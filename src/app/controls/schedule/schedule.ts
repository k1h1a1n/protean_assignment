import {
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  effect,
  input,
  linkedSignal,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { ErrorStateMatcher, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerInput, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTimepickerInput, MatTimepickerModule } from '@angular/material/timepicker';
import {
  EMPTY_SCHEDULE,
  NO_ISSUES,
  ScheduleValue,
  dateToIsoDate,
  dateToTime,
  isoDateToDate,
  scheduleIssues,
  timeToDate,
} from './schedule.model';

@Component({
  imports: [MatFormFieldModule, MatDatepickerModule, MatInput, MatTimepickerModule],
  selector: 'app-schedule',
  styleUrl: './schedule.scss',
  templateUrl: './schedule.html',
  providers: [
    provideNativeDateAdapter(),
    // The form reads and writes the value through this component (writeValue, onChange...).
    { provide: NG_VALUE_ACCESSOR, useExisting: Schedule, multi: true },
    // The form asks this component "is your value valid?" (the validate() method below).
    { provide: NG_VALIDATORS, useExisting: Schedule, multi: true },
  ],
})
export class Schedule implements ControlValueAccessor, Validator {
  /** Filled in by [formField]: true once the user leaves the field or presses Save. */
  readonly touched = input(false);

  protected readonly disabled = signal(false);

  /**
   * The last value the form wrote in. Every write counts, even the same value again
   * (a reset writes a value again precisely to throw away the user's edits).
   */
  private readonly written = signal<ScheduleValue>(EMPTY_SCHEDULE, { equal: () => false });

  /** What the inputs hold now: the written value, plus the user's edits since. */
  private readonly value = linkedSignal(() => this.written());

  /** Every rule, checked against what the inputs hold: one message (or null) per part. */
  private readonly issues = computed(() => scheduleIssues(this.value()));

  /** The messages to display: none until the field is touched, so we don't nag early. */
  protected readonly shownIssues = computed(() => (this.touched() ? this.issues() : NO_ISSUES));

  // One matcher per input: Material paints that field red while it has a message to show.
  protected readonly dateMatcher = this.matcherFor('date');
  protected readonly timeMatcher = this.matcherFor('startTime');
  protected readonly durationMatcher = this.matcherFor('durationMinutes');

  // The three inputs, to fill them in when the form writes a value.
  private readonly datepickerInput = viewChild.required('dateInput', { read: MatDatepickerInput });
  private readonly timepickerInput = viewChild.required('timeInput', { read: MatTimepickerInput });
  private readonly durationInput = viewChild.required<ElementRef<HTMLInputElement>>('durationInput');
  private readonly matInputs = viewChildren(MatInput);

  // Functions the form gives us through registerOnChange / registerOnTouched.
  private onChange: (value: ScheduleValue) => void = () => {};
  protected onTouched: () => void = () => {};

  constructor() {
    // Form -> inputs: each time the form writes a value, copy it into the three inputs.
    // Only then (no [value] binding): what the user is typing is never overwritten by our
    // own updates, and a reset always clears the inputs.
    // afterRenderEffect({
    //   write: () => {
    //     const { date, startTime, durationMinutes } = this.written();
    //     this.datepickerInput().value = isoDateToDate(date);
    //     this.timepickerInput().value.set(timeToDate(startTime));
    //     this.durationInput().nativeElement.value = durationMinutes?.toString() ?? '';
    //   },
    // });

    // Material only re-checks a matcher by itself when the <input> has its own form control.
    // Ours don't, so ask every input to re-check whenever the shown messages change.
    effect(() => {
      this.shownIssues();
      for (const matInput of this.matInputs()) matInput.updateErrorState();
    });
  }

  // ---- ControlValueAccessor: how the form and this component share the value ----

  /** Form -> component: the form has a new value for us to show. */
  writeValue(value: ScheduleValue | null): void {
    this.written.set(value ?? EMPTY_SCHEDULE);
  }

  /** The form gives us the function to call when the user changes the value. */
  registerOnChange(fn: (value: ScheduleValue) => void): void {
    this.onChange = fn;
  }

  /** The form gives us the function to call when the user leaves the field. */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** Form -> component: turn the fields on or off. */
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // ---- Validator: the parent only learns "valid" or "invalid" from here ----

  validate(): ValidationErrors | null {
    const issues = this.issues();
    const hasProblem = Object.values(issues).some((message) => message !== null);
    return hasProblem ? { schedule: issues } : null;
  }

  // ---- Inputs -> component -> form ----

  /** From the datepicker: the Date picked, or null when empty or not a real date. */
  protected setDate(date: Date | null, text: string): void {
    // Not a real date: keep the text, so the rule can say "Enter a valid date".
    this.update({ ...this.value(), date: date ? dateToIsoDate(date) : text.trim() || null });
  }

  /** From the timepicker: the Date picked, null when empty, or an invalid Date for bad text. */
  protected setStartTime(time: Date | null, text: string): void {
    let startTime: string | null = null; // empty
    if (time && isNaN(time.getTime())) startTime = text.trim(); // not a real time: keep the text
    else if (time) startTime = dateToTime(time); // a real time: 'HH:mm'

    // Filling the input in (see constructor) also fires this; nothing changed then, so stop.
    if (startTime === this.value().startTime) return;
    this.update({ ...this.value(), startTime });
  }

  /** From the number input: '' when empty. */
  protected setDuration(text: string): void {
    this.update({ ...this.value(), durationMinutes: text === '' ? null : Number(text) });
  }

  /** Keep the new value and send it to the form. */
  private update(value: ScheduleValue): void {
    this.value.set(value);
    this.onChange(value);
  }

  /** A matcher that shows `part` in red while it has a message to show. */
  private matcherFor(part: keyof ScheduleValue): ErrorStateMatcher {
    return { isErrorState: () => this.shownIssues()[part] !== null };
  }
}
