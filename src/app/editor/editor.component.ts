import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DirNode } from '../model/dir-node';
import { Notebook } from '../model/notebook';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  private static SAVE_DELAY = 1000;

  @ViewChild('textArea') textArea: ElementRef;

  @Input() markdownCode: string;

  @Output() markdownCodeChange = new EventEmitter<string>();
  @Output() save = new EventEmitter();

  @Output() addTreeImage = new EventEmitter<DirNode>(true);

  @Input() fs: any;
  @Input() notebook: Notebook;

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

  public paste(event): void {
    if (event.clipboardData.files[0] && this.notebook) {
      event.preventDefault();
      let imgNode = this.notebook.pasteImage(event.clipboardData.files[0], this.fs);
      document.execCommand('insertHTML', false, '![](' + imgNode.name + ')');
      this.addTreeImage.emit(imgNode);
    }
  }

  public insert(value: string) {
    let cursorPos = this.textArea.nativeElement.selectionStart;
    this.markdownCode = this.markdownCode.substring(0, cursorPos) + value + this.markdownCode.substring(cursorPos);
    this.onChange();
  }



}
