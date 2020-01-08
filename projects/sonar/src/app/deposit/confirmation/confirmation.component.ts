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
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

import { DepositService } from '../deposit.service';

@Component({
  selector: 'sonar-deposit-confirmation',
  templateUrl: './confirmation.component.html'
})
export class ConfirmationComponent implements OnInit {
  deposit$: Observable<any> = null;

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private depositService: DepositService,
    private router: Router,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.deposit$ = this.route.params.pipe(
      switchMap(params => {
        return this.depositService.get(params.id);
      }),
      map(result => result.metadata),
      catchError(() => {
        this.toastr.error(this.translateService.instant('Deposit not found'));
        this.router.navigate(['deposit', '0', 'create']);
        return of(null);
      })
    );
  }
}
