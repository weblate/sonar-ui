import { HttpClientModule } from '@angular/common/http';
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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TranslateLoader as BaseTranslateLoader,
  TranslateModule
} from '@ngx-translate/core';
import { RecordModule, TranslateLoader } from '@rero/ng-core';
import { FileComponent } from './file.component';

describe('FileComponent', () => {
  let component: FileComponent;
  let fixture: ComponentFixture<FileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FileComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: BaseTranslateLoader,
            useClass: TranslateLoader,
          },
        }),
        RecordModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
