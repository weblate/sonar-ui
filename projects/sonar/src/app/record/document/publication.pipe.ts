/*
 * SONAR User Interface
 * Copyright (C) 2021 RERO
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
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@rero/ng-core';

/**
 * Pipe for displaying publication for a document
 */
@Pipe({
  name: 'publication',
})
export class PublicationPipe implements PipeTransform {
  /**
   * Constructor.
   *
   * @param _translateService TranslateService
   */
  constructor(private _translateService: TranslateService) {}

  /**
   * Transform `partOf` object in text.
   *
   * @param value `partOf` object.
   * @returns Text representing the publication.
   */
  transform(value: any): string {
    const journal: Array<string> = [];

    if (value.document && value.document.title) {
      journal.push(value.document.title);
    }

    if (value.numberingYear) {
      journal.push(value.numberingYear);
    }

    if (value.numberingVolume) {
      journal.push(
        this._translateService.translate('vol.') + ' ' + value.numberingVolume
      );
    }

    if (value.numberingIssue) {
      journal.push(
        this._translateService.translate('no.') + ' ' + value.numberingIssue
      );
    }

    if (value.numberingPages) {
      journal.push(
        this._translateService.translate('p.') + ' ' + value.numberingPages
      );
    }

    return journal.join(', ');
  }
}
