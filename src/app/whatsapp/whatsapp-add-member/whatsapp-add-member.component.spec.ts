import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappAddMemberComponent } from './whatsapp-add-member.component';

describe('WhatsappAddMemberComponent', () => {
  let component: WhatsappAddMemberComponent;
  let fixture: ComponentFixture<WhatsappAddMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappAddMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappAddMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
