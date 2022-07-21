export class DirNode {

  public path: string;
  public name: string;
  public children: Array<DirNode>;
  public isDir: boolean;

  constructor(path: string, name: string, isDir: boolean) {
    this.path = path;
    this.name = name;
    this.isDir = isDir;
    this.children = [];
  }


}
