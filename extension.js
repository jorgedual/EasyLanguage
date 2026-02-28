const vscode = require("vscode");

let activeEditor;

function activate(context) {
  activeEditor = vscode.window.activeTextEditor;

  if (activeEditor) {
    updateDecorations();
  }
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor && editor.document.languageId === 'easy') {
        updateDecorations();
      }
    },
    null,
    context.subscriptions
  );

  // Actualiza las decoraciones cuando el contenido del archivo cambia
  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      // Solo procesar si es un archivo .easy para evitar bucles infinitos con el OUTPUT
      if (activeEditor && 
          event.document === activeEditor.document &&
          event.document.languageId === 'easy') {
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

function deactivate() {}
exports.deactivate = deactivate;

/*Constantes de colores */



// #todo
const todoDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#FFD700", // Amarillo
  color: "black",
  borderRadius: "4px",
  fontWeight: "bold",
});

// #doing
const doingDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#1E90FF", // Azul
  color: "white",
  borderRadius: "4px",
  fontWeight: "bold",
});

// #done
const doneDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#32CD32", // Verde
  color: "white",
  borderRadius: "4px",
  fontWeight: "bold",
});


// Tema:
const temaDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#000000",
  color: "#FFFFFF",
  fontWeight: "bold",
  fontStyle: "italic",
  borderRadius: "4px",
});

// Texto >>
const nuevoTextoDecoration = vscode.window.createTextEditorDecorationType({
  color: "#FF2D55",
  fontWeight: "bold",
});

// Texto **
const negritaDecoration = vscode.window.createTextEditorDecorationType({
  color: "#000000",
  fontWeight: "bold",
});

// cuando quedo listo (🗸)
const checkDecoration = vscode.window.createTextEditorDecorationType({
  textDecoration: "line-through",
  fontWeight: "bold",
  color: "#000000",
  backgroundColor: "#38F5B1"
});

// @
const arrobaDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#0F7FBE",
  color: "white",
  fontWeight: "bold",
});

// #validar
const validarDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#E74444",
  color: "#ffffff",
  borderRadius: "4px",
});

// #check
const checkDosDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#51FB15",
  color: "#282A36",
  borderRadius: "4px",
});

// #alta
const altaDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#F62E2E",
  color: "#FFC8C8",
});


// #task
const taskDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#FFF893",
  color: "#CC8400",
});

// #media
const mediaDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#F3DB00",
  color: "#727272",
});

//Fecha
const fechaDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#F8F8F8",
  color: "#474747",
  fontWeight: "bold",
  borderRadius: "4px",
});

// #
const tituloDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#C1D0E5",
  fontWeight: "bold",
  color: "#000000",
  borderRadius: "4px",
});

// ##
const subTituloUnoDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#E5ECF7",
  fontWeight: "bold",
  color: "#000000",
  borderRadius: "4px",
});


// ###
const subTituloDosDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#F0F6FF",
  fontWeight: "bold",
  color: "#000000",
  borderRadius: "4px",
});

const comentarioUnoDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#F6F6F6",
  color: "#000000",
  fontWeight: "bold",
  borderRadius: "4px",
});

const comentarioDosDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#666666",
  fontWeight: "bold",
  color: "#FFFFFF",
});

const comentarioTresDecoration = vscode.window.createTextEditorDecorationType({
  backgroundColor: "#777777",
  fontWeight: "bold",
  color: "#FFFFFF",
});

/*cierre de constantes de colores */

function updateDecorations() {
  if (!activeEditor) {
    return;
  }

  // Solo aplicar decoraciones en archivos .easy
  if (activeEditor.document.languageId !== 'easy') {
    return; // Salir silenciosamente si no es un archivo .easy
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

  // Decoraciones para texto en negrita **texto**
  const negritaDecorations = [];
  const negritaRegEx = /\*\*(.*)/g;
  while ((match = negritaRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "Negrita",
    };
    negritaDecorations.push(decoration);
  }
  activeEditor.setDecorations(negritaDecoration, negritaDecorations);

  // Decoraciones para "Subtitulo2 - ###:"  (PRIMERO ### para evitar conflictos)
  const subTituloDosDecorations = [];
  const subTituloDosRegEx = /^###(.*)$/gm;
  while ((match = subTituloDosRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "Subtítulo Nivel 2",
    };
    subTituloDosDecorations.push(decoration);
  }
  activeEditor.setDecorations(subTituloDosDecoration, subTituloDosDecorations);

  // Decoraciones para "Subtitulo1 - ##:" (DESPUÉS de ###)
  const subTituloUnoDecorations = [];
  const subTituloUnoRegEx = /^##([^#].*)$/gm;
  while ((match = subTituloUnoRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "Subtítulo Nivel 1",
    };
    subTituloUnoDecorations.push(decoration);
  }
  activeEditor.setDecorations(subTituloUnoDecoration, subTituloUnoDecorations);

  // Decoraciones para "Titulo - #:" (DESPUÉS de ## y ###)
  const tituloDecorations = [];
  const tituloRegEx = /^#(?!todo|doing|done|validar|check|alta|task|media)([^#].*)$/gm;
  while ((match = tituloRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "Título",
    };
    tituloDecorations.push(decoration);
  }
  activeEditor.setDecorations(tituloDecoration, tituloDecorations);

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

  // Decoraciones para "arroba - /@:"
  const arrobaDecorations = [];
  const arrobaRegEx = /\/@(\w+)/g;
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

  //Decoraciones para #task

  const taskDecorations = [];
  const taskRegEx = /#task/g;
  while ((match = taskRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(
      match.index + match[0].length
    );
    const decoration = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: "task",
    };
    taskDecorations.push(decoration);
  }
  activeEditor.setDecorations(taskDecoration, taskDecorations);

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
  const comentarioUnoRegEx = /\/\*\*+\//g;  // Match /**....*/ con 2 o más asteriscos
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
  const comentarioTresRegEx = /\/\/\/(.*)$/gm;
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

  // Decoraciones para "#todo"
  const todoDecorations = [];
  const todoRegEx = /#todo/g;
  while ((match = todoRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(match.index + match[0].length);
    const decoration = { 
      range: new vscode.Range(startPos, endPos), 
      hoverMessage: "Tarea pendiente" 
    };
    todoDecorations.push(decoration);
  }
  activeEditor.setDecorations(todoDecoration, todoDecorations);

  // Decoraciones para "#doing"
  const doingDecorations = [];
  const doingRegEx = /#doing/g;
  while ((match = doingRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(match.index + match[0].length);
    const decoration = { 
      range: new vscode.Range(startPos, endPos), 
      hoverMessage: "En progreso" 
    };
    doingDecorations.push(decoration);
  }
  activeEditor.setDecorations(doingDecoration, doingDecorations);

  // Decoraciones para "#done"
  const doneDecorations = [];
  const doneRegEx = /#done/g;
  while ((match = doneRegEx.exec(text))) {
    const startPos = activeEditor.document.positionAt(match.index);
    const endPos = activeEditor.document.positionAt(match.index + match[0].length);
    const decoration = { 
      range: new vscode.Range(startPos, endPos), 
      hoverMessage: "Completado" 
    };
    doneDecorations.push(decoration);
  }
  activeEditor.setDecorations(doneDecoration, doneDecorations);

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
