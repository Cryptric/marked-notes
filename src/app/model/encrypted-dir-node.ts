import { DirNode } from "./dir-node";
import { EncryptedNotebook } from "./encrypted-notebook";

export class EncryptedDirNode extends DirNode {

  public override children: Array<EncryptedDirNode>;
  public parent: EncryptedDirNode;

  public content: string = "";


}
