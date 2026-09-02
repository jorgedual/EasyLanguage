# EasyLanguage Project Documentation

## Project Overview

EasyLanguage is a Visual Studio Code extension designed for efficient visual note-taking with colored tags, formatted titles, date insertion, and keyboard shortcuts. The extension provides a productivity-focused language for task management and organized plain-text notes.

**Version:** 0.1.0  
**Publisher:** JorgeDuarte  
**Author:** Jorge Duarte  
**License:** MIT  
**Repository:** https://github.com/tu-usuario/EasyLanguage

---

## Project Structure

### Root Files

```
EasyLanguage/
├── package.json                      # Extension manifest and configuration
├── package-lock.json                 # Dependency lock file
├── extension.js                      # Main extension logic (625 lines)
├── easySnippets.json                 # Code snippets configuration
├── language-configuration.json       # Language settings (brackets, comments)
├── .gitignore                        # Git ignore rules
├── .vscodeignore                     # VSCode packaging ignore rules
├── .vscode/                          # VSCode development configuration
│   ├── launch.json                   # Debug launch configuration
│   └── settings.json                 # Workspace settings
└── README.md                         # Main documentation
```

### Documentation Files

- **README.md** - Main documentation with features, usage, and installation instructions
- **CHANGELOG.md** - Version history and changes
- **COMO_INSTALAR.md** - Installation guide (Spanish)
- **DIAGNOSTICO.md** - Diagnostic documentation (Spanish)
- **GUIA_RAPIDA.md** - Quick start guide (Spanish)
- **INSTRUCCIONES.md** - Instructions (Spanish)
- **PASOS_RECARGA.md** - Reload steps (Spanish)
- **vsc-extension-quickstart.md** - VSCode extension quick start guide

### Extension Versions

The project includes historical `.vsix` extension packages:

- easy-0.0.1.vsix
- easy-0.0.2.vsix
- easy-0.0.3.vsix
- easy-0.0.4.vsix
- easy-0.0.5.vsix
- easy-0.0.6.vsix
- easy-0.0.7.vsix
- easy-0.0.8.vsix
- easy-0.0.9.vsix
- easy-0.1.0.vsix

### Directories

#### syntaxes/

- **easy.tmLanguage.json** (163 lines) - TextMate grammar for syntax highlighting

#### themes/

- **easy-color-theme.json** (169 lines) - Dark color theme configuration
- **easy-light-color-theme.json** (177 lines) - Light color theme configuration

#### Example Files

- **test-example.easy** (108 lines) - Comprehensive example demonstrating all features
- **hola.easy** - Basic example file

---

## Core Components

### 1. Extension Manifest (package.json)

**Key Configuration:**

- **Extension ID:** `easy`
- **Display Name:** `Easy Language`
- **Supported Languages:** `easy`, `plaintext`
- **File Extension:** `.easy`
- **Minimum VSCode Version:** 1.52.0

**Categories:** Programming Languages, Other  
**Keywords:** notes, todo, productivity, easy, color, task management

### 2. Main Extension Logic (extension.js)

**Key Functions:**

- `activate(context)` - Extension activation and event registration
- `deactivate()` - Extension cleanup
- `updateDecorations()` - Applies all text decorations based on regex patterns
- `insertText()` - Inserts check mark (🗸) at line start
- `insertSquare()` - Inserts checkbox (□) at line start
- `insertCurrentDate()` - Inserts current date (YYYY-MM-DD)
- `getCurrentDate()` - Returns formatted current date

**Decoration Types (19 total):**

1. `todoDecoration` - Yellow background (#FFD700) for #todo
2. `doingDecoration` - Blue background (#1E90FF) for #doing
3. `doneDecoration` - Green background (#32CD32) for #done
4. `temaDecoration` - Black background for Tema:
5. `nuevoTextoDecoration` - Red (#FF2D55) for >> text
6. `negritaDecoration` - Bold for **text**
7. `checkDecoration` - Strikethrough + green background for 🗸
8. `arrobaDecoration` - Blue background (#0F7FBE) for /@mentions
9. `validarDecoration` - Red background (#E74444) for #validar
10. `checkDosDecoration` - Green background (#51FB15) for #check
11. `altaDecoration` - Red background (#F62E2E) for #alta
12. `taskDecoration` - Yellow background (#FFF893) for #task
13. `mediaDecoration` - Yellow background (#F3DB00) for #media
14. `fechaDecoration` - Light gray background for fecha:
15. `tituloDecoration` - Blue-gray background for # headers
16. `subTituloUnoDecoration` - Light blue background for ## headers
17. `subTituloDosDecoration` - Light blue-green background for ### headers
18. `comentarioUnoDecoration` - Light gray for /****/ comments
19. `comentarioDosDecoration` - Dark gray for /+/+/ comments
20. `comentarioTresDecoration` - Dark gray for /// comments

### 3. TextMate Grammar (syntaxes/easy.tmLanguage.json)

**Pattern Categories:**

- `tema` - Matches `^Tema:(.*)$`
- `fecha` - Matches `^fecha:(.*)$`
- `heading3` - Matches `^###(.*)$`
- `heading2` - Matches `^##([^#].*)$`
- `heading1` - Matches `^#(?!todo|doing|done|validar|check|alta|task|media)([^#].*)$`
- `tags` - Matches 8 keyword tags: #todo, #doing, #done, #alta, #media, #task, #validar, #check
- `commentBlock1` - Matches `/\*\*+\//`
- `commentBlock2` - Matches `/\+(.*?)\+/`
- `commentTripleSlash` - Matches `///(.*)$`
- `mention` - Matches `/@(\w+)`
- `checkmark` - Matches `🗸(.*)`
- `checkbox` - Matches `□`
- `highlighted` - Matches `>>(.*)`
- `bold` - Matches `\*\*(.*)`

### 4. Themes

#### Easy Dark Theme

- Type: `dark`
- 19 token color scopes matching grammar patterns
- Custom colors for all EasyLanguage syntax elements

#### Easy Light Theme

- Type: `light`
- White editor background
- Terminal color scheme included
- 19 token color scopes for light mode

### 5. Code Snippets (easySnippets.json)

**Available Snippets:**

1. `/co` - Decorative asterisk block: `/******************************************************************************/`
2. `/cruz` - Decorative plus block: `/+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++/`
3. `/fecha` - Current date: `fecha: YYYY-MM-DD`

### 6. Language Configuration

**Comments:**

- Line comment: `//`
- Block comment: `/* */`

**Brackets:** `{}`, `[]`, `()`

**Auto-closing pairs:** `{}`, `[]`, `()`, `""`, `''`

**Surrounding pairs:** `{}`, `[]`, `()`, `""`, `''`

---

## Features

### Color Coding System

#### Task Management Tags

- **#todo** - Yellow background, black text, bold, rounded corners
- **#doing** - Blue background, white text, bold, rounded corners
- **#done** - Green background, white text, bold, rounded corners

#### Priority Tags

- **#alta** - Red background (#F62E2E), light red text (#FFC8C8)
- **#media** - Yellow background (#F3DB00), gray text (#727272)
- **#task** - Yellow background (#FFF893), orange text (#CC8400)

#### Validation Tags

- **#validar** - Red background (#E74444), white text, rounded corners
- **#check** - Green background (#51FB15), dark text (#282A36), rounded corners

#### Formatting Elements

- **Tema:** - Black background, white text, bold, italic, rounded corners
- **##** - Light blue background (#E5ECF7), bold text, rounded corners
- **###** - Light blue-green background (#F0F6FF), bold text, rounded corners
- **#** - Blue-gray background (#C1D0E5), bold text, rounded corners
- **fecha:** - Light gray background (#F8F8F8), dark gray text (#474747), bold, rounded corners
- **>>** - Red text (#FF2D55), bold, underlined
- **/@usuario** - Blue background (#0F7FBE), white text, bold
- **🗸** - Strikethrough, bold, green background (#38F5B1), black text

#### Decorative Comments

- **/**_..._***/** - Light gray background (#F6F6F6), black text
- **/+...+/** - Medium gray background (#666666), white text
- **///** - Dark gray background (#777777), white text

### Keyboard Shortcuts

| Shortcut   | Action              | Command                       |
| ---------- | ------------------- | ----------------------------- |
| Ctrl+Alt+D | Insert check mark   | `extension.insertText`        |
| Ctrl+Alt+I | Insert checkbox     | `extension.insertSquare`      |
| Ctrl+Alt+F | Insert current date | `extension.insertCurrentDate` |

### Commands

1. **extension.insertText** - Insert Check Mark
2. **extension.insertSquare** - Insert Square
3. **extension.insertCurrentDate** - Insert Current Date

---

## Installation

### Development Installation

1. Clone this repository
2. Open the project in VS Code
3. Press F5 to open a new window with the extension loaded
4. Create a `.easy` file to test

### Production Installation

Install from `.vsix` package:

```bash
code --install-extension easy-0.1.0.vsix
```

---

## Requirements

- Visual Studio Code version 1.52.0 or higher

---

## Development Scripts

- `npm run lint` - Run ESLint
- `npm run pretest` - Run lint before tests
- `npm run test` - Run tests

---

## Version History

### 0.1.0 (Current)

- Latest stable release

### 0.0.9 through 0.0.2

- Progressive improvements and bug fixes

### 0.0.1

- Initial version
- Basic functionality for colored tags and formatted titles

---

## Extension Capabilities

### Supported File Types

- `.easy` files
- `plaintext` files

### Language Activation Events

- `onLanguage:easy`
- `onLanguage:plaintext`

### Event Listeners

- Active text editor changes
- Text document changes
- Real-time decoration updates

---

## Color Theme Integration

The extension includes two complete color themes:

1. **Easy Dark** - Optimized for dark mode with rich, saturated colors
2. **Easy Light** - Optimized for light mode with clear, high-contrast colors

Both themes include terminal color schemes and editor background/foreground settings.

---

## Test Coverage

The `test-example.easy` file demonstrates:

- All color tags and their visual appearance
- All heading levels (#, ##, ###)
- All comment types
- Mentions and special formatting
- Keyboard shortcut usage
- Integration examples

---

## Configuration Files Summary

| File                        | Purpose            | Lines |
| --------------------------- | ------------------ | ----- |
| package.json                | Extension manifest | 117   |
| extension.js                | Main logic         | 625   |
| easy.tmLanguage.json        | Syntax grammar     | 163   |
| easy-color-theme.json       | Dark theme         | 169   |
| easy-light-color-theme.json | Light theme        | 177   |
| easySnippets.json           | Code snippets      | 26    |
| language-configuration.json | Language settings  | 30    |
| test-example.easy           | Example file       | 108   |

---

## Technical Stack

- **Runtime:** Node.js
- **Language:** JavaScript
- **Development Tools:**
  - TypeScript 4.1.2
  - VSCode Extension API 1.1.37
  - ESLint for linting
  - Mocha for testing

---

## Key Features Implemented

1. ✅ Real-time syntax highlighting
2. ✅ 8 colored task/priority tags
3. ✅ 3 heading levels with distinct styling
4. ✅ 3 types of decorative comments
5. ✅ User mentions support
6. ✅ Task completion markers
7. ✅ Date formatting and insertion
8. ✅ Keyboard shortcuts for common operations
9. ✅ Code snippets for rapid content creation
10. ✅ Dark and light color themes
11. ✅ TextMate grammar support
12. ✅ Visual decorations with rounded corners and special effects

---

## File Sizes and Complexity

- **Largest file:** `extension.js` (625 lines) - Core functionality
- **Most complex logic:** Regex pattern matching and decoration application
- **Most patterns:** `easy.tmLanguage.json` with 18 different pattern categories
- **Most scopes:** Both theme files with 19 token color scopes each

---

## Extension Architecture

```
User Input (.easy file)
        ↓
TextMate Grammar (syntax highlighting)
        ↓
Extension.js (regex processing + decorations)
        ↓
VSCode Rendering (final display)
```

---

## Maintenance Notes

- Extension supports both `easy` and `plaintext` languages
- Decorations update automatically on text changes
- Regex patterns are applied in specific order to avoid conflicts
- All decorations include hover messages for UX enhancement
- Code follows VSCode extension best practices

---

_Last Updated: 2026-08-29_
_Documentation generated from EasyLanguage v0.1.0 project structure_
