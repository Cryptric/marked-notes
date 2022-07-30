import { Notebook } from "./notebook";

export class DirNode {

  public path: string;
  public name: string;
  public children: Array<DirNode>;
  public isDir: boolean;
  public notebook: Notebook;

  constructor(path: string, name: string, isDir: boolean, notebook: Notebook) {
    this.path = path;
    this.name = name;
    this.isDir = isDir;
    this.notebook = notebook;
    this.children = [];
  }

  public rebuildPath(basePath: string): void {
    //console.log("rebuild: " + basePath);
    this.path = basePath + "/" + this.name;
    for (let child of this.children) {
      child.rebuildPath(basePath + "/" + this.name);
    }
  }

}
