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
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { depositTestingService, userTestingService } from 'projects/sonar/tests/utils';
import { DepositService } from '../deposit/deposit.service';
import { UserService } from '../user.service';
import { CanAddGuard } from './can-add.guard';

describe('CanAddGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        CanAddGuard,
        { provide: UserService, useValue: userTestingService },
        { provide: DepositService, useValue: depositTestingService }
      ]
    });
  });

  it('should create can add guard', inject([CanAddGuard], (guard: CanAddGuard) => {
    expect(guard).toBeTruthy();
  }));
});
