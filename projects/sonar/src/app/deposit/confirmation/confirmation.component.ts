/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
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
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DepositService } from '../deposit.service';

@Component({
  selector: 'sonar-deposit-confirmation',
  templateUrl: './confirmation.component.html'
})
export class ConfirmationComponent implements OnInit {
  deposit$: Observable<any> = null;

  /**
   * Constructor.
   *
   * @param _route Route.
   * @param _toastr Toastr service.
   * @param _depositService Deposit servce.
   * @param _router Router service.
   * @param _translateService Translate service.
   */
  constructor(
    private _route: ActivatedRoute,
    private _toastr: ToastrService,
    private _depositService: DepositService,
    private _router: Router,
    private _translateService: TranslateService
  ) { }

  /**
   * Component initialization
   *
   * Gets the deposit data.
   */
  ngOnInit() {
    this.deposit$ = this._route.params.pipe(
      switchMap(params => {
        return this._depositService.get(params.id);
      }),
      map(result => result.metadata),
      catchError(() => {
        this._toastr.error(this._translateService.instant('Deposit not found'));
        this._router.navigate(['deposit', '0', 'create']);
        return of(null);
      })
    );
  }
}
