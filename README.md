# BASIC Language Extension for Visual Studio Code

This extension provides support for the MTX BASIC programming language in Visual Studio Code, including syntax highlighting and other features.

## Features

- Syntax highlighting for MTX BASIC code
- Basic code snippets
- Language support for MTX BASIC programming constructs
- Description and usage when hovering over a MTX BASIC command

## Installation

1. Clone the repository or download the ZIP file.
2. Open the project in Visual Studio Code.
3. Press `F5` to run the extension in a new Extension Development Host window.
4. Ensure that the following is set in VS Code User settings. File->Preferences->Settings then select USER tab and search for Hover, and tick enabled.
    Alternatively, to set manually, type below. On linux this can be found at ~/.config/Code/User/settings.json
    "[mtxbasic]": {
        "editor.hover.enabled": true
    }
5. Open a BASIC file or create a new one with the `.bas` extension to start using the extension.

## Usage

Once the extension is installed, you can open any BASIC file, and the syntax highlighting will be applied automatically. You can also use the provided snippets to speed up your coding process. If you hover over a BASIC command (e.g. PRINT or LET or ..), it will bring up its description and usage. If it is a string command (e.g. INKEY$ or CHR$ or ..) you need to hover over the $ symbol to bring up the description and usage information.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the GNU License. See the LICENSE file for more details.

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

Refer to the "MTX series owners manual.odt" (open document format).

**Enjoy!**
