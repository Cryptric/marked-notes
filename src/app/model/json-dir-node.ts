import { DirNode } from './dir-node';

export class JSONDirNode extends DirNode {

  declare public children: Array<JSONDirNode>;
  public parent: JSONDirNode;

  public content: string = "";

}
