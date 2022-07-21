import { Component } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { ConfigLoader } from './helper/config-loader';
import { Config } from './model/config';
import { Notebook } from './model/notebook';
import { DirNode } from './model/dir-node';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public markdownCode: string = "";
  public openedFile: DirNode;

  public config: Config;

  private configLoader: ConfigLoader;

  constructor(private electronService: ElectronService, private translate: TranslateService) {
    this.translate.setDefaultLang('en');
    // console.log('APP_CONFIG', APP_CONFIG);

    if (electronService.isElectron) {
      this.configLoader = new ConfigLoader(electronService);
      this.config = this.configLoader.loadConfig();
      for (let i = 0; i < this.config.notebooks.length; i++) {
        this.config.notebooks[i].readNotebook(electronService.fs);
      }

      // console.log(process.env);
      // console.log('Run in electron');
      // console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      // console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }

  public selectFile(dirNode: DirNode) {
    if (!dirNode.isDir) {
      if (dirNode.name.toLowerCase().endsWith('.md')) {
        this.openedFile = dirNode;
        this.markdownCode = this.electronService.fs.readFileSync(dirNode.path).toString();
      }
    }
  }

  public save(): void {
    console.log("save");
  }

}
