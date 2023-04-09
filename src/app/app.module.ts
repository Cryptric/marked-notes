import { BrowserModule } from '@angular/platform-browser';
import { NgModule, SecurityContext } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


import { AppComponent } from './app.component';

import { AngularSplitModule } from 'angular-split';
import { MarkdownModule } from 'ngx-markdown';
import { TreeModule } from '@circlon/angular-tree-component';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';

import { PreviewComponent } from './preview/preview.component';
import { EditorComponent } from './editor/editor.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { WhiteboardComponent } from './whiteboard/whiteboard.component';
import { TexEditorComponent } from './tex-editor/tex-editor.component';
import { SafePipe } from './helper/safe.pipe';
import { AutofocusDirective } from './helper/autofocus.directive';

import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/verilog/verilog';
import 'codemirror/mode/haskell/haskell';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';
import 'codemirror/mode/stex/stex';
import 'codemirror/keymap/sublime'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/closebrackets'

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>  new TranslateHttpLoader(http, './assets/i18n/', '.json');

@NgModule({
  declarations: [
    AppComponent,
    PreviewComponent,
    EditorComponent,
    SidebarComponent,
    WhiteboardComponent,
    TexEditorComponent,
    SafePipe,
    AutofocusDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AngularSplitModule,
    MarkdownModule.forRoot({
      sanitize: SecurityContext.NONE
    }),
    TreeModule,
    CodemirrorModule
  ],
  providers: [ ],
  bootstrap: [AppComponent]
})
export class AppModule {}
