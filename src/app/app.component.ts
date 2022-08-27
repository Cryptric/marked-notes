import { Component, HostListener, ViewChild } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import { ConfigLoader } from './helper/config-loader';
import { Config } from './model/config';
import { Notebook } from './model/notebook';
import { DirNode } from './model/dir-node';
import { SidebarComponent } from './sidebar/sidebar.component';
import { JSONNotebook } from './model/json-notebook';
import { JSONDirNode } from './model/json-dir-node';
import { EditorComponent } from './editor/editor.component';
import { ConfigService } from './helper/config.service';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild(SidebarComponent)
  private sidebarComponent: SidebarComponent;

  @ViewChild(EditorComponent)
  private editorComponent: EditorComponent;

  public newNotebookDialogOpen: boolean = false;
  public newNotebookName: string = "";
  public newNotebookLocation: string = "";
  public newNotebookJson: boolean = false;

  public newFolderDialogOpen: boolean = false;
  public newFileDialogOpen: boolean = false;
  public newFileFolderName: string = "";

  public renameDialogOpen: boolean = false;
  public renameName: string = "";

  public whiteboardOpen: boolean = false;

  public texeditorOpen: boolean = false;

  public showPreview = true;
  public showEditor = true;

  public markdownCode: string = "";
  public markdownPath: string = "";
  public imageFolderPath: string = "";
  public openedFile: DirNode;


  constructor(public electronService: ElectronService, private translate: TranslateService, public configService: ConfigService) {
    this.translate.setDefaultLang('en');
    // console.log('APP_CONFIG', APP_CONFIG);

    if (electronService.isElectron) {
      this.configService.loadConfig();
      for (let i = 0; i < this.configService.config.notebooks.length; i++) {
        this.configService.config.notebooks[i].readNotebook(electronService.fs);
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
        if (dirNode.notebook instanceof JSONNotebook) {
          this.markdownCode = (dirNode as JSONDirNode).content;
        } else {
          this.imageFolderPath = dirNode.notebook.path.replace(/\\/g, '/') + "/images/";
          this.markdownCode = this.electronService.fs.readFileSync(dirNode.path).toString();
          this.markdownPath = dirNode.path;
        }
      }
    }
  }

  @HostListener('document:keydown.control.s')
  public save(): void {
    if (this.openedFile && this.openedFile.name.toLowerCase().endsWith('.md')) {
      if (this.openedFile.notebook instanceof JSONNotebook) {
        (this.openedFile as JSONDirNode).content = this.markdownCode;
        this.openedFile.notebook.save(this.electronService.fs);
      } else {
        this.electronService.fs.writeFileSync(this.markdownPath, this.markdownCode);
      }
    }
  }

  public createNewNotebook(): void {
    let notebook = this.newNotebookJson? new JSONNotebook() : new Notebook();

    notebook.name = this.newNotebookName;
    notebook.path = this.newNotebookLocation;
    notebook.createNotebook(this.electronService.fs);
    notebook.readNotebook(this.electronService.fs);

    this.configService.config.notebooks.push(notebook);
    this.configService.config.notebooks = [].concat(this.configService.config.notebooks); // to trigger ngOnChange
    this.configService.saveConfig();

    this.newNotebookDialogOpen = false;
    this.newNotebookName = "";
    this.newNotebookLocation = "";
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
      if (this.openedFile.notebook instanceof JSONNotebook) {
        let node = new JSONDirNode(path, this.newFileFolderName, true, this.openedFile.notebook);
        this.openedFile.children.push(node);
        this.sidebarComponent.addNode(node);
        this.openedFile.notebook.save(this.electronService.fs);
      } else {
        let dir = new DirNode(path, this.newFileFolderName, true, this.openedFile.notebook);
        this.openedFile.children.push(dir);
        this.sidebarComponent.addNode(dir);
        this.electronService.fs.mkdirSync(path);
      }
      this.newFolderDialogOpen = false;
    } else if (this.newFileDialogOpen) {
      if (!this.newFileFolderName.includes('.')) {
        this.newFileFolderName += ".md";
      }
      let path = this.openedFile.path + "/" + this.newFileFolderName;
      if (this.openedFile.notebook instanceof JSONNotebook) {
        let node = new JSONDirNode(path, this.newFileFolderName, false, this.openedFile.notebook);
        this.openedFile.children.push(node);
        this.sidebarComponent.addNode(node);
        this.openedFile.notebook.save(this.electronService.fs);
      } else {
        let dir = new DirNode(path, this.newFileFolderName, false, this.openedFile.notebook);
        this.openedFile.children.push(dir);
        this.sidebarComponent.addNode(dir);
        this.electronService.fs.writeFileSync(path, '');
      }
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
      if (this.openedFile.isDir) {
        if (this.openedFile.notebook instanceof JSONNotebook && this.openedFile instanceof JSONDirNode) {
          if (this.openedFile.parent) {
            // sub folder
            let i = -1;
            this.openedFile.parent.children.forEach((value, index) => {
              if (value == this.openedFile) {
                i = index;
              }
            });
            this.openedFile.parent.children.splice(i, 1);
            this.openedFile.notebook.save(this.electronService.fs);
          } else {
            // notebook
            let i = -1;
            this.configService.config.notebooks.forEach((value, index) => {
              if (value == this.openedFile.notebook) {
                i = index;
              }
            });
            this.openedFile.notebook.remove(this.electronService.fs);
            this.configService.config.notebooks.splice(i, 1);
            this.configService.saveConfig();
          }
        } else {
          this.electronService.fs.rmdirSync(path, { recursive: true });
          let i = -1;
          this.configService.config.notebooks.forEach((value, index) => {
            if (value.path === path) {
              i = index;
            }
          });
          if (i != 0) {
            this.configService.config.notebooks.splice(i, 1);
            this.configService.saveConfig();
          }
        }
      } else {
        if (this.openedFile.notebook instanceof JSONNotebook && this.openedFile instanceof JSONDirNode) {
          let i = -1;
          this.openedFile.parent.children.forEach((value, index) => {
            if (value == this.openedFile) {
              i = index;
            }
          });
          this.openedFile.parent.children.splice(i, 1);
          this.openedFile.notebook.save(this.electronService.fs);
        } else {
          this.electronService.fs.rmSync(path);
        }
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

  public openRenameDialog(): void {
    if (this.openedFile) {
      this.renameDialogOpen = true;
    }
  }

  public rename(): void {
    if (!this.renameName) {
      return;
    }

    if (this.openedFile.isDir) {
      // Folder
      if (this.openedFile.path === this.openedFile.notebook.path || (this.openedFile.notebook instanceof JSONNotebook && this.openedFile.path === this.openedFile.notebook.name)) {
        // Notebook

        let oldPath = this.openedFile.notebook.path;
        let oldName = this.openedFile.notebook.name;
        this.openedFile.notebook.path = oldPath.substring(0, oldPath.length - this.openedFile.notebook.name.length) + this.renameName;
        this.openedFile.name = this.renameName;
        this.openedFile.notebook.dir.rebuildPath(oldPath.substring(0, oldPath.length - this.openedFile.notebook.name.length));
        this.openedFile.notebook.name = this.renameName;
        this.configService.saveConfig();

        if (this.openedFile.notebook instanceof JSONNotebook) {
          this.openedFile.notebook.rename(this.electronService.fs, oldPath, oldName);
        } else {
          this.electronService.fs.renameSync(oldPath, this.openedFile.notebook.path);
        }
        this.sidebarComponent.rename(this.renameName);
      } else {
        // sub folder
        let oldPath = this.openedFile.path;
        let basePath = oldPath.substring(0, oldPath.length - this.openedFile.name.length);
        this.openedFile.name = this.renameName;
        this.openedFile.rebuildPath(basePath);
        if (this.openedFile.notebook instanceof JSONNotebook) {
          this.openedFile.notebook.save(this.electronService.fs);
        } else {
          this.electronService.fs.renameSync(oldPath, this.openedFile.path);
        }
        this.sidebarComponent.rename(this.renameName);

      }
    } else {
      // File
      if (!this.renameName.includes('.')) {
        this.renameName += ".md";
      }
      let oldPath = this.openedFile.path
      this.openedFile.path = this.openedFile.path.substring(0, oldPath.length - this.openedFile.name.length) + this.renameName;
      this.openedFile.name = this.renameName;
      if (this.openedFile.notebook instanceof JSONNotebook) {
        this.openedFile.notebook.save(this.electronService.fs);
      } else {
        this.electronService.fs.renameSync(oldPath, this.openedFile.path);
      }
      this.sidebarComponent.rename(this.renameName);
    }
    this.renameName = "";
    this.renameDialogOpen = false;
  }

  public addTreeImage(event) {
    this.sidebarComponent.addImageToTree(event);
  }

  public insertSketch(data) {
    if (this.openedFile) {
      let node = this.openedFile.notebook.saveSketch(data, this.electronService.fs);
      this.addTreeImage(node);
      let md = "![sketch](" + node.name + ")";
      this.editorComponent.insert(md);
    }
    this.whiteboardOpen = false;
  }

  public insertTex(data) {
    if (this.openedFile) {
      let node = this.openedFile.notebook.saveTex(data, this.electronService.fs);
      this.addTreeImage(node);
      let md = "![tex](" + node.name + ")";
      this.editorComponent.insert(md);
    }
    this.texeditorOpen = false;
  }

}
