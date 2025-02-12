import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileselectionComponent } from './fileselection.component';

describe('FileselectionComponent', () => {
  let component: FileselectionComponent;
  let fixture: ComponentFixture<FileselectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileselectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FileselectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
