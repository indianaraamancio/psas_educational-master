import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentScalesComponent } from './assessment-scale.component';

describe('AssessmentScalesComponent', () => {
  let component: AssessmentScalesComponent;
  let fixture: ComponentFixture<AssessmentScalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentScalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentScalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
