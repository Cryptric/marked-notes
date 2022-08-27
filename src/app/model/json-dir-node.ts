import { DirNode } from "./dir-node";

export class JSONDirNode extends DirNode {

  public override children: Array<JSONDirNode>;
  public parent: JSONDirNode;

  public content: string = "";

}
