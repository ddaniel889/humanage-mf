import { Component, Input, EventEmitter, Output, ViewChild, OnChanges } from '@angular/core';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { getEsPaginatorIntl } from './es-paginator-intl';

@Component({
  selector: 'app-cs-paginator',
  templateUrl: './cs-paginator.component.html',
  styles: [],
  imports: [MatPaginatorModule, MatSelectModule, MatFormFieldModule, FormsModule],
  providers: [{ provide: MatPaginatorIntl, useValue: getEsPaginatorIntl() }],
})
export class CsPaginatorComponent implements OnChanges {
  @Input() pageCount: number;
  @Input() hidePageSize = true;
  @Input() hidePageSizeSelection = true;
  @Input() pageIndex: number;
  @Input() pageSize = 15;
  @Input() optionsPageSize = [15, 50, 100, 200];

  @Output() pageIndexChange = new EventEmitter();
  @Output() pageSizeChange = new EventEmitter();
  @Output() pageChanged = new EventEmitter<boolean>();
  @Output() pageSizeChanged = new EventEmitter<boolean>();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  zeroBasedPageIndex: number;

  ngOnChanges(): void {
    this.zeroBasedPageIndex = this.pageIndex - 1;
  }

  selectedPageChanged(): void {
    this.zeroBasedPageIndex = this.paginator.pageIndex;
    this.pageIndex = this.zeroBasedPageIndex + 1;
    this.pageIndexChange.emit(this.pageIndex);
    this.pageSizeChange.emit(this.pageSize);
    this.pageChanged.emit();
  }

  setSizePage(): void {
    this.pageIndex = 1;
    this.pageSizeChange.emit(this.pageSize);
    this.pageSizeChanged.emit();
  }
}
