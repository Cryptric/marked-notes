import { Component, HostListener, Input, OnInit } from '@angular/core';

import { MarkdownService, MermaidAPI } from 'ngx-markdown';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {

  @Input() markdownCode: string = "";
  _imageFolderPath: string = "";

  @Input() set imageFolderPath(value: string) {
    this._imageFolderPath = value;
    this.markdownService.options.baseUrl = this._imageFolderPath;
  }


  public mermaidOptions: MermaidAPI.Config = {
    theme: MermaidAPI.Theme.Dark
  }

  constructor(private markdownService: MarkdownService) { }

  ngOnInit(): void {
  }


}
