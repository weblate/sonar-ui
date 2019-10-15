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
    const observable = this.http.get<any>(`${this.apiService.baseUrl}/logged-user/${resolve ? '?resolve=1' : ''}`).pipe(
      map((user) => {
        if (user.metadata) {
          this.user = user.metadata;
          return this.user;
        }

        return null;
      })
    );

    return observable;
  }
}
