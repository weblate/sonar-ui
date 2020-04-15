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
import { Injectable } from '@angular/core';
import { TranslateLoader as NgCoreTranslateLoader } from '@rero/ng-core';
import { AppConfigService } from '../../app-config.service';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import fr from '../i18n/fr.json';
import it from '../i18n/it.json';

@Injectable()
export class TranslateLoader extends NgCoreTranslateLoader {

  /**
   * Store translations in available languages.
   */
  private _applicationTranslations: object = { fr, de, en, it };

  /**
   * Constructor.
   *
   * @param _appService Application service.
   */
  constructor(private _appService: AppConfigService) {
    super(_appService);
    this._loadApplicationTranslations();
  }

  /**
   * Load application translations
   */
  private _loadApplicationTranslations() {
    for (const lang of this._appService.languages) {
      this.translations[lang] = {...this.translations[lang], ...this._applicationTranslations[lang]};
    }
  }
}
