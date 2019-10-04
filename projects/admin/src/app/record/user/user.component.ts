import { Component, Input } from '@angular/core';
import { ResultItem } from '@rero/ng-core';

@Component({
  templateUrl: './user.component.html'
})
export class UserComponent implements ResultItem {
  @Input()
  record: any;

  @Input()
  type: string;
}
