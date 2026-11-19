import { maxLength, required, schema } from '@angular/forms/signals';
import { DEFAULT_SCHEDULE, EMPTY_SCHEDULE, ScheduleValue } from '../controls/schedule/schedule.model';
import { DEFAULT_TICKET_TIERS, EMPTY_TICKET_TIER, TicketTierValue } from '../controls/ticket-tier/ticket.model';


const NAME_MAX_LENGTH = 80;
export const DESCRIPTION_MAX_LENGTH = 500;


/** Everything the event setup form edits. */
export interface EventSetupModel {
    eventName: string;
    eventDescription: string;
    schedule: ScheduleValue
    ticketTiers: TicketTierValue[];
}

/** What the form shows when the page opens. */
export const INITIAL_EVENT: EventSetupModel = {
    eventName: 'Initial Event',
    eventDescription: 'Some Event',
    schedule: DEFAULT_SCHEDULE,
    ticketTiers: DEFAULT_TICKET_TIERS,
};

/** A blank form, ready to be filled in from scratch. Reset goes back to this. */
export const EMPTY_EVENT: EventSetupModel = {
    eventName: '',
    eventDescription: '',
    schedule: EMPTY_SCHEDULE,
    // One blank row to fill in.
    ticketTiers: [EMPTY_TICKET_TIER],
};

/** The validations for the event setup form. */
export const validationSchema = schema<EventSetupModel>((path) => {
    required(path.eventName, { message: 'Event name is required' });
    maxLength(path.eventName, NAME_MAX_LENGTH, {
        message: `Use at most ${NAME_MAX_LENGTH} characters.`,
    });
    maxLength(path.eventDescription, DESCRIPTION_MAX_LENGTH, {
        message: `Use at most ${DESCRIPTION_MAX_LENGTH} characters.`,
    });
});
