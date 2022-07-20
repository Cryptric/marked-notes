import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { MermaidAPI } from 'ngx-markdown';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {

  @Input() markdownCode: string = "";

  public mermaidOptions: MermaidAPI.Config = {
    theme: MermaidAPI.Theme.Dark
  }

  constructor() { }

  ngOnInit(): void {
  }

}
