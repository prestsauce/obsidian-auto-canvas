import { App, Editor, MarkdownView, Modal, Notice, Plugin, TAbstractFile, TFile } from 'obsidian';
import { AutoCanvasSettingsTab, AutoCanvasPluginSettings, DEFAULT_SETTINGS, FolderCanvasMap } from "./settings";
const fs = require('fs');
var path = require('path');


interface node {
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
	type: 'file';
	file: string;
	color?: string;
  }


export default class AutoCanvasPlugin extends Plugin {
	settings: AutoCanvasPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AutoCanvasSettingsTab(this.app, this));

		this.registerEvent(
			this.app.vault.on("modify", async (page) => {

				let targetCanvas = this.findFolderCanvasMap(page);
				if (!targetCanvas)
					return;

				let addedPage = await this.tryAddPageToCanvas(page, targetCanvas);
				if (!addedPage)
					return;

				if (targetCanvas && this.settings.openTargetCanvasOnNewItem)
					this.openTargetCanvas(targetCanvas);
			})
		)
	}


	findFolderCanvasMap(page: TAbstractFile) : string|null {
		const folderPath = page.path.substring(0, page.path.lastIndexOf("/") + 1);
		let entry =  
			Object.entries(this.settings.folderCanvasMaps)
			.find(entry => (entry[1] as FolderCanvasMap).folder == folderPath);

		return entry ? (entry[1] as FolderCanvasMap).canvas : null;
	}



	async openTargetCanvas(canvasPath : string) {
		
		let activeLeaf;
		try { activeLeaf = this.app.workspace.getLeaf(); }
		catch { return; }
		if (!activeLeaf) { return; }

		try {
			let pageData = this.app.vault.fileMap[canvasPath];

			if (!pageData)
				return;

			await activeLeaf.openFile(pageData);
			activeLeaf.setEphemeralState({ rename: 'all' });
		} catch (error)
		{
			console.log(error);
		}
	}



	buildData(path: string) : node {
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



	async tryAddPageToCanvas(page: any, canvasPath: string) : Promise<boolean> {
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


	onunload() {

	}

	
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}


	async saveSettings() {
		await this.saveData(this.settings);
	}
}




