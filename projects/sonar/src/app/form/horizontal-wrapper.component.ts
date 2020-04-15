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

import { Component } from '@angular/core';

import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'sonar-formly-horizontal-wrapper',
  template: `
    <div class="form-group row">
      <label [attr.for]="id" class="col-sm-4 col-form-label" *ngIf="to.label">
        {{ to.label }}
        <ng-container *ngIf="to.required">*</ng-container>
      </label>
      <div class="col-sm-8">
        <ng-template #fieldComponent></ng-template>
        <div *ngIf="showError" class="invalid-feedback d-block">
          <formly-validation-message [field]="field"></formly-validation-message>
        </div>
      </div>
    </div>
  `
})
export class FormlyHorizontalWrapperComponent extends FieldWrapper {}
