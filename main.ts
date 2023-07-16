import { App, Editor, MarkdownView, Modal, Notice, Plugin } from 'obsidian';
import { AutoCanvasSettingsTab, AutoCanvasPluginSettings, DEFAULT_SETTINGS, FolderCanvasMap } from "./settings";
const fs = require('fs');
var path = require('path');

export default class AutoCanvasPlugin extends Plugin {
	settings: AutoCanvasPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AutoCanvasSettingsTab(this.app, this));

		this.registerEvent(
			this.app.vault.on("create", (page) => {

				let targetCanvas = this.tryAddMatch(page);
				if (targetCanvas)
					this.openTargetCanvas(targetCanvas)
			})
		)
	}


	tryAddMatch(page) {

		const folderPath = page.path.substring(0, page.path.lastIndexOf("/") + 1);
		for(const [key, val] of Object.entries(this.settings.folderCanvasMaps))
		{
			let map = val as FolderCanvasMap;
			if (map.folder == folderPath)
			{
				this.tryAddPageToCanvas(page, map.canvas);
				return map.canvas;
			}
		}

		return null;
	}


	openTargetCanvas(canvasPath) {

		if (this.settings.openTargetCanvasOnNewItem == false)
			return;

		let activeLeaf;
		try { activeLeaf = this.app.workspace.getLeaf(); }
		catch { return; }
		if (!activeLeaf) { return; }

		setTimeout( async () => {
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

		}, 1500);
	}


	tryAddPageToCanvas(page: any, canvas: string) {

		try {

			let newNodeObj = {
				"type":"file",
				"file": page.path,
				"id": Math.random() * Date.now(),
				"x": 0,
				"y": 0,
				"width": 260,
				"height": 380
			}

			let fullPath = path.join(page.vault.adapter.basePath, canvas);
			
			fs.readFile(fullPath, 'utf8', (err, data) => {

				if (err){ console.log(err);}
				if (!data) return;

				let allObjs = JSON.parse(data);
				allObjs.nodes.push(newNodeObj);
				console.log(fullPath);
				fs.writeFile(fullPath, JSON.stringify(allObjs), (err2) => {
					if (err2)
						console.log(err2);
				})

				return;
			})
			

			return;

		} catch (error){
			console.log(error);
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




