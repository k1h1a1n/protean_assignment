import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketTier } from './ticket-tier';
import { TicketTierValue } from './ticket.model';
import { Confirmation } from '../../shared/confirm-dialog/confirm-dialog';

describe('TicketTier', () => {
  let component: TicketTier;
  let fixture: ComponentFixture<TicketTier>;
  let element: HTMLElement;

  // A fake confirmation dialog: always answers "yes", and counts how often it was asked.
  let timesAsked: number;
  const fakeConfirmation = {
    ask: async () => {
      timesAsked++;
      return true;
    },
  };

  beforeEach(async () => {
    timesAsked = 0;
    await TestBed.configureTestingModule({
      imports: [TicketTier],
      providers: [{ provide: Confirmation, useValue: fakeConfirmation }],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketTier);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('is invalid when a row has no price', () => {
    component.writeValue([{ tierName: 'VIP', price: null }]);

    expect(component.validate()).not.toBeNull();
  });

  it('is valid when every row has a name and a price', () => {
    component.writeValue([
      { tierName: 'General Admission', price: 25 },
      { tierName: 'VIP', price: 75 },
    ]);

    expect(component.validate()).toBeNull();
  });

  it('sends the typed price to the form', async () => {
    component.writeValue([{ tierName: 'VIP', price: null }]);
    await fixture.whenStable();
    let sent: TicketTierValue[] | null = null;
    component.registerOnChange((value) => (sent = value));

    const priceInput = element.querySelector<HTMLInputElement>('.price input')!;
    priceInput.value = '50';
    priceInput.dispatchEvent(new Event('input'));

    expect(sent).toEqual([{ tierName: 'VIP', price: 50 }]);
  });

  it('"Add ticket tier" adds an empty row', async () => {
    component.writeValue([{ tierName: 'VIP', price: 75 }]);
    await fixture.whenStable();
    let sent: TicketTierValue[] | null = null;
    component.registerOnChange((value) => (sent = value));

    element.querySelector<HTMLButtonElement>('.add-button')!.click();
    await fixture.whenStable();

    expect(sent).toEqual([
      { tierName: 'VIP', price: 75 },
      { tierName: null, price: null },
    ]);
    expect(element.querySelectorAll('.name input').length).toBe(2);
  });

  it('asks before deleting a filled row, then removes it', async () => {
    component.writeValue([
      { tierName: 'VIP', price: 75 },
      { tierName: 'Student', price: 10 },
    ]);
    await fixture.whenStable();
    let sent: TicketTierValue[] | null = null;
    component.registerOnChange((value) => (sent = value));

    element.querySelector<HTMLButtonElement>('button[aria-label="Delete ticket tier"]')!.click();
    await fixture.whenStable();

    expect(timesAsked).toBe(1);
    expect(sent).toEqual([{ tierName: 'Student', price: 10 }]);
  });
});
