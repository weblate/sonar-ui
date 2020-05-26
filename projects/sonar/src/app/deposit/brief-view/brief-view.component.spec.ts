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
import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RecordModule, TranslateLoader } from '@rero/ng-core';
import { depositTestingService, userTestingService } from 'projects/sonar/tests/utils';
import { UserService } from '../../user.service';
import { DepositService } from '../deposit.service';
import { BriefViewComponent } from './brief-view.component';

describe('BriefViewComponent', () => {
  let component: BriefViewComponent;
  let fixture: ComponentFixture<BriefViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BriefViewComponent],
      imports: [
        RouterTestingModule,
        RecordModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: BaseTranslateLoader,
            useClass: TranslateLoader
          }
        })
      ],
      providers: [
        { provide: UserService, useValue: userTestingService },
        { provide: DepositService, useValue: depositTestingService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BriefViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
