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
import { UserService } from '../../user.service';

@Component({
  selector: 'sonar-deposit-brief-view',
  templateUrl: './brief-view.component.html'
})
export class BriefViewComponent {
  /** Record data */
  record: any;

  /**
   * Constructor.
   *
   * @param _userService User service.
   */
  constructor(private _userService: UserService) {}

  /**
   * Return current logged user
   */
  get user(): any {
    return this._userService.user;
  }

  /**
   * Check if current logged user can continue to fill the deposit.
   */
  canContinueProcess(): boolean {
    if (
      this.record.metadata.status !== 'in_progress' &&
      this.record.metadata.status !== 'ask_for_changes'
    ) {
      return false;
    }

    return this._userService.checkUserPid(this.record.metadata.user.pid);
  }

  /**
   * Check if current logged user can review the deposit.
   */
  canReview(): boolean {
    if (this.record.metadata.status !== 'to_validate') {
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
