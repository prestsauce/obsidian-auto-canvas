import AutoCanvasPlugin from "./main";
import { App, PluginSettingTab, Setting, setIcon } from 'obsidian';

export interface Vector2 {
    X: number,
    Y: number
}

export interface FolderCanvasPair {
    folder: string;
    canvas: string;
    gridSize: Vector2 | null;
    nodeSize: Vector2 | null;
}

export interface AutoCanvasPluginSettings {
    openTargetCanvasOnNewItem: boolean;
	folderCanvasMaps: FolderCanvasPair[];
}

export const DEFAULT_SETTINGS: AutoCanvasPluginSettings = {
    openTargetCanvasOnNewItem: true,
	folderCanvasMaps: []
}


export class AutoCanvasSettingsTab extends PluginSettingTab {
	plugin: AutoCanvasPlugin;

	constructor(app: App, plugin: AutoCanvasPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}


    private async addFolderCanvasMap(newMap: FolderCanvasPair) {
        this.plugin.settings.folderCanvasMaps.push(newMap); 
        await this.plugin.saveSettings();
        console.log(this.plugin.settings.folderCanvasMaps);
        this.display();

        return true;
    }


    private async deleteFolderCanvasMap(index: number) {
        if (index < 0)
            return;

        this.plugin.settings.folderCanvasMaps.splice(index, 1);

        await this.plugin.saveSettings();
        this.display();

        return true;
    }




    private createInputRow(el: HTMLElement, map: FolderCanvasPair, index: number) {

        const mapContainer = el.createDiv({ cls: "auto-canvas-settings__map-container" });
        const folderCanvasRow = mapContainer.createDiv({ cls: "auto-canvas-settings__row" });
        const gridSizeRow = mapContainer.createDiv({ cls: "auto-canvas-settings__row" });
        mapContainer.createDiv({cls: "setting-item"});

        
        // FOLDER
        folderCanvasRow.createEl("p", {text: "Folder:", cls:"auto-canvas-settings__label"});
        folderCanvasRow
            .createEl("input", {
                cls: "auto-canvas-settings__input",
                attr: { value: map.folder, placeholder: "path/to/folder", type: "text", }
            })
            .addEventListener('input', (ev: Event) => {
                const folderInputEl = this.eventInputIsValid(ev);
                if (!folderInputEl) return;
                this.plugin.settings.folderCanvasMaps[index]['folder'] = folderInputEl.value as string;
                this.plugin.saveSettings();
            });


        // CANVAS
        folderCanvasRow.createEl("p", {text: "Canvas:", cls:"auto-canvas-settings__label"});
        folderCanvasRow
            .createEl("input", {
                cls: "auto-canvas-settings__input",
                attr: { value: map.canvas, placeholder: "path/to/canvas", type: "text", }
            })
            .addEventListener('input', (ev: Event) => {
                const canvasInputEl = this.eventInputIsValid(ev);
                if (!canvasInputEl) return;
                this.plugin.settings.folderCanvasMaps[index]['canvas'] = canvasInputEl.value as string;
                this.plugin.saveSettings();
            });

            
        // GRID.X
        gridSizeRow.createEl("p", {text: "Grid-X:", cls:"auto-canvas-settings__label"});
        gridSizeRow
            .createEl("input", {
                cls: "auto-canvas-settings__input",
                attr: { value: map.gridSize ? map.gridSize.X : null, placeholder: "300", type: "number", }
            })
            .addEventListener('input', (ev: Event) => {
                const gridXInputEl = this.eventInputIsValid(ev);
                if (!gridXInputEl) return;

                const value = parseInt(gridXInputEl.value) as number;

                if (!this.plugin.settings.folderCanvasMaps[index]['gridSize'])
                    this.plugin.settings.folderCanvasMaps[index]['gridSize'] = { X: value, Y: 0 };
                else
                    this.plugin.settings.folderCanvasMaps[index]['gridSize']!['X'] = value;

                this.plugin.saveSettings();
            });

        // GRID.Y
        gridSizeRow.createEl("p", {text: "Grid-Y:", cls:"auto-canvas-settings__label"});
        gridSizeRow
            .createEl("input", {
                cls: "auto-canvas-settings__input",
                attr: { value: map.gridSize ? map.gridSize.Y : null, placeholder: "400", type: "number", }
            })
            .addEventListener('input', (ev: Event) => {
                const gridYInputEl = this.eventInputIsValid(ev);
                if (!gridYInputEl) return;

                const value = parseInt(gridYInputEl.value) as number;

                if (!this.plugin.settings.folderCanvasMaps[index]['gridSize'])
                    this.plugin.settings.folderCanvasMaps[index]['gridSize'] = { X: 0, Y: value };
                else
                    this.plugin.settings.folderCanvasMaps[index]['gridSize']!['Y'] = value;

                this.plugin.saveSettings();
            });

        // NODE.X
        gridSizeRow.createEl("p", {text: "Node-X:", cls:"auto-canvas-settings__label"});
        gridSizeRow
            .createEl("input", {
                cls: "auto-canvas-settings__input",
                attr: { value: map.nodeSize ? map.nodeSize.X : null, placeholder: "260", type: "number", }
            })
            .addEventListener('input', (ev: Event) => {
                const nodeXInputEl = this.eventInputIsValid(ev);
                if (!nodeXInputEl) return;

                const value = parseInt(nodeXInputEl.value) as number;

                if (!this.plugin.settings.folderCanvasMaps[index]['nodeSize'])
                    this.plugin.settings.folderCanvasMaps[index]['nodeSize'] = { X: value, Y: 0 };
                else
                    this.plugin.settings.folderCanvasMaps[index]['nodeSize']!['X'] = value;

                this.plugin.saveSettings();
            });


        // NODE.Y
        gridSizeRow.createEl("p", {text: "Node-Y:", cls:"auto-canvas-settings__label"});
        gridSizeRow
            .createEl("input", {
                cls: "auto-canvas-settings__input",
                attr: { value: map.nodeSize ? map.nodeSize.Y : null, placeholder: "380", type: "number", }
            })
            .addEventListener('input', (ev: Event) => {
                const nodeYInputEl = this.eventInputIsValid(ev);
                if (!nodeYInputEl) return;

                const value = parseInt(nodeYInputEl.value) as number;

                if (!this.plugin.settings.folderCanvasMaps[index]['nodeSize'])
                    this.plugin.settings.folderCanvasMaps[index]['nodeSize'] = { X: 0, Y: value };
                else
                    this.plugin.settings.folderCanvasMaps[index]['nodeSize']!['Y'] = value;

                this.plugin.saveSettings();
            });




        // REMOVE BUTTON
        const removeMapButton = folderCanvasRow.createEl("button", {
            cls: "mod-cta auto-canvas-settings__btn"
        });
        setIcon(removeMapButton, "minus");
        removeMapButton.addEventListener("click", async () => {
            const isValid = await this.deleteFolderCanvasMap(index);
        })

    }


    

    private eventInputIsValid(ev: Event) : HTMLTextAreaElement | null {
        if (!ev.target )
            return null;
    
        const element : HTMLTextAreaElement = ev.target as HTMLTextAreaElement;
        return element ? element : null;
    }




    private displayMapInputs() {
        const {containerEl} = this;

        for(let i = 0; i < this.plugin.settings.folderCanvasMaps.length; i++)
        {
            let value = this.plugin.settings.folderCanvasMaps[i];
            if (!value)
                continue;

            this.createInputRow(containerEl, value, i);
        }

        const addMapButton = containerEl.createEl("button", {
			cls: "auto-canvas-settings__new-map-btn",
		})

		setIcon(addMapButton, "plus")

		addMapButton.addEventListener("click", () => {
            this.addFolderCanvasMap({
                folder: "",
				canvas: "",
                nodeSize: null,
                gridSize: null
			})
		});
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

        containerEl.createEl('div', {cls: "setting-item"});
        containerEl.createEl('h2', {text: 'Mappings'});
        containerEl.createEl("p", {
            cls: "setting-item-description",
            text: "Each mapping represents a folder-canvas pair. Elements created in the listed folder will be automatically added to the associated canvas. Node-X and Node-Y determine the size of the new node on the canvas. Use -1 to use the Obsidian default. Grid-X and Grid-Y determine the size of the grid in which to organize new elements. Use -1 to place elements at 0, 0."
        });
        
            containerEl.createEl('div', {cls: "setting-item"});

        this.displayMapInputs();
	}
}