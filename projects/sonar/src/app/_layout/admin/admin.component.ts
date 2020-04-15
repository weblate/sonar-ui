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
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from '../../user.service';

@Component({
  selector: 'sonar-layout-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  // Logged user
  user: any;

  // Application is ready?
  ready = false;

  // Navigation is collapsed?
  isCollapsed = true;

  /**
   * Constructor.
   *
   * @param _spinner Spinner service.
   * @param _userService User service.
   */
  constructor(private _spinner: NgxSpinnerService, private _userService: UserService) {
    this._spinner.show();

    this._userService.loadLoggedUser().subscribe(user => {
      if (user) {
        this.user = user;
      }

      this._spinner.hide();
      this.ready = true;
    });
  }
}
