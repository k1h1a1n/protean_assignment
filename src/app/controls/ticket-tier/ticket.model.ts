export interface TicketTierValue {
  tierName: string | null;
  price: number | null;
}
export type TicketTierIssues = Record<keyof TicketTierValue, string | null>;

export const EMPTY_TICKET_TIER: TicketTierValue = { tierName: null, price: null };
/** None of the three inputs has been left yet. */
export const NOTHING_LEFT: Record<keyof TicketTierValue, boolean> = {
  tierName: false,
  price: false,
};

export function ticketTierIssues(value: TicketTierValue): TicketTierIssues {
  return {
    tierName: nameIssue(value.tierName),
    price: priceIssue(value.price),
  };
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
