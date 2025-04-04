import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceColon',
  standalone: true,
})
export class ReplaceColonPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/:/g, '');
  }
}
