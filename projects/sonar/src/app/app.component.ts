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
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  LangChangeEvent,
  TranslateService as NgxTranslateService,
} from '@ngx-translate/core';
import { TranslateService } from '@rero/ng-core';
import cookie from 'cookie';
import { Subscription } from 'rxjs';

@Component({
  selector: 'sonar-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnDestroy, OnInit {
  // Change language subscription.
  private _changeLanguageSubscription: Subscription;

  /**
   * Constructor.
   *
   * @param _translateService Translate service.
   * @param _ngxTranslateService NgxTranslateService.
   */
  constructor(
    private _translateService: TranslateService,
    private _ngxTranslateService: NgxTranslateService
  ) {}

  /**
   * Component init hook.
   */
  ngOnInit() {
    this._changeLanguageSubscription = this._ngxTranslateService.onLangChange.subscribe(
      (event: LangChangeEvent) => {
        document.cookie = `lang=${event.lang}`;
      }
    );

    this._translateService.setLanguage(this._getPreferredLang());
  }

  /**
   * Component destruction hook.
   */
  ngOnDestroy() {
    this._changeLanguageSubscription.unsubscribe();
  }

  /**
   * Return the preferred language for the user.
   */
  private _getPreferredLang(): string {
    const cookies = cookie.parse(document.cookie);

    if (cookies.lang) {
      return cookies.lang;
    }

    return document.documentElement.lang || 'en';
  }
}
