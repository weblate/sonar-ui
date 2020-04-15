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
import { SecurityContext } from '@angular/core';
import { inject } from '@angular/core/testing';
import { DomSanitizer, ɵDomSanitizerImpl } from '@angular/platform-browser';
import { HighlightJsonPipe } from './highlight-json.pipe';

describe('HighlightJsonPipe', () => {
  const sanitizer: DomSanitizer = new ɵDomSanitizerImpl(null);

  it('highlight json by injecting customs css classes', inject(
    [DomSanitizer],
    (domSanitizer: DomSanitizer) => {
      const pipe = new HighlightJsonPipe(domSanitizer);
      expect(pipe).toBeTruthy();

      const highlightedText = pipe.transform('{ title: "Title of document" }');
      const sanitizedValue = sanitizer.sanitize(SecurityContext.HTML, highlightedText);
      expect(sanitizedValue).toBe('{ title: <span class="string">"Title of document"</span> }');
    }
  ));
});
