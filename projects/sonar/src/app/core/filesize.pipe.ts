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
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Get human readable file size.
 */
@Pipe({
  name: 'filesize'
})
export class FileSizePipe implements PipeTransform {
  /**
   * Transform size to a human readable size.
   *
   * @param size Size of file.
   * @param extension Extension of file.
   * @return Human readable file size.
   */
  transform(size: number, extension: string = ' Mo') {
    return (size / (1024 * 1024)).toFixed(2) + extension;
  }
}
