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

import { RecordSearchComponent, DetailComponent as RecordDetailComponent, EditorComponent } from '@rero/ng-core';
import { DocumentComponent } from './record/document/document.component';
import { InstitutionComponent } from './record/institution/institution.component';
import { UserComponent } from './record/user/user.component';
import { DetailComponent as DocumentDetailComponent } from './record/document/detail/detail.component';
import { DetailComponent as InstitutionDetailComponent } from './record/institution/detail/detail.component';
import { DetailComponent as UserDetailComponent } from './record/user/detail/detail.component';


const routes: Routes = [
  {
    path: 'records',
    children: [
      { path: ':type', component: RecordSearchComponent },
      { path: ':type/detail/:pid', component: RecordDetailComponent },
      { path: ':type/edit/:pid', component: EditorComponent },
      { path: ':type/new', component: EditorComponent }
    ],
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
        }
      ]
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
