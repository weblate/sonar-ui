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
import { Observable, Subscription } from 'rxjs';
import { AppConfigService } from '../../../app-config.service';

const SORT_CONTRIBUTOR_PRIORITY = ['cre', 'ctb', 'dgs', 'edt', 'prt'];

@Component({
  templateUrl: './detail.component.html',
})
export class DetailComponent implements OnDestroy, OnInit {
  /** Observable resolving record data */
  record$: Observable<any>;

  /** File key to preview */
  previewFileKey: string;

  // Show only three contributors on startup.
  contributorsLength = 3;

  // Record retrieved from observable.
  record: any = null;

  // Subscription to observables, used to unsubscribe to all at the same time.
  private _subscription: Subscription = new Subscription();

  /**
   * Constructor.
   *
   * @param _configSservice Config service.
   * @param _translateService Translate service.
   */
  constructor(
    private _configSservice: AppConfigService,
    private _translateService: TranslateService
  ) {}

  /**
   * Component initialisation.
   *
   * Retrieve record from observable.
   */
  ngOnInit() {
    this.record$.subscribe((record: any) => {
      this.record = record.metadata;

      // Add property to abstracts for show more functionality.
      if (!this.record.abstracts) {
        this.record.abstracts = [];
      }
      this.sortAbstracts();
      this.record.abstracts.map((element: any, index: number) => {
        element.show = index === 0;
        element.full = false;
        return element;
      });

      if (!this.record.contribution) {
        this.record.contribution = [];
      }
      this.sortContributors();
    });

    // When language change, abstracts are sorted and first one is displayed.
    this._subscription.add(
      this._translateService.onLangChange.subscribe(() => {
        this.sortAbstracts();
        if (this.record.abstracts.length > 0) {
          this.changeAbstract(this.record.abstracts[0]);
        }
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
   * Returns the list of contributions filtered by creator.
   *
   * @returns List of contributors limited.
   */
  get filteredContributors(): Array<any> {
    const contributors = this.record.contribution.slice(
      0,
      this.contributorsLength
    );

    return contributors;
  }

  /**
   * Get only files of type "file" (exclude fulltext and thumbnail files).
   *
   * @return List of item filtered.
   */
  get filteredFiles(): Array<any> {
    if (!this.record._files) {
      return [];
    }

    return this.record._files.filter((item: any) => {
      return item.type === 'file';
    });
  }

  /**
   * Return the document's main file.
   *
   * @returns Main file object.
   */
  get mainFile(): any {
    return this.filteredFiles.length === 0 ? null : this.filteredFiles[0];
  }

  /**
   * Show all contributors when clicking on the show more link.
   *
   * @param event DOM event triggered.
   */
  showMoreContributors(event: any) {
    event.preventDefault();
    event.srcElement.parentNode.removeChild(event.srcElement);
    this.contributorsLength = this.record.contribution
      ? this.record.contribution.length
      : 0;
  }

  /**
   * Show abstract's full text when clicking on the show more link.
   *
   * @param event DOM event triggered.
   * @param abstract Object containing abstract's data.
   */
  showMoreAbstract(event: any, abstract: any) {
    event.preventDefault();
    abstract.full = true;
  }

  /**
   * Show abstract corresponding to the clicked language.
   *
   * @param abstract Object containing abstract's data.
   */
  changeAbstract(abstract: any) {
    this.record.abstracts.forEach((element: any) => {
      element.show = false;
    });
    abstract.show = true;
  }

  /**
   * Returns the thumbnail corresponding to PDF file.
   *
   * @param file PDF file object.
   * @returns Thumbnail URL.
   */
  getThumbnail(file: any): string {
    const key = file.key.replace(/(.*)\.(.*)$/, '$1.jpg');
    const thumbnail = this.record._files.find(
      (recordFile: any) => recordFile.key === key
    );

    if (!thumbnail) {
      return null;
    }

    if (file.restriction.restricted === true) {
      return '/static/images/restricted.png';
    }

    return `/documents/${this.record.pid}/files/${thumbnail.key}`;
  }

  /**
   * Scroll to target.
   *
   * @param event DOM event triggered.
   * @param target ID of the target element.
   */
  goToOtherFile(event: any, target: string) {
    event.preventDefault();
    document.querySelector('#' + target).scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Sort contributors by given priorities array constant.
   */
  private sortContributors() {
    this.record.contribution = this.record.contribution.sort(
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

  /**
   * Sort abstracts by language prioritization. First language is the current
   * language of the interface.
   */
  private sortAbstracts() {
    const firstLanguage = this._configSservice.languagesMap.find(
      (item) => item.code === this._translateService.currentLang
    );
    const languagesPriorities = [firstLanguage].concat(
      this._configSservice.languagesMap
    );

    this.record.abstracts = this.record.abstracts.sort((a: any, b: any) => {
      const aIndex = languagesPriorities.findIndex(
        (lang) => a.language === lang.bibCode
      );
      const bIndex = languagesPriorities.findIndex(
        (lang) => b.language === lang.bibCode
      );

      if (aIndex === bIndex) {
        return 0;
      }
      return aIndex < bIndex ? -1 : 1;
    });
  }
}
