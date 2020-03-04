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

  ngOnInit() {
    this.loadThumbnail();
  }

  /**
   * Load the thumbnail for record
   */
  private loadThumbnail() {
    if (!this.record.metadata._files) {
      return;
    }

    const thumbnails = this.record.metadata._files.filter((file: any) => file.type === 'thumbnail');

    if (thumbnails.length === 0) {
      return;
    }

    this.thumbnail = `/documents/${this.record.metadata.pid}/files/${thumbnails[0].key}`;
  }
}
