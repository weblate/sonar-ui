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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreConfigService, RecordModule, TranslateLoader } from '@rero/ng-core';
import { TabsModule } from 'ngx-bootstrap';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { of } from 'rxjs';
import { FileSizePipe } from '../../core/filesize.pipe';
import { StepComponent } from '../../core/step/step.component';
import { ReviewComponent } from '../review/review.component';
import { UploadComponent } from './upload.component';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  const route = {
    params: of({
      id: '0'
    })
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UploadComponent, StepComponent, ReviewComponent, FileSizePipe],
      imports: [
        RecordModule,
        ReactiveFormsModule,
        NgxDropzoneModule,
        TabsModule.forRoot(),
        HttpClientModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: BaseTranslateLoader,
            useClass: TranslateLoader,
            deps: [CoreConfigService, HttpClient]
          }
        })
      ],
      providers: [{ provide: ActivatedRoute, useValue: route }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadComponent);
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
