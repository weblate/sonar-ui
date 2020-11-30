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
import { ActivationStart, Router, RouterEvent, RouterModule, Routes, UrlSegment } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ActionStatus, DetailComponent, EditorComponent, RecordSearchPageComponent } from '@rero/ng-core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BriefViewComponent } from './deposit/brief-view/brief-view.component';
import { ConfirmationComponent } from './deposit/confirmation/confirmation.component';
import { EditorComponent as DepositEditorComponent } from './deposit/editor/editor.component';
import { UploadComponent } from './deposit/upload/upload.component';
import { CanAddGuard } from './guard/can-add.guard';
import { RoleGuard } from './guard/role.guard';
import { AggregationFilter } from './record/document/aggregation-filter';
import { DetailComponent as DocumentDetailComponent } from './record/document/detail/detail.component';
import { DocumentComponent } from './record/document/document.component';
import { DetailComponent as OrganisationDetailComponent } from './record/organisation/detail/detail.component';
import { OrganisationComponent } from './record/organisation/organisation.component';
import { DetailComponent as UserDetailComponent } from './record/user/detail/detail.component';
import { UserComponent } from './record/user/user.component';
import { UserService } from './user.service';
import { AdminComponent } from './_layout/admin/admin.component';

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
        path: 'deposit/:id',
        canActivate: [RoleGuard],
        data: {
          role: 'submitter'
        },
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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
  /**
   * Constructor.
   *
   * Adds routes for resources
   *
   * @param _translateService Translate service.
   * @param _router Router service.
   * @param _userService User service.
   * @param _appConfigService Config service.
   */
  constructor(
    private _translateService: TranslateService,
    private _router: Router,
    private _userService: UserService,
    private _appConfigService: AppConfigService
  ) {
    AggregationFilter.globalSearchViewCode = this._appConfigService.globalSearchViewCode;
    AggregationFilter.translateService = this._translateService;

    this._router.config.push({
      path: ':view/search',
      children: [
        { path: ':type', component: RecordSearchPageComponent },
        { path: ':type/detail/:pid', component: DetailComponent }
      ],
      data: {
        showSearchInput: false,
        adminMode: adminModeDisabled,
        types: [
          {
            showLabel: false,
            key: 'documents',
            label: 'Documents',
            component: DocumentComponent,
            aggregations: AggregationFilter.filter,
            aggregationsExpand: ['document_type', 'controlled_affiliation', 'year'],
            aggregationsOrder: [
              'document_type',
              'controlled_affiliation',
              'year',
              'specific_collection',
              'language',
              'author',
              'subject',
              'organisation'
            ],
            aggregationsBucketSize: 10,
            searchFields: [
              {
                label: this._translateService.instant('Full-text'),
                path: 'fulltext'
              }
            ]
          }
        ]
      }
    });

    // Page for editing user profile.
    this._router.config.push({
      path: ':type/profile/:pid',
      component: EditorComponent,
      canActivate: [RoleGuard],
      data: {
        types: [
          {
            key: 'users',
            redirectUrl: (record: any) => {
              return of(`/users/profile/${record.metadata.pid}`);
            }
          }
        ]
      }
    });

    // Fallback page
    this._router.config.push({ path: '**', redirectTo: '' });

    this._updateSearchRouteData();

    const recordsRoutesConfiguration = [
      {
        type: 'documents',
        briefView: DocumentComponent,
        detailView: DocumentDetailComponent,
        aggregations: AggregationFilter.filter,
        aggregationsExpand: ['document_type', 'controlled_affiliation', 'year'],
        aggregationsOrder: [
          'document_type',
          'controlled_affiliation',
          'year',
          'specific_collection',
          'language',
          'author',
          'subject',
          'organisation',
        ],
        editorSettings: {
          longMode: true
        },
        files: {
          enabled: true,
          filterList: (item: any) => {
            return item.metadata && item.metadata.type && item.metadata.type === 'file';
          },
          orderList: (a: any, b: any) => {
            return a.metadata.order - b.metadata.order;
          },
          infoExcludedFields: ['restriction', 'type', 'links', 'thumbnail'],
          canUpdateMetadata: () => of({ can: true, message: '' })
        },
        searchFields: [
          {
            label: this._translateService.instant('Full-text'),
            path: 'fulltext'
          }
        ]
      },
      {
        type: 'users',
        briefView: UserComponent,
        detailView: UserDetailComponent,
        aggregationsOrder: ['missing_organisation']
      },
      {
        type: 'organisations',
        briefView: OrganisationComponent,
        detailView: OrganisationDetailComponent,
        files: {
          enabled: true
        },
      },
      {
        type: 'deposits',
        briefView: BriefViewComponent,
        aggregations: AggregationFilter.filter,
        aggregationsExpand: ['status', 'user', 'contributor'],
        aggregationsOrder: ['status', 'user', 'contributor']
      }
    ];

    recordsRoutesConfiguration.forEach((config: any) => {
      const route = {
        matcher: (url: any) => this._routeMatcher(url, config.type),
        canActivate: [RoleGuard],
        children: [
          { path: '', component: RecordSearchPageComponent },
          { path: 'detail/:pid', component: DetailComponent },
          { path: 'edit/:pid', component: EditorComponent },
          { path: 'new', component: EditorComponent, canActivate: [CanAddGuard] }
        ],
        data: {
          role: 'submitter',
          showSearchInput: true,
          types: [
            {
              key: config.type,
              label: config.type.charAt(0).toUpperCase() + config.type.slice(1),
              component: config.briefView || null,
              editorSettings: config.editorSettings || false,
              detailComponent: config.detailView || null,
              aggregations: config.aggregations || null,
              aggregationsExpand: config.aggregationsExpand || [],
              aggregationsOrder: config.aggregationsOrder || [],
              aggregationsBucketSize: 10,
              files: config.files || null,
              searchFields: config.searchFields || null,
              canAdd: () => this._can(config.type, 'add'),
              canUpdate: (record: any) => this._can(config.type, 'update', record),
              canDelete: (record: any) => this._can(config.type, 'delete', record),
              canRead: (record: any) => this._can(config.type, 'read', record)
            }
          ]
        }
      };

      this._router.config[0].children.push(route);
    });
  }

  /**
   * Updates route data properties which are depending to the view parameter.
   */
  private _updateSearchRouteData() {
    this._router.events.subscribe((e: RouterEvent) => {
      if (e instanceof ActivationStart &&
        e.snapshot.parent.routeConfig &&
        e.snapshot.parent.routeConfig.path === ':view/search'
      ) {
        AggregationFilter.view = e.snapshot.params.view;

        e.snapshot.data = {
          ...e.snapshot.data, ...{
            detailUrl: `/${e.snapshot.params.view}/:type/:pid`
          }
        };

        e.snapshot.data.types[0].preFilters = {
          view: e.snapshot.params.view
        };
      }
    });
  }

  /**
   * Check if resource of given type can do the given action.
   *
   * @param resource Resource type.
   * @param action Action to check.
   * @param record Record dict.
   * @return Observable
   */
  private _can(resource: string, action: string, record: any = null): Observable<ActionStatus> {
    if (resource === 'deposits' && ['add', 'update'].includes(action)) {
      return of({ can: false, message: '' });
    }

    if (record) {
      return of({ can: record.metadata.permissions[action], message: '' });
    }

    return this._userService.user$.pipe(
      map((user: any) => {
        return { can: user.permissions[resource][action], message: '' };
      })
    );
  }

  /**
   * Route matcher for matching route with a resource type.
   *
   * @param url URL parts for the route.
   * @param type Resource type.
   * @returns The matched URL if found or null.
   */
  private _routeMatcher(url: any, type: string) {
    if (url[0].path === 'records' && url[1].path === type) {
      return this._matchedUrl(url);
    }
    return null;
  }

  /**
   * Matched url
   *
   * @param url UrlSegment
   * @returns Object containing the matched URL.
   */
  private _matchedUrl(url: UrlSegment[]) {
    const segments = [
      new UrlSegment(url[0].path, {}),
      new UrlSegment(url[1].path, {})
    ];
    return {
      consumed: segments,
      posParams: { type: new UrlSegment(url[1].path, {}) }
    };
  }
}
