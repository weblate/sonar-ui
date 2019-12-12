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
import { Component, Input, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { first, switchMap, delay } from 'rxjs/operators';

import { DialogService } from '@rero/ng-core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../../user.service';
import { DepositService } from '../deposit.service';

@Component({
  selector: 'admin-deposit-review',
  templateUrl: './review.component.html'
})
export class ReviewComponent {
  /** Deposit record */
  @Input() deposit: any = null;

  /** Used to retrieve value for the comment */
  @ViewChild('comment', { static: false }) comment: ElementRef;

  /**
   * Return current logged user
   */
  get user(): any {
    return this.userService.user;
  }

  constructor(
    private userService: UserService,
    private dialogService: DialogService,
    private translateService: TranslateService,
    private depositService: DepositService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  /**
   * Approve the deposit.
   */
  review(action: string) {
    this.dialogService
      .show({
        ignoreBackdropClick: true,
        initialState: {
          title: this.translateService.instant(action),
          body: this.translateService.instant('Do you really want to do this action?'),
          confirmButton: true,
          confirmTitleButton: this.translateService.instant('OK'),
          cancelTitleButton: this.translateService.instant('Cancel')
        }
      })
      .pipe(
        first(),
        switchMap(result => {
          if (result === false) {
            return EMPTY;
          }

          return this.depositService.reviewDeposit(
            this.deposit,
            action,
            this.comment.nativeElement.value
          );
        }),
        delay(1000)
      )
      .subscribe((deposit: any) => {
        this.toastr.success(this.translateService.instant('Review has been done successfully!'));
        this.router.navigate(['records', 'deposits'], {
          queryParams: { q: deposit.metadata.title }
        });
      });
  }
}
