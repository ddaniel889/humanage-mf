import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  OnChanges,
} from '@angular/core';
import {
  MatAutocompleteModule,
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { IdName } from '../models/Generics/IdName.model';
import { startWith, map } from 'rxjs/operators';
import { OrganizationalUnitAccess } from '../models/ou-access.model';
import { OrganizationalUnit } from '../models';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-autocomplete-chip',
  templateUrl: './autocomplete-chip.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatFormFieldModule,
    MatChipsModule,
    MatListModule,
    MatButtonModule,
    MatInputModule,
  ],
})
export class AutocompleteChipComponent implements OnChanges {
  @Input() originalList: IdName[];
  @Input() OrganizationList: OrganizationalUnit[];
  @Input() AccessList: OrganizationalUnitAccess[];
  @Input() placeHolderText: string;
  @Input() selectedItemsList: IdName[] = [];
  @Input() disabledAutocomplete = false;
  @Input() showIcons = false;
  @Input() iconName: string;
  @Input() listView = false;
  @Input() simpleSelection = false;
  @Input() itemButtonIcon: string;
  @Input() itemButtonTitle = 'Opciones';
  @Input() AccessView = false;
  @Input() OuView = false;
  @Output() OnChipClick = new EventEmitter<IdName>();
  @Output() OnAccessClick = new EventEmitter<OrganizationalUnitAccess>();
  @Output() OnItemSelected = new EventEmitter<IdName>();
  @Output() OnOuSelected = new EventEmitter<OrganizationalUnit>();
  @Output() OnValidSelected = new EventEmitter<string>();
  @Output() OnRemoveItem = new EventEmitter<IdName>();
  @Output() OnActiveList = new EventEmitter<string>();

  formCtrl = new UntypedFormControl();
  autocompleteNameList: Observable<string[]>;
  autocompleteAccessList: Observable<OrganizationalUnitAccess[]>;
  autocompleteOuList: Observable<OrganizationalUnit[]>;
  selectedOrganizationalUnit: OrganizationalUnit;

  @ViewChild('autocompleteChipInput') autocompleteChipInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  ngOnChanges() {
    this.autocomplete();
  }

  chipClick(entity: IdName) {
    this.OnChipClick.emit(entity);
  }

  activeList() {
    const newName = this.formCtrl.value;
    if (newName != undefined) {
      this.OnActiveList.emit(newName);
    }
  }

  accessClick(entity: OrganizationalUnitAccess) {
    this.OnAccessClick.emit(entity);
  }
  autocomplete() {
    this.autocompleteNameList = this.formCtrl.valueChanges.pipe(
      startWith(null),
      map((name) => this.filterOnValueChange(name)),
    );

    this.autocompleteAccessList = this.formCtrl.valueChanges.pipe(
      startWith(null),
      map((name) => this.filterAccessOnValueChange(name)),
    );

    this.autocompleteOuList = this.formCtrl.valueChanges.pipe(
      startWith(null),
      map((name) => this.filterOuOnValueChange(name)),
    );
  }

  removeItem(item: IdName): void {
    const index = this.selectedItemsList.indexOf(item);
    if (index >= 0) {
      this.selectedItemsList.splice(index, 1);
      this.resetInputs();
      this.OnRemoveItem.emit(item);
    }
  }

  itemSelected(event: MatAutocompleteSelectedEvent): void {
    this.OnItemSelected.emit(event.option.value);
    this.resetInputs();
  }

  ouSelected(event: MatAutocompleteSelectedEvent): void {
    this.OnOuSelected.emit(event.option.value);
  }

  private resetInputs() {
    if (this.autocompleteChipInput?.nativeElement) {
      this.autocompleteChipInput.nativeElement.value = '';
      this.autocompleteChipInput.nativeElement.blur();
    }
    this.formCtrl.setValue(null);
  }

  private filterOnValueChange(itemName: string | null): string[] {
    if (!this.originalList) {
      return [];
    }
    let result: string[] = [];
    const allItemssLessSelected = this.originalList.filter(
      (dt) => this.selectedItemsList.filter((sdt) => sdt.id == dt.id).length <= 0,
    );
    if (itemName) {
      result = this.filterItemList(allItemssLessSelected, itemName);
    } else {
      result = allItemssLessSelected.map((dt) => dt.name);
    }
    return result;
  }

  private filterItemList(itemList: IdName[], itemName: string): string[] {
    let autocompleteNameList: IdName[] = [];
    const filterValue = itemName.toLowerCase();
    const itemMatchingName = itemList.filter(
      (dt) => dt.name.toLowerCase().indexOf(filterValue) >= 0,
    );
    if (itemMatchingName.length) {
      autocompleteNameList = itemMatchingName;
    } else {
      autocompleteNameList = itemList;
    }
    return autocompleteNameList.map((dt) => dt.name);
  }

  private filterAccessOnValueChange(itemName: string | null): OrganizationalUnitAccess[] {
    if (!this.AccessList) {
      return [];
    }
    let result: OrganizationalUnitAccess[] = [];
    const allItemssLessSelected = this.AccessList;
    if (itemName) {
      result = this.filterAccessList(allItemssLessSelected, itemName);
    } else {
      result = allItemssLessSelected.map((dt) => dt);
    }
    return result;
  }

  private filterAccessList(
    itemList: OrganizationalUnitAccess[],
    itemName: string,
  ): OrganizationalUnitAccess[] {
    let autocompleteAccessList: OrganizationalUnitAccess[] = [];
    const filterValue = itemName.toLowerCase();
    const itemMatchingName = itemList.filter(
      (dt) => dt.ouName?.toLowerCase().indexOf(filterValue) >= 0,
    );
    if (itemMatchingName.length) {
      autocompleteAccessList = itemMatchingName;
    } else {
      autocompleteAccessList = itemList;
    }
    return autocompleteAccessList.map((dt) => dt);
  }

  private filterOuOnValueChange(itemName: string | null): OrganizationalUnit[] {
    if (!this.OrganizationList) {
      return [];
    }
    let result: OrganizationalUnit[] = [];
    const allItemssLessSelected = this.OrganizationList;
    if (itemName) {
      result = this.filterOuList(allItemssLessSelected, itemName);
    } else {
      result = allItemssLessSelected.map((dt) => dt);
    }
    return result;
  }

  private filterOuList(itemList: OrganizationalUnit[], itemName: string): OrganizationalUnit[] {
    let autocompleteOuList: OrganizationalUnit[] = [];
    const filterValue = itemName.toLowerCase();
    const itemMatchingName = itemList.filter(
      (dt) => dt.name.toLowerCase().indexOf(filterValue) >= 0,
    );
    if (itemMatchingName.length) {
      autocompleteOuList = itemMatchingName;
    } else {
      autocompleteOuList = itemList;
    }
    this.OnValidSelected.emit(itemName);
    return autocompleteOuList.map((dt) => dt);
  }
}
