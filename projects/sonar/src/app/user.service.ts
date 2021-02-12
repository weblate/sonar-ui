/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
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
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Subject for generating new users.
  private _userSubject: BehaviorSubject<any> = new BehaviorSubject(null);

  // Logged user
  private _user: any = null;

  /**
   * Constructor.
   *
   * @param _apiService API service.
   * @param _http HTTP client.
   */
  constructor(private _apiService: ApiService, private _http: HttpClient) {
    this.loadLoggedUser().subscribe();
  }

  get user$(): Observable<any> {
    return this._userSubject.asObservable();
  }

  /**
   * Load logged user in backend
   */
  loadLoggedUser(resolve: boolean = true) {
    return this._http
      .get<any>(`${this._apiService.baseUrl}/logged-user/${resolve ? '?resolve=1' : ''}`)
      .pipe(
        catchError((e) => {
          this._userSubject.error(e);
          return throwError(e);
        }),
        map(user => {
          if (user.metadata && user.metadata.is_user) {
            this._user = user.metadata;
            this._userSubject.next(user.metadata);
          }
        })
      );
  }

  /**
   * Return $ref endpoint for current logged user.
   */
  getUserRefEndpoint() {
    return this._apiService.getRefEndpoint('users', this._user.pid);
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
      if (role === this._user.role) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check is user as at least the given role.
   * @param role Role to check.
   * @returns True if user has the role.
   */
  is(role: string): boolean {
    return this._user['is_' + role] === true;
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
    return this._user.pid === pid;
  }
}
