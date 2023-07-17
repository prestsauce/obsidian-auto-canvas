import { App } from 'obsidian';


export const tryOpenTargetFile = 
    async (app: App, targetFilePath : string) : Promise<void> => {
		let activeLeaf;
		try { activeLeaf = app.workspace.getLeaf(); }
		catch { return; }
		if (!activeLeaf) { return; }

		try {
			let pageData = app.vault.getFiles().find(file => file.path == targetFilePath);

			if (!pageData)
				return;

			await activeLeaf.openFile(pageData);
			activeLeaf.setEphemeralState({ rename: 'all' });
		} catch (error)
		{
			console.log(error);
		}
	}