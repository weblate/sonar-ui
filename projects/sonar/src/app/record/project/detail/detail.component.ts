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
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../../../user.service';

@Component({
  templateUrl: './detail.component.html'
})
export class DetailComponent {
  /** Observable resolving record data */
  record$: Observable<any>;

  /** Resolve logged user */
  user$: Observable<any>;

  /**
   * Constructor.
   *
   * @param _userService User service.
   */
  constructor(private _userService: UserService) {
    this.user$ = this._userService.user$;
  }
}
