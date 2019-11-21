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
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RecordModule, CoreConfigService } from '@rero/ng-core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CollapseModule } from 'ngx-bootstrap/collapse';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppConfigService } from './app-config.service';
import { InstitutionComponent } from './record/institution/institution.component';
import { DocumentComponent } from './record/document/document.component';
import { DetailComponent as DocumentDetailComponent } from './record/document/detail/detail.component';
import { UserComponent } from './record/user/user.component';
import { DetailComponent as InstitutionDetailComponent } from './record/institution/detail/detail.component';
import { DetailComponent as UserDetailComponent } from './record/user/detail/detail.component';
import { JoinPipe } from './pipe/join.pipe';
import { LanguageValuePipe } from './pipe/language-value.pipe';
import { DashboardComponent } from './dashboard/dashboard.component';

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
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    CollapseModule.forRoot(),
    NgxSpinnerModule,
    RecordModule
  ],
  providers: [
    {
      provide: CoreConfigService,
      useClass: AppConfigService
    }
  ],
  entryComponents: [
    DocumentComponent,
    InstitutionComponent,
    UserComponent,
    DocumentDetailComponent,
    InstitutionDetailComponent,
    UserDetailComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
