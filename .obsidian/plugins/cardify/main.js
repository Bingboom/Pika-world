/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => Cardify
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// src/helper.ts
var import_obsidian = require("obsidian");
function parseMDFile(mdContent) {
  const frontMatter = mdContent.match(/^(---\s*\n[\s\S]*?\n?---)/);
  const content = mdContent.replace(/^(---\s*\n[\s\S]*?\n?---)/, "");
  return { frontMatter: frontMatter ? frontMatter[1] : null, content };
}
function extractComment(content) {
  const match = content.match("(?<=\n>%%COMMENT%%\n>)(.*?)(?=\n)");
  return match ? match[1] : "";
}
function extractInternalLink(content) {
  const match = content.match("(?<=\n\\^)(.*?)(?=\n|$)");
  return match ? match[1] : null;
}
function extractPathBasename(filePath) {
  const match = filePath.match(/[^\\/]+$/);
  return match ? match[0] : "";
}
function parseCardBlock(cardBlock, activeFilePath) {
  return {
    title: extractComment(cardBlock),
    link: "![[" + extractPathBasename(activeFilePath) + "#^" + extractInternalLink(cardBlock) + "]]"
  };
}
function generateRandomKey(length = 10) {
  return Array.from(Array(length), () => Math.random().toString(36).charAt(2)).join("");
}
function addMissingInternalLink(content, separator) {
  const gSeparator = new RegExp(separator, "g");
  const blocks = content.split(gSeparator);
  const internalLinkRegex = "(?<=\n\\^)(.*?)(?=\n*?$)";
  const separatorList = content.match(gSeparator);
  if (!separatorList && blocks.length !== 1) {
    new import_obsidian.Notice("Cannot add missing internal link, separator not found but have >1 blocks.");
    return content;
  } else if (separatorList && separatorList.length !== blocks.length - 1) {
    new import_obsidian.Notice("Cannot add missing internal link, mismatch length between separator and linked blocks.");
    return content;
  }
  const linkedBlocks = blocks.map((block, idx) => {
    if (!block.match(internalLinkRegex) && block !== "") {
      const linkAnnotation = block.slice(-1) === "\n" ? "^" : "\n^";
      if (separatorList && idx < separatorList.length) {
        return block + linkAnnotation + generateRandomKey() + separatorList[idx];
      } else {
        return block + linkAnnotation + generateRandomKey();
      }
    }
    if (separatorList && idx < separatorList.length) {
      return block + separatorList[idx];
    } else {
      return block;
    }
  });
  return linkedBlocks.join("");
}
function removeUnsuitableCharacters(filename) {
  const unsuitableCharactersRegex = /[^a-zA-Z0-9_.\-\s/]/g;
  return filename.replace(unsuitableCharactersRegex, "");
}

// src/class/CardifySettingTabClass.ts
var import_obsidian2 = require("obsidian");
var CardifySettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian2.Setting(containerEl).setName("Set separator for cards").setDesc("Select the separator used to separate cards in one markdown file").addDropdown((dropDown) => {
      dropDown.addOption("empty line", "empty line");
      dropDown.addOption("---", "---");
      dropDown.setValue(this.plugin.settings.separatorName);
      dropDown.onChange(async (value) => {
        this.plugin.settings.separatorName = value;
        switch (value) {
          case "empty line":
            this.plugin.settings.separator = "\n{2,}";
            break;
          case "---":
            this.plugin.settings.separator = "\n+---\\s*(?:\n+|\n*?)";
            break;
        }
        await this.plugin.saveSettings();
      });
    });
  }
};

// src/main.ts
var DEFAULT_SETTINGS = {
  separatorName: "empty line",
  separator: "\n{2,}"
  // by default, card are separated by 2 or more new line symbols
};
var Cardify = class extends import_obsidian3.Plugin {
  async createNewFileContent(content, activeFilePath) {
    const rSeparator = new RegExp(this.settings.separator);
    const cardBlocks = content.split(rSeparator);
    const nonEmptyBlocks = cardBlocks.filter(
      (block) => block.trim().length > 0
    );
    return nonEmptyBlocks.map(
      (block) => {
        return parseCardBlock(block, activeFilePath);
      }
    );
  }
  async genCardsFromFile() {
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile === null) {
      new import_obsidian3.Notice("Cannot get active file.");
      return null;
    }
    if (activeFile.extension !== "md") {
      new import_obsidian3.Notice("Active file is not a markdown file.");
      return null;
    }
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    if (!activeView) {
      new import_obsidian3.Notice("Unable to get active view, place cursor on file content to get active view.");
      return null;
    }
    const editor = activeView.editor;
    const activeFileBaseName = activeFile.basename;
    const parentDir = activeFile.parent ? activeFile.parent.path : "";
    const parentFolder = parentDir === "/" ? "/" : parentDir + "/";
    const generatedFolder = parentFolder + activeFileBaseName + "-cardify-generated/";
    const fileContent = editor.getValue();
    const { frontMatter, content } = parseMDFile(fileContent);
    const frontMatterString = frontMatter ? frontMatter : "";
    const linkedContent = addMissingInternalLink(content, this.settings.separator);
    editor.setValue(frontMatterString + linkedContent);
    const newFileContent = await this.createNewFileContent(linkedContent, activeFile.path);
    if (!newFileContent || newFileContent.length === 0) {
      return new import_obsidian3.Notice("No new content");
    }
    if (!await this.app.vault.adapter.exists(generatedFolder)) {
      await this.app.vault.createFolder(generatedFolder);
    }
    let createdFiles = 0;
    const createdContent = newFileContent.map(async (lb, idx) => {
      const filename = lb.title === "" ? idx.toString() : idx.toString() + "-" + lb.title;
      const filepath = (0, import_obsidian3.normalizePath)(removeUnsuitableCharacters(generatedFolder + "/" + filename + ".md"));
      if (await this.app.vault.adapter.exists(filepath)) {
        new import_obsidian3.Notice(filepath + " already exists, skipped overwriting it.");
      } else {
        createdFiles++;
        return await this.app.vault.create(filepath, lb.link);
      }
    });
    await Promise.all(createdContent);
    createdFiles > 0 && new import_obsidian3.Notice(createdFiles + " new files stored in " + generatedFolder);
  }
  async onload() {
    await this.loadSettings();
    const ribbonIconEl = this.addRibbonIcon("copy-plus", "Cardify", async (evt) => {
      this.genCardsFromFile();
    });
    ribbonIconEl.addClass("cardify-ribbon-class");
    this.statusBarItemEl = this.addStatusBarItem();
    this.addCommand({
      id: "insert-internal-link",
      name: "Insert internal link",
      editorCallback: (editor, view) => {
        console.log(editor.getSelection());
        editor.replaceSelection("^" + generateRandomKey());
      }
    });
    this.addCommand({
      id: "generate-file-cards",
      name: "Generate cards for current file",
      icon: "copy-plus",
      editorCallback: (editor, view) => {
        this.genCardsFromFile();
      }
    });
    this.addSettingTab(new CardifySettingTab(this.app, this));
    this.registerEvent(this.app.workspace.on("editor-change", async () => {
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile === null) {
        new import_obsidian3.Notice("Cannot get active file.");
        return null;
      }
      if (activeFile.extension !== "md") {
        new import_obsidian3.Notice("Active file is not a markdown file.");
        return null;
      }
      const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
      if (!activeView) {
        new import_obsidian3.Notice("Cannot get active view of type MarkdownView.");
        return null;
      }
      const editor = activeView.editor;
      const fileContent = editor.getValue();
      const { content } = parseMDFile(fileContent);
      const gSeparator = new RegExp(this.settings.separator, "g");
      const blocks = content.split(gSeparator);
      const nonEmptyBlocks = blocks.filter(
        (block) => block.trim().length > 0
      );
      const statusBarText = nonEmptyBlocks.length.toString() + " cards";
      this.statusBarItemEl.setText(statusBarText);
    }));
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = DEFAULT_SETTINGS;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL2hlbHBlci50cyIsICJzcmMvY2xhc3MvQ2FyZGlmeVNldHRpbmdUYWJDbGFzcy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHtFZGl0b3IsIE1hcmtkb3duVmlldywgbm9ybWFsaXplUGF0aCwgTm90aWNlLCBQbHVnaW4sIFRGaWxlfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQge1xuXHRhZGRNaXNzaW5nSW50ZXJuYWxMaW5rLFxuXHRnZW5lcmF0ZVJhbmRvbUtleSxcblx0cGFyc2VDYXJkQmxvY2ssXG5cdHBhcnNlTURGaWxlLFxuXHRyZW1vdmVVbnN1aXRhYmxlQ2hhcmFjdGVyc1xufSBmcm9tIFwiLi9oZWxwZXJcIjtcbmltcG9ydCB7TGlua2VkQmxvY2t9IGZyb20gXCIuL3R5cGVcIjtcbmltcG9ydCBDYXJkaWZ5U2V0dGluZ1RhYiBmcm9tIFwiLi9jbGFzcy9DYXJkaWZ5U2V0dGluZ1RhYkNsYXNzXCI7XG5pbXBvcnQgQ2FyZGlmeVNldHRpbmdzIGZyb20gXCIuL2ludGVyZmFjZS9JQ2FyZGlmeVNldHRpbmdzXCI7XG5cbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IENhcmRpZnlTZXR0aW5ncyA9IHtcblx0c2VwYXJhdG9yTmFtZTogJ2VtcHR5IGxpbmUnLFxuXHRzZXBhcmF0b3I6ICdcXG57Mix9JywgLy8gYnkgZGVmYXVsdCwgY2FyZCBhcmUgc2VwYXJhdGVkIGJ5IDIgb3IgbW9yZSBuZXcgbGluZSBzeW1ib2xzXG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYXJkaWZ5IGV4dGVuZHMgUGx1Z2luIHtcblx0c2V0dGluZ3M6IENhcmRpZnlTZXR0aW5ncztcblx0c3RhdHVzQmFySXRlbUVsOiBIVE1MRWxlbWVudDtcblxuXHRhc3luYyBjcmVhdGVOZXdGaWxlQ29udGVudChjb250ZW50OiBzdHJpbmcsIGFjdGl2ZUZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PExpbmtlZEJsb2NrPnxudWxsPiB7XG5cdFx0Y29uc3QgclNlcGFyYXRvciA9IG5ldyBSZWdFeHAodGhpcy5zZXR0aW5ncy5zZXBhcmF0b3IpXG5cdFx0Y29uc3QgY2FyZEJsb2NrczogQXJyYXk8c3RyaW5nPiA9IGNvbnRlbnQuc3BsaXQoclNlcGFyYXRvcik7XG5cdFx0Y29uc3Qgbm9uRW1wdHlCbG9ja3M6IEFycmF5PHN0cmluZz4gPSBjYXJkQmxvY2tzLmZpbHRlcihcblx0XHRcdChibG9jazogc3RyaW5nKTogYm9vbGVhbiA9PiBibG9jay50cmltKCkubGVuZ3RoID4gMFxuXHRcdClcblx0XHRyZXR1cm4gbm9uRW1wdHlCbG9ja3MubWFwKFxuXHRcdFx0KGJsb2NrOiBzdHJpbmcpOiBMaW5rZWRCbG9jayA9PiB7XG5cdFx0XHRcdHJldHVybiBwYXJzZUNhcmRCbG9jayhibG9jaywgYWN0aXZlRmlsZVBhdGgpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHRhc3luYyBnZW5DYXJkc0Zyb21GaWxlKCkge1xuXHRcdC8vIENoZWNrIHRoYXQgdGhlIGFjdGl2ZSBmaWxlIGlzIGEgbWQgZmlsZVxuXHRcdGNvbnN0IGFjdGl2ZUZpbGU6IFRGaWxlIHwgbnVsbCA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKClcblx0XHRpZiAoYWN0aXZlRmlsZSA9PT0gbnVsbCApIHtcblx0XHRcdG5ldyBOb3RpY2UoJ0Nhbm5vdCBnZXQgYWN0aXZlIGZpbGUuJylcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXHRcdGlmIChhY3RpdmVGaWxlLmV4dGVuc2lvbiAhPT0gJ21kJykge1xuXHRcdFx0bmV3IE5vdGljZSgnQWN0aXZlIGZpbGUgaXMgbm90IGEgbWFya2Rvd24gZmlsZS4nKVxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cdFx0Y29uc3QgYWN0aXZlVmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG5cdFx0aWYgKCFhY3RpdmVWaWV3KSB7XG5cdFx0XHRuZXcgTm90aWNlKCdVbmFibGUgdG8gZ2V0IGFjdGl2ZSB2aWV3LCBwbGFjZSBjdXJzb3Igb24gZmlsZSBjb250ZW50IHRvIGdldCBhY3RpdmUgdmlldy4nKVxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cdFx0Y29uc3QgZWRpdG9yID0gYWN0aXZlVmlldy5lZGl0b3I7XG5cblx0XHRjb25zdCBhY3RpdmVGaWxlQmFzZU5hbWU6IHN0cmluZyA9IGFjdGl2ZUZpbGUuYmFzZW5hbWVcblx0XHRjb25zdCBwYXJlbnREaXI6c3RyaW5nID0gYWN0aXZlRmlsZS5wYXJlbnQ/IGFjdGl2ZUZpbGUucGFyZW50LnBhdGggOiAnJ1xuXG5cblx0XHQvLyBjcmVhdGUgZm9sZGVyIHRvIHN0b3JlIGdlbmVyYXRlZCBtZCBpZiBmb2xkZXIgZG9lcyBub3QgZXhpc3QgeWV0XG5cdFx0Y29uc3QgcGFyZW50Rm9sZGVyOiBzdHJpbmcgPSBwYXJlbnREaXI9PT0nLyc/ICcvJyA6IChwYXJlbnREaXIgKyAnLycpXG5cdFx0Y29uc3QgZ2VuZXJhdGVkRm9sZGVyOiBzdHJpbmcgPSBwYXJlbnRGb2xkZXIgKyBhY3RpdmVGaWxlQmFzZU5hbWUgKyAnLWNhcmRpZnktZ2VuZXJhdGVkLydcblxuXHRcdC8vIGV4dHJhY3QgZmlsZSBmcm9udG1hdHRlciBhbmQgY29udGVudCBmcm9tIGZpbGUgY29udGVudFxuXHRcdGNvbnN0IGZpbGVDb250ZW50OiBzdHJpbmcgPSBlZGl0b3IuZ2V0VmFsdWUoKTtcblx0XHRjb25zdCB7ZnJvbnRNYXR0ZXIsIGNvbnRlbnR9OiB7ZnJvbnRNYXR0ZXI6IHN0cmluZyB8IG51bGwsIGNvbnRlbnQ6IHN0cmluZ30gPSBwYXJzZU1ERmlsZShmaWxlQ29udGVudCk7XG5cblx0XHQvLyBlZGl0IGNvbnRlbnQgdG8gYWRkIG1pc3NpbmcgaW50ZXJuYWwgbGlua1xuXHRcdGNvbnN0IGZyb250TWF0dGVyU3RyaW5nOiBzdHJpbmcgPSBmcm9udE1hdHRlcj8gZnJvbnRNYXR0ZXIgOiAnJztcblx0XHRjb25zdCBsaW5rZWRDb250ZW50OiBzdHJpbmcgPSBhZGRNaXNzaW5nSW50ZXJuYWxMaW5rKGNvbnRlbnQsIHRoaXMuc2V0dGluZ3Muc2VwYXJhdG9yKVxuXG5cdFx0Ly8gYWRkIGludGVybmFsIGxpbmsgdG8gYmxvY2tzIGlmIGEgbGluayBpcyBub3QgZGV0ZWN0ZWQgZm9yIGEgYmxvY2sgKGxpbmsgaXMgaW4gdGhlIGZvcm0gb2YgXFxuXjxpZD4pXG5cdFx0ZWRpdG9yLnNldFZhbHVlKGZyb250TWF0dGVyU3RyaW5nICsgbGlua2VkQ29udGVudClcblxuXHRcdC8vIHBhcnNlIGZpbGUgY29udGVudCBmcm9tIGFjdGl2ZUZpbGUgaW50byBzZXBhcmF0ZSBtZCBmaWxlc1xuXHRcdGNvbnN0IG5ld0ZpbGVDb250ZW50ID0gYXdhaXQgdGhpcy5jcmVhdGVOZXdGaWxlQ29udGVudChsaW5rZWRDb250ZW50LCBhY3RpdmVGaWxlLnBhdGgpO1xuXHRcdGlmICghbmV3RmlsZUNvbnRlbnQgfHwgbmV3RmlsZUNvbnRlbnQubGVuZ3RoPT09MCkge3JldHVybiBuZXcgTm90aWNlKCdObyBuZXcgY29udGVudCcpO31cblxuXHRcdC8vIG1ha2Ugc3VyZSBmb2xkZXIgZXhpc3RzIHRvIHN0b3JlIHRoZSBnZW5lcmF0ZWQgbWQgZmlsZXMgc3RvcmluZyB0aGUgbGlua2VkIGNvbnRlbnRcblx0XHRpZiAoIWF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIuZXhpc3RzKGdlbmVyYXRlZEZvbGRlcikpIHtcblx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZUZvbGRlcihnZW5lcmF0ZWRGb2xkZXIpO1xuXHRcdH1cblxuXHRcdC8vIHdyaXRlIHBhcnNlZCBjb250ZW50IGludG8gbmV3IG1kIGZpbGVzXG5cdFx0bGV0IGNyZWF0ZWRGaWxlcyA9IDAgLy8gdG8ga2VlcCB0cmFjayBvZiBjcmVhdGVkIGZpbGVzXG5cdFx0Y29uc3QgY3JlYXRlZENvbnRlbnQgPSBuZXdGaWxlQ29udGVudC5tYXAoYXN5bmMgKGxiOiBMaW5rZWRCbG9jaywgaWR4OiBudW1iZXIpID0+IHtcblx0XHRcdGNvbnN0IGZpbGVuYW1lOiBzdHJpbmcgPSBsYi50aXRsZSA9PT0gJycgPyBpZHgudG9TdHJpbmcoKSA6IGlkeC50b1N0cmluZygpICsgJy0nICsgbGIudGl0bGVcblx0XHRcdGNvbnN0IGZpbGVwYXRoOiBzdHJpbmcgPSBub3JtYWxpemVQYXRoKHJlbW92ZVVuc3VpdGFibGVDaGFyYWN0ZXJzKGdlbmVyYXRlZEZvbGRlciArICcvJyArIGZpbGVuYW1lICsgJy5tZCcpKTtcblx0XHRcdGlmIChhd2FpdCB0aGlzLmFwcC52YXVsdC5hZGFwdGVyLmV4aXN0cyhmaWxlcGF0aCkpIHtcblx0XHRcdFx0bmV3IE5vdGljZShmaWxlcGF0aCArICcgYWxyZWFkeSBleGlzdHMsIHNraXBwZWQgb3ZlcndyaXRpbmcgaXQuJylcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNyZWF0ZWRGaWxlcysrXG5cdFx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUoZmlsZXBhdGgsIGxiLmxpbmspXG5cdFx0XHR9XG5cdFx0fSlcblx0XHRhd2FpdCBQcm9taXNlLmFsbChjcmVhdGVkQ29udGVudClcblx0XHRjcmVhdGVkRmlsZXMgPiAwICYmIG5ldyBOb3RpY2UoY3JlYXRlZEZpbGVzICsgJyBuZXcgZmlsZXMgc3RvcmVkIGluICcgKyBnZW5lcmF0ZWRGb2xkZXIpXG5cdH1cblx0XG5cdGFzeW5jIG9ubG9hZCgpIHtcblx0XHRhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG5cdFx0Ly8gVGhpcyBjcmVhdGVzIGFuIGljb24gaW4gdGhlIGxlZnQgcmliYm9uLlxuXHRcdGNvbnN0IHJpYmJvbkljb25FbCA9IHRoaXMuYWRkUmliYm9uSWNvbignY29weS1wbHVzJywgJ0NhcmRpZnknLCBhc3luYyAoZXZ0OiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHR0aGlzLmdlbkNhcmRzRnJvbUZpbGUoKVxuXHRcdH0pO1xuXHRcdHJpYmJvbkljb25FbC5hZGRDbGFzcygnY2FyZGlmeS1yaWJib24tY2xhc3MnKTtcblxuXHRcdC8vIFRoaXMgYWRkcyBhIHN0YXR1cyBiYXIgaXRlbSB0byB0aGUgYm90dG9tIG9mIHRoZSBhcHAuIERvZXMgbm90IHdvcmsgb24gbW9iaWxlIGFwcHMuXG5cdFx0dGhpcy5zdGF0dXNCYXJJdGVtRWwgPSB0aGlzLmFkZFN0YXR1c0Jhckl0ZW0oKTtcblxuXHRcdC8vIFRoaXMgYWRkcyBhbiBlZGl0b3IgY29tbWFuZCB0aGF0IGNhbiBwZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG9uIHRoZSBjdXJyZW50IGVkaXRvciBpbnN0YW5jZVxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2luc2VydC1pbnRlcm5hbC1saW5rJyxcblx0XHRcdG5hbWU6ICdJbnNlcnQgaW50ZXJuYWwgbGluaycsXG5cdFx0XHRlZGl0b3JDYWxsYmFjazogKGVkaXRvcjogRWRpdG9yLCB2aWV3OiBNYXJrZG93blZpZXcpID0+IHtcblx0XHRcdFx0Y29uc29sZS5sb2coZWRpdG9yLmdldFNlbGVjdGlvbigpKTtcblx0XHRcdFx0ZWRpdG9yLnJlcGxhY2VTZWxlY3Rpb24oJ14nICsgZ2VuZXJhdGVSYW5kb21LZXkoKSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdnZW5lcmF0ZS1maWxlLWNhcmRzJyxcblx0XHRcdG5hbWU6ICdHZW5lcmF0ZSBjYXJkcyBmb3IgY3VycmVudCBmaWxlJyxcblx0XHRcdGljb246ICdjb3B5LXBsdXMnLFxuXHRcdFx0ZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3I6IEVkaXRvciwgdmlldzogTWFya2Rvd25WaWV3KSA9PiB7XG5cdFx0XHRcdHRoaXMuZ2VuQ2FyZHNGcm9tRmlsZSgpXG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdC8vIFRoaXMgYWRkcyBhIHNldHRpbmdzIHRhYiBzbyB0aGUgdXNlciBjYW4gY29uZmlndXJlIHZhcmlvdXMgYXNwZWN0cyBvZiB0aGUgcGx1Z2luXG5cdFx0dGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBDYXJkaWZ5U2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuXG5cblx0XHQvLyBUaGlzIGFkZHMgYSBmdW5jdGlvbiB0aGF0IHVwZGF0ZSB0aGUgc3RhdHVzIGJhciBldmVyeXRpbWUgdGhlIGVkaXRvciBjaGFuZ2VzXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KHRoaXMuYXBwLndvcmtzcGFjZS5vbignZWRpdG9yLWNoYW5nZScsIGFzeW5jICgpID0+IHtcblx0XHRcdGNvbnN0IGFjdGl2ZUZpbGU6IFRGaWxlIHwgbnVsbCA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKClcblx0XHRcdGlmIChhY3RpdmVGaWxlID09PSBudWxsICkge1xuXHRcdFx0XHRuZXcgTm90aWNlKCdDYW5ub3QgZ2V0IGFjdGl2ZSBmaWxlLicpXG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR9XG5cdFx0XHRpZiAoYWN0aXZlRmlsZS5leHRlbnNpb24gIT09ICdtZCcpIHtcblx0XHRcdFx0bmV3IE5vdGljZSgnQWN0aXZlIGZpbGUgaXMgbm90IGEgbWFya2Rvd24gZmlsZS4nKVxuXHRcdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgYWN0aXZlVmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG5cdFx0XHRpZiAoIWFjdGl2ZVZpZXcpIHtcblx0XHRcdFx0bmV3IE5vdGljZSgnQ2Fubm90IGdldCBhY3RpdmUgdmlldyBvZiB0eXBlIE1hcmtkb3duVmlldy4nKVxuXHRcdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgZWRpdG9yID0gYWN0aXZlVmlldy5lZGl0b3I7XG5cdFx0XHRjb25zdCBmaWxlQ29udGVudDogc3RyaW5nID0gZWRpdG9yLmdldFZhbHVlKCk7XG5cdFx0XHRjb25zdCB7Y29udGVudH06IHtmcm9udE1hdHRlcjogc3RyaW5nIHwgbnVsbCwgY29udGVudDogc3RyaW5nfSA9IHBhcnNlTURGaWxlKGZpbGVDb250ZW50KTtcblx0XHRcdGNvbnN0IGdTZXBhcmF0b3IgPSBuZXcgUmVnRXhwKHRoaXMuc2V0dGluZ3Muc2VwYXJhdG9yLCAnZycpO1xuXHRcdFx0Y29uc3QgYmxvY2tzOiBBcnJheTxzdHJpbmc+ID0gY29udGVudC5zcGxpdChnU2VwYXJhdG9yKTtcblx0XHRcdGNvbnN0IG5vbkVtcHR5QmxvY2tzOiBBcnJheTxzdHJpbmc+ID0gYmxvY2tzLmZpbHRlcihcblx0XHRcdFx0KGJsb2NrOiBzdHJpbmcpOiBib29sZWFuID0+IGJsb2NrLnRyaW0oKS5sZW5ndGggPiAwXG5cdFx0XHQpXG5cdFx0XHRjb25zdCBzdGF0dXNCYXJUZXh0ID0gbm9uRW1wdHlCbG9ja3MubGVuZ3RoLnRvU3RyaW5nKCkgKyAnIGNhcmRzJztcblx0XHRcdHRoaXMuc3RhdHVzQmFySXRlbUVsLnNldFRleHQoc3RhdHVzQmFyVGV4dCk7XG5cdFx0fSkpO1xuXHR9XG5cblx0b251bmxvYWQoKSB7fVxuXG5cdGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcblx0XHR0aGlzLnNldHRpbmdzID0gREVGQVVMVF9TRVRUSU5HU1xuXHRcdHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuXHR9XG5cblx0YXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuXHRcdGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG5cdH1cbn1cbiIsICJpbXBvcnQge0NvbnRlbnQsIExpbmtlZEJsb2NrfSBmcm9tIFwiLi90eXBlXCI7XG5pbXBvcnQge05vdGljZX0gZnJvbSBcIm9ic2lkaWFuXCI7XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIG1hcmtkb3duIGNvbnRlbnQgdG8gZXh0cmFjdCB0aGUgZnJvbnRtYXR0ZXIgYW5kIHRoZSBjb250ZW50XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG1kQ29udGVudCAtIFRoZSBtYXJrZG93biBjb250ZW50XG4gKiBAcmV0dXJuIHtDb250ZW50fSBBIENvbnRlbnQgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGZyb250TWF0dGVyIGlmIGV4aXN0cyAob3RoZXJ3aXNlIHRoaXMgZmllbGQgaXMgbnVsbCkgYW5kIHRoZSBjb250ZW50XG4gKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1ERmlsZShtZENvbnRlbnQ6IHN0cmluZyk6IENvbnRlbnQge1xuXHRjb25zdCBmcm9udE1hdHRlciA9IG1kQ29udGVudC5tYXRjaCgvXigtLS1cXHMqXFxuW1xcc1xcU10qP1xcbj8tLS0pLyk7XG5cdGNvbnN0IGNvbnRlbnQ6IHN0cmluZyA9IG1kQ29udGVudC5yZXBsYWNlKC9eKC0tLVxccypcXG5bXFxzXFxTXSo/XFxuPy0tLSkvLCAnJyk7XG5cdHJldHVybiB7ZnJvbnRNYXR0ZXI6IGZyb250TWF0dGVyPyBmcm9udE1hdHRlclsxXSA6IG51bGwsIGNvbnRlbnQ6IGNvbnRlbnR9O1xufVxuXG5cbi8qKlxuICogRXh0cmFjdHMgdGhlIGNvbW1lbnQgZnJvbSB0aGUgZ2l2ZW4gY29udGVudC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCAtIFRoZSBjb250ZW50IGZyb20gd2hpY2ggdG8gZXh0cmFjdCB0aGUgY29tbWVudC5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGV4dHJhY3RlZCBjb21tZW50LCBvciBhbiBlbXB0eSBzdHJpbmcgaWYgbm8gY29tbWVudCBpcyBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdENvbW1lbnQoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcblx0Y29uc3QgbWF0Y2g6IFJlZ0V4cE1hdGNoQXJyYXkgfCBudWxsID0gY29udGVudC5tYXRjaCgnKD88PVxcbj4lJUNPTU1FTlQlJVxcbj4pKC4qPykoPz1cXG4pJylcblx0cmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiAnJztcbn1cblxuLyoqXG4gKiBFeHRyYWN0cyB0aGUgZmlyc3QgaW50ZXJuYWwgbGluayBmcm9tIHRoZSBnaXZlbiBjb250ZW50LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50IC0gVGhlIGNvbnRlbnQgdG8gZXh0cmFjdCB0aGUgbGluayBmcm9tLlxuICogQHJldHVybiB7c3RyaW5nIHwgbnVsbH0gLSBUaGUgZXh0cmFjdGVkIGxpbmsgb3IgbnVsbCBpZiBubyBsaW5rIGlzIGZvdW5kLlxuICovXG5mdW5jdGlvbiBleHRyYWN0SW50ZXJuYWxMaW5rKGNvbnRlbnQ6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuXHRjb25zdCBtYXRjaDogUmVnRXhwTWF0Y2hBcnJheSB8IG51bGwgPSBjb250ZW50Lm1hdGNoKCcoPzw9XFxuXFxcXF4pKC4qPykoPz1cXG58JCknKVxuXHRyZXR1cm4gbWF0Y2g/IG1hdGNoWzFdIDogbnVsbDtcbn1cblxuLyoqXG4gKiBFeHRyYWN0cyB0aGUgYmFzZW5hbWUgZnJvbSBhIGZpbGUgcGF0aC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZVBhdGggLSBUaGUgZnVsbCBwYXRoIHRvIHRoZSBmaWxlLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgYmFzZW5hbWUgb2YgdGhlIGZpbGUuXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RQYXRoQmFzZW5hbWUoZmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gVGhpcyByZWdleCBtYXRjaGVzIHRoZSBsYXN0IHBhcnQgb2YgdGhlIHBhdGggYWZ0ZXIgdGhlIGxhc3Qgc2xhc2gsIGFjY291bnRpbmcgZm9yIGJvdGggZm9yd2FyZCBhbmQgYmFja3dhcmQgc2xhc2hlcy5cbiAgICBjb25zdCBtYXRjaCA9IGZpbGVQYXRoLm1hdGNoKC9bXlxcXFwvXSskLyk7XG4gICAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMF0gOiAnJztcbn1cblxuLyoqXG4gKiBQYXJzZXMgYSBjYXJkIGJsb2NrIGFuZCByZXR1cm5zIGEgTGlua2VkQmxvY2sgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBjYXJkQmxvY2sgLSBUaGUgY2FyZCBibG9jayB0byBwYXJzZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhY3RpdmVGaWxlUGF0aCAtIFRoZSBwYXRoIHRvIHRoZSBhY3RpdmUgZmlsZSBmcm9tIHdoaWNoIHRoZSBjYXJkQmxvY2sgaXMgZXh0cmFjdGVkLlxuICogQHJldHVybiB7TGlua2VkQmxvY2t9IFRoZSBwYXJzZWQgTGlua2VkQmxvY2sgb2JqZWN0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDYXJkQmxvY2soY2FyZEJsb2NrOiBzdHJpbmcsIGFjdGl2ZUZpbGVQYXRoOiBzdHJpbmcpOiBMaW5rZWRCbG9jayB7XG5cdHJldHVybiB7XG5cdFx0dGl0bGU6IGV4dHJhY3RDb21tZW50KGNhcmRCbG9jayksXG5cdFx0bGluazogJyFbWycgKyBleHRyYWN0UGF0aEJhc2VuYW1lKGFjdGl2ZUZpbGVQYXRoKSArICcjXicgKyBleHRyYWN0SW50ZXJuYWxMaW5rKGNhcmRCbG9jaykgKyAnXV0nXG5cdH07XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcHNldWRvcmFuZG9tIGtleSBvZiB0aGUgc3BlY2lmaWVkIGxlbmd0aC5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIC0gVGhlIGRlc2lyZWQgbGVuZ3RoIG9mIHRoZSBrZXkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgZ2VuZXJhdGVkIHBzZXVkb3JhbmRvbSBrZXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVJhbmRvbUtleShsZW5ndGggPSAxMCk6IHN0cmluZyB7XG5cdHJldHVybiBBcnJheS5mcm9tKEFycmF5KGxlbmd0aCksICgpID0+IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLmNoYXJBdCgyKSkuam9pbignJyk7XG59XG5cbi8qKlxuICogU2VwYXJhdGUgZ2l2ZW4gY29udGVudCBpbnRvIGJsb2NrcywgYWRkIGludGVybmFsIGxpbmsgaWYgc2VwYXJhdGVkIGJsb2NrcyBkb2VzIG5vdCBjb250YWluIG9uZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gY29udGVudCAtIFRoZSBjb250ZW50IHRvIHByb2Nlc3MuXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VwYXJhdG9yIC0gVGhlIHNlcGFyYXRvciB1c2VkIHRvIHNwbGl0IHRoZSBjb250ZW50LlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgcHJvY2Vzc2VkIGNvbnRlbnQgd2l0aCBtaXNzaW5nIGludGVybmFsIGxpbmtzIGFkZGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkTWlzc2luZ0ludGVybmFsTGluayhjb250ZW50OiBzdHJpbmcsIHNlcGFyYXRvcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBnU2VwYXJhdG9yID0gbmV3IFJlZ0V4cChzZXBhcmF0b3IsICdnJyk7XG4gICAgY29uc3QgYmxvY2tzOiBBcnJheTxzdHJpbmc+ID0gY29udGVudC5zcGxpdChnU2VwYXJhdG9yKTtcbiAgICBjb25zdCBpbnRlcm5hbExpbmtSZWdleCA9ICcoPzw9XFxuXFxcXF4pKC4qPykoPz1cXG4qPyQpJ1xuICAgIC8vIHNldHRpbmcgdGhlIGcgZmxhZyBmb3IgdGhlIHNlcGFyYXRvciBzbyBtYXRjaCByZXR1cm5zIGFsbCBtYXRjaGVzXG5cdGNvbnN0IHNlcGFyYXRvckxpc3Q6IFJlZ0V4cE1hdGNoQXJyYXkgfCBudWxsID0gY29udGVudC5tYXRjaChnU2VwYXJhdG9yKTtcblx0Ly8gY2hlY2sgdGhhdCB0aGUgc2VwYXJhdG9yTGlzdCBpcyBvbmUgZWxlbWVudCBsZXNzIHRoYW4gdGhlIGJsb2NrcyBsaXN0XG5cdGlmICghc2VwYXJhdG9yTGlzdCAmJiBibG9ja3MubGVuZ3RoICE9PSAxKSB7XG5cdFx0bmV3IE5vdGljZSgnQ2Fubm90IGFkZCBtaXNzaW5nIGludGVybmFsIGxpbmssIHNlcGFyYXRvciBub3QgZm91bmQgYnV0IGhhdmUgPjEgYmxvY2tzLicpXG5cdFx0cmV0dXJuIGNvbnRlbnRcblx0fSBlbHNlIGlmIChzZXBhcmF0b3JMaXN0ICYmIHNlcGFyYXRvckxpc3QubGVuZ3RoICE9PSBibG9ja3MubGVuZ3RoIC0gMSkge1xuXHRcdG5ldyBOb3RpY2UoJ0Nhbm5vdCBhZGQgbWlzc2luZyBpbnRlcm5hbCBsaW5rLCBtaXNtYXRjaCBsZW5ndGggYmV0d2VlbiBzZXBhcmF0b3IgYW5kIGxpbmtlZCBibG9ja3MuJylcblx0XHRyZXR1cm4gY29udGVudFxuXHR9XG5cdC8vIGFkZCBtaXNzaW5nIGludGVybmFsIGxpbmsgZm9yIGVhY2ggYmxvY2tzXG5cdGNvbnN0IGxpbmtlZEJsb2NrczogQXJyYXk8c3RyaW5nPiA9IGJsb2Nrcy5tYXAoKGJsb2NrOiBzdHJpbmcsIGlkeDogbnVtYmVyKSA9PiB7XG5cdFx0aWYgKCFibG9jay5tYXRjaChpbnRlcm5hbExpbmtSZWdleCkgJiYgYmxvY2sgIT09ICcnKSB7XG5cdFx0XHRjb25zdCBsaW5rQW5ub3RhdGlvbjogc3RyaW5nID0gYmxvY2suc2xpY2UoLTEpID09PSAnXFxuJyA/ICdeJyA6ICdcXG5eJ1xuXHRcdFx0aWYgKHNlcGFyYXRvckxpc3QgJiYgaWR4IDwgc2VwYXJhdG9yTGlzdC5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIGJsb2NrICsgbGlua0Fubm90YXRpb24gKyBnZW5lcmF0ZVJhbmRvbUtleSgpICsgc2VwYXJhdG9yTGlzdFtpZHhdXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gYmxvY2sgKyBsaW5rQW5ub3RhdGlvbiArIGdlbmVyYXRlUmFuZG9tS2V5KClcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHNlcGFyYXRvckxpc3QgJiYgaWR4IDwgc2VwYXJhdG9yTGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBibG9jayArIHNlcGFyYXRvckxpc3RbaWR4XVxuICAgICAgICB9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGJsb2NrXG5cdFx0fVxuXHR9KVxuXHRyZXR1cm4gbGlua2VkQmxvY2tzLmpvaW4oJycpO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgYW55IGNoYXJhY3RlcnMgbm90IHN1aXRhYmxlIGZvciBmaWxlbmFtZXMgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZSAtIFRoZSBzdHJpbmcgdG8gcmVtb3ZlIHVuc3VpdGFibGUgY2hhcmFjdGVycyBmcm9tLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgZmlsZW5hbWUgd2l0aCB1bnN1aXRhYmxlIGNoYXJhY3RlcnMgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVVuc3VpdGFibGVDaGFyYWN0ZXJzKGZpbGVuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRjb25zdCB1bnN1aXRhYmxlQ2hhcmFjdGVyc1JlZ2V4ID0gL1teYS16QS1aMC05Xy5cXC1cXHMvXS9nO1xuXHRyZXR1cm4gZmlsZW5hbWUucmVwbGFjZSh1bnN1aXRhYmxlQ2hhcmFjdGVyc1JlZ2V4LCAnJyk7XG59XG4iLCAiaW1wb3J0IHtBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmd9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IENhcmRpZnkgZnJvbSBcIi4uL21haW5cIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FyZGlmeVNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcblx0cGx1Z2luOiBDYXJkaWZ5O1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IENhcmRpZnkpIHtcblx0XHRzdXBlcihhcHAsIHBsdWdpbik7XG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XG5cdH1cblxuXHRkaXNwbGF5KCk6IHZvaWQge1xuXHRcdGNvbnN0IHtjb250YWluZXJFbH0gPSB0aGlzO1xuXG5cdFx0Y29udGFpbmVyRWwuZW1wdHkoKTtcblxuXHRcdG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuXHRcdFx0LnNldE5hbWUoJ1NldCBzZXBhcmF0b3IgZm9yIGNhcmRzJylcblx0XHRcdC5zZXREZXNjKCdTZWxlY3QgdGhlIHNlcGFyYXRvciB1c2VkIHRvIHNlcGFyYXRlIGNhcmRzIGluIG9uZSBtYXJrZG93biBmaWxlJylcblx0XHRcdC5hZGREcm9wZG93bihkcm9wRG93biA9PiB7XG5cdFx0XHRcdGRyb3BEb3duLmFkZE9wdGlvbignZW1wdHkgbGluZScsICdlbXB0eSBsaW5lJyk7XG5cdFx0XHRcdGRyb3BEb3duLmFkZE9wdGlvbignLS0tJywgJy0tLScpO1xuXHRcdFx0XHRkcm9wRG93bi5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5zZXBhcmF0b3JOYW1lKVxuXHRcdFx0XHRkcm9wRG93bi5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcblx0XHRcdFx0XHR0aGlzLnBsdWdpbi5zZXR0aW5ncy5zZXBhcmF0b3JOYW1lID0gdmFsdWU7XG5cdFx0XHRcdFx0c3dpdGNoICh2YWx1ZSkge1xuXHRcdFx0XHRcdFx0Y2FzZSAnZW1wdHkgbGluZSc6XG5cdFx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnNlcGFyYXRvciA9ICdcXG57Mix9J1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgJy0tLSc6XG5cdFx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLnNldHRpbmdzLnNlcGFyYXRvciA9ICdcXG4rLS0tXFxcXHMqKD86XFxuK3xcXG4qPyknXG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcblx0XHRcdFx0fSlcblx0XHRcdH0pXG5cdH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFBQSxtQkFBeUU7OztBQ0N6RSxzQkFBcUI7QUFTZCxTQUFTLFlBQVksV0FBNEI7QUFDdkQsUUFBTSxjQUFjLFVBQVUsTUFBTSwyQkFBMkI7QUFDL0QsUUFBTSxVQUFrQixVQUFVLFFBQVEsNkJBQTZCLEVBQUU7QUFDekUsU0FBTyxFQUFDLGFBQWEsY0FBYSxZQUFZLENBQUMsSUFBSSxNQUFNLFFBQWdCO0FBQzFFO0FBU0EsU0FBUyxlQUFlLFNBQXlCO0FBQ2hELFFBQU0sUUFBaUMsUUFBUSxNQUFNLG1DQUFtQztBQUN4RixTQUFPLFFBQVEsTUFBTSxDQUFDLElBQUk7QUFDM0I7QUFRQSxTQUFTLG9CQUFvQixTQUFnQztBQUM1RCxRQUFNLFFBQWlDLFFBQVEsTUFBTSx5QkFBeUI7QUFDOUUsU0FBTyxRQUFPLE1BQU0sQ0FBQyxJQUFJO0FBQzFCO0FBUUEsU0FBUyxvQkFBb0IsVUFBMEI7QUFFbkQsUUFBTSxRQUFRLFNBQVMsTUFBTSxVQUFVO0FBQ3ZDLFNBQU8sUUFBUSxNQUFNLENBQUMsSUFBSTtBQUM5QjtBQVNPLFNBQVMsZUFBZSxXQUFtQixnQkFBcUM7QUFDdEYsU0FBTztBQUFBLElBQ04sT0FBTyxlQUFlLFNBQVM7QUFBQSxJQUMvQixNQUFNLFFBQVEsb0JBQW9CLGNBQWMsSUFBSSxPQUFPLG9CQUFvQixTQUFTLElBQUk7QUFBQSxFQUM3RjtBQUNEO0FBUU8sU0FBUyxrQkFBa0IsU0FBUyxJQUFZO0FBQ3RELFNBQU8sTUFBTSxLQUFLLE1BQU0sTUFBTSxHQUFHLE1BQU0sS0FBSyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUU7QUFDckY7QUFTTyxTQUFTLHVCQUF1QixTQUFpQixXQUEyQjtBQUMvRSxRQUFNLGFBQWEsSUFBSSxPQUFPLFdBQVcsR0FBRztBQUM1QyxRQUFNLFNBQXdCLFFBQVEsTUFBTSxVQUFVO0FBQ3RELFFBQU0sb0JBQW9CO0FBRTdCLFFBQU0sZ0JBQXlDLFFBQVEsTUFBTSxVQUFVO0FBRXZFLE1BQUksQ0FBQyxpQkFBaUIsT0FBTyxXQUFXLEdBQUc7QUFDMUMsUUFBSSx1QkFBTywyRUFBMkU7QUFDdEYsV0FBTztBQUFBLEVBQ1IsV0FBVyxpQkFBaUIsY0FBYyxXQUFXLE9BQU8sU0FBUyxHQUFHO0FBQ3ZFLFFBQUksdUJBQU8sd0ZBQXdGO0FBQ25HLFdBQU87QUFBQSxFQUNSO0FBRUEsUUFBTSxlQUE4QixPQUFPLElBQUksQ0FBQyxPQUFlLFFBQWdCO0FBQzlFLFFBQUksQ0FBQyxNQUFNLE1BQU0saUJBQWlCLEtBQUssVUFBVSxJQUFJO0FBQ3BELFlBQU0saUJBQXlCLE1BQU0sTUFBTSxFQUFFLE1BQU0sT0FBTyxNQUFNO0FBQ2hFLFVBQUksaUJBQWlCLE1BQU0sY0FBYyxRQUFRO0FBQ2hELGVBQU8sUUFBUSxpQkFBaUIsa0JBQWtCLElBQUksY0FBYyxHQUFHO0FBQUEsTUFDeEUsT0FBTztBQUNOLGVBQU8sUUFBUSxpQkFBaUIsa0JBQWtCO0FBQUEsTUFDbkQ7QUFBQSxJQUNEO0FBQ0EsUUFBSSxpQkFBaUIsTUFBTSxjQUFjLFFBQVE7QUFDdkMsYUFBTyxRQUFRLGNBQWMsR0FBRztBQUFBLElBQ3BDLE9BQU87QUFDWixhQUFPO0FBQUEsSUFDUjtBQUFBLEVBQ0QsQ0FBQztBQUNELFNBQU8sYUFBYSxLQUFLLEVBQUU7QUFDNUI7QUFRTyxTQUFTLDJCQUEyQixVQUEwQjtBQUNwRSxRQUFNLDRCQUE0QjtBQUNsQyxTQUFPLFNBQVMsUUFBUSwyQkFBMkIsRUFBRTtBQUN0RDs7O0FDNUhBLElBQUFDLG1CQUE2QztBQUc3QyxJQUFxQixvQkFBckIsY0FBK0Msa0NBQWlCO0FBQUEsRUFHL0QsWUFBWSxLQUFVLFFBQWlCO0FBQ3RDLFVBQU0sS0FBSyxNQUFNO0FBQ2pCLFNBQUssU0FBUztBQUFBLEVBQ2Y7QUFBQSxFQUVBLFVBQWdCO0FBQ2YsVUFBTSxFQUFDLFlBQVcsSUFBSTtBQUV0QixnQkFBWSxNQUFNO0FBRWxCLFFBQUkseUJBQVEsV0FBVyxFQUNyQixRQUFRLHlCQUF5QixFQUNqQyxRQUFRLGtFQUFrRSxFQUMxRSxZQUFZLGNBQVk7QUFDeEIsZUFBUyxVQUFVLGNBQWMsWUFBWTtBQUM3QyxlQUFTLFVBQVUsT0FBTyxLQUFLO0FBQy9CLGVBQVMsU0FBUyxLQUFLLE9BQU8sU0FBUyxhQUFhO0FBQ3BELGVBQVMsU0FBUyxPQUFPLFVBQVU7QUFDbEMsYUFBSyxPQUFPLFNBQVMsZ0JBQWdCO0FBQ3JDLGdCQUFRLE9BQU87QUFBQSxVQUNkLEtBQUs7QUFDSixpQkFBSyxPQUFPLFNBQVMsWUFBWTtBQUNqQztBQUFBLFVBQ0QsS0FBSztBQUNKLGlCQUFLLE9BQU8sU0FBUyxZQUFZO0FBQ2pDO0FBQUEsUUFDRjtBQUNBLGNBQU0sS0FBSyxPQUFPLGFBQWE7QUFBQSxNQUNoQyxDQUFDO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUNEOzs7QUZ6QkEsSUFBTSxtQkFBb0M7QUFBQSxFQUN6QyxlQUFlO0FBQUEsRUFDZixXQUFXO0FBQUE7QUFDWjtBQUNBLElBQXFCLFVBQXJCLGNBQXFDLHdCQUFPO0FBQUEsRUFJM0MsTUFBTSxxQkFBcUIsU0FBaUIsZ0JBQTBEO0FBQ3JHLFVBQU0sYUFBYSxJQUFJLE9BQU8sS0FBSyxTQUFTLFNBQVM7QUFDckQsVUFBTSxhQUE0QixRQUFRLE1BQU0sVUFBVTtBQUMxRCxVQUFNLGlCQUFnQyxXQUFXO0FBQUEsTUFDaEQsQ0FBQyxVQUEyQixNQUFNLEtBQUssRUFBRSxTQUFTO0FBQUEsSUFDbkQ7QUFDQSxXQUFPLGVBQWU7QUFBQSxNQUNyQixDQUFDLFVBQStCO0FBQy9CLGVBQU8sZUFBZSxPQUFPLGNBQWM7QUFBQSxNQUM1QztBQUFBLElBQUM7QUFBQSxFQUNIO0FBQUEsRUFFQSxNQUFNLG1CQUFtQjtBQUV4QixVQUFNLGFBQTJCLEtBQUssSUFBSSxVQUFVLGNBQWM7QUFDbEUsUUFBSSxlQUFlLE1BQU87QUFDekIsVUFBSSx3QkFBTyx5QkFBeUI7QUFDcEMsYUFBTztBQUFBLElBQ1I7QUFDQSxRQUFJLFdBQVcsY0FBYyxNQUFNO0FBQ2xDLFVBQUksd0JBQU8scUNBQXFDO0FBQ2hELGFBQU87QUFBQSxJQUNSO0FBQ0EsVUFBTSxhQUFhLEtBQUssSUFBSSxVQUFVLG9CQUFvQiw2QkFBWTtBQUN0RSxRQUFJLENBQUMsWUFBWTtBQUNoQixVQUFJLHdCQUFPLDZFQUE2RTtBQUN4RixhQUFPO0FBQUEsSUFDUjtBQUNBLFVBQU0sU0FBUyxXQUFXO0FBRTFCLFVBQU0scUJBQTZCLFdBQVc7QUFDOUMsVUFBTSxZQUFtQixXQUFXLFNBQVEsV0FBVyxPQUFPLE9BQU87QUFJckUsVUFBTSxlQUF1QixjQUFZLE1BQUssTUFBTyxZQUFZO0FBQ2pFLFVBQU0sa0JBQTBCLGVBQWUscUJBQXFCO0FBR3BFLFVBQU0sY0FBc0IsT0FBTyxTQUFTO0FBQzVDLFVBQU0sRUFBQyxhQUFhLFFBQU8sSUFBbUQsWUFBWSxXQUFXO0FBR3JHLFVBQU0sb0JBQTRCLGNBQWEsY0FBYztBQUM3RCxVQUFNLGdCQUF3Qix1QkFBdUIsU0FBUyxLQUFLLFNBQVMsU0FBUztBQUdyRixXQUFPLFNBQVMsb0JBQW9CLGFBQWE7QUFHakQsVUFBTSxpQkFBaUIsTUFBTSxLQUFLLHFCQUFxQixlQUFlLFdBQVcsSUFBSTtBQUNyRixRQUFJLENBQUMsa0JBQWtCLGVBQWUsV0FBUyxHQUFHO0FBQUMsYUFBTyxJQUFJLHdCQUFPLGdCQUFnQjtBQUFBLElBQUU7QUFHdkYsUUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLE1BQU0sUUFBUSxPQUFPLGVBQWUsR0FBRztBQUMxRCxZQUFNLEtBQUssSUFBSSxNQUFNLGFBQWEsZUFBZTtBQUFBLElBQ2xEO0FBR0EsUUFBSSxlQUFlO0FBQ25CLFVBQU0saUJBQWlCLGVBQWUsSUFBSSxPQUFPLElBQWlCLFFBQWdCO0FBQ2pGLFlBQU0sV0FBbUIsR0FBRyxVQUFVLEtBQUssSUFBSSxTQUFTLElBQUksSUFBSSxTQUFTLElBQUksTUFBTSxHQUFHO0FBQ3RGLFlBQU0sZUFBbUIsZ0NBQWMsMkJBQTJCLGtCQUFrQixNQUFNLFdBQVcsS0FBSyxDQUFDO0FBQzNHLFVBQUksTUFBTSxLQUFLLElBQUksTUFBTSxRQUFRLE9BQU8sUUFBUSxHQUFHO0FBQ2xELFlBQUksd0JBQU8sV0FBVywwQ0FBMEM7QUFBQSxNQUNqRSxPQUFPO0FBQ047QUFDQSxlQUFPLE1BQU0sS0FBSyxJQUFJLE1BQU0sT0FBTyxVQUFVLEdBQUcsSUFBSTtBQUFBLE1BQ3JEO0FBQUEsSUFDRCxDQUFDO0FBQ0QsVUFBTSxRQUFRLElBQUksY0FBYztBQUNoQyxtQkFBZSxLQUFLLElBQUksd0JBQU8sZUFBZSwwQkFBMEIsZUFBZTtBQUFBLEVBQ3hGO0FBQUEsRUFFQSxNQUFNLFNBQVM7QUFDZCxVQUFNLEtBQUssYUFBYTtBQUd4QixVQUFNLGVBQWUsS0FBSyxjQUFjLGFBQWEsV0FBVyxPQUFPLFFBQW9CO0FBQzFGLFdBQUssaUJBQWlCO0FBQUEsSUFDdkIsQ0FBQztBQUNELGlCQUFhLFNBQVMsc0JBQXNCO0FBRzVDLFNBQUssa0JBQWtCLEtBQUssaUJBQWlCO0FBRzdDLFNBQUssV0FBVztBQUFBLE1BQ2YsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLENBQUMsUUFBZ0IsU0FBdUI7QUFDdkQsZ0JBQVEsSUFBSSxPQUFPLGFBQWEsQ0FBQztBQUNqQyxlQUFPLGlCQUFpQixNQUFNLGtCQUFrQixDQUFDO0FBQUEsTUFDbEQ7QUFBQSxJQUNELENBQUM7QUFFRCxTQUFLLFdBQVc7QUFBQSxNQUNmLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLGdCQUFnQixDQUFDLFFBQWdCLFNBQXVCO0FBQ3ZELGFBQUssaUJBQWlCO0FBQUEsTUFDdkI7QUFBQSxJQUNELENBQUM7QUFHRCxTQUFLLGNBQWMsSUFBSSxrQkFBa0IsS0FBSyxLQUFLLElBQUksQ0FBQztBQUl4RCxTQUFLLGNBQWMsS0FBSyxJQUFJLFVBQVUsR0FBRyxpQkFBaUIsWUFBWTtBQUNyRSxZQUFNLGFBQTJCLEtBQUssSUFBSSxVQUFVLGNBQWM7QUFDbEUsVUFBSSxlQUFlLE1BQU87QUFDekIsWUFBSSx3QkFBTyx5QkFBeUI7QUFDcEMsZUFBTztBQUFBLE1BQ1I7QUFDQSxVQUFJLFdBQVcsY0FBYyxNQUFNO0FBQ2xDLFlBQUksd0JBQU8scUNBQXFDO0FBQ2hELGVBQU87QUFBQSxNQUNSO0FBQ0EsWUFBTSxhQUFhLEtBQUssSUFBSSxVQUFVLG9CQUFvQiw2QkFBWTtBQUN0RSxVQUFJLENBQUMsWUFBWTtBQUNoQixZQUFJLHdCQUFPLDhDQUE4QztBQUN6RCxlQUFPO0FBQUEsTUFDUjtBQUNBLFlBQU0sU0FBUyxXQUFXO0FBQzFCLFlBQU0sY0FBc0IsT0FBTyxTQUFTO0FBQzVDLFlBQU0sRUFBQyxRQUFPLElBQW1ELFlBQVksV0FBVztBQUN4RixZQUFNLGFBQWEsSUFBSSxPQUFPLEtBQUssU0FBUyxXQUFXLEdBQUc7QUFDMUQsWUFBTSxTQUF3QixRQUFRLE1BQU0sVUFBVTtBQUN0RCxZQUFNLGlCQUFnQyxPQUFPO0FBQUEsUUFDNUMsQ0FBQyxVQUEyQixNQUFNLEtBQUssRUFBRSxTQUFTO0FBQUEsTUFDbkQ7QUFDQSxZQUFNLGdCQUFnQixlQUFlLE9BQU8sU0FBUyxJQUFJO0FBQ3pELFdBQUssZ0JBQWdCLFFBQVEsYUFBYTtBQUFBLElBQzNDLENBQUMsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUVBLFdBQVc7QUFBQSxFQUFDO0FBQUEsRUFFWixNQUFNLGVBQWU7QUFDcEIsU0FBSyxXQUFXO0FBQ2hCLFNBQUssV0FBVyxPQUFPLE9BQU8sQ0FBQyxHQUFHLGtCQUFrQixNQUFNLEtBQUssU0FBUyxDQUFDO0FBQUEsRUFDMUU7QUFBQSxFQUVBLE1BQU0sZUFBZTtBQUNwQixVQUFNLEtBQUssU0FBUyxLQUFLLFFBQVE7QUFBQSxFQUNsQztBQUNEOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiaW1wb3J0X29ic2lkaWFuIl0KfQo=
