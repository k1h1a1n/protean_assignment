import { Component, computed, effect, inject, input, linkedSignal, signal, viewChildren } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, Validator, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { EMPTY_TICKET_TIER, NO_TICKET_TIER_ISSUES, NOTHING_LEFT, ticketTierIssues, TicketTierRow, TicketTierValue } from './ticket.model';
import { ErrorStateMatcher } from '@angular/material/core';
import { Confirmation } from '../../shared/confirm-dialog/confirm-dialog';

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

  /**
   * Filled in by [formField]: true once the user has left every input of every row (see onBlur),
   * or presses Save. The form has only this one flag for all the tiers.
   */
  readonly touched = input(false);
  protected readonly disabled = signal(false);

  // Functions the form gives us through registerOnChange / registerOnTouched.
  private onChange: (value: TicketTierValue[]) => void = () => { };
  private onTouched: () => void = () => { };

  // private readonly written = signal<TicketTierValue>(EMPTY_TICKET_TIER, { equal: () => false });
  // private readonly value = linkedSignal(() => this.written());
  protected readonly rows = signal<TicketTierRow[]>([]);
  private nextId = 0;
  private readonly value = computed(() => this.rows().map(row => row.TicketTier))
  private readonly issues = computed(() => ticketTierIssues(this.value()));

  private readonly matInputs = viewChildren(MatInput);
  private readonly confirmation = inject(Confirmation);


  constructor() {
    effect(() => {
      this.shownIssues(); // ensure shownIssues is computed when issues or left changes
      for (const matInput of this.matInputs()) matInput.updateErrorState();
    });
  }

  // One matcher per input per row: Material paints that field red while it has a message to show.
  // Each matcher looks up its row by index when asked, so the same objects stay valid while the
  // row count is unchanged; that keeps the [errorStateMatcher] bindings stable while typing.
  protected readonly matchers = computed(
    () =>
      this.rows().map((_, index) => ({
        tierName: this.matcherFor(index, 'tierName'),
        price: this.matcherFor(index, 'price'),
      })),
    { equal: (a, b) => a.length === b.length },
  );

  // ---- ControlValueAccessor: how the form and this component share the value ----

  /** Form -> component: the form has a new value for us to show. */
  writeValue(value: TicketTierValue[] | null): void {
    this.rows.set((value ?? []).map((tier) => this.newRow(tier)));
  }

  /** The form gives us the function to call when the user changes the value. */
  registerOnChange(fn: (value: TicketTierValue[]) => void): void {
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
  private updateRow(row: TicketTierRow, changes: Partial<TicketTierValue>): void {
    this.rows.update((rows) =>
      rows.map((r) => (r.id === row.id ? { ...r, TicketTier: { ...r.TicketTier, ...changes } } : r)),
    );
    this.onChange(this.value());
  }


  // ---- Validator: the parent only learns "valid" or "invalid" from here ----
  validate(): ValidationErrors | null {
    const issues = this.issues();
    if (Object.values(issues).every((issue) => issue === null)) return null;
    return { ticketTier: issues };
  }

  /** A matcher that shows `part` in red while it has a message to show. */
  private matcherFor(index: number, part: keyof TicketTierValue): ErrorStateMatcher {
    return { isErrorState: () => this.shownIssues()[index]?.[part] != null };
  }

  /**
   * The messages to display, one entry per row. Each input shows its message once the user has
   * left that input, or once the whole field is touched (Save). Before that: nothing, so we don't
   * nag early. Nothing is shown while the field is disabled.
   */
  protected readonly shownIssues = computed(() => {
    const issues = this.issues();
    if (this.disabled()) return issues.map(() => NO_TICKET_TIER_ISSUES);

    const all = this.touched();
    const rows = this.rows();
    return issues.map((rowIssues, index) => {
      const left = rows[index].left;
      return {
        tierName: all || left.tierName ? rowIssues.tierName : null,
        price: all || left.price ? rowIssues.price : null,
      };
    });
  });

  /** From the number input: '' when empty. */
  protected setPrice(row: TicketTierRow, text: string): void {
    this.updateRow(row, { price: text === '' ? null : Number(text) });
  }

  protected setTierName(row: TicketTierRow, tierName: string): void {
    this.updateRow(row, { tierName });
  }

  /** An input lost focus: from now on, show that input's message in that row. */
  protected onBlur(row: TicketTierRow, part: keyof TicketTierValue): void {
    this.rows.update((rows) =>
      rows.map((r) => (r.id === row.id ? { ...r, left: { ...r.left, [part]: true } } : r)),
    );

    // Telling the form "touched" turns on every message in every row (see shownIssues),
    // so only do it once the user has left every input of every row.
    if (this.rows().every((r) => Object.values(r.left).every(Boolean))) this.onTouched();
  }

  /** A new row starts with nothing left, so a value from the form (load, reset) starts fresh. */
  private newRow(tier: TicketTierValue): TicketTierRow {
    return { id: this.nextId++, TicketTier: tier, initial: tier, left: NOTHING_LEFT };
  }

  protected addRow(): void {
    // this.rows.update((rows) => [...rows, this.newRow()]);
  }

  private removeRow(row: TicketTierRow): void {
    this.rows.update((rows) => rows.filter((r) => r.id !== row.id));
    this.onChange(this.value());
  }

  /** Delete button: ask first, unless the row is still empty (nothing to lose). */
  protected async remove(row: TicketTierRow): Promise<void> {
    const { tierName, price } = row.TicketTier;
    const name = tierName?.trim();
    if (!name && price === null) {
      this.removeRow(row);
      return;
    }

    const confirmed = await this.confirmation.ask({
      title: 'Delete ticket tier?',
      message: name
        ? `"${name}" will be removed from this event.`
        : 'This ticket tier will be removed from this event.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (confirmed) this.removeRow(row);
  }

  protected add(): void {
    this.rows.update((rows) => [...rows, this.newRow({ tierName: null, price: null })]);
    this.onChange(this.value());
  }
}
