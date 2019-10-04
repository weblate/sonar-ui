import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'join'
})
export class JoinPipe implements PipeTransform {

  transform(value: string[], ...args: any[]): string {
    if (!value) {
      return '';
    }

    if (!args[0]) {
      args[0] = ', ';
    }
    return value.join(args[0]);
  }

}
