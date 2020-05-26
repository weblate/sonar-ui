/*
 * SONAR User Interface
 * Copyright (C) 2020 RERO
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
import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiService, DialogService, orderedJsonSchema, RecordService, removeEmptyValues } from '@rero/ng-core';
import { ToastrService } from 'ngx-toastr';
import { concat, from, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, first, ignoreElements, map, mergeMap, reduce, switchMap, tap } from 'rxjs/operators';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class DepositService implements OnDestroy {
  // Logged user
  private _user: any;

  // User subscription
  private _userSubscription: Subscription;

  /**
   * Constructor.
   *
   * @param _apiService API service.
   * @param _httpClient HTTP client.
   * @param _userService User service.
   * @param _toastrService Toast service.
   * @param _translateService Translate service.
   * @param _dialogService Dialog service.
   * @param _recordService Record service.
   */
  constructor(
    private _apiService: ApiService,
    private _httpClient: HttpClient,
    private _userService: UserService,
    private _toastrService: ToastrService,
    private _translateService: TranslateService,
    private _dialogService: DialogService,
    private _recordService: RecordService
  ) {
    this._userSubscription = this._userService.user$.subscribe((user) => {
      this._user = user;
    });
  }

  /**
   * Service destruction
   */
  ngOnDestroy() {
    this._userSubscription.unsubscribe();
  }

  /**
   * Returns deposit endpoint.
   *
   * @return Deposit endpoint as string.
   */
  get depositEndPoint(): string {
    return `${this._apiService.getEndpointByType('deposits', true)}`;
  }

  /**
   * Get the deposit corresponding to given ID.
   * @param id - string ID of deposit
   */
  get(id: string): Observable<any> {
    return this._httpClient.get(`${this._apiService.getEndpointByType('deposits', true)}/${id}`).pipe(
      tap(result => {
        if (
          this._userService.hasRole(['moderator', 'admin', 'superuser']) === false &&
          this._userService.checkUserReference(result.metadata.user.$ref) === false
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
    return this._httpClient.post(`${this._apiService.getEndpointByType('deposits', true)}/`, {
      user: {
        $ref: this._userService.getUserRefEndpoint()
      },
      step: 'metadata',
      status: 'in_progress'
    });
  }

  /**
   * Update the deposit corresponding to given ID.
   * @param id ID of deposit
   * @param data Deposit metadata
   */
  update(id: string, data: any): Observable<any> {
    // Clean up empty values before sending the form.
    data = removeEmptyValues(data);

    return this._httpClient
      .put(`${this._apiService.getEndpointByType('deposits', true)}/${id}`, data)
      .pipe(
        catchError(error => {
          this._toastrService.error(error.error.message);
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
      this._httpClient.delete(
        `${this._apiService.getEndpointByType('deposits', true)}/${deposit.pid}`
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
      observable$ = this._dialogService
        .show({
          ignoreBackdropClick: true,
          initialState: {
            title: this._translateService.instant('Confirmation'),
            body: this._translateService.instant(
              'Do you really want to cancel and remove this deposit ?'
            ),
            confirmButton: true,
            confirmTitleButton: this._translateService.instant('OK'),
            cancelTitleButton: this._translateService.instant('Cancel')
          }
        })
        .pipe(
          first(),
          switchMap((result: boolean) => {
            if (result === true) {
              return this.delete(deposit).pipe(
                tap(() => {
                  this._toastrService.success(
                    this._translateService.instant('Deposit successfully removed.')
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
    return this._httpClient
      .post(`${this.depositEndPoint}/${id}/publish`, null)
      .pipe(catchError(err => this._handleError(err)));
  }

  /**
   * Upload a file and put it in the bucket.
   * @param id ID of deposit
   * @param name File name
   * @param type Type of the file
   * @param file Binary data of the file
   */
  uploadFile(id: string, name: string, type: string, file: File): Observable<any> {
    return this._httpClient.post(
      `${this._apiService.getEndpointByType(
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
    return this._httpClient
      .put(
        `${this._apiService.getEndpointByType('deposits', true)}/${id}/custom-files/${data.key}`,
        {
          label: data.label || data.key,
          embargo: data.embargo || false,
          embargoDate: data.embargoDate || null,
          exceptInOrganisation: data.exceptInOrganisation || false
        }
      )
      .pipe(
        catchError(() => {
          this._toastrService.error(
            this._translateService.instant('File could not be updated, please try again')
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
    return this._httpClient
      .delete(
        `${this._apiService.getEndpointByType('deposits', true)}/${id}/files/${name}${
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
    return this._httpClient.get(
      `${this._apiService.getEndpointByType('deposits', true)}/${id}/custom-files`
    );
  }

  /**
   * Return the JSON schema corresponding to resource, with properties ordered.
   * @param type Resource type
   */
  getJsonSchema(type: string): Observable<any> {
    return this._recordService.getSchemaForm(type)
      .pipe(
        map((result: any) => {
          orderedJsonSchema(result.schema);
          return result.schema;
        })
      );
  }

  /**
   * Check if user can access to deposit
   * @param deposit Deposit to check
   */
  canAccessDeposit(deposit: any): boolean {
    if (
      (deposit.status === 'in_progress' || deposit.status === 'ask_for_changes') &&
      this._userService.checkUserReference(deposit.user.$ref)
    ) {
      return true;
    }

    if (deposit.status === 'to_validate' && this._user && this._user.is_moderator) {
      return true;
    }

    return false;
  }

  /**
   * Review a deposit by calling an API endpoint depending on given action.
   * @param deposit Deposit to review
   * @param action Action to send to API
   */
  reviewDeposit(deposit: any, action: string, comment: string = null): Observable<any> {
    return this._httpClient
      .post(`${this.depositEndPoint}/${deposit.pid}/review`, {
        action,
        user: {
          $ref: this._userService.getUserRefEndpoint()
        },
        comment: comment || null
      })
      .pipe(catchError(err => this._handleError(err)));
  }

  /**
   * Get the extracted metadata from main file.
   * @param deposit Deposit
   */
  extractPDFMetadata(deposit: any): Observable<any> {
    return this._httpClient
      .get(`${this.depositEndPoint}/${deposit.pid}/extract-pdf-metadata`)
      .pipe(catchError(err => this._handleError(err)));
  }

  /**
   * Error handling during api call process.
   * @param error - HttpErrorResponse
   */
  private _handleError(error: HttpErrorResponse) {
    this._toastrService.error(error.error.message);
    return throwError('Something bad happened; please try again later.');
  }
}
