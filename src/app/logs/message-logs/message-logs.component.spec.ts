import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageLogsComponent } from './message-logs.component';

describe('MessageLogsComponent', () => {
  let component: MessageLogsComponent;
  let fixture: ComponentFixture<MessageLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageLogsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
