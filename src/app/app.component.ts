import { Component, HostListener, ViewChild } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { ConfigLoader } from './helper/config-loader';
import { Config } from './model/config';
import { Notebook } from './model/notebook';
import { DirNode } from './model/dir-node';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild(SidebarComponent)
  private sidebarComponent: SidebarComponent;

  public newNotebookDialogOpen: boolean = false;
  public newNotebookName: string = "";
  public newNotebookLocation: string = "";

  public newFolderDialogOpen: boolean = false;
  public newFileDialogOpen: boolean = false;
  public newFileFolderName: string = "";

  public showPreview = true;
  public showEditor = true;

  public markdownCode: string = "";
  public imageFolderPath: string = "";
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
    this.openedFile = dirNode;
    if (!dirNode.isDir) {
      if (dirNode.name.toLowerCase().endsWith('.md')) {
        this.imageFolderPath = dirNode.notebook.path.replace(/\\/g, '/') + "/images/";
        this.markdownCode = this.electronService.fs.readFileSync(dirNode.path).toString();
      }
    }
  }

  @HostListener('document:keydown.control.s')
  public save(): void {
    if (this.openedFile) {
      this.electronService.fs.writeFileSync(this.openedFile.path, this.markdownCode);
    }
  }

  public createNewNotebook(): void {
    let notebook = new Notebook();
    notebook.name = this.newNotebookName;
    notebook.path = this.newNotebookLocation;
    notebook.createNotebook(this.electronService.fs);
    this.newNotebookDialogOpen = false;
    this.newNotebookName = "";
    this.newNotebookLocation = "";
    notebook.readNotebook(this.electronService.fs);
    this.config.notebooks.push(notebook);
    this.config.notebooks = [].concat(this.config.notebooks); // to trigger ngOnChange
    this.configLoader.saveConfig(this.config);
  }

  public openDirectoryDialog(): void {
    let response = this.electronService.ipcRenderer.sendSync("selectDir");
    if (response) {
      this.newNotebookLocation = response[0];
    }
  }

  public createNewFileFolder(): void {
    if (this.newFolderDialogOpen) {
      let path = this.openedFile.path + "/" + this.newFileFolderName;
      let dir = new DirNode(path, this.newFileFolderName, true, this.openedFile.notebook);
      this.openedFile.children.push(dir);
      this.sidebarComponent.addNode(dir);
      this.electronService.fs.mkdirSync(path);
      this.newFolderDialogOpen = false;
    } else if (this.newFileDialogOpen) {
      if (!this.newFileFolderName.includes('.')) {
        this.newFileFolderName += ".md";
      }
      let path = this.openedFile.path + "/" + this.newFileFolderName;
      let dir = new DirNode(path, this.newFileFolderName, false, this.openedFile.notebook);
      this.openedFile.children.push(dir);
      this.sidebarComponent.addNode(dir);
      this.electronService.fs.writeFileSync(path, '');
      this.newFileDialogOpen = false;

    }
    this.newFileFolderName = "";
  }

  public openNewFolderDialog(): void {
    if (this.openedFile && this.openedFile.isDir) {
      this.newFolderDialogOpen = true;
    }
  }

  public openNewFileDialog(): void {
    if (this.openedFile && this.openedFile.isDir) {
      this.newFileDialogOpen = true;
    }
  }

  public delete(): void {
    if (this.openedFile) {
      let path = this.openedFile.path;
      if (this.electronService.fs.statSync(path).isDirectory()) {
        this.electronService.fs.rmdirSync(path, { recursive: true });
        let i = -1;
        this.config.notebooks.forEach((value, index) => {
          if (value.path === path) {
            i = index;
          }
        });
        if (i != 0) {
          this.config.notebooks.splice(i, 1);
          this.configLoader.saveConfig(this.config);
        }
      } else {
        this.electronService.fs.rmSync(path);
      }
    }
    this.sidebarComponent.removeSelectedNode();
  }

  public togglePreview(): void {
    if (this.showPreview) {
      this.showEditor = true;
    }
    this.showPreview = !this.showPreview;
  }

  public toggleEditor(): void {
    if (this.showPreview && !this.showEditor) {
      this.showPreview = false;
      this.showEditor = true;
      setTimeout(() => this.showPreview = true, 0);
    } else {
      this.showEditor = !this.showEditor;
      if (!this.showEditor) {
        this.showPreview = true;
      }
    }
  }

}
