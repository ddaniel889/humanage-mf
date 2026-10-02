import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@jsverse/transloco';

@Injectable()
export class TranslocoPaginatorIntl extends MatPaginatorIntl {
  private readonly translocoService = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);
  constructor() {
    super();
    // Subscribe to translation changes to update labels dynamically
    this.translocoService
      .selectTranslation('common')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.getAndInitTranslations());
  }

  getAndInitTranslations() {
    this.itemsPerPageLabel = this.translocoService.translate('common.paginator.items_per_page');
    this.nextPageLabel = this.translocoService.translate('common.paginator.next_page');
    this.previousPageLabel = this.translocoService.translate('common.paginator.previous_page');
    this.firstPageLabel = this.translocoService.translate('common.paginator.first_page');
    this.lastPageLabel = this.translocoService.translate('common.paginator.last_page');
    // Notify the paginator that labels have changed
    this.changes.next();
  }

  // Override the range label (e.g., "1 - 10 of 100")
  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 ${this.translocoService.translate('common.paginator.of')} ${length}`;
    }
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} ${this.translocoService.translate('common.paginator.of')} ${length}`;
  };
}
