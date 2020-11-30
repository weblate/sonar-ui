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
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@rero/ng-core';
import { ToastrService } from 'ngx-toastr';
import { EMPTY, Subscription } from 'rxjs';
import { delay, first, switchMap } from 'rxjs/operators';
import { UserService } from '../../user.service';
import { DepositService } from '../deposit.service';

@Component({
  selector: 'sonar-deposit-review',
  templateUrl: './review.component.html'
})
export class ReviewComponent implements OnInit, OnDestroy {
  /** Deposit record */
  @Input()
  deposit: any = null;

  // Logged user
  user: any;

  // User subscription
  private _userSubscription: Subscription;

  /** Used to retrieve value for the comment */
  @ViewChild('comment')
  comment: ElementRef;

  constructor(
    private _userService: UserService,
    private _dialogService: DialogService,
    private _translateService: TranslateService,
    private _depositService: DepositService,
    private _toastr: ToastrService,
    private _router: Router
  ) { }

  /**
   * Component initialisation.
   *
   */
  ngOnInit() {
    this._userSubscription = this._userService.user$.subscribe((user) => {
      this.user = user;
    });
  }

  /**
   * Component destruction
   */
  ngOnDestroy() {
    this._userSubscription.unsubscribe();
  }

  /**
   * Approve the deposit.
   */
  review(action: string) {
    this._dialogService
      .show({
        ignoreBackdropClick: true,
        initialState: {
          title: this._translateService.instant('deposit_log_action_' + action),
          body: this._translateService.instant('Do you really want to do this action?'),
          confirmButton: true,
          confirmTitleButton: this._translateService.instant('OK'),
          cancelTitleButton: this._translateService.instant('Cancel')
        }
      })
      .pipe(
        first(),
        switchMap(result => {
          if (result === false) {
            return EMPTY;
          }

          return this._depositService.reviewDeposit(
            this.deposit,
            action,
            this.comment.nativeElement.value
          );
        }),
        delay(1000)
      )
      .subscribe((deposit: any) => {
        this._toastr.success(this._translateService.instant('Review has been done successfully!'));
        this._router.navigate(['records', 'deposits'], {
          queryParams: { q: `pid:${deposit.pid}` }
        });
      });
  }
}
