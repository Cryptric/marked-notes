import { Component, HostListener, Input, OnInit } from '@angular/core';

import { KatexOptions, MarkdownService, MermaidAPI } from 'ngx-markdown';


import { Renderer } from 'marked';
import { Notebook } from '../model/notebook';
import { JSONDirNode } from '../model/json-dir-node';
import { JSONNotebook } from '../model/json-notebook';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {

  private static stringReplacement = [['\\\\', '\\\\\\\\'], ['\\{', '\\\\{'], ['\\}', '\\\\}'], ['\\,', '\\\\,'], ['\\;', '\\\\;'], ['\\#', '\\\\#'], ['\\&', '\\\\&'], ['\\%', '\\\\%']];

  @Input() notebook: Notebook;

  private _markdownCode: string;
  public _markdownCodeRender: string;
  _imageFolderPath: string = "";

  private renderer: Renderer = new Renderer();

  @Input() set imageFolderPath(value: string) {
    this._imageFolderPath = value;
    this.markdownService.options.baseUrl = this._imageFolderPath;
  }

  @Input() set markdownCode(value: string) {
    this._markdownCode = value;
    let mdString = this._markdownCode;
    let mathMode = false;

    for (const e of PreviewComponent.stringReplacement) {
      mdString = mdString.replaceAll(e[0], e[1]);
    }

    this._markdownCodeRender = mdString;
  }

  public katexOptions: KatexOptions = {
    throwOnError: false
  }


  public mermaidOptions: MermaidAPI.Config = {
    theme: MermaidAPI.Theme.Dark
  }

  constructor(private markdownService: MarkdownService) {
    this.renderer.options = this.markdownService.options;
    this.markdownService.renderer.image = (href: string, title: string, text: string) => {
      if (this.notebook) {
        if (this.notebook instanceof JSONNotebook && !href.startsWith('http')) {
          const path = this.notebook.path + '/images/' + href;
          const data = this.notebook.loadFile(path);
          let out = `<img src="${data}" alt="${text}"`;
          if (title) {
            out += ` title="${title}"`;
          }
          out += this.renderer.options.xhtml ? '/>' : '>';
          return out;
        } else {
          return this.renderer.image(href, title, text);
        }
      }
    }
  }

  ngOnInit(): void {
  }


}
