# HEXDUMP

This program takes any binary file and outputs a text file showing both the hexadecimal bytes and their ASCII character equivalents. This program has been updated to include an additional customised output for Memotech MTX computers. However, it is just as useful as a general hexdump. 

## Features

- Written in Python
- Reads text or program file (binary .mtx or .BAS or .com file types)
- Outputs a text file (address, 16 byte data per line, 16 ASCII characters per line)
- MTX series customised output version breaks the code into sections:
    Tape header,
    Saved system variables,
    Main BASIC listing including z80 assembly code
    NODDY program and text pages.

## Installation

1. Clone the repository or download the ZIP file and unzip.
2. Open the project in Visual Studio Code or IDLE or preferred IDE.
3. Open mtxhexdump.py


## Usage

Run mtxhexump.py from within your IDE. It will ask you to select the input filename and then output filename. If the file detects a MTX binary program, it will by default select the customised version. However, there is a check message to confirm to proceed on this basis or to over-ride this and output in the general layout format.

NOTE: there have been a couple of files where sys_vars marker byte pairs preceded by three null bytes (00) do not match up with the equivalent markers at the start of the header at bytes 16 and 17. This caused the program to hang when MTX customisation mode is selected but general layout mode remains unaffected. The code was
modified to trap this and compare against the default settings to generate the correct customisation breakdown. Tested against BOMBER.mtx which exhibited this.


## Contributing

Contributions are welcome! Unfortunately, every eventuality cannot be tested for, so potential errors are possible. Please feel free to submit a pull request or open an issue for any enhancements or bug fixes. I don't claim to be anything other than an average hobbyist coder. Thanks.

## License

This project is licensed under the GNU License. See the LICENSE file for more details.

## Creation

MTX hexdump was created to assist in developing additional tools that allow MTX BASIC to be worked on in a modern IDE environment. MTX hexdump is generates output similar to the MTX PANEL Copy utility (see ref 4). The resultant MTX programs can be run/tested using the excellent MEMU emulator for Memotech computers (see ref. 3 below).
a) MTX Disassembly (previously called MTX BASIC to text) written in Python 
b) MTX BASIC extension for Visual Studio code written in typescript/javascript.

## For more information

Mac users replace CMD for CTRL.

1. "MTX Series Operator's Manual" by Brian Pritchard.
2. "The Memotech Operator's Manual" by Spencer Bateson
3. http://www.primrosebank.net/computers/mtx/mtx512.htm
4. Popular Computing Weekly, 26 June-2 July 1987 and page 31 3-9 July 1987


**Enjoy!**
