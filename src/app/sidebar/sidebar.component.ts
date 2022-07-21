import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { notStrictEqual } from 'assert';
import { DirNode } from '../model/dir-node';
import { Notebook } from '../model/notebook';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnChanges {

  @Input() notebooks: Notebook[];

  nodes = [ /*
    {
      id: 1,
      name: 'root1',
      children: [
        { id: 2, name: 'child1' },
        { id: 3, name: 'child2' }
      ]
    },
    {
      id: 4,
      name: 'root2',
      children: [
        { id: 5, name: 'child2.1' },
        {
          id: 6,
          name: 'child2.2',
          children: [
            { id: 7, name: 'subsub' }
          ]
        }
      ]
    } */
  ];

  options = {};

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.notebooks.forEach(x => this.notebookToTree(x));
  }

  private notebookToTree(notebook: Notebook): void {
    let root: DirNode = notebook.dir;
    this.nodes.push(this.dfs(root));

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

  public onNodeActivate(event: any) {
    console.log(event);
  }

}
