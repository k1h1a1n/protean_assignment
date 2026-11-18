import {
    disabled,
    maxLength,
    minLength,
    pattern,
    required,
    schema,
    validate,
} from '@angular/forms/signals';


const NAME_MAX_LENGTH = 80;
export const DESCRIPTION_MAX_LENGTH = 500;


export interface EventSetupModel {
    eventName: string;
    eventDescription: string;
}

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
