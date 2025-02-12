import { Component, OnInit, output } from '@angular/core';

import { DataService } from '../Services/DataService.service';

import { MessageService } from 'primeng/api/messageservice';
import { TreeNode } from 'primeng/api/treenode';
import { TreeModule } from 'primeng/tree';

@Component({
    selector: 'fileSelection',
    standalone: true,
    imports: [TreeModule],
    templateUrl: './fileselection.component.html',
    styleUrl: './fileselection.component.scss'
})
export class FileselectionComponent implements OnInit {
    public root = "/";
    public files: TreeNode[] = [];
    public selected: TreeNode[] = [];

    public showChecked : boolean = true;
    public loading: any;
    public new_root : string = '';
    public displaySetRootDialog : boolean = false;
    public displayDeleteDialog : boolean = false;

    public selectedFile = output<any>();

    constructor(private dataService : DataService) { 
    }

    ngOnInit(): void {
        this.initializeTree();

        this.dataService.getFiles(this.root).then((nodes : Array<any>) => {
            this.files[0].children = nodes;
        });
    }

//  CALLBACKS

    nodeExpand(event: any) {
        const node = event.node;

        if (node.leaf === false) {
            node.icon = 'pi pi-folder-open';
        }
        if (node.leaf === false && node.children.length === 0) {
            this.dataService.getFiles(event.node.data).then((nodes : Array<any>) => {
                node.children = nodes;
            });
        }
    }

    nodeCollapse(event : any) {
      const node = event.node;

      if (node.leaf === false)
          node.icon = 'pi pi-folder';
    }

    nodeSelect(event: any) {
        const node = event.node;

        if (node.leaf === true) {
            this.selectedFile.emit(node);
        }
    }

    nodeUnSelect(event: any) {
        let n = 0;
        const node = event.node;
        const f = (p : string, c : string) =>  { return p.endsWith(c) };
    }

    public setRoot() {
        this.root = this.new_root;
        this.initializeTree();
        this.displaySetRootDialog = false;
    }

//  PRIVATE METHODS

    private initializeTree() : void {
        this.files = [{"label": this.root, "data": this.root, "expandedIcon": "pi pi-folder-open", "collapsedIcon": "pi pi-folder", "children": [], "leaf": false}];
        this.selected = [];
    }
}
