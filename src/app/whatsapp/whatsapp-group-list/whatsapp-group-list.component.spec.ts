import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappGroupListComponent } from './whatsapp-group-list.component';

describe('WhatsappGroupListComponent', () => {
  let component: WhatsappGroupListComponent;
  let fixture: ComponentFixture<WhatsappGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappGroupListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
