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
import { Component, OnInit } from '@angular/core';
import { ResultItem } from '@rero/ng-core';

@Component({
  templateUrl: './document.component.html'
})
export class DocumentComponent implements ResultItem, OnInit {
  // Record object
  record: any;

  // Type of resource
  type: string;

  // Detail URL object
  detailUrl: { link: string, external: boolean };

  // Thumbnail file for record
  thumbnail: any;

  // Main file of the document
  mainFile: any;

  // Embargo date
  embargoDate: string;

  // Boolean giving the information is the main file is restricted
  restricted: boolean;

  /**
   * Component initialization.
   * - Extracts and stores main file from document files.
   * - Stores embargo information from main file.
   * - Load thumbnail for the record.
   */
  ngOnInit() {
    this.mainFile = this.record.metadata._files.find((file: any) => file.type === 'file');

    if (this.mainFile) {
      if (this.mainFile.restricted.date) {
        this.embargoDate = this.mainFile.restricted.date;
      }

      if (this.mainFile.restricted.restricted) {
        this.restricted = this.mainFile.restricted.restricted;
      }

      this.loadThumbnail();
    }
  }

  /**
   * Load the thumbnail for record
   */
  private loadThumbnail() {
    if (!this.record.metadata._files) {
      return;
    }

    const thumbnail = this.record.metadata._files.find((file: any) => file.type === 'thumbnail');

    if (!thumbnail) {
      return;
    }

    if (this.restricted === true) {
      this.thumbnail = '/static/images/restricted.png';
      return;
    }

    this.thumbnail = `/documents/${this.record.metadata.pid}/files/${thumbnail.key}`;
  }
}
