import { App, TAbstractFile, TFile } from 'obsidian';
import AutoCanvasPlugin from "./main";
import { 
    AutoCanvasPluginSettings } from "./settings";

import { tryOpenTargetFile } from './editor';

const fs = require('fs');
var path = require('path');


export interface node {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	type: 'file';
	file: string;
	color?: string;
  }



export class Canvas {

    private plugin: AutoCanvasPlugin;
    private app: App;
    private settings: AutoCanvasPluginSettings;
    
    constructor(plugin: AutoCanvasPlugin)
    {
        this.plugin = plugin;
        this.app = plugin.app
        this.settings = plugin.settings;
		this.plugin.registerEvent(this.app.vault.on("modify", (page: TAbstractFile) => this.onModify(page)));
        this.plugin.registerEvent(this.app.workspace.on("active-leaf-change", (menu, editor, view) => {
            console.log(view);
        }));
    }


    private async onModify(page: TAbstractFile) {
        const targetCanvasPath = this.findFolderCanvasMap(page);
        if (!targetCanvasPath)
            return;

        const addedPage = await this.tryAddPageToCanvas(page, targetCanvasPath);
        if (!addedPage)
            return;

        if (targetCanvasPath && this.settings.openTargetCanvasOnNewItem)
            tryOpenTargetFile(this.app, targetCanvasPath);
    }


    findFolderCanvasMap(page: TAbstractFile) : string|null {
		const folderPath = page.path.substring(0, page.path.lastIndexOf("/") + 1);
		let entry = this.settings.folderCanvasMaps.find(entry => entry.folder == folderPath);
		return entry ? entry.canvas : null;
	}


	private buildData(path: string) : node {
		return {
			"type":"file",
			"file": path,
			"id": (Math.floor(Math.random() * Date.now())).toString(),
			"x": 0,
			"y": 0,
			"width": 260,
			"height": 380
		}
	}

	private async tryAddPageToCanvas(page: any, canvasPath: string) : Promise<boolean> {
		try {
			let tAbstractCanvas = this.app.vault.getAbstractFileByPath(canvasPath) as TFile;
			let added = false;

			await this.app.vault.process(tAbstractCanvas, (data) => {
				let canvasData = JSON.parse(data);
				let found = canvasData.nodes.find((n: node) => n.file == page.path);
				if (found) return data;

				canvasData.nodes.push(this.buildData(page.path));
				added = true;
				return JSON.stringify(canvasData);
			})

			return added;
		} catch (error){
			console.log(error);
			return false;
		}
	}

}