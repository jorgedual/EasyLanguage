const vscode = typeof require !== 'undefined' ? tryRequire('vscode') : null;

function tryRequire(moduleName) {
  try {
    return require(moduleName);
  } catch (e) {
    return null;
  }
}

let updateTimeout;

function debounce(callback, delay) {
  return function(...args) {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function validateEditor(editor) {
  if (!editor) {
    if (vscode) {
      console.error("EasyLanguage: No active editor available");
    }
    return false;
  }

  if (!editor.document) {
    if (vscode) {
      console.error("EasyLanguage: Editor has no document");
    }
    return false;
  }

  return true;
}

function isSupportedLanguage(languageId) {
  const supportedLanguages = ['easy', 'plaintext'];
  return supportedLanguages.includes(languageId);
}

function safeExecute(callback, context = "operation") {
  try {
    return callback();
  } catch (error) {
    if (vscode) {
      console.error(`EasyLanguage: Error during ${context}`, error);
      vscode.window.showErrorMessage(`EasyLanguage: ${error.message}`);
    }
    return null;
  }
}

function logInfo(message, data = null) {
  const logData = data ? ` ${JSON.stringify(data)}` : "";
  console.log(`EasyLanguage: ${message}${logData}`);
}

function logError(message, error = null) {
  const errorData = error ? ` ${error.message}\n${error.stack}` : "";
  console.error(`EasyLanguage: ${message}${errorData}`);
}

function disposeAll(disposables) {
  if (Array.isArray(disposables)) {
    disposables.forEach(disposable => {
      if (disposable && typeof disposable.dispose === 'function') {
        try {
          disposable.dispose();
        } catch (error) {
          console.error("EasyLanguage: Error disposing resource", error);
        }
      }
    });
  }
}

module.exports = {
  debounce,
  getCurrentDate,
  validateEditor,
  isSupportedLanguage,
  safeExecute,
  logInfo,
  logError,
  disposeAll
};