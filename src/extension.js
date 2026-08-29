const vscode = require("vscode");
const { initializeDecorationTypes, disposeAllDecorationTypes } = require("./src/decorations");
const { registerCommands } = require("./src/commands");
const { setActiveEditor, updateAllDecorations } = require("./src/decorations/manager");
const { debounce, validateEditor, isSupportedLanguage, logInfo, logError, disposeAll } = require("./src/utils");

let contextSubscriptions = [];

const debouncedUpdateDecorations = debounce(() => {
  return updateAllDecorations();
}, 300);

function activate(context) {
  logInfo("EasyLanguage extension activating...");

  try {
    initializeDecorationTypes();
    
    setActiveEditor(vscode.window.activeTextEditor);
    
    if (vscode.window.activeTextEditor) {
      debouncedUpdateDecorations();
    }

    const activeEditorChangeListener = vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        setActiveEditor(editor);
        if (editor && validateEditor(editor) && isSupportedLanguage(editor.document.languageId)) {
          debouncedUpdateDecorations();
        }
      },
      null,
      context.subscriptions
    );
    contextSubscriptions.push(activeEditorChangeListener);

    const textDocumentChangeListener = vscode.workspace.onDidChangeTextDocument(
      (event) => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && 
            validateEditor(activeEditor) &&
            event.document === activeEditor.document &&
            isSupportedLanguage(event.document.languageId)) {
          debouncedUpdateDecorations();
        }
      },
      null,
      context.subscriptions
    );
    contextSubscriptions.push(textDocumentChangeListener);

    registerCommands(context);

    logInfo("EasyLanguage extension activated successfully");

  } catch (error) {
    logError("Failed to activate extension", error);
    vscode.window.showErrorMessage(`EasyLanguage activation failed: ${error.message}`);
  }
}

function deactivate() {
  logInfo("EasyLanguage extension deactivating...");
  
  try {
    disposeAll(contextSubscriptions);
    disposeAllDecorationTypes();
    logInfo("EasyLanguage extension deactivated successfully");
  } catch (error) {
    logError("Error during deactivation", error);
  }
}

exports.activate = activate;
exports.deactivate = deactivate;