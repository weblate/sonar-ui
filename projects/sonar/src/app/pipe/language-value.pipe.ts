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
import { TranslateService } from '@ngx-translate/core';

/**
 * Return the value of source array, corresponding of given language.
 */
@Pipe({
  name: 'languageValue'
})
export class LanguageValuePipe implements PipeTransform {
  /**
   * Constructor.
   *
   * @param _translateService Translate service.
   */
  constructor(private _translateService: TranslateService) { }

  transform(value: any[], ...args: any[]): string {
    if (!value || value.length === 0) {
      return '';
    }

    if (!args[0]) {
      args[0] = 'value';
    }

    if (!args[1]) {
      args[1] = 'language';
    }

    const languageMap = {
      fr: 'fre',
      en: 'eng',
      de: 'ger',
      it: 'ita'
    };

    const currentLang = this._translateService.currentLang;

    if (!languageMap[currentLang]) {
      return value[0][args[0]];
    }

    value.forEach(element => {
      if (element[args[1]] === languageMap[currentLang]) {
        return element[args[0]];
      }
    });

    return value[0][args[0]];
  }
}
