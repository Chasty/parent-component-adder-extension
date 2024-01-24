// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is deactivated
export function deactivate() {}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "addparentcomponent" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension.addParentComponent",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      // vscode.window.showInformationMessage("Hello VS Code!");
      addParentComponent();
    }
  );

  context.subscriptions.push(disposable);

  registerContextMenu();
}

async function addParentComponent(customName?: string) {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);

  if (!selectedText) {
    return;
  }

  const parentComponentName =
    customName ||
    (await vscode.window.showInputBox({
      prompt: "Enter a name for the parent component:",
      placeHolder: "AddedParent",
      validateInput: (value) => (value.trim() ? null : "Name cannot be empty"),
    }));

  if (!parentComponentName) {
    return;
  }

  const addedCode = `<${parentComponentName}>\n${selectedText}\n</${parentComponentName}>`;

  editor.edit((editBuilder) => {
    editBuilder.replace(selection, addedCode);
  });

  // Check if the Prettier extension is enabled
  const prettierExtension = vscode.extensions.getExtension(
    "esbenp.prettier-vscode"
  );

  // Check if the VscTsLanguageFeatures extension is enabled
  const vscTsLanguageFeaturesExtension = vscode.extensions.getExtension(
    "vscode.typescript-language-features"
  );

  console.log({
    vscTsLanguageFeaturesExtension: vscTsLanguageFeaturesExtension?.isActive,
  });

  if (prettierExtension && prettierExtension.isActive) {
    try {
      // Trigger Prettier formatting
      await vscode.commands.executeCommand("editor.action.format");
    } catch (error) {
      console.error("Error formatting document with Prettier:", error);
    }
  }
}

function registerContextMenu() {
  // Register the command for context menu
  vscode.commands.registerTextEditorCommand(
    "extension.addParentComponentContextMenu",
    (editor, edit, args) => {
      const customName = args?.customName || "AddedParent"; // Default to 'AddedParent' if not provided
      addParentComponent(customName);
    }
  );

  // Register the context menu
  vscode.window.onDidChangeTextEditorSelection((e) => {
    updateContextMenu(e as unknown as vscode.TextEditor);
  });

  // Initial registration of the context menu
  updateContextMenu(vscode.window.activeTextEditor);
}

function updateContextMenu(editor: vscode.TextEditor | undefined) {
  if (editor) {
    const command = editor.selection.isEmpty
      ? undefined
      : {
          command: "extension.addParentComponentContextMenu",
          title: "Add Parent Component",
          arguments: [{ customName: "AddedParent" }],
        };

    vscode.commands.executeCommand(
      "setContext",
      "editorHasSelection",
      !editor.selection.isEmpty
    );

    vscode.commands.executeCommand(
      "setContext",
      "editorContextMenuCommand",
      command
    );
  }
}
