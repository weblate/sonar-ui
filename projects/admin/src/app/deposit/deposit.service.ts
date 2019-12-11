/*
 * SONAR UI
 * Copyright (C) 2019 RERO
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, Observable, from, concat, throwError } from 'rxjs';
import {
  catchError,
  map,
  tap,
  mergeMap,
  ignoreElements,
  switchMap,
  reduce,
  first
} from 'rxjs/operators';

import { ApiService, DialogService } from '@rero/ng-core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class DepositService {
  constructor(
    private apiService: ApiService,
    private httpClient: HttpClient,
    private userService: UserService,
    private toastrService: ToastrService,
    private translateService: TranslateService,
    private dialogService: DialogService
  ) {}

  get depositEndPoint(): string {
    return `${this.apiService.getEndpointByType('deposits', true)}`;
  }

  /**
   * Get the deposit corresponding to given ID.
   * @param id - string ID of deposit
   */
  get(id: string): Observable<any> {
    return this.httpClient.get(`${this.apiService.getEndpointByType('deposits', true)}/${id}`).pipe(
      tap(result => {
        if (
          this.userService.hasRole(['moderator', 'admin', 'superadmin']) === false &&
          this.userService.checkUserReference(result.metadata.user.$ref) === false
        ) {
          throw new Error('Logged user is not owning this deposit');
        }
      })
    );
  }

  /**
   * Create a deposit
   */
  create(): Observable<any> {
    return this.httpClient.post(`${this.apiService.getEndpointByType('deposits', true)}/`, {
      user: {
        $ref: this.userService.getUserRefEndpoint()
      },
      step: 'metadata',
      status: 'in progress'
    });
  }

  /**
   * Update the deposit corresponding to given ID.
   * @param id ID of deposit
   * @param data Deposit metadata
   */
  update(id: string, data: any): Observable<any> {
    return this.httpClient
      .put(`${this.apiService.getEndpointByType('deposits', true)}/${id}`, data)
      .pipe(
        catchError(error => {
          this.toastrService.error(error.error.message);
          return of(null);
        })
      );
  }

  /**
   * Remove a deposit and all files linked to it.
   * @param deposit Deposit to remove
   */
  delete(deposit: any): Observable<any> {
    let deleteFileObservable$ = of(null);

    if (deposit._files) {
      deleteFileObservable$ = from(deposit._files).pipe(
        mergeMap((file: any) => {
          return this.removeFile(deposit.pid, file.key, file.version_id);
        }),
        ignoreElements()
      );
    }

    return concat(
      deleteFileObservable$,
      this.httpClient.delete(
        `${this.apiService.getEndpointByType('deposits', true)}/${deposit.pid}`
      )
    ).pipe(reduce(() => true));
  }

  /**
   * Delete a deposit after a user confirmation.
   * @param deposit Deposit to remove.
   */
  deleteDepositWithConfirmation(deposit: any): Observable<boolean> {
    let observable$ = of(true);

    if (deposit) {
      observable$ = this.dialogService
        .show({
          ignoreBackdropClick: true,
          initialState: {
            title: this.translateService.instant('Confirmation'),
            body: this.translateService.instant(
              'Do you really want to cancel and remove this deposit ?'
            ),
            confirmButton: true,
            confirmTitleButton: this.translateService.instant('OK'),
            cancelTitleButton: this.translateService.instant('Cancel')
          }
        })
        .pipe(
          first(),
          switchMap((result: boolean) => {
            if (result === true) {
              return this.delete(deposit).pipe(
                tap(() => {
                  this.toastrService.success(
                    this.translateService.instant('Deposit successfully removed.')
                  );
                }),
                map(() => {
                  return true;
                })
              );
            }

            return of(false);
          })
        );
    }

    return observable$;
  }

  /**
   * Publish a deposit
   * @param id Deposit ID to publish
   */
  publish(id: string): Observable<any> {
    return this.httpClient
      .post(`${this.depositEndPoint}/${id}/publish`, null)
      .pipe(catchError(err => this.handleError(err)));
  }

  /**
   * Upload a file and put it in the bucket.
   * @param id ID of deposit
   * @param name File name
   * @param type Type of the file
   * @param file Binary data of the file
   */
  uploadFile(id: string, name: string, type: string, file: File): Observable<any> {
    return this.httpClient.post(
      `${this.apiService.getEndpointByType(
        'deposits',
        true
      )}/${id}/custom-files?key=${name}&type=${type}`,
      file
    );
  }

  /**
   * Update file metadata
   * @param id ID of deposit
   * @param data File data
   */
  updateFile(id: string, data: any): Observable<any> {
    return this.httpClient
      .put(
        `${this.apiService.getEndpointByType('deposits', true)}/${id}/custom-files/${data.key}`,
        {
          label: data.label || data.key,
          embargo: data.embargo || false,
          embargoDate: data.embargoDate || null,
          expect: data.expect || false
        }
      )
      .pipe(
        catchError(() => {
          this.toastrService.error(
            this.translateService.instant('File could not be updated, please try again')
          );
          return of(null);
        })
      );
  }

  /**
   * Remove file from bucket
   * @param id Deposit id
   * @param name File key
   * @param versionId File version, if specified, will make a hard delete of the file. See invenio-files-rest for detail.
   */
  removeFile(id: string, name: string, versionId: string = null): Observable<any> {
    return this.httpClient
      .delete(
        `${this.apiService.getEndpointByType('deposits', true)}/${id}/files/${name}${
          versionId ? '?versionId=' + versionId : ''
        }`
      )
      .pipe(catchError(() => of(null)));
  }

  /**
   * Get files stored in deposit
   * @param id Deposit id
   */
  getFiles(id: string): Observable<any> {
    return this.httpClient.get(
      `${this.apiService.getEndpointByType('deposits', true)}/${id}/custom-files`
    );
  }

  /**
   * Return the JSON schema corresponding to resource, with properties ordered.
   * @param type Resource type
   * @param version Version of the JSON schema
   */
  getJsonSchema(type: string, version: string = '1.0.0'): Observable<any> {
    const recordType = type.replace(/ies$/, 'y').replace(/s$/, '');
    return this.httpClient
      .get(`${this.apiService.baseUrl}/schemas/${type}/${recordType}-v${version}.json`)
      .pipe(
        map((result: any) => {
          this.orderSchemaProperties(result);
          return result;
        })
      );
  }

  /**
   * Order properties for the current entry.
   * @param schema Current entry of the JSON schema on which properties will be ordered
   */
  private orderSchemaProperties(schema: any) {
    if (schema.type !== 'object') {
      return;
    }

    // order properties for nested properties
    Object.entries(schema.properties).forEach((value: Array<any>) => {
      if (value[1].type === 'object') {
        this.orderSchemaProperties(schema.properties[value[0]]);
      }

      if (value[1].type === 'array') {
        this.orderSchemaProperties(schema.properties[value[0]].items);
      }
    });

    if (schema.propertiesOrder) {
      const orderedProperties: any = {};
      for (const property of schema.propertiesOrder) {
        if (schema.properties[property]) {
          orderedProperties[property] = schema.properties[property];
        }
      }

      schema.properties = orderedProperties;
    }
  }

  /**
   * Error handling during api call process.
   * @param error - HttpErrorResponse
   */
  private handleError(error: HttpErrorResponse) {
    this.toastrService.error(error.error.message);
    return throwError('Something bad happened; please try again later.');
  }
}
