# MTX-DISASSEMBLY (MTX BASIC to TEXT Conversion)
 
 Conversion of MTX BASIC Programs (.mtx, .BAS) into readable MTX BASIC text files. Use in conjuction with mtxhexdump.py utility for best disassembly results.

## Features

- Written in Python
- Reads a Memotech MTX tape or disc program (.mtx or .BAS or .RUN) file
- Outputs a disassembled MTX BASIC text file of the program for updating.
- The output is customised for use with VS Code editor, i.e. looks for REM NODDY at the end of the BASIC listing, if not found will add or amend
  linenumber 65535 to put this placeholder.
  65535 REM NODDY
- Determines if a NODDY page is a program (i.e. Program title=<pagename>) or text (i.e. Text title=<pagename>) page.

## Installation

1. Clone the repository or download the ZIP file and unzip.
2. Open the project in Visual Studio Code or IDLE or preferred IDE.
3. Open mtxdisassembly.py


## Usage

Run mtxdisassembly.py from within your IDE. 

The follwowing prompts require user selection/input:-
1) Select the input filename (drop down menu to select file type (.mtx or .BAS or .RUN)) 
2) Then the output filename (.bas). The lowercase .bas extension indicates a text file compatible with VS code MTX BASIC extension.
3) If the program detects a MTX compatible file (tape or disc), it will ask the user 
3.1) Do you require VS code compatibility (i.e. drops the symbols list at the end of a code block) or not. 
3.2) Do you require MTX directives (e.g. labels, comments, etc) to be included in the disassembly (if detected). 

If it doesn't detect a MTX program file, then it is likely the file a .RUN or a BASIC text file and can be loaded into the VS code editor. 

Notes:
a) Disassembly of .RUN files are work in progress. According to MEMU website, the 1st 2 bytes are the code start and the next 2 bytes are the code length. But the code length when disassembled (i.e. KILO.RUN) has resulted in part complete instructions when compared to the hexdump of the program. So disaasembling the .RUN program is based on the file length minus these 4 bytes. Also, I have injected "0 CODE" BASIC instruction to make the program header (see ref. 6 for header details, these notes were were the original tape versions, not these disc versions) compatible with VS code MTX BASIC extension. Note: the .RUN programs may have been written and compiled in a different z80 assembler. Finally, disassembling TOADO.RUN also includes a BASIC block based on system variable detection.

b) Use a CP/M disassembler for CP/M .COM programs instead.


## Contributing

Contributions are welcome! Unfortunately, every eventuality cannot be tested for, so potential errors are possible. Please feel free to submit a pull request or open an issue for any enhancements or bug fixes. I don't claim to be anything other than an average hobbyist coder.Thanks.

## License

This project is licensed under the GNU License. See the LICENSE file for more details.

## Creation

MTX disassembly was created to assist in developing additional tools that allow MTX BASIC to be worked on a modern IDE environment. MTX disassembly generates a MTX BASIC text file (includes BASIC, z80 assembly and NODDY text) from a MTX program (binary file). The file is customised for use in VS Code, allowing the program to be interrogated or updated and using the mtxbasic extension, to create a resultant MTX binary program which can be run/tested using the excellent MEMU emulator for Memotech computers (see ref. 3 below).
a) MTX hexdump written in Python generates a customised hexadecimal/ASCII output of a MTX program (binary file .mtx or .BAS), similar to the MTX PANEL Copy utility (see ref 4).
b) MTX BASIC extension for Visual Studio code written in typescript/javascript.


## For more information

1. "MTX Series Operator's Manual" by Brian Pritchard.
2. "The Memotech Operator's Manual" by Spencer Bateson
3. http://www.primrosebank.net/computers/mtx/mtx512.htm
4. Popular Computing Weekly, 26 June-2 July 1987 and page 31 3-9 July 1987
5. mtxbasic-extension (VS code extension - avaliable from github soon)
6. "MTX TAPE TO DISC CONVERSION BOOKLET" by A.F.Wilson


**Enjoy!**
