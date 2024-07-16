const vscode = require("vscode");

let activeEditor;
function activate(context) {
  activeEditor = vscode.window.activeTextEditor;

  // Actualiza las decoraciones al abrir la extensión y cuando cambies el editor activo
  if (activeEditor) {
    updateDecorations();
  }
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        updateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  // Actualiza las decoraciones cuando el contenido del archivo cambia
  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        updateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  // Registro del comando para insertar texto check
  let disposable = vscode.commands.registerCommand(
    "extension.insertText",
    insertText
  );
  context.subscriptions.push(disposable);

  // Registro del comando para insertar texto check
  let disposableDos = vscode.commands.registerCommand(
    "extension.insertSquare",
    insertSquare
  );
  context.subscriptions.push(disposableDos);

  // Registro del comando para insertar fecha
  let disposableTres = vscode.commands.registerCommand(
    "extension.insertCurrentDate",
    insertCurrentDate
  );
  context.subscriptions.push(disposableTres);
}
exports.activate = activate;

/*Constantes de colores */
const temaDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#0C66E4",
  color: "#FFF7D6",
  borderRadius: "4px",
  fontWeight: "800",
  fontStyle: "italic",
});

const nuevoTextoDecoration = vscode.window.createTextEditorDecorationType({
  textDecoration: "white underline;",
  color: "white",
  fontWeight: 800,
});

const checkDecoration = vscode.window.createTextEditorDecorationType({
  textDecoration: "line-through",
  color: "#51FB15",
});

const arrobaDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#0F7FBE",
  color: "white",
  borderRadius: "4px",
});

const validarDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#E74444",
  color: "#282A36",
  borderRadius: "4px",
});

const checkDosDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#51FB15",
  color: "#282A36",
  borderRadius: "4px",
});

const altaDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#E74444",
  color: "black",
});

const mediaDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#E5A045",
  color: "black",
});

const fechaDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#F0F2F4",
  color: "#2C3A51",
  borderRadius: "4px",
});

const subTituloUnoDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#DEC90F",
  fontWeight: 600,
  color: "black",
});

const subTituloDosDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#FFF493",
  fontWeight: 800,
  color: "#1A1A1A",
});

const comentarioUnoDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#E9F2FF",
  color: "#0055CC",
  fontWeight: 800,
  color: "white",
  borderRadius: "4px",
});

const comentarioDosDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#686C81",
  fontWeight: 800,
  color: "black",
});

const comentarioTresDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#AAA9A9",
  fontWeight: 800,
  color: "black",
});

/*cierre de constantes de colores */

function updateDecorations() {
  if (!activeEditor) {
    return;
  }
  const text = activeEditor.document.getText();

  // Decoraciones para "Tema:"
  const temaDecorations = [];
  const temaRegEx = /Tema:(.*)/g;
  let match;
  while ((match = temaRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "Tema ",
    };
    temaDecorations.push(decoration);
  }
  activeEditor.setDecorations(temaDecoration, temaDecorations);

  // Decoraciones para "NuevoTexto:"
  const nuevoTextoDecorations = [];
  const nuevoTextoRegEx = />>(.*)/g;
  while ((match = nuevoTextoRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "Check",
    };
    nuevoTextoDecorations.push(decoration);
  }
  activeEditor.setDecorations(nuevoTextoDecoration, nuevoTextoDecorations);

  // Decoraciones para "Subtitulo1 - ##:"
  const subTituloUnoDecorations = [];
  const subTituloUnoRegEx = /##(.*)/g;
  while ((match = subTituloUnoRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "Check",
    };
    subTituloUnoDecorations.push(decoration);
  }
  activeEditor.setDecorations(subTituloUnoDecoration, subTituloUnoDecorations);

  // Decoraciones para "Subtitulo2 - ###:"
  const subTituloDosDecorations = [];
  const subTituloDosRegEx = /###(.*)/g;
  while ((match = subTituloDosRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "Check",
    };
    subTituloDosDecorations.push(decoration);
  }
  activeEditor.setDecorations(subTituloDosDecoration, subTituloDosDecorations);

  // Decoraciones para "check - 🗸:"
  const checkDecorations = [];
  const checkRegEx = /🗸(.*)/g;
  while ((match = checkRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "Check",
    };
    checkDecorations.push(decoration);
  }
  activeEditor.setDecorations(checkDecoration, checkDecorations);

  // Decoraciones para "arroba - @:"
  const arrobaDecorations = [];
  const arrobaRegEx = /@(\w+)/g;
  while ((match = arrobaRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "arroba",
    };
    arrobaDecorations.push(decoration);
  }
  activeEditor.setDecorations(arrobaDecoration, arrobaDecorations);

  // Decoraciones para "#validar"
  const validarDecorations = [];
  const validarRegEx = /#validar/g;
  while ((match = validarRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "validar",
    };
    validarDecorations.push(decoration);
  }
  activeEditor.setDecorations(validarDecoration, validarDecorations);

  // Decoraciones para "#check"
  const checkDosDecorations = [];
  const checkDosRegEx = /#check/g;
  while ((match = checkDosRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "checkDos",
    };
    checkDosDecorations.push(decoration);
  }
  activeEditor.setDecorations(checkDosDecoration, checkDosDecorations);

  // Decoraciones para "fecha:"
  const fechaDecorations = [];
  const fechaRegEx = /fecha:(.*)/g;
  while ((match = fechaRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "fecha",
    };
    fechaDecorations.push(decoration);
  }
  activeEditor.setDecorations(fechaDecoration, fechaDecorations);

  // Decoraciones para "#alta"
  const altaDecorations = [];
  const altaRegEx = /#alta/g;
  while ((match = altaRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "alta",
    };
    altaDecorations.push(decoration);
  }
  activeEditor.setDecorations(altaDecoration, altaDecorations);

  // Decoraciones para "#media"
  const mediaDecorations = [];
  const mediaRegEx = /#media/g;
  while ((match = mediaRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "media",
    };
    mediaDecorations.push(decoration);
  }
  activeEditor.setDecorations(mediaDecoration, mediaDecorations);

  // Decoraciones para "comentario 1:"
  const comentarioUnoDecorations = [];
  const comentarioUnoRegEx =
    /\/\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\//g;
  while ((match = comentarioUnoRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "comentarioUno",
    };
    comentarioUnoDecorations.push(decoration);
  }
  activeEditor.setDecorations(
    comentarioUnoDecoration,
    comentarioUnoDecorations
  );

  // Decoraciones para "comentario 2:"
  const comentarioDosDecorations = [];
  const comentarioDosRegEx = /\/\+(.*?)\+\//g;
  while ((match = comentarioDosRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "comentarioDos",
    };
    comentarioDosDecorations.push(decoration);
  }
  activeEditor.setDecorations(
    comentarioDosDecoration,
    comentarioDosDecorations
  );

  // Decoraciones para "comentario 3:"
  const comentarioTresDecorations = [];
  const comentarioTresRegEx = /\/\/(.*)$/gm;
  while ((match = comentarioTresRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "comentarioTres",
    };
    comentarioTresDecorations.push(decoration);
  }
  activeEditor.setDecorations(
    comentarioTresDecoration,
    comentarioTresDecorations
  );

  //Cierre
}

function insertText() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No hay editor activo");
    return;
  }

  const currentPosition = editor.selection.active;
  const currentLine = editor.document.lineAt(currentPosition.line);
  const lineText = currentLine.text;

  // Encuentra la primera posición no blanca (espacio o tabulador)
  const nonWhiteSpaceIndex = lineText.search(/\S/);
  const insertPosition =
    nonWhiteSpaceIndex !== -1
      ? new vscode.Position(currentPosition.line, nonWhiteSpaceIndex)
      : currentPosition;

  editor.edit((editBuilder) => {
    editBuilder.insert(insertPosition, "🗸 ");
  });
}

function insertSquare() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No hay editor activo");
    return;
  }

  const currentPosition = editor.selection.active;
  const currentLine = editor.document.lineAt(currentPosition.line);
  const lineText = currentLine.text;

  // Encuentra la primera posición no blanca (espacio o tabulador)
  const nonWhiteSpaceIndex = lineText.search(/\S/);
  const insertPosition =
    nonWhiteSpaceIndex !== -1
      ? new vscode.Position(currentPosition.line, nonWhiteSpaceIndex)
      : currentPosition;

  editor.edit((editBuilder) => {
    editBuilder.insert(insertPosition, "□ ");
  });
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Los meses van de 0 a 11, así que añadimos 1.
  const day = now.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function insertCurrentDate() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No hay editor activo");
    return;
  }

  const currentDate = getCurrentDate();
  const currentPosition = editor.selection.active;

  editor.edit((editBuilder) => {
    editBuilder.insert(currentPosition, currentDate);
  });
}
