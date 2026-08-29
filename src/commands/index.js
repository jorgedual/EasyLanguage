const vscode = tryRequire('vscode');
const { validateEditor, safeExecute, logInfo, logError } = require("../utils");

function tryRequire(moduleName) {
  try {
    return require(moduleName);
  } catch (e) {
    return null;
  }
}

function insertText() {
  return safeExecute(() => {
    const editor = vscode && vscode.window && vscode.window.activeTextEditor;
    
    if (!validateEditor(editor)) {
      if (vscode) {
        vscode.window.showErrorMessage("No hay editor activo");
      }
      return;
    }

    const currentPosition = editor.selection.active;
    const currentLine = editor.document.lineAt(currentPosition.line);
    const lineText = currentLine.text;

    const nonWhiteSpaceIndex = lineText.search(/\S/);
    const insertPosition =
      nonWhiteSpaceIndex !== -1
        ? new vscode.Position(currentPosition.line, nonWhiteSpaceIndex)
        : currentPosition;

    editor.edit((editBuilder) => {
      editBuilder.insert(insertPosition, "🗸 ");
    });

    logInfo("Inserted check mark");
  }, "insert text operation");
}

function insertSquare() {
  return safeExecute(() => {
    const editor = vscode && vscode.window && vscode.window.activeTextEditor;
    
    if (!validateEditor(editor)) {
      if (vscode) {
        vscode.window.showErrorMessage("No hay editor activo");
      }
      return;
    }

    const currentPosition = editor.selection.active;
    const currentLine = editor.document.lineAt(currentPosition.line);
    const lineText = currentLine.text;

    const nonWhiteSpaceIndex = lineText.search(/\S/);
    const insertPosition =
      nonWhiteSpaceIndex !== -1
        ? new vscode.Position(currentPosition.line, nonWhiteSpaceIndex)
        : currentPosition;

    editor.edit((editBuilder) => {
      editBuilder.insert(insertPosition, "□ ");
    });

    logInfo("Inserted square checkbox");
  }, "insert square operation");
}

function insertCurrentDate() {
  return safeExecute(() => {
    const editor = vscode && vscode.window && vscode.window.activeTextEditor;
    
    if (!validateEditor(editor)) {
      if (vscode) {
        vscode.window.showErrorMessage("No hay editor activo");
      }
      return;
    }

    const { getCurrentDate } = require("../utils");
    const currentDate = getCurrentDate();
    const currentPosition = editor.selection.active;

    editor.edit((editBuilder) => {
      editBuilder.insert(currentPosition, currentDate);
    });

    logInfo("Inserted current date", { date: currentDate });
  }, "insert date operation");
}

function registerCommands(context) {
  if (!vscode) {
    return;
  }
  
  try {
    const insertTextCommand = vscode.commands.registerCommand(
      "extension.insertText",
      insertText
    );
    context.subscriptions.push(insertTextCommand);

    const insertSquareCommand = vscode.commands.registerCommand(
      "extension.insertSquare",
      insertSquare
    );
    context.subscriptions.push(insertSquareCommand);

    const insertDateCommand = vscode.commands.registerCommand(
      "extension.insertCurrentDate",
      insertCurrentDate
    );
    context.subscriptions.push(insertDateCommand);

    logInfo("Commands registered successfully");
  } catch (error) {
    logError("Failed to register commands", error);
    throw error;
  }
}

module.exports = {
  insertText,
  insertSquare,
  insertCurrentDate,
  registerCommands
};