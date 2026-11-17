import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketTier } from './ticket-tier';

describe('TicketTier', () => {
  let component: TicketTier;
  let fixture: ComponentFixture<TicketTier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketTier],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketTier);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
