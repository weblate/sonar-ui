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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreConfigService, RecordModule, TranslateLoader } from '@rero/ng-core';
import { ToastrModule } from 'ngx-toastr';
import { depositTestingService, userTestingService } from 'projects/sonar/tests/utils';
import { UserService } from '../user.service';
import { DepositService } from './deposit.service';

describe('DepositService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        ToastrModule.forRoot(),
        TranslateModule.forRoot({
          loader: {
            provide: BaseTranslateLoader,
            useClass: TranslateLoader,
            deps: [CoreConfigService, HttpClient]
          }
        }),
        RecordModule
      ],
      providers: [
        { provide: UserService, useValue: userTestingService },
        { provide: DepositService, useValue: depositTestingService }
      ]
    })
  );

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    const service: DepositService = TestBed.inject(DepositService);
    expect(service).toBeTruthy();
  });
});
