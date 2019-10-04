import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'languageValue'
})
export class LanguageValuePipe implements PipeTransform {

  constructor(private translateService: TranslateService) {}

  transform(value: any[], ...args: any[]): string {
    if (!value || value.length === 0) {
      return '';
    }

    if (!args[0]) {
      args[0] = 'value';
    }

    if (!args[1]) {
      args[1] = 'language';
    }

    const languageMap = {
      fr : 'fre',
      en : 'eng',
      de : 'ger',
      it : 'ita'
    };

    const currentLang = this.translateService.currentLang;

    if (!languageMap[currentLang]) {
      return value[0][args[0]];
    }

    value.forEach(element => {
      if (element[args[1]] === languageMap[currentLang]) {
        return element[args[0]];
      }
    });

    return value[0][args[0]];
  }
}
