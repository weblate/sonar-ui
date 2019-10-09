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
    component: DashboardComponent
  },
  {
    path: 'records',
    loadChildren: () => import('./record-wrapper/record-wrapper.module').then(m => m.RecordWrapperModule),
    data: {
      showSearchInput: true,
      adminMode: true,
      linkPrefix: '/records',
      types: [
        {
          key: 'documents',
          label: 'Documents',
          component: DocumentComponent,
          detailComponent: DocumentDetailComponent
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
