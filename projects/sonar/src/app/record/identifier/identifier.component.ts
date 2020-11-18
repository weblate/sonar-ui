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
import { Component, Input } from '@angular/core';
import { TranslateService } from '@rero/ng-core';

/**
 * Component that display an identifier.
 */
@Component({
  selector: 'sonar-record-identifier',
  templateUrl: './identifier.component.html',
})
export class IdentifierComponent {
  /** Type of identifier (local, DOI, ...) */
  @Input()
  type: string;

  /** Identifier value */
  @Input()
  value: string;

  /** Identifier source */
  @Input()
  source: string;

  /**
   * Constructor.
   *
   * @param _translateService: Translate service.
   */
  constructor(private _translateService: TranslateService) {}

  /**
   * Return the value to display in the badge
   *
   * @returns String value displayed in the badge
   */
  get badgeValue(): string {
    if (this.type == null) {
      throw new Error('Type cannot not be empty');
    }

    return this.type === 'bf:Local'
      ? this.source
      : this._translateService.translate(this.type);
  }

  /**
   * Check if source is set to ORCID.
   *
   * @returns True if source is set to ORCID.
   */
  get isSourceOrcid(): boolean {
    if (this.source == null) {
      return false;
    }
    return this.source.toLowerCase() === 'orcid';
  }
}
