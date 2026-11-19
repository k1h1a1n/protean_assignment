/** One ticket tier as the form stores it. null means "nothing entered". */
export interface TicketTierValue {
  tierName: string | null;
  price: number | null;
}

/** A tier as <app-ticket-tier> keeps it on screen: its value plus what only the UI needs. */
export interface TicketTierRow {
  /** Stable key for @for, so editing a row doesn't rebuild its inputs. */
  id: number;
  /** The row's current value: what is sent to the form. */
  TicketTier: TicketTierValue;
  /**
   * What the inputs show when the row appears. It never changes afterwards, so typing
   * isn't rewritten under the cursor (e.g. "1.0" turning into "1").
   */
  initial: TicketTierValue;
  /** Which of this row's inputs the user has left (blurred) at least once. */
  left: Record<keyof TicketTierValue, boolean>;
}

/** One message (or null when fine) per input of a row. */
export type TicketTierIssues = Record<keyof TicketTierValue, string | null>;

/** A blank row, as "Add ticket tier" adds it. */
export const EMPTY_TICKET_TIER: TicketTierValue = { tierName: null, price: null };
/** The tiers a new event starts with. */
export const DEFAULT_TICKET_TIERS: TicketTierValue[] = [
  { tierName: 'General Admission', price: 25 },
  { tierName: 'VIP', price: 75 },
];

/** A row with no messages to show. */
export const NO_TICKET_TIER_ISSUES: TicketTierIssues = { tierName: null, price: null };

/** Neither input of a row has been left yet. */
export const NOTHING_LEFT: Record<keyof TicketTierValue, boolean> = {
  tierName: false,
  price: false,
};

/** Every rule, checked against each row: one { tierName, price } entry per row. */
export function ticketTierIssues(value: TicketTierValue[]): TicketTierIssues[] {
  return value.map((r) => ({ tierName: nameIssue(r.tierName), price: priceIssue(r.price) }));
}

function nameIssue(name: string | null): string | null {
  if (!name?.trim()) return 'Tier name is required';
  return null;
}

function priceIssue(price: number | null): string | null {
  if (price == null) return 'Price is required'; // null or undefined
  if (typeof price !== 'number' || isNaN(price)) return 'Price must be a number';
  if (price < 0) return 'Price cannot be negative';
  return null;
}
