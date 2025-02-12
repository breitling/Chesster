import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChesspositionComponent } from './chessposition.component';

describe('ChesspositionComponent', () => {
  let component: ChesspositionComponent;
  let fixture: ComponentFixture<ChesspositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChesspositionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChesspositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
