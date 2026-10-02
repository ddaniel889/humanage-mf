import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Cross-field validators for reactive forms.
 * These validators check relationships between multiple form controls.
 */
export class CrossFieldValidators {
  /**
   * Validates that a max value is greater than or equal to a min value.
   * @param minField - The name of the control containing the minimum value
   * @param maxField - The name of the control containing the maximum value
   * @returns A validator function that returns an error if max < min
   */
  static minMax(minField: string, maxField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const minControl = formGroup.get(minField);
      const maxControl = formGroup.get(maxField);

      if (!minControl || !maxControl) {
        return null;
      }

      const min = minControl.value;
      const max = maxControl.value;

      // Only validate if both values exist
      if (min == null || max == null) {
        return null;
      }

      if (max < min) {
        return {
          minMax: {
            minField,
            maxField,
            min,
            max,
          },
        };
      }

      return null;
    };
  }

  /**
   * Makes a field required based on a condition.
   * @param field - The name of the field to conditionally require
   * @param condition - A function that receives the form and returns true if the field should be required
   * @returns A validator function that returns an error if the field is required but empty
   */
  static requiredIf(field: string, condition: (form: AbstractControl) => boolean): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(field);

      if (!control) {
        return null;
      }

      if (condition(formGroup) && !control.value) {
        return {
          requiredIf: {
            field,
          },
        };
      }

      return null;
    };
  }

  /**
   * Validates that at least one of the specified fields has a value.
   * @param fields - Array of field names where at least one must have a value
   * @returns A validator function that returns an error if all fields are empty
   */
  static requireAtLeastOne(fields: string[]): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const hasValue = fields.some((field) => {
        const control = formGroup.get(field);
        return control?.value != null && control?.value !== '';
      });

      if (!hasValue) {
        return {
          requireAtLeastOne: {
            fields,
          },
        };
      }

      return null;
    };
  }

  /**
   * Validates that two fields have matching values.
   * @param field1 - The name of the first field
   * @param field2 - The name of the second field
   * @returns A validator function that returns an error if the values don't match
   */
  static mustMatch(field1: string, field2: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control1 = formGroup.get(field1);
      const control2 = formGroup.get(field2);

      if (!control1 || !control2) {
        return null;
      }

      if (control1.value !== control2.value) {
        return {
          mustMatch: {
            field1,
            field2,
          },
        };
      }

      return null;
    };
  }

  /**
   * Validates that a field's value does not exceed another field's value.
   * @param field - The name of the field to validate
   * @param maxField - The name of the field containing the maximum allowed value
   * @param errorKey - The key to use in the returned validation error
   * @returns A validator function that returns an error if field > maxField
   */
  static notExceeds(field: string, maxField: string, errorKey: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const fieldControl = formGroup.get(field);
      const maxControl = formGroup.get(maxField);

      if (!fieldControl || !maxControl) {
        return null;
      }

      const value = fieldControl.value;
      const max = maxControl.value;

      // Only validate if both values exist
      if (value == null || max == null) {
        return null;
      }

      if (value > max) {
        return {
          [errorKey]: {
            value,
            max,
          },
        };
      }

      return null;
    };
  }
}
