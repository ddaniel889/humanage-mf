import { Component, input, output, viewChild, ViewEncapsulation } from '@angular/core';
import { OrganizationalUnit } from '../../models/organizational-unit.model';
import { MatLabel, MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'hl-ou-select',
  imports: [MatIconModule, MatSelectModule, MatLabel, MatFormFieldModule, TranslocoDirective],
  standalone: true,
  templateUrl: './ou-select.component.html',
  styleUrl: './ou-select.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class OuSelectComponent {
  ous = input.required<OrganizationalUnit[]>();
  selectedOu = input.required<OrganizationalUnit>();
  ouChange = output<OrganizationalUnit>();
  ouSelector = viewChild<MatSelect>('ouSelector');

  compareOu = (a: OrganizationalUnit, b: OrganizationalUnit): boolean => {
    return a?.id === b?.id;
  };

  onSelectOu(event: MatSelectChange<OrganizationalUnit>) {
    const ou = event.value;
    this.ouChange.emit(ou);
    this.onSelectClose();
  }

  onSelectClose() {
    // This is needed to lost focus on the select and restore the border radius of the form field
    this.ouSelector()?.close();
  }
}
