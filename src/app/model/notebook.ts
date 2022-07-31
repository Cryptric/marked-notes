import { DirNode } from "./dir-node";

export class Notebook {

  public static IMAGE_NAME_REGEX = new RegExp(/img-\d+\..*/gm)

  public name: string;
  public path: string;

  public dir: DirNode;
  public isEncryptedNotebook: boolean = false;

  constructor() {

  }

  public readNotebook(fs: any) {
    this.dir = new DirNode(this.path, this.name, true, this);

    const stack = [this.dir];
    while (stack.length > 0) {
      let node = stack.pop();
      if (node) {
        const childern = fs.readdirSync(node.path);
        for (let child of childern) {
          const childPath = `${node.path}/${child}`;
          const childNode = new DirNode(childPath, child, fs.statSync(childPath).isDirectory(), this);
          node.children.push(childNode);

          if (childNode.isDir) {
            stack.push(childNode);
          }
        }
      }
    }
  }

  public createNotebook(fs: any) {
    if (!this.path.endsWith(this.name)) {
      this.path = this.path + "/" + this.name;
    }
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path);
    }
    if (!fs.existsSync(this.path + "/images")) {
      fs.mkdirSync(this.path + "/images");
    }
  }

  public pasteImage(file: File, fs: any): DirNode {
    let files = fs.readdirSync(this.path + "/images/");
    files = files.filter((element) => element.match(Notebook.IMAGE_NAME_REGEX));
    files.forEach((element, index) => files[index] = parseInt(element.substring(4, element.indexOf('.'))));
    let fileName;
    if (files.length == 0) {
      fileName = "img-0"
    } else {
      let max = Math.max.apply(Math, files);
      fileName = "img-" + (max + 1);
    }
    fileName = fileName + file.name.substring(file.name.lastIndexOf('.'), file.name.length);
    let filePath = this.path + "/images/" + fileName;
    fs.copyFileSync(file.path, filePath);

    let dirNode = new DirNode(filePath, fileName, false, this);
    let imgDir = this.dir.children.filter((element) => element.name === "images")[0];
    imgDir.children.push(dirNode);

    return dirNode;
  }
}
