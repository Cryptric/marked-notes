import { DirNode } from "./dir-node";

export class Notebook {

  public name: string;
  public path: string;

  public dir: DirNode;

  constructor() {

  }

  public readNotebook(fs: any) {
    this.dir = new DirNode(this.path, this.name, true);

    const stack = [this.dir];
    while (stack.length > 0) {
      let node = stack.pop();
      if (node) {
        const childern = fs.readdirSync(node.path);
        for (let child of childern) {
          const childPath = `${node.path}/${child}`;
          const childNode = new DirNode(childPath, child, fs.statSync(childPath).isDirectory());
          node.children.push(childNode);

          if (childNode.isDir) {
            stack.push(childNode);
          }
        }
      }
    }
  }
}
