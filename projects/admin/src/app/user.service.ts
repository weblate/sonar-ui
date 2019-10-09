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
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { ApiService } from '@rero/ng-core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: any;

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  /**
   * Load logged user in backend
   */
  loadLoggedUser(resolve: boolean = true) {
    return this.http.get<any>(`${this.apiService.baseUrl}/logged-user/${resolve ? '?resolve=1' : ''}`).pipe(
      map((user) => {
        if (user.metadata) {
          this.user = user.metadata;
          return this.user;
        }

        return null;
      })
    );
  }

  /**
   * Return $ref endpoint for current logged user.
   */
  getUserRefEndpoint() {
    return this.apiService.getRefEndpoint('users', this.user.pid);
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

    return this.user.pid === result[0];
  }
}
