import { Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { Schedule } from '../controls/schedule/schedule';
import { TicketTier } from '../controls/ticket-tier/ticket-tier';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { apply, disabled, form, FormField } from '@angular/forms/signals';
import { EMPTY_EVENT, EventSetupModel, INITIAL_EVENT, validationSchema } from './event.model';
import {DESCRIPTION_MAX_LENGTH} from './event.model';
import { Confirmation } from '../shared/confirm-dialog/confirm-dialog';

/** How long the pretend save takes, until there's a real server to send the event to. */
const SAVE_DELAY_MS = 1500;

@Component({
  imports: [MatTabsModule, Schedule, TicketTier, MatFormFieldModule, MatButtonModule, MatCard, MatInputModule, MatIconModule, MatProgressSpinner, FormField, MatError],
  selector: 'app-event-setup',
  styleUrl: './event-setup.scss',
  templateUrl: './event-setup.html',
})

export class EventSetup {
  protected readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;
  eventFormModel: WritableSignal<EventSetupModel> = signal(INITIAL_EVENT);

  /** True while the event is being saved: the whole form is disabled and a loader covers it. */
  protected readonly saving = signal(false);

  /** The open tab: 0 = Event Schedule, 1 = Ticket Tiers. */
  protected readonly selectedTab = signal(0);

  eventForm = form(this.eventFormModel, (path) => {
    apply(path, validationSchema);
    // Disabling the root disables every field inside it.
    disabled(path, { when: () => this.saving() });
  });

  // An alert icon shows on a tab while one of its fields has an error the user can see:
  // the field is invalid and touched (left by the user, or Save was pressed).
  protected readonly scheduleTabHasError = computed(() =>
    [this.eventForm.eventName, this.eventForm.eventDescription, this.eventForm.schedule].some(
      (field) => field().invalid() && field().touched(),
    ),
  );
  protected readonly ticketsTabHasError = computed(
    () => this.eventForm.ticketTiers().invalid() && this.eventForm.ticketTiers().touched(),
  );

  private readonly confirmation = inject(Confirmation);
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Save: show every message if something is wrong, otherwise ask, then save with the form
   * disabled under a loader. Once saved, the form is cleared for the next event.
   */
  /** Opens the first tab that has a field with an error, so the user sees what to fix. */
  private openFirstInvalidTab(): void {
    const scheduleTabInvalid =
      this.eventForm.eventName().invalid() ||
      this.eventForm.eventDescription().invalid() ||
      this.eventForm.schedule().invalid();

    // The form is invalid, so if the first tab is fine, the problem is in Ticket Tiers.
    this.selectedTab.set(scheduleTabInvalid ? 0 : 1);
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    if (this.saving()) return;
    if (this.eventForm().invalid()) {
      this.eventForm().markAsTouched();
      this.openFirstInvalidTab();
      return;
    }

    const confirmed = await this.confirmation.ask({
      title: 'Save event?',
      message: 'The event and its ticket tiers will be saved.',
      confirmLabel: 'Save',
    });
    if (!confirmed) return;

    this.saving.set(true);
    console.log('Form submitted successfully:', this.eventFormModel());
    await new Promise((resolve) => setTimeout(resolve, SAVE_DELAY_MS)); // stands in for the request
    this.eventForm().reset(EMPTY_EVENT);
    this.saving.set(false);
    this.snackBar.open('Saved successfully', 'OK', { duration: 3000 });
  }

  /**
   * Reset: ask, then clear every field. reset() also marks every field untouched, so no
   * message shows until the user leaves an input or presses Save, as on a first visit.
   */
  async onReset() {
    const confirmed = await this.confirmation.ask({
      title: 'Reset form?',
      message: 'Everything you entered will be cleared.',
      confirmLabel: 'Reset',
      tone: 'danger',
    });
    if (confirmed) this.eventForm().reset(EMPTY_EVENT);
  }
}

