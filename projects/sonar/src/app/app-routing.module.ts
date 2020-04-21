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
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ActionStatus } from '@rero/ng-core';
import { Observable, of } from 'rxjs';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BriefViewComponent } from './deposit/brief-view/brief-view.component';
import { ConfirmationComponent } from './deposit/confirmation/confirmation.component';
import { EditorComponent as DepositEditorComponent } from './deposit/editor/editor.component';
import { UploadComponent } from './deposit/upload/upload.component';
import { AggregationFilter } from './record/document/aggregation-filter';
import { DetailComponent as DocumentDetailComponent } from './record/document/detail/detail.component';
import { DocumentComponent } from './record/document/document.component';
import { DetailComponent as OrganisationDetailComponent } from './record/organisation/detail/detail.component';
import { OrganisationComponent } from './record/organisation/organisation.component';
import { DetailComponent as UserDetailComponent } from './record/user/detail/detail.component';
import { UserComponent } from './record/user/user.component';
import { AdminComponent } from './_layout/admin/admin.component';

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

const adminModeDisabled = (): Observable<ActionStatus> => {
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
          types: [
            {
              key: 'documents',
              label: 'Documents',
              component: DocumentComponent,
              detailComponent: DocumentDetailComponent,
              aggregations: AggregationFilter.filter
            },
            {
              key: 'organisations',
              label: 'Organisations',
              component: OrganisationComponent,
              detailComponent: OrganisationDetailComponent
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
    path: 'organisation/sonar/search',
    loadChildren: () =>
      import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    data: {
      showSearchInput: false,
      adminMode: adminModeDisabled,
      detailUrl: '/organisation/sonar/:type/:pid',
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
    path: 'organisation/unisi/search',
    loadChildren: () =>
      import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    data: {
      showSearchInput: false,
      adminMode: adminModeDisabled,
      detailUrl: '/organisation/unisi/:type/:pid',
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          aggregations: AggregationFilter.filter,
          preFilters: {
            organisation: 'unisi'
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
  /**
   * Constructor.
   *
   * @param _translateService Translate service.
   */
  constructor(private _translateService: TranslateService) {
    AggregationFilter.translateService = this._translateService;
  }
}
