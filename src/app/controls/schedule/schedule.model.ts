/**
 * The value <app-schedule> reads from and writes to the form.
 * null means "nothing entered". While the text in an input isn't a real date or time,
 * that part holds the text as typed, so the rules below can say "Enter a valid ...".
 */
export interface ScheduleValue {
    date: string | null; // 'YYYY-MM-DD'
    startTime: string | null; // 'HH:mm', 24-hour
    durationMinutes: number | null;
}

export const EMPTY_SCHEDULE: ScheduleValue = { date: null, startTime: null, durationMinutes: null };

// ---- Rules: one message (or null when fine) per part ----

export type ScheduleIssues = Record<keyof ScheduleValue, string | null>;

export const NO_ISSUES: ScheduleIssues = { date: null, startTime: null, durationMinutes: null };

export function scheduleIssues(value: ScheduleValue): ScheduleIssues {
    return {
        date: dateIssue(value.date),
        startTime: startTimeIssue(value.startTime),
        durationMinutes: durationIssue(value.durationMinutes),
    };
}

function dateIssue(date: string | null): string | null {
    if (date === null) return 'Date is required';
    if (isoDateToDate(date) === null) return 'Enter a valid date';
    return null;
}

function startTimeIssue(time: string | null): string | null {
    if (time === null) return 'Start time is required';
    if (timeToDate(time) === null) return 'Enter a valid time';
    return null;
}

function durationIssue(minutes: number | null): string | null {
    if (minutes === null) return 'Duration is required';
    if (!Number.isInteger(minutes)) return 'Use whole minutes';
    if (minutes < 1) return 'Must be at least 1 minute';
    return null;
}

// ---- The form stores strings; Material's date and time pickers work with Date objects ----
const pad = (n: number) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' -> Date at local midnight, or null if it isn't a real day. */
export function isoDateToDate(value: string | null): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
    if (!match) return null;
    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(year, month - 1, day);
    // new Date() rolls a day that doesn't exist (Feb 30) into the next month: reject it.
    return date.getMonth() === month - 1 ? date : null;
}

/** Date -> 'YYYY-MM-DD' (local). */
export function dateToIsoDate(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 'HH:mm' -> a Date (today) at that time, or null if it isn't a real time. */
export function timeToDate(value: string | null): Date | null {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value ?? '');
    console.log('timeToDate', value, match);
    if (!match) return null;
    const date = new Date();
    date.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return date;
}

/** Date -> 'HH:mm' (24-hour). */
export function dateToTime(date: Date): string {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
