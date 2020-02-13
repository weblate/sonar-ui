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
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'fileLink'
})
export class FileLinkPipe implements PipeTransform {
  constructor(public sanitizer: DomSanitizer) { }

  /**
   * Generate the link for a file
   * @param key File key
   * @param resourceType Type of the resource
   * @param resourceId Id of the resource
   * @param fileType If we want to have "files" or "preview"
   */
  transform(key: any, resourceType: string, resourceId: string, fileType = 'files'): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${resourceType}/${resourceId}/${fileType}/${key}`);
  }
}
