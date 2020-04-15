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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '@rero/ng-core';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: any;

  /**
   * Constructor.
   *
   * @param _apiService API service.
   * @param _http HTTP client.
   */
  constructor(private _apiService: ApiService, private _http: HttpClient) { }

  /**
   * Load logged user in backend
   */
  loadLoggedUser(resolve: boolean = true) {
    return this._http
      .get<any>(`${this._apiService.baseUrl}/logged-user/${resolve ? '?resolve=1' : ''}`)
      .pipe(
        map(user => {
          if (user.metadata) {
            this.user = user.metadata;
            return this.user;
          }

          return null;
        }),
        catchError(() => {
          return of(null);
        })
      );
  }

  /**
   * Return $ref endpoint for current logged user.
   */
  getUserRefEndpoint() {
    return this._apiService.getRefEndpoint('users', this.user.pid);
  }

  /**
   * Check if user has specified role(s).
   * @param roles String or array of roles to check against user
   */
  hasRole(roles: string | Array<string>) {
    if (typeof roles === 'string') {
      roles = [roles];
    }

    for (const role of roles) {
      for (const userRole of this.user.roles) {
        if (role === userRole) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if user reference is corresonding to logged user id.
   * @param reference User JSON endpoint reference
   */
  checkUserReference(reference: string) {
    const result = /[0-9]+$/.exec(reference);

    if (result === null) {
      return false;
    }

    return this.checkUserPid(result[0]);
  }

  /**
   * Check if given PID is the same as logged user.
   * @param pid User PID to check against logged user
   */
  checkUserPid(pid: string): boolean {
    return this.user.pid === pid;
  }
}
