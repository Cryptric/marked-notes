import { DirNode } from "./dir-node";

export class Notebook {

  public static IMAGE_NAME_REGEX = new RegExp(/img-\d+\..*/gm)
  public static SKETCH_NAME_REGEX = new RegExp(/sketch-\d+\..*/gm)
  public static TEX_NAME_REGEX = new RegExp(/tex-\d+\..*/gm)


  public name: string;
  public path: string;

  public dir: DirNode;
  public isJSONNotebook: boolean = false;
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
    let fileName = this.getNewImageName(fs, Notebook.IMAGE_NAME_REGEX, "img");
    fileName = fileName + file.name.substring(file.name.lastIndexOf('.'), file.name.length);
    let filePath = this.path + "/images/" + fileName;

    fs.copyFileSync(file.path, filePath);
    //fs.writeFileSync(filePath, file);

    let dirNode = new DirNode(filePath, fileName, false, this);
    let imgDir = this.dir.children.filter((element) => element.name === "images")[0];
    imgDir.children.push(dirNode);

    return dirNode;
  }

  public getNewImageName(fs: any, regex: any, baseName: string): string {
    let files = fs.readdirSync(this.path + "/images/");
    files = files.filter((element) => element.match(regex));
    files.forEach((element, index) => files[index] = parseInt(element.substring(baseName.length + 1, element.indexOf('.'))));
    let fileName;
    if (files.length == 0) {
      fileName = baseName + "-0"
    } else {
      let max = Math.max.apply(Math, files);
      fileName = baseName + "-" + (max + 1);
    }
    return fileName;
  }

  public saveSketch(data, fs: any): DirNode {
    let fileName = this.getNewImageName(fs, Notebook.SKETCH_NAME_REGEX, "sketch");
    fileName = fileName + ".svg";

    let filePath = this.path + "/images/" + fileName;

    fs.writeFileSync(filePath, data);

    let dirNode = new DirNode(filePath, fileName, false, this);
    let imgDir = this.dir.children.filter((element) => element.name === "images")[0];
    imgDir.children.push(dirNode);

    return dirNode;
  }

  public saveTex(data, fs: any): DirNode {
    let fileName = this.getNewImageName(fs, Notebook.TEX_NAME_REGEX, "tex");
    fileName = fileName + ".svg";

    let filePath = this.path + "/images/" + fileName;

    fs.writeFileSync(filePath, data);

    let dirNode = new DirNode(filePath, fileName, false, this);
    let imgDir = this.dir.children.filter((element) => element.name === "images")[0];
    imgDir.children.push(dirNode);

    return dirNode;
  }

}
