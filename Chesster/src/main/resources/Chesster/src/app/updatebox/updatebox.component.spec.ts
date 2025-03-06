import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateboxComponent } from './updatebox.component';

describe('UpdateboxComponent', () => {
  let component: UpdateboxComponent;
  let fixture: ComponentFixture<UpdateboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
