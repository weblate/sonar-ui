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
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateLoader as BaseTranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CoreConfigService, RecordModule, TranslateLoader } from '@rero/ng-core';
import { BsLocaleService, ModalModule } from 'ngx-bootstrap';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ToastrModule } from 'ngx-toastr';
import { AppConfigService } from './app-config.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FileLinkPipe } from './core/file-link.pipe';
import { FileSizePipe } from './core/filesize.pipe';
import { HighlightJsonPipe } from './core/highlight-json.pipe';
import { JoinPipe } from './core/join.pipe';
import { StepComponent } from './core/step/step.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BriefViewComponent } from './deposit/brief-view/brief-view.component';
import { ConfirmationComponent } from './deposit/confirmation/confirmation.component';
import { EditorComponent } from './deposit/editor/editor.component';
import { ReviewComponent } from './deposit/review/review.component';
import { UploadComponent } from './deposit/upload/upload.component';
import { HttpInterceptor } from './interceptor/http.interceptor';
import { LanguageValuePipe } from './pipe/language-value.pipe';
import { DetailComponent as DocumentDetailComponent } from './record/document/detail/detail.component';
import { DocumentComponent } from './record/document/document.component';
import { PublicationPipe } from './record/document/publication.pipe';
import { DetailComponent as OrganisationDetailComponent } from './record/organisation/detail/detail.component';
import { OrganisationComponent } from './record/organisation/organisation.component';
import { DetailComponent as UserDetailComponent } from './record/user/detail/detail.component';
import { UserComponent } from './record/user/user.component';
import { AdminComponent } from './_layout/admin/admin.component';

export function minElementError(err: any, field: FormlyFieldConfig) {
  return `This field must contain at least ${field.templateOptions.minItems} element.`;
}

@NgModule({
  declarations: [
    AppComponent,
    OrganisationComponent,
    DocumentComponent,
    UserComponent,
    DocumentDetailComponent,
    OrganisationDetailComponent,
    UserDetailComponent,
    JoinPipe,
    LanguageValuePipe,
    DashboardComponent,
    UploadComponent,
    FileSizePipe,
    EditorComponent,
    StepComponent,
    ConfirmationComponent,
    BriefViewComponent,
    FileLinkPipe,
    HighlightJsonPipe,
    ReviewComponent,
    AdminComponent,
    PublicationPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    CollapseModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
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
    RecordModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptor,
      multi: true
    },
    {
      provide: CoreConfigService,
      useClass: AppConfigService
    },
    BsLocaleService
  ],
  entryComponents: [
    DocumentComponent,
    OrganisationComponent,
    UserComponent,
    DocumentDetailComponent,
    OrganisationDetailComponent,
    UserDetailComponent,
    BriefViewComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
