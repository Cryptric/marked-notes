import { Component, HostListener, Input, OnInit } from '@angular/core';

import { KatexOptions, MarkdownService, MermaidAPI } from 'ngx-markdown';


import { Renderer } from 'marked';
import { Notebook } from '../model/notebook';
import { EncryptedDirNode } from '../model/encrypted-dir-node';
import { EncryptedNotebook } from '../model/encrypted-notebook';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {

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

    for (let i = 0; i < mdString.length; i++) {
      if (mdString.charAt(i) === '$' && (i <= 0 || mdString.charAt(i-1) !== '\\')) {
        if (mathMode) {
          mathMode = false;
        } else if (mdString.substring(i+2).includes('$') && mdString.substring(i+2).match(/.*[\w\s]\$.*/g)) {
          mathMode = true;
        }
      }
      if (mathMode && mdString.charAt(i) === '\\') {
        mdString = mdString.substring(0, i) + '\\\\' + mdString.substring(i+1);
        i += 1;
      }
    }


    for (let i = 0; i < mdString.length -1; i++) {
      if (mdString.charAt(i) === '$' && mdString.charAt(i+1) === '$' && (i <= 0 || mdString.charAt(i-1) !== '\\')) {
        if (mathMode) {
          mathMode = false;
        } else {
          if (mdString.substring(i + 2).includes('$$') && mdString.substring(i+2).match(/.*[\w\s]\$\$.*/g)) {
            mathMode = true;
          }
        }
      }
      if (mathMode && mdString.charAt(i) === '\\') {
        mdString = mdString.substring(0, i) + '\\\\' + mdString.substring(i+1);
        i += 1;
      }
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
        if (this.notebook instanceof EncryptedNotebook && !href.startsWith('http')) {
          let path = this.notebook.path + "/images/" + href;
          let data = this.notebook.loadFile(path);
          let out = `<img src='${data}' alt="${text}"`;
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
