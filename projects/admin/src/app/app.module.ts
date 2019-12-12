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
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RecordModule, CoreConfigService, TranslateLoader } from '@rero/ng-core';
import { ToastrModule } from 'ngx-toastr';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TranslateModule, TranslateLoader as BaseTranslateLoader } from '@ngx-translate/core';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { BsLocaleService } from 'ngx-bootstrap';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppConfigService } from './app-config.service';
import { InstitutionComponent } from './record/institution/institution.component';
import { DocumentComponent } from './record/document/document.component';
import { DetailComponent as DocumentDetailComponent } from './record/document/detail/detail.component';
import { UserComponent } from './record/user/user.component';
import { DetailComponent as InstitutionDetailComponent } from './record/institution/detail/detail.component';
import { DetailComponent as UserDetailComponent } from './record/user/detail/detail.component';
import { JoinPipe } from './core/join.pipe';
import { LanguageValuePipe } from './pipe/language-value.pipe';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UploadComponent } from './deposit/upload/upload.component';
import { EditorComponent } from './deposit/editor/editor.component';
import { FileSizePipe } from './core/filesize.pipe';
import { StepComponent } from './core/step/step.component';
import { ObjectTypeComponent } from './form/object-type.component';
import { ArrayTypeComponent } from './form/array-type.component';
import { FormlyHorizontalWrapperComponent } from './form/horizontal-wrapper.component';
import { ConfirmationComponent } from './deposit/confirmation/confirmation.component';
import { BriefViewComponent } from './deposit/brief-view/brief-view.component';
import { FileLinkPipe } from './core/file-link.pipe';
import { HighlightJsonPipe } from './core/highlight-json.pipe';
import { ReviewComponent } from './deposit/review/review.component';

export function minElementError(err: any, field: FormlyFieldConfig) {
  return `This field must contain at least ${field.templateOptions.minItems} element.`;
}

@NgModule({
  declarations: [
    AppComponent,
    InstitutionComponent,
    DocumentComponent,
    UserComponent,
    DocumentDetailComponent,
    InstitutionDetailComponent,
    UserDetailComponent,
    JoinPipe,
    LanguageValuePipe,
    DashboardComponent,
    UploadComponent,
    FileSizePipe,
    EditorComponent,
    StepComponent,
    ObjectTypeComponent,
    ArrayTypeComponent,
    FormlyHorizontalWrapperComponent,
    ConfirmationComponent,
    BriefViewComponent,
    FileLinkPipe,
    HighlightJsonPipe,
    ReviewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    CollapseModule.forRoot(),
    TabsModule.forRoot(),
    NgxSpinnerModule,
    TranslateModule.forRoot({
      loader: {
        provide: BaseTranslateLoader,
        useClass: TranslateLoader
      }
    }),
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NgxDropzoneModule,
    FormlyBootstrapModule,
    FormlyModule.forRoot({
      wrappers: [{ name: 'form-field-horizontal', component: FormlyHorizontalWrapperComponent }],
      validationMessages: [
        { name: 'required', message: 'This field is required' },
        {
          name: 'minItems',
          message: minElementError
        }
      ],
      types: [
        { name: 'string', extends: 'input' },
        { name: 'object', component: ObjectTypeComponent },
        { name: 'array', component: ArrayTypeComponent },
        { name: 'enum', extends: 'select' },
        {
          name: 'integer',
          extends: 'input',
          defaultOptions: {
            templateOptions: {
              type: 'number'
            }
          }
        }
      ]
    }),
    RecordModule
  ],
  providers: [
    {
      provide: CoreConfigService,
      useClass: AppConfigService
    },
    BsLocaleService
  ],
  entryComponents: [
    DocumentComponent,
    InstitutionComponent,
    UserComponent,
    DocumentDetailComponent,
    InstitutionDetailComponent,
    UserDetailComponent,
    BriefViewComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
