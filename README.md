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
    Alternatively, to set manually, in VS Code, keypress: CTRL SHIFT P and select Preferences: OPEN USER SETTINGS (JSON). 
    or if you want to access the user settings outside of VS code, in linux this can be found at ~/.config/Code/User/settings.json
    "[mtxbasic]": {
        "editor.hover.enabled": true
    }
5. Open a BASIC file or create a new one with the `.BAS` extension to start using the extension.
6. Inline assembler (ASSEM <linenumber>), is not required, use <linenumber> CODE . You can then enter Z80 assembly language instructions.
7. Inline Noddy text language (NODDY), is not accessible. At the End of the BASIC program, add without a linenumber, NODDY. This will allow text language commands to be inputted and Text screens (24 rows x 40 cols).
8. SAVE the program.
9. A future iteration will include a converter to either convert from text (.BAS file) to an executable (.mtx file) or vice versa.

## Usage

Once the extension is installed, you can open any BASIC file, and the syntax highlighting will be applied automatically. You can also use the provided snippets to speed up your coding process. If you hover over a BASIC command (e.g. PRINT or LET or ..), it will bring up its description and usage. If it is a string command (e.g. INKEY$ or CHR$ or ..) you need to hover over the $ symbol to bring up the description and usage information.

Errors like missing space after a command or too many spaces, or insufficient or too many arguments or numeric assigned to string or vice versa will be show a red squiggly line under the command/function. Hovering over it will also show the error prompt message.
Erros are also listed on the Problems Tab if a TERMINAL window is opened within VS Code.

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

Refer to the "MTX series owners manual.pdf".

**Enjoy!**
