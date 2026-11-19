# Event Setup

An Angular 22 form for setting up an event: name, description, schedule and ticket tiers, built with Signal Forms and Angular Material.

## How to run

You need Node.js 22.22.3+, 24.15+ or 26+ (the versions Angular 22 supports) and npm.

```bash
npm install
npm start
```

Open http://localhost:4200. The app opens on the Event setup form, which has two tabs: **Event Schedule** and **Ticket Tiers**. The page reloads when you save a file.

### Tests

```bash
npm test                    # Vitest, re-runs when files change
npm test -- --watch=false   # run once and exit
```

### Production build

```bash
npm run build
```

The output goes to `dist/assesment/browser`. The build warns that the initial bundle (about 780 kB) is over the 500 kB budget set in `angular.json`, but it still completes.

## 1. How does a value travel from the parent form into the ticket tiers control and back out again? What is the contract between them?

The contract is `ControlValueAccessor`, with the value typed as `TicketTierValue[]`.

- **In:** `<app-ticket-tier [formField]="eventForm.ticketTiers">` calls `writeValue(tiers)` whenever the form's value changes from outside (first load, reset). The control turns each tier into a row: an id, its current value, the `initial` text its inputs start with, and which inputs the user has left.
- **Out:** every edit, add or delete updates `rows`, then calls the `onChange` function the form passed in through `registerOnChange`, always with a new array.

## 2. How does an invalid row inside a control end up making the parent form invalid?

The control registers itself as a validator: `{ provide: NG_VALIDATORS, useExisting: TicketTier }`. `[formField]` finds it and calls `validate()` inside a `computed`. `validate()` reads the `issues` signal (one message per input per row) and returns `{ ticketTier: issues }` when any row has a message. That becomes an error on `eventForm.ticketTiers`, and a signal form is invalid when any of its fields is, so `eventForm().invalid()` becomes true.
Because `validate()` reads signals, it re-runs on its own whenever a row changes. The parent's schema has no ticket rules at all.

## 3. How does the surrounding form's state reach the inside of your controls?

Through the same `[formField]` binding:

- **Touched:** `[formField]` fills any control input with a matching name, so `touched = input(false)` follows the field. After Save (`markAsTouched()`) every message shows, and after a reset it goes back to `false`.
- **Disabled:** the form's `disabled(path, { when: () => this.saving() })` rule reaches the control through `setDisabledState()`, which disables every input and button while saving.
- **Value:** through `writeValue()`, as in question 1.

The control doesn't take its error messages from the form. It works them out from its own rules.

## 4. Your controls are ControlValueAccessors, but the form around them is a signal form. How do the two fit together, and what would you do differently if you wrote the controls natively for signal forms?

`[formField]` has a compatibility path for this. When the element provides `NG_VALUE_ACCESSOR`, it drives it through `writeValue`, `registerOnChange`, `registerOnTouched` and `setDisabledState`. It also turns what `NG_VALIDATORS` returns into field errors, and still sets inputs such as `touched`.

Written natively as a `FormValueControl<TicketTierValue[]>`, I would:

- replace `writeValue` and `onChange` with a single `value = model<TicketTierValue[]>()`
- take `disabled`, `touched` and `errors` as plain `input()`s instead of `setDisabledState`
- emit a `touch` output instead of calling `onTouched`, and add a `focus()` method


## 5. Point at one reactivity decision you made, and explain what would break if you had made the opposite choice.

In `Schedule`, the value the form writes is kept in `written = signal(…, { equal: () => false })`, and an `afterRenderEffect` copies it into the inputs only when it changes. What the user types lives in `value = linkedSignal(() => this.written())`.

The opposite choice, normal equality, breaks Reset. The form resets the schedule to `EMPTY_SCHEDULE`, which can be the same object it wrote the last time. With normal equality, `written.set(EMPTY_SCHEDULE)` counts as "no change", so the `linkedSignal` keeps the user's edits and the effect never clears the inputs. The form would hold an empty schedule while the screen still shows the old date. `equal: () => false` makes every `writeValue` count.
