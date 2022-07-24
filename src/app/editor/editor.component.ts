import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  private static SAVE_DELAY = 1000;

  @Input() markdownCode: string;

  @Output() markdownCodeChange = new EventEmitter<string>();
  @Output() save = new EventEmitter();

  private saveScheduled = false;

  constructor() { }

  ngOnInit(): void {
  }

  public onChange(): void {
    this.markdownCodeChange.emit(this.markdownCode);
    this.saveScheduled = true;
    setTimeout(() => this.emitSave(), EditorComponent.SAVE_DELAY);
  }

  public emitSave(): void {
    this.saveScheduled = false;
    this.save.emit();
  }


}
