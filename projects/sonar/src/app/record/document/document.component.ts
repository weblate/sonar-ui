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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ResultItem } from '@rero/ng-core';
import { Subscription } from 'rxjs';
import { AppConfigService } from '../../app-config.service';
import { DocumentFile } from './document.interface';

const SORT_CONTRIBUTOR_PRIORITY = ['cre', 'ctb', 'dgs', 'edt', 'prt'];

@Component({
  templateUrl: './document.component.html',
})
export class DocumentComponent implements ResultItem, OnDestroy, OnInit {
  // Record object
  record: any;

  // Type of resource
  type: string;

  // Detail URL object
  detailUrl: { link: string; external: boolean };

  // Abstract corresponding to current language.
  abstract: string;

  // Subscription to observables, used to unsubscribe to all at the same time.
  private _subscription: Subscription = new Subscription();

  /**
   * Constructor.
   *
   * @param _configService Config service
   * @param _translateService Translate service
   */
  constructor(
    private _configService: AppConfigService,
    private _translateService: TranslateService
  ) {}

  /**
   * Component initialization.
   */
  ngOnInit() {
    // Initialize and sort contributors
    if (!this.record.metadata.contribution) {
      this.record.metadata.contribution = [];
    }
    this._sortContributors();

    // Load abstract
    this._storeAbstract();

    // When language change, abstracts are sorted and first one is displayed.
    this._subscription.add(
      this._translateService.onLangChange.subscribe(() => {
        this._storeAbstract();
      })
    );
  }

  /**
   * Component destruction.
   *
   * Unsubscribe from subscribers.
   */
  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  /**
   * Return the main file of the record.
   */
  get mainFile(): DocumentFile {
    if (!this.record.metadata._files || this.record.metadata._files.length === 0) {
      return null;
    }

    const files = this.record.metadata._files.filter((file: any) => file.type === 'file');

    return files.length === 0 ? null : files[0];
  }

  /**
   * Sort contributors by given priorities array constant.
   */
  private _sortContributors() {
    this.record.metadata.contribution = this.record.metadata.contribution.sort(
      (a: any, b: any) => {
        const aIndex = SORT_CONTRIBUTOR_PRIORITY.findIndex(
          (role) => a.role[0] === role
        );
        const bIndex = SORT_CONTRIBUTOR_PRIORITY.findIndex(
          (role) => b.role[0] === role
        );
        if (aIndex === bIndex) {
          return 0;
        }
        return aIndex < bIndex ? -1 : 1;
      }
    );
  }

  private _storeAbstract() {
    if (
      !this.record.metadata.abstracts ||
      this.record.metadata.abstracts.length === 0
    ) {
      return null;
    }

    const currentLang = this._configService.languagesMap.find(
      (item) => item.code === this._translateService.currentLang
    );

    const abstract = this.record.metadata.abstracts.find(
      (item: any) => item.language === currentLang.bibCode
    );

    this.abstract = abstract
      ? abstract.value
      : this.record.metadata.abstracts[0].value;
  }
}
