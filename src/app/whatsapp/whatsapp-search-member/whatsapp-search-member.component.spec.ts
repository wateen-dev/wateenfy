import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappSearchMemberComponent } from './whatsapp-search-member.component';

describe('WhatsappSearchMemberComponent', () => {
  let component: WhatsappSearchMemberComponent;
  let fixture: ComponentFixture<WhatsappSearchMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappSearchMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhatsappSearchMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
