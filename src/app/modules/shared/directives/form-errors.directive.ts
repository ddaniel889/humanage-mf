import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';
import { merge } from 'rxjs';

type ErrorParamExtractor = (err: unknown) => Record<string, unknown>;

const ERROR_EXTRACTORS: Record<string, ErrorParamExtractor> = {
  min: (err) => ({ value: (err as { min: number }).min }),
  max: (err) => ({ value: (err as { max: number }).max }),
  maxlength: (err) => ({ value: (err as { requiredLength: number }).requiredLength }),
  minlength: (err) => ({ value: (err as { requiredLength: number }).requiredLength }),
  exceedsMax: (err) => ({ max: (err as { max: number }).max }),
  minMax: (err) => ({ min: (err as { min: number; max: number }).min }),
  required: () => ({}),
};

@Directive({
  selector: 'mat-error[hlFormErrors]',
})
export class HlFormErrorsDirective implements OnInit {
  readonly hlFormErrors = input.required<AbstractControl>();

  private readonly transloco = inject(TranslocoService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const control = this.hlFormErrors();

    merge(control.statusChanges, control.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.render(control));
  }

  private render(control: AbstractControl): void {
    const errors = control.errors;

    if (!errors) {
      this.renderer.setProperty(this.elementRef.nativeElement, 'textContent', '');
      this.cdr.markForCheck();
      return;
    }

    const errorKey = Object.keys(ERROR_EXTRACTORS).find((key) => key in errors);
    if (!errorKey) {
      this.renderer.setProperty(this.elementRef.nativeElement, 'textContent', '');
      this.cdr.markForCheck();
      return;
    }

    const params = ERROR_EXTRACTORS[errorKey](errors[errorKey]);
    const message = this.transloco.translate(`common.forms.errors.${errorKey}`, params);

    this.renderer.setProperty(this.elementRef.nativeElement, 'textContent', message);
    this.cdr.markForCheck();
  }
}
