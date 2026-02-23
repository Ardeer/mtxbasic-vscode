# MTX-DISASSEMBLY (MTX BASIC to TEXT Conversion)
 
 Conversion of MTX BASIC Programs (.mtx, .BAS, .COM) into readable MTX BASIC text files. 

## Features

- Written in Python
- Reads a Memotech MTX program (.BAS or .mtx or .com) file
- Outputs a MTX BASIC text file of the program for updating.
- The output is customised for use with VS Code editor, i.e. looks for REM NODDY at the end of the BASIC listing, if not found will add or amend
  linenumber 65535 to put this placeholder.
  65535 REM NODDY
- Determines if a NODDY page is a program (i.e. Program title=<pagename>) or text (i.e. Text title=<pagename>) page.

## Installation

1. Clone the repository or download the ZIP file and unzip.
2. Open the project in Visual Studio Code or IDLE or preferred IDE.
3. Open mtxdisassembly.py


## Usage

Run mtxdisassembly.py from within your IDE. It will ask you to select the input filename and then output filename. If the file detects a MTX program, it will proceed with the disassembly. If it doesn't detect a MTX program file, then it is likely the file is a BASIC text file and can be loaded into the VS code editor.


## Contributing

Contributions are welcome! Unfortunately, every eventuality cannot be tested for, so potential errors are possible. Please feel free to submit a pull request or open an issue for any enhancements or bug fixes. I don't claim to be anything other than an average hobbyist coder. Thanks.

## License

This project is licensed under the GNU License. See the LICENSE file for more details.

## Creation

MTX disassembly was created to assist in developing additional tools that allow MTX BASIC to be worked on in a modern IDE environment. MTX disassembly generates a MTX BASIC text file (includes BASIC, z80 assembly and NODDY text) from a MTX program (binary file). The file is customised for use in VS Code, allowing the program to be interrogated or updated and using the mtxbasic extension, to create a resultant MTX binary program which can be run/tested using the excellent MEMU emulator for Memotech computers (see ref. 3 below).
a) MTX hexdump written in Python generates a customised hexadecimal/ascii output of a MTX program (binary file .mtx or .BAS), similar to the MTX PANEL Copy utility (see ref 4).
b) MTX BASIC extension for Visual Studio code written in typescript/javascript.


## For more information

Mac users replace CMD for CTRL.

1. "MTX Series Operator's Manual" by Brian Pritchard.
2. "The Memotech Operator's Manual" by Spencer Bateson
3. http://www.primrosebank.net/computers/mtx/mtx512.htm
4. Popular Computing Weekly, 26 June-2 July 1987 and page 31 3-9 July 1987
5. mtxbasic-extension (VS code extension - avaliable from github soon)


**Enjoy!**
