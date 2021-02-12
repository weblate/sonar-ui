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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentFile } from '../document.interface';

@Component({
  selector: 'sonar-document-file',
  templateUrl: './file.component.html'
})
export class FileComponent {
  // File object.
  @Input()
  file: DocumentFile;

  // Show preview icon
  @Input()
  showPreview = true;

  // Show download icon
  @Input()
  showDownload = true;

  @Input()
  showExternalLink = true;

  // Show label
  @Input()
  showLabel = true;

  // Force link.
  @Input()
  link: string;

  // In router or standard href link
  @Input()
  inRouter = false;

  /** Event emitted when a preview is clicked. */
  @Output()
  previewClicked: EventEmitter<any> = new EventEmitter();

  /**
   * Method called when a preview link is clicked.
   *
   * @param file Document file object.
   */
  preview(file: DocumentFile): void {
    this.previewClicked.emit(file);
  }
}
