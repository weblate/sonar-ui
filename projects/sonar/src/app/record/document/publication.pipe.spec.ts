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
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@rero/ng-core';
import { mockedConfiguration } from '../../../../tests/utils';
import { PublicationPipe } from './publication.pipe';

let pipe: PublicationPipe;

describe('PublicationPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(mockedConfiguration);

    pipe = new PublicationPipe(TestBed.get(TranslateService));
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty publication', () => {
    expect(pipe.transform({})).toBe('');
  });

  it('should return only document', () => {
    expect(pipe.transform({ document: { title: 'Journal' } })).toBe('Journal');
  });

  it('should return document and year', () => {
    expect(
      pipe.transform({ document: { title: 'Journal' }, numberingYear: '2000' })
    ).toBe('Journal, 2000');
  });

  it('should return document, year and issue', () => {
    expect(
      pipe.transform({
        document: { title: 'Journal' },
        numberingYear: '2000',
        numberingIssue: '12',
      })
    ).toBe('Journal, 2000, no. 12');
  });

  it('should return document, year, issue and volume', () => {
    expect(
      pipe.transform({
        document: { title: 'Journal' },
        numberingYear: '2000',
        numberingIssue: '12',
        numberingVolume: '1',
      })
    ).toBe('Journal, 2000, vol. 1, no. 12');
  });

  it('should return document, year, issue, volume and pages', () => {
    expect(
      pipe.transform({
        document: { title: 'Journal' },
        numberingYear: '2000',
        numberingIssue: '12',
        numberingVolume: '1',
        numberingPages: '20-25',
      })
    ).toBe('Journal, 2000, vol. 1, no. 12, p. 20-25');
  });
});
