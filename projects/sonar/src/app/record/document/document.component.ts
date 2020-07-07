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

  // Thumbnail file for record
  thumbnail: any;

  // Main file of the document
  mainFile: any;

  // Embargo date
  embargoDate: string;

  // Boolean giving the information is the main file is restricted
  restricted: boolean;

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
   * - Extracts and stores main file from document files.
   * - Stores embargo information from main file.
   * - Load thumbnail for the record.
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

    if (this.record.metadata._files) {
      this.mainFile = this.record.metadata._files.find(
        (file: any) => file.type === 'file'
      );
      if (this.mainFile) {
        if (this.mainFile.restriction.date) {
          this.embargoDate = this.mainFile.restriction.date;
        }

        if (this.mainFile.restriction.restricted) {
          this.restricted = this.mainFile.restriction.restricted;
        }

        this._loadThumbnail();
      }
    }
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
   * Load the thumbnail for record
   */
  private _loadThumbnail() {
    if (!this.record.metadata._files) {
      return;
    }

    const thumbnail = this.record.metadata._files.find(
      (file: any) => file.type === 'thumbnail'
    );

    if (!thumbnail) {
      return;
    }

    if (this.restricted === true) {
      this.thumbnail = '/static/images/restricted.png';
      return;
    }

    this.thumbnail = `/documents/${this.record.metadata.pid}/files/${thumbnail.key}`;
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
