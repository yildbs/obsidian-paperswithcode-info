import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { getPaperInfo } from "src/parser";


export default class PaperswithcodeInfo extends Plugin {
	async onload() {
		// This creates an icon in the left ribbon.
		this.addRibbonIcon(
			"file-search",
			"Add Paper Info",
			async (evt: MouseEvent) => {
				// check current active file
				const file = this.app.workspace.getActiveFile();

				if (file.extension !== "md") {
					new Notice("This file is not md file, Please open md file");
					return;
				}

				if (!file) {
					new Notice("There's no active file, Please open new file");
					return;
				}

				// Called when the user clicks the icon.
				new Notice("Loading...");

				// Get first line
				const content = await this.app.vault.read(file);
				const lines = content.split(/\r?\n/);
				const url = lines[0];

				new Notice(`URL : ${url}`);
				const [title, result] = await getPaperInfo(url);

				// Join Frontmatter And text
				this.app.vault.modify(file, result + "\n\n" + content);

				if(title){
					// sanitizing the title
					const regExp =
					/[\{\}\[\]\/?.,;:|\)*~`!^\-+<>@\#$%&\\\=\(\'\"]/gi;
					const fileName = title.replace(regExp, "");

					// change file name
					this.app.fileManager.renameFile(
						this.app.vault.getAbstractFileByPath(file.path),
						file.parent.path + "/" + fileName + ".md"
					);
				}

				return
			}
		);
	}

	onunload() {

	}
}
