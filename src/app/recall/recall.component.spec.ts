import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecallComponent } from './recall.component';

describe('RecallComponent', () => {
  let component: RecallComponent;
  let fixture: ComponentFixture<RecallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecallComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
