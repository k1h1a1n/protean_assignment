export interface TicketTierValue {
  tierName: string | null;
  price: number | null;
}

export interface TicketTierRow {
  id: number;
  TicketTier: TicketTierValue;
  /** Which of this row's inputs the user has left (blurred) at least once. */
  left: Record<keyof TicketTierValue, boolean>;
}
export type TicketTierIssues = Record<keyof TicketTierValue, string | null>;

export const EMPTY_TICKET_TIER: TicketTierValue = { tierName: null, price: null };
export const NO_TICKET_TIER_ISSUES: TicketTierIssues = { tierName: null, price: null };

/** Neither input of a row has been left yet. */
export const NOTHING_LEFT: Record<keyof TicketTierValue, boolean> = {
  tierName: false,
  price: false,
};

export function ticketTierIssues(value: TicketTierValue[] | null): TicketTierIssues[] {
  return (value ?? []).map((r) => {
    return {tierName : nameIssue(r.tierName) , price : priceIssue(r.price)}
  })
}

function nameIssue(name: string | null): string | null {
  if (!name?.trim()) return 'Tier name is required';
  return null;
}

function priceIssue(price: number | null): string | null {
  if (price === null || price === undefined) return 'Price is required';
  if (typeof price !== 'number' || isNaN(price)) return 'Price must be a number';
  if (price < 0) return 'Price cannot be negative';
  return null;
  };
