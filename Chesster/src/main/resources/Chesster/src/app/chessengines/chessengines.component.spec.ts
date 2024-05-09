import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChessenginesComponent } from './chessengines.component';

describe('ChessenginesComponent', () => {
  let component: ChessenginesComponent;
  let fixture: ComponentFixture<ChessenginesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChessenginesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChessenginesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
