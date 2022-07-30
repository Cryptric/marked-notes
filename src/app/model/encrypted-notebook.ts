import { EncryptedDirNode } from "./encrypted-dir-node";
import { Notebook } from "./notebook";

export class EncryptedNotebook extends Notebook {

  public override dir: EncryptedDirNode;

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

}
