import { Component, signal, WritableSignal } from '@angular/core';
import { Schedule } from '../controls/schedule/schedule';
import { TicketTier } from '../controls/ticket-tier/ticket-tier';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { form, FormField } from '@angular/forms/signals';
import { EventSetupModel, validationSchema } from './event.model';
import {DESCRIPTION_MAX_LENGTH} from './event.model';
import { EMPTY_SCHEDULE } from '../controls/schedule/schedule.model';
@Component({
  imports: [MatTabsModule, Schedule, TicketTier, MatFormFieldModule, MatButtonModule, MatCard, MatInputModule, MatIconModule, FormField, MatError],
  selector: 'app-event-setup',
  styleUrl: './event-setup.scss',
  templateUrl: './event-setup.html',
})

export class EventSetup {
  protected readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;
  eventFormModel: WritableSignal<EventSetupModel> = signal({
    eventName: '',
    eventDescription: '',
    schedule: EMPTY_SCHEDULE,
  });

  eventForm = form(this.eventFormModel , validationSchema);

  onSubmit(event: Event) {
    event.preventDefault();
    console.log('Form submitted successfully:', this.eventFormModel() , this.eventForm().valid() , this.eventForm().errorSummary());
    if (this.eventForm().invalid()) {
      this.eventForm().markAsTouched();
      return;
    }
  }
}

