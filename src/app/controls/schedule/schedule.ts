import { Component, computed, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ErrorStateMatcher, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { EMPTY_SCHEDULE, ScheduleValue } from './schedule.model';
@Component({
  imports: [MatFormFieldModule, MatDatepickerModule, MatInput, MatTimepickerModule],
  selector: 'app-schedule',
  styleUrl: './schedule.scss',
  templateUrl: './schedule.html',
  providers: [provideNativeDateAdapter(), { provide: NG_VALUE_ACCESSOR, useExisting: Schedule, multi: true },],
})
export class Schedule implements ControlValueAccessor {

  readonly touched = input(false);
  readonly required = input(false);
  readonly minDate = input<Date | null>(null);

  value = signal<ScheduleValue>({ ...EMPTY_SCHEDULE });
  disabled = signal(false);
  

  // 2. Places to store Angular's functions
  private onChange: (value: ScheduleValue | null) => void = () => { };
  onTouched: () => void = () => { };

  // 3. Implement the ControlValueAccessor interface
  writeValue(value: ScheduleValue | null): void {
    this.value.set(value ?? { ...EMPTY_SCHEDULE });
  }

  registerOnChange(fn: (value: ScheduleValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onDateChange(date: ScheduleValue) {
    this.value.set(date);     // update own state
    this.onChange(date);      // tell the form
  }

  protected readonly shownIssues = computed(() =>
    this.touched() && !this.disabled() ? 'somemessaeg' : null,
  );

}
