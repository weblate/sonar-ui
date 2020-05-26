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
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { UserService } from '../user.service';

@Injectable({
  providedIn: 'root'
})
export class CanListGuard implements CanActivate {
  /**
   * Constructor.
   * @param _userService User service.
   */
  constructor(
    private _userService: UserService
  ) { }

  /**
   * Check if the current logged user can list records for resource.
   *
   * @param next Activated route.
   * @param state Router state.
   * @return Observable emitting boolean.
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return this._userService.user$.pipe(
      filter(user => user !== null), // Because we don't take care of first null value for taking the decision.
      map((user: any) => {
        return user.permissions[next.params.type].list;
      })
    );
  }

}
