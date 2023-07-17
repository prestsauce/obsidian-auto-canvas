import { Plugin } from 'obsidian';
import { 
	AutoCanvasPluginSettings, 
	AutoCanvasSettingsTab,
	DEFAULT_SETTINGS } from './settings';
	
import { Canvas } from './canvas';



export default class AutoCanvasPlugin extends Plugin {
	settings: AutoCanvasPluginSettings;
	canvas: Canvas;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new AutoCanvasSettingsTab(this.app, this));
		this.canvas = new Canvas(this);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}




