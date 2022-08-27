import * as svgToTinyDataUri from "mini-svg-data-uri";
import { DirNode } from "./dir-node";
import { EncryptedDirNode } from "./encrypted-dir-node";
import { Notebook } from "./notebook";

export class EncryptedNotebook extends Notebook {

  public override dir: EncryptedDirNode;
  public override isEncryptedNotebook: boolean = true;

  public override readNotebook(fs: any) {
    let jsonBook = fs.readFileSync(this.path + "/" + this.name + ".json");
    this.dir = Object.assign(new EncryptedDirNode(), JSON.parse(jsonBook));

    this.dir.notebook = this;
    this.assignNodes(this.dir, null);
  }

  private assignNodes(node: EncryptedDirNode, parent: EncryptedDirNode) {
    for (let i = 0; i < node.children.length; i++) {
      node.children[i] = Object.assign(new EncryptedDirNode(), node.children[i]);
      node.children[i].notebook = this;
      node.children[i].parent = node;
      this.assignNodes(node.children[i], node.children[i]);
    }
  }

  public save(fs: any): void {
    let json = JSON.stringify(this.dir, (key, value) => {
      if (key === 'notebook' || key === 'parent') {
        return undefined;
      } else {
        return value;
      }
    });
    fs.writeFileSync(this.path + "/" + this.name + ".json", json);
  }

  public rename(fs: any, oldPath: string, oldName: string) {
    fs.renameSync(oldPath, this.path);
    fs.renameSync(this.path + "/" + oldName + ".json", this.path + "/" + this.name + ".json");
    this.save(fs);
  }

  public remove(fs: any): void {
    fs.rmSync(this.path, { recursive: true })
  }

  public override createNotebook(fs: any) {
    if (!this.path.endsWith(this.name)) {
      this.path = this.path + "/" + this.name;
    }
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path);
    }
    let content = new EncryptedDirNode(this.path, this.name, true, this);
    content.children.push(new EncryptedDirNode(this.path + "/images", "images", true, this));
    this.dir = content;
    this.save(fs);
  }

  public loadFile(path: string): string {
    return this.searchFile(path, this.dir);
  }

  private searchFile(path: string, node: EncryptedDirNode): string {
    if (node.path === path) {
      return node.content;
    }
    for (let child of node.children) {
      let result = this.searchFile(path, child);
      if (result) {
        return result;
      }
    }
    return null;
  }

  public override pasteImage(file: File, fs: any): EncryptedDirNode {
    let imgDir = this.dir.children.filter((element) => element.name === "images")[0];
    let name = this.getNewImageName(fs, Notebook.IMAGE_NAME_REGEX, "img");
    let imageType = file.name.substring(file.name.lastIndexOf('.'), file.name.length);
    name = name + imageType;

    let img = 'data:image/' + imageType.substring(1) + ";base64," + fs.readFileSync(file.path, 'base64');

    let imgNode = new EncryptedDirNode(this.path + "/images/" + name, name, false, this);
    imgNode.parent = imgDir;
    imgNode.content = img;
    imgDir.children.push(imgNode);
    return imgNode;
  }

  public override getNewImageName(fs: any, regex: any, baseName: string): string {
    let imgDir = this.dir.children.filter((element) => element.name === "images")[0];
    let files = [];
    imgDir.children.forEach((element) => {
      if (element.name.match(regex)) {
        files.push(parseInt(element.name.substring(baseName.length + 1, element.name.indexOf('.'))));
      }
    });
    let name;
    if (files.length == 0) {
      name = baseName + "-0";
    } else {
      let max = Math.max.apply(Math, files);
      name = baseName + "-" + (max + 1);
    }
    return name;
  }

  public saveSketch(data, fs: any): DirNode {
    let imgDir = this.dir.children.filter((element) => element.name === "images")[0];

    let fileName = this.getNewImageName(fs, Notebook.SKETCH_NAME_REGEX, "sketch");
    fileName = fileName + ".svg";

    let img = svgToTinyDataUri(data);

    let imgNode = new EncryptedDirNode(this.path + "/images/" + fileName, fileName, false, this);
    imgNode.parent = imgDir;
    imgNode.content = img;
    imgDir.children.push(imgNode);
    return imgNode;
  }

  public saveTex(data, fs: any): DirNode {
    let imgDir = this.dir.children.filter((element) => element.name === "images")[0];

    let fileName = this.getNewImageName(fs, Notebook.TEX_NAME_REGEX, "tex");
    fileName = fileName + ".svg";

    let img = svgToTinyDataUri(data);

    let imgNode = new EncryptedDirNode(this.path + "/images/" + fileName, fileName, false, this);
    imgNode.parent = imgDir;
    imgNode.content = img;
    imgDir.children.push(imgNode);
    return imgNode;
  }

}
