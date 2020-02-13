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
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  templateUrl: './detail.component.html'
})
export class DetailComponent {
  /** Observable resolving record data */
  record$: Observable<any>;

  /** File key to preview */
  previewFileKey: string;

  /**
   * Get only files of type "file" (exclude fulltext files).
   */
  filterFiles(files: Array<any>): Array<any> {
    return files.filter((item: any) => {
      return item.type === 'file';
    });
  }
}
