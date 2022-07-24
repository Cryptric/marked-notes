import { Component, HostListener, Input, OnInit } from '@angular/core';

import { KatexOptions, MarkdownService, MermaidAPI } from 'ngx-markdown';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {

  private _markdownCode: string;
  public _markdownCodeRender: string;
  _imageFolderPath: string = "";

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

  constructor(private markdownService: MarkdownService) { }

  ngOnInit(): void {
  }


}
