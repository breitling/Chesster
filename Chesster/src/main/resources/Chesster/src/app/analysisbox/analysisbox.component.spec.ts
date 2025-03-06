import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisboxComponent } from './analysisbox.component';

describe('AnalysisboxComponent', () => {
  let component: AnalysisboxComponent;
  let fixture: ComponentFixture<AnalysisboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
