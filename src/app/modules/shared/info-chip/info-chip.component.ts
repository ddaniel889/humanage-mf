import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';
import { COLOR_CLASSES, HlColor } from '../types/color.types';

@Component({
  selector: 'hl-info-chip',
  templateUrl: './info-chip.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoChipComponent {
  readonly text = input<string>('');
  readonly color = input<HlColor>('green');

  readonly chipClasses = computed(() => COLOR_CLASSES[this.color()]);
}
