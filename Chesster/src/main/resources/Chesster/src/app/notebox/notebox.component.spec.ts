import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteboxComponent } from './notebox.component';

describe('NoteboxComponent', () => {
  let component: NoteboxComponent;
  let fixture: ComponentFixture<NoteboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoteboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
