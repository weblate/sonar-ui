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
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { of, Observable } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';
import { ActionStatus } from '@rero/ng-core';

import { DocumentComponent } from './record/document/document.component';
import { InstitutionComponent } from './record/institution/institution.component';
import { UserComponent } from './record/user/user.component';
import { DetailComponent as DocumentDetailComponent } from './record/document/detail/detail.component';
import { DetailComponent as InstitutionDetailComponent } from './record/institution/detail/detail.component';
import { DetailComponent as UserDetailComponent } from './record/user/detail/detail.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UploadComponent } from './deposit/upload/upload.component';
import { EditorComponent as DepositEditorComponent } from './deposit/editor/editor.component';
import { ConfirmationComponent } from './deposit/confirmation/confirmation.component';
import { BriefViewComponent } from './deposit/brief-view/brief-view.component';
import { AdminComponent } from './_layout/admin/admin.component';
import { AggregationFilter } from './record/document/aggregation-filter';

const canReadDeposit = (): Observable<ActionStatus> => {
  return of({
    can: false,
    message: ''
  });
};

const canDeleteDeposit = (): Observable<ActionStatus> => {
  return of({
    can: false,
    message: ''
  });
};

const canUpdateDeposit = (): Observable<ActionStatus> => {
  return of({
    can: false,
    message: ''
  });
};

const canAddDeposit = (): Observable<ActionStatus> => {
  return of({
    can: false,
    message: ''
  });
};

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: '', component: DashboardComponent },
      {
        path: 'records',
        loadChildren: () =>
          import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
        data: {
          showSearchInput: true,
          adminMode: true,
          types: [
            {
              key: 'documents',
              label: 'Documents',
              component: DocumentComponent,
              detailComponent: DocumentDetailComponent,
              aggregations: AggregationFilter.filter
            },
            {
              key: 'institutions',
              label: 'Organizations',
              component: InstitutionComponent,
              detailComponent: InstitutionDetailComponent
            },
            {
              key: 'users',
              label: 'Users',
              component: UserComponent,
              detailComponent: UserDetailComponent
            },
            {
              key: 'deposits',
              label: 'Deposits',
              component: BriefViewComponent,
              canRead: canReadDeposit,
              canUpdate: canUpdateDeposit,
              canDelete: canDeleteDeposit,
              canAdd: canAddDeposit
            }
          ]
        }
      },
      {
        path: 'deposit/:id',
        children: [
          {
            path: 'create',
            component: UploadComponent
          },
          {
            path: 'confirmation',
            component: ConfirmationComponent
          },
          {
            path: ':step',
            component: DepositEditorComponent
          }
        ]
      }
    ]
  },
  {
    path: 'organization/sonar/search',
    loadChildren: () =>
      import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    data: {
      showSearchInput: false,
      adminMode: false,
      detailUrl: '/organization/sonar/:type/:pid',
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          aggregations: AggregationFilter.filter
        }
      ]
    }
  },
  {
    path: 'organization/unisi/search',
    loadChildren: () =>
      import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    data: {
      showSearchInput: false,
      adminMode: false,
      detailUrl: '/organization/unisi/:type/:pid',
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          aggregations: AggregationFilter.filter,
          preFilters: {
            institution: 'unisi'
          }
        }
      ]
    }
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(private translateService: TranslateService) {
    AggregationFilter.translateService = this.translateService;
  }
}
