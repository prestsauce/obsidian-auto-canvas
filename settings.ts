import AutoCanvasPlugin from "./main";
import { App, PluginSettingTab, Setting, setIcon } from 'obsidian';


export interface FolderCanvasMap {
    key: string;
    folder: string;
    canvas: string;
}

export interface AutoCanvasPluginSettings {
    openTargetCanvasOnNewItem: boolean;
	folderCanvasMaps: {};
}

export const DEFAULT_SETTINGS: AutoCanvasPluginSettings = {
    openTargetCanvasOnNewItem: true,
	folderCanvasMaps: {}
}


export class AutoCanvasSettingsTab extends PluginSettingTab {
	plugin: AutoCanvasPlugin;

	constructor(app: App, plugin: AutoCanvasPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}


    private async addFolderCanvasMap(newMap: FolderCanvasMap) {
        if (!newMap.key)
            return;

        (this.plugin.settings.folderCanvasMaps as any)[newMap.key] = newMap; 
        await this.plugin.saveSettings();
        console.log(this.plugin.settings.folderCanvasMaps);
        this.display();

        return true;
    }


    private async deleteFolderCanvasMap(key: string) {
        if (!key)
            return;

        delete (this.plugin.settings.folderCanvasMaps as any)[key];

        await this.plugin.saveSettings();
        this.display();

        return true;
    }




    private createInputRow(el: HTMLElement, map: FolderCanvasMap) {

        const inputContainer = el.createDiv({ cls: "auto-canvas-settings__new-input-container" });

        const folderInput = inputContainer.createEl("input", {
            cls: "auto-canvas-settings__new-input",
            attr: { value: map.folder, placeholder: "path/to/folder", type: "text", }
        });

        folderInput.addEventListener('input', (ev: Event) => {
            (this.plugin.settings.folderCanvasMaps as any)[map.key].folder = (ev.target.value as String);
            this.plugin.saveSettings();
        })

        const canvasInput = inputContainer.createEl("input", {
            cls: "auto-canvas-settings__new-input",
            attr: { value: map.canvas, placeholder: "path/to/canvas", type: "text", }
        })

        canvasInput.addEventListener('input', (ev: Event) => {
            (this.plugin.settings.folderCanvasMaps as any)[map.key].canvas = (ev.target.value as String);
            this.plugin.saveSettings();
        })

        const removeMapButton = inputContainer.createEl("button", {
            cls: "mod-cta auto-canvas-settings__remove-map-button"
        });

        setIcon(removeMapButton, "minus");
        
        removeMapButton.addEventListener("click", async () => {
            const isValid = await this.deleteFolderCanvasMap(map.key);
            console.log(this.plugin.settings.folderCanvasMaps);
        })

    }


    private displayMapInputs() {
        const {containerEl} = this;
        const currentLength = Object.entries(this.plugin.settings.folderCanvasMaps).length;

        for(const [key, value] of Object.entries(this.plugin.settings.folderCanvasMaps))
        {
            if (!value)
                continue;

            this.createInputRow(containerEl, (value as FolderCanvasMap));
        }

        const buttonContainer = containerEl.createDiv({ cls: "auto-canvas-settings__new-input-container" });
		const addMapButton = buttonContainer.createEl("button", {
			cls: "auto-canvas-settings__new-map-button",
		})

		setIcon(addMapButton, "plus")

		addMapButton.addEventListener("click", async () => {

			const isValid = await this.addFolderCanvasMap({
				key: (currentLength + 1).toString(),
                folder: "",
				canvas: "",
			})

            console.log(this.plugin.settings.folderCanvasMaps);

			// this.reportInputValidity(folderInput, isValid.key, "Please input a name for your color")
			// this.reportInputValidity(colorValueInput, isValid.value, "Color is not a valid JSON array of colors")
		})
    }


	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Auto Canvas Settings'});

        new Setting(containerEl)
            .setName("Open Canvas on New Item")
            .setDesc("Enable or disable the automatic opening of the canvas when a new node is created.")
            .addToggle(toggle =>
                toggle
                .setValue(this.plugin.settings.openTargetCanvasOnNewItem)
                .onChange(async value => {
                this.plugin.settings.openTargetCanvasOnNewItem = value;
                await this.plugin.saveSettings();
                })
            );
        this.displayMapInputs();
	}
}