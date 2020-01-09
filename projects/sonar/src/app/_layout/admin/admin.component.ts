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
import { Component, OnInit } from '@angular/core';

import { NgxSpinnerService } from 'ngx-spinner';

import { UserService } from '../../user.service';

@Component({
  selector: 'sonar-layout-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  user: any;
  ready = false;
  isCollapsed = true;

  constructor(private spinner: NgxSpinnerService, private userService: UserService) {
    this.spinner.show();

    this.userService.loadLoggedUser().subscribe(user => {
      if (user) {
        this.user = user;
      }

      this.spinner.hide();
      this.ready = true;
    });
  }

  ngOnInit() {}
}
