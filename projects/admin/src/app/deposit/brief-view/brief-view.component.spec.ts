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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

import { TranslateLoader, RecordModule } from '@rero/ng-core';
import { TranslateModule, TranslateLoader as BaseTranslateLoader } from '@ngx-translate/core';

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
