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

import { Component } from '@angular/core';
import { FieldArrayType } from '@ngx-formly/core';

@Component({
  selector: 'admin-formly-array-type',
  template: `
    <div class="mb-5">
      <legend *ngIf="to.label">
        {{ to.label }}
        <button class="btn btn-outline-secondary btn-sm" type="button" (click)="add()">
          <i class="fa fa-plus"></i>
        </button>
      </legend>
      <p *ngIf="to.description">{{ to.description }}</p>

      <div class="alert alert-danger" role="alert" *ngIf="showError && formControl.errors">
        <formly-validation-message [field]="field"></formly-validation-message>
      </div>

      <div *ngFor="let field of field.fieldGroup; let i = index" class="">
        <div class="d-flex">
          <formly-field class="flex-grow-1" [field]="field"></formly-field>
          <div class="ml-2">
            <button class="btn btn-outline-secondary" type="button" (click)="remove(i)">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ArrayTypeComponent extends FieldArrayType {}
