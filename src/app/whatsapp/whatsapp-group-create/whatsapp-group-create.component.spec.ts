import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappGroupCreateComponent } from './whatsapp-group-create.component';

describe('WhatsappGroupCreateComponent', () => {
  let component: WhatsappGroupCreateComponent;
  let fixture: ComponentFixture<WhatsappGroupCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappGroupCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappGroupCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
