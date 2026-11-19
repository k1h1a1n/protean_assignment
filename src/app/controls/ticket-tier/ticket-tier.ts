import { Component, computed, effect, input, linkedSignal, signal, viewChildren } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, Validator, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { EMPTY_TICKET_TIER, NOTHING_LEFT, ticketTierIssues, TicketTierValue } from './ticket.model';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  selector: 'app-ticket-tier',
  styleUrl: './ticket-tier.scss',
  templateUrl: './ticket-tier.html',
  providers: [
    // The form reads and writes the value through this component (writeValue, onChange...).
    { provide: NG_VALUE_ACCESSOR, useExisting: TicketTier, multi: true },
    // The form asks this component "is your value valid?" (the validate() method below).
    { provide: NG_VALIDATORS, useExisting: TicketTier, multi: true },
  ],
})
export class TicketTier implements ControlValueAccessor, Validator {

  readonly touched = input(false);
  protected readonly disabled = signal(false);

  /** Which inputs the user has left (blurred) at least once. */
  private readonly left = signal(NOTHING_LEFT);

  // Functions the form gives us through registerOnChange / registerOnTouched.
  private onChange: (value: TicketTierValue) => void = () => { };
  private onTouched: () => void = () => { };

  private readonly written = signal<TicketTierValue>(EMPTY_TICKET_TIER, { equal: () => false });
  private readonly value = linkedSignal(() => this.written());
  private readonly issues = computed(() => ticketTierIssues(this.value()));

  private readonly matInputs = viewChildren(MatInput);


  constructor() {
    effect(() => {
      this.shownIssues(); // ensure shownIssues is computed when issues or left changes
      for (const matInput of this.matInputs()) matInput.updateErrorState();
    });
  }

  // One matcher per input: Material paints that field red while it has a message to show.
  protected readonly tierNameMatcher = this.matcherFor('tierName');
  protected readonly priceMatcher = this.matcherFor('price');

  // ---- ControlValueAccessor: how the form and this component share the value ----

  /** Form -> component: the form has a new value for us to show. */
  writeValue(value: TicketTierValue | null): void {
    this.written.set(value ?? EMPTY_TICKET_TIER);
  }

  /** The form gives us the function to call when the user changes the value. */
  registerOnChange(fn: (value: TicketTierValue) => void): void {
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

  /** Keep the new value and send it to the form. */
  private update(value: TicketTierValue): void {
    this.value.set(value);
    this.onChange(value);
  }


  // ---- Validator: the parent only learns "valid" or "invalid" from here ----
  validate(): ValidationErrors | null {
    const issues = this.issues();
    if (Object.values(issues).every((issue) => issue === null)) return null;
    return { ticketTier: issues };
  }

  /** A matcher that shows `part` in red while it has a message to show. */
  private matcherFor(part: keyof TicketTierValue): ErrorStateMatcher {
    return { isErrorState: () => this.shownIssues()[part] !== null };
  }

  protected readonly shownIssues = computed(() => {
    const issues = this.issues();
    const left = this.left();
    const all = this.touched();
    return {
      tierName: all || left.tierName ? issues.tierName : null,
      price: all || left.price ? issues.price : null,
    };
  });

  /** From the number input: '' when empty. */
  protected setPrice(text: string): void {
    this.update({ ...this.value(), price: text === '' ? null : Number(text) });
  }

  protected setTierName(text: string): void {
    this.update({ ...this.value(), tierName: text.trim() || null });
  }

  /** An input lost focus: from now on, show that input's message. */
  protected onBlur(part: keyof TicketTierValue): void {
    this.left.update((left) => ({ ...left, [part]: true }));

    // Telling the form "touched" turns on every message (see shownIssues),
    // so only do it once the user has left all three inputs.
    if (Object.values(this.left()).every(Boolean)) this.onTouched();
  }
}
