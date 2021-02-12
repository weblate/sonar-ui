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
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscriber } from 'rxjs';

export class AggregationFilter {
  static translateService: TranslateService;

  // Default code for global search
  static globalSearchViewCode: string;

  // Current view
  static view: string;

  /**
   * Creates an observable emitting the aggregations.
   *
   * @param aggregations Object containing the aggregations.
   * @returns Observable resolving aggregations.
   */
  static filter(aggregations: object): Observable<any> {
    const obs = new Observable((observer: Subscriber<any>): void => {
      observer.next(AggregationFilter.aggregationFilter(aggregations));
      AggregationFilter.translateService.onLangChange.subscribe(() => {
        observer.next(AggregationFilter.aggregationFilter(aggregations));
      });
    });
    return obs;
  }

  /**
   * Filter aggregations.
   *
   * @param aggregations Object containing the aggregations.
   * @returns Filtered aggregations.
   */
  static aggregationFilter(aggregations: any) {
    const aggs = {};

    Object.keys(aggregations).forEach(aggregation => {
      // Translate values for document type
      if (aggregation === 'document_type') {
        aggregations[aggregation].buckets.forEach((bucket: any) => {
          bucket.name = this.translateService.instant('document_type_' + bucket.key);
        });
      }

      if (aggregation === 'status') {
        aggregations[aggregation].buckets.forEach((bucket: any) => {
          bucket.name = this.translateService.instant('deposit_status_' + bucket.key);
        });
      }

      if (aggregation.indexOf('__') > -1) {
        const splitted = aggregation.split('__');
        if (AggregationFilter.translateService.currentLang === splitted[1]) {
          aggs[aggregation] = aggregations[aggregation];
        }
      } else {
        aggs[aggregation] = aggregations[aggregation];
      }
    });
    return aggs;
  }
}
