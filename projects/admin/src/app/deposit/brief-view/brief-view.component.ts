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
import { Component } from '@angular/core';

import { UserService } from '../../user.service';

@Component({
  selector: 'admin-brief-view',
  templateUrl: './brief-view.component.html'
})
export class BriefViewComponent {
  /** Record data */
  record: any;

  constructor(private userService: UserService) {}

  /**
   * Return current logged user
   */
  get user(): any {
    return this.userService.user;
  }

  /**
   * Check if current logged user can continue to fill the deposit.
   */
  canContinueProcess(): boolean {
    if (
      this.record.metadata.status !== 'in progress' &&
      this.record.metadata.status !== 'ask for changes'
    ) {
      return false;
    }

    return this.userService.checkUserPid(this.record.metadata.user.pid);
  }

  /**
   * Check if current logged user can review the deposit.
   */
  canReview(): boolean {
    if (this.record.metadata.status !== 'to validate') {
      return false;
    }

    return this.user.is_moderator;
  }

  /**
   * Toggle visibility of logs for this record.
   * @param record Current record
   */
  toggleHistory(record: any) {
    record.showHistory = !record.showHistory;
  }
}
