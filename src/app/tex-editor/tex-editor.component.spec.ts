import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TexEditorComponent } from './tex-editor.component';

describe('TexEditorComponent', () => {
  let component: TexEditorComponent;
  let fixture: ComponentFixture<TexEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TexEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TexEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
