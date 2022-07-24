import { BrowserModule } from '@angular/platform-browser';
import { NgModule, SecurityContext } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


import { AppComponent } from './app.component';

import { AngularSplitModule } from 'angular-split';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { TreeModule } from '@circlon/angular-tree-component';

import { PreviewComponent } from './preview/preview.component';
import { EditorComponent } from './editor/editor.component';
import { SidebarComponent } from './sidebar/sidebar.component';

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>  new TranslateHttpLoader(http, './assets/i18n/', '.json');

@NgModule({
  declarations: [
    AppComponent,
    PreviewComponent,
    EditorComponent,
    SidebarComponent
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
    TreeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();
  console.log("options")
  return {
    renderer: renderer,
    baseUrl: "D:/tmp/test-notes/images/",
  }
}
