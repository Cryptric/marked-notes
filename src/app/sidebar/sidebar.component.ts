import { ThisReceiver } from '@angular/compiler';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TreeComponent } from '@circlon/angular-tree-component';
import { DirNode } from '../model/dir-node';
import { EncryptedNotebook } from '../model/encrypted-notebook';
import { Notebook } from '../model/notebook';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnChanges {

  @Input() notebooks: Notebook[];
  @Output() selectedFile = new EventEmitter<DirNode>();
  @Output() newNotebook = new EventEmitter();
  @Output() newFolder = new EventEmitter();
  @Output() newFile = new EventEmitter();
  @Output() delete = new EventEmitter();
  @Output() renameEvent = new EventEmitter();
  @Output() requestEncryption = new EventEmitter();

  @ViewChild(TreeComponent)
  private tree: TreeComponent;

  nodes = [ ];

  options = {};

  activeTreeNode: any;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.nodes = [];
    this.notebooks.forEach(x => this.notebookToTree(x));
  }

  private notebookToTree(notebook: Notebook): void {
    let root: DirNode = notebook.dir;
    if (!(notebook instanceof EncryptedNotebook ) || notebook.isPasswordSet()) {
      this.nodes.push(this.dfs(root));
    } else {
      let treeNode = { name: notebook.name, children: [], dirNode: root, encrypted: true, notebook: notebook};
      this.nodes.push(treeNode);
    };
  }

  private dfs(node: DirNode): any {
    let treeNode = { name: node.name, children: [], dirNode: node};

    if (node.isDir) {
      for (let child of node.children) {
        treeNode.children.push(this.dfs(child));
      }
    }
    return treeNode;
  }

  public addEncryptedNotebook(notebook: Notebook): void {
    let root = notebook.dir;
    let treeNode = this.dfs(root);
    let children = treeNode.children;
    this.nodes.forEach(element => {
      if (element.id == this.activeTreeNode.id) {
        element.children = children;
        element.notebook = undefined;
        element.encrypted = false;
        element.dirNode = root;
      }
    });
    this.tree.treeModel.update();
  }

  public onNodeActivate(event: any) {
    this.activeTreeNode = event.node;
    if (this.activeTreeNode.data.encrypted) {
      this.requestEncryption.emit();
    } else {
      this.selectedFile.emit(event.node.data.dirNode);
    }
  }

  public addNode(dirNode: DirNode): void {
    this.activeTreeNode.data.children.push({name: dirNode.name, children: [], dirNode: dirNode});
    this.tree.treeModel.update();
    this.tree.treeModel.focusDrillDown();
  }

  public removeSelectedNode(): void {
    let parent = this.activeTreeNode.parent;
    let id = this.activeTreeNode.data.id;
    if (parent) {
      const index = parent.data.children.indexOf(this.activeTreeNode.data);
      parent.data.children.splice(index, 1);
    }
    this.tree.treeModel.update();
  }

  public rename(newName: string): void {
    this.activeTreeNode.data.name = newName;
    this.tree.treeModel.update();
  }

  public addImageToTree(dirNode: DirNode) {
    let node = this.tree.treeModel.getActiveNode();
    while (node.parent.parent) {
      node = node.parent;
    }
    let imgNode = node.data.children.filter((element) => element.name === "images")[0];
    imgNode.children.push({name: dirNode.name, children: [], dirNode: dirNode});
    this.tree.treeModel.update();
  }

}
