import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Schedule } from '../controls/schedule/schedule';
import { TicketTier } from '../controls/ticket-tier/ticket-tier';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { form, FormField } from '@angular/forms/signals';
import { EMPTY_EVENT, EventSetupModel, INITIAL_EVENT, validationSchema } from './event.model';
import {DESCRIPTION_MAX_LENGTH} from './event.model';
import { Confirmation } from '../shared/confirm-dialog/confirm-dialog';

@Component({
  imports: [MatTabsModule, Schedule, TicketTier, MatFormFieldModule, MatButtonModule, MatCard, MatInputModule, MatIconModule, FormField, MatError],
  selector: 'app-event-setup',
  styleUrl: './event-setup.scss',
  templateUrl: './event-setup.html',
})

export class EventSetup {
  protected readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;
  eventFormModel: WritableSignal<EventSetupModel> = signal(INITIAL_EVENT);

  eventForm = form(this.eventFormModel , validationSchema);

  private readonly confirmation = inject(Confirmation);

  /** Save: show every message if something is wrong, otherwise ask before saving. */
  async onSubmit(event: Event) {
    event.preventDefault();
    if (this.eventForm().invalid()) {
      this.eventForm().markAsTouched();
      return;
    }

    const confirmed = await this.confirmation.ask({
      title: 'Save event?',
      message: 'The event and its ticket tiers will be saved.',
      confirmLabel: 'Save',
    });
    if (!confirmed) return;
    console.log('Form submitted successfully:', this.eventFormModel());
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

