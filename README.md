# BASIC Language Extension for Visual Studio Code

This extension provides support for the MTX BASIC programming language in Visual Studio Code, including syntax highlighting and other features. Converting MTX text based programs generated in VS code into machine readable Z80 program code (.mtx). This extension is targeted at those MTX programmers using the MEMU emulator (tested), although equally any code generated should work on an original Memotech computer (untested). 

## Features

- MTX BASIC language with Syntax highlighting
- Description and usage when hovering over a MTX BASIC command
- Z80 assembly language
- NODDY text language

## Installation

1. Clone the repository or download and unzip the ZIP file. NOTE: in future hoping to have this available in the VS Code extension marketplace for download.
2. In linux, ensure hidden folders are visible, move the folder to .vscode/extensions/ (the dot in front of vscode is required). You should now have a folder 
   .vscode\extensions\mtxbasic-extension
   In Windows this will be found at, remember to change the USERNAME to that in your system. Note: Linux uses (/) and windows uses (\) for file/directory paths.
   C:\Users\USERNAME\AppData\Local\Programs\Microsoft VS Code\resources\app\extensions 
   Apologies, I don't have a mac.
3. Exit and reload VS Code. This should update extension.json file in folder .vscode/extensions. It should look like the following (example from raspberry pi5 PiOS, replace $USER with your username)
{"id":"ardeer.mtxbasic-extension"},"version":"0.0.1","location":{"$mid":1,"fsPath":"/home/$USER/.vscode/extensions/mtxbasic-extension","external":"file:///home/$USER/.vscode/extensions/mtxbasic-extension","path":"/home/$USER/.vscode/extensions/mtxbasic-extension","scheme":"file"},"relativeLocation":"mtxbasic-extension"}
4. Either press "CTRL SHIFT p", select <Developer: Restart Host Extension> within the existing workspace window (recommended) or `F5` to run the extension in a new Extension Development Host window.
5. package.json has been configured to to ensure Hover is switched on and autofill is off as invariably it gets it wrong. If that   
   doesn't work, you can also configure VS code File->Preferences->Settings then select USER tab and search for Hover, and tick
   enabled.
   Alternatively, to set manually, in VS Code, keypress: "CTRL SHIFT p" and select Preferences: OPEN USER SETTINGS (JSON). 
   or if you want to access the user settings outside of VS code, in linux this can be found at ~/.config/Code/User/settings.json
         //Hover is probably better for novices to the language or as a refresher. Experienced users may find it annoying, setting to false switches it off.
        "editor.hover.enabled": true,
        //avoids CSS colour swatches appearing in front of #hex addresses like a dark red square in front of #401B 
        "editor.colorDecorators": false,
   Additional specific VS Code setting changes for mtxbasic are found in package.json in this extension.
6. Once the extension is installed, Create a new file or text file. Then click on the {} shown on the bottom left hand corner of VS code main. Click on this and scroll down until you find 
   MTX-BASIC. You are now in the MTX-BASIC environment. You cannot open historical .mtx, .com or .BAS files, these will be in the original MTX binary format. Use mtxdisassembly.py (ref 5.) to 
   convert these into .bas files, Use the lowercase .bas extension as this will be in VS code MTX-BASIC text format and you will be able to edit them in VS code editor, save as .bas and to 
   save as .mtx binary format for execution on a MTX computer or emulator like MEMU, See below for further details.

## Coding Convention and Usage

Once the extension is installed, you can open any "TEXT" based MTX BASIC file (.BAS or .bas or .txt), and the syntax highlighting will be applied automatically (the bottom left hand corner of the VS code taskbar should have {} MTX BASIC as the selected language mode). If File New or New text file, the default selected language will be {} plain text. Just use the mouse to click on this and scroll down until you find MTX-BASIC and select this. You are now ready to program in MTX BASIC in VS Code.

MTX BASIC requires all Keywords, Variables and Z80 assembly code to be in UPPERCASE. Variables must not start with a number. Lowercase can be used in NODDY text pages, REM statements and any text enclosed by double quotes. Recommend using CAPS LOCK while writing MTX BASIC code. If you hover over a BASIC command (e.g. PRINT or LET or ..), it will bring up its description and usage based on reference 1. Errors like missing space after a command or too many spaces, or insufficient or too many arguments or numeric assigned to string and vice versa will show a red squiggly line under the command/function that needs attention. Hovering over it will also show the error prompt message(s). Errors are also listed on the Problems Tab if a TERMINAL window is opened within VS Code. The <linenumber> must be the start immediately on a new line (no space before it) and must be followed by a single space after it. The reason for this will become apparent shortly.

<linenumber><sp><KEYWORD>
10 PRINT "HELLO"

<linenumbers> are in the range 0 to 65535 only in accordance with 16-bit addressing on the Zilog z80 CPU. Multiple commands are separated by colons ':' as per normal MTX BASIC convention, e.g.

15 LET A=1: PRINT A

The length of a BASIC line is the same as for MTX BASIC (158 characters), otherwise you wouldn't be able to edit the line in MEMU.

One known issue is that MTX BASIC is a bit more forgiving than how I have coded it, for example, MTX BASIC allows X,Y coordinates to be decimals when clearly they should be integers. Therefore, there is a possibility that some original programs if disaasembled and loaded into VS Code will show up as errors, e.g. CIRCLE 10.5,20,1.5 . There are some function command ranges where I have selected based the maximum-minium MTX BASIC allowed me to enter before showing an error. Further work is needed in this area.

The use of colon (:) within REM statements that are not enclosed within double quotes will lead to ironically the following error "Unrecognised or stray text: 'function'. Did you mean to add 'REM'?". Avoid using a colon (:) in free form REM statements. Also, ensure there is a space after REM. Minor changes from original MTX editor to simplify the parser coding in VS code.

The mtxbasic-extension uses regular expressions (regex) to parse the command syntax (e.g. const onMatch = /^\s*ON\s+(.+?)\s+(GOTO|GOSUB)\s+(.+?)\s*$/.exec(seg.text);). Unfortunately, this is not without its challenges, too many to discuss here, but one area where it struggles is with nested (or depth) parentheses, for example, ON MOD(Z(1),2) GOSUB 700,800 , I had to apply an additional a strip parentheses to this syntax parser to allow it to detect the second argument in the MOD() function due to Z(1) conflict. 

MTX BASIC inline z80 assembler is handled slightly different. Inline z80 assembler (ASSEM <linenumber>) command would normally generate a <linenumber> CODE in MTX BASIC. ASSEM option is not required in VS Code as we can type <linenumber> CODE directly into the BASIC listing as a placeholder followed by return, you can then enter Z80 assembly language instructions. 

<linenumber><sp><CODE>
20 CODE<return>

CODE must be on a dedicated line with no other commands, as shown above, otherwise it will not be treated as in assembler mode. 

The assembler format is unchanged from that used by the MTX assembler. 
<indent><sp><hexaddr><LABEL: (optional)><z80 mnenomic><;COMMENT (optional)>

Once a CODE block is defined as above, pressing <return> moves the line down 1 row and indents, so as to differentiate from a BASIC <linenumber>. Pressing the space bar <sp> after the indent will generate the next available hexadecimal address. Click on it to use it. This can be a tad slow, I normally use 4000 for each line then use the auto renumber feature below to quick renumber the whole block with the correct hex addresses.

20 CODE<return>
     4014 START: LD A,#0F ; START of the z80 code<return>

The user can still enter hex addresses manually, if out of sequence, the system will flag and error. You can renumber the hex addresses containing an incorrect hex address, typically caused by inserting a BASIC line before it or a z80 assembly line before it. Renumbering can be done in one of two ways in a code block by clicking on the hex address in EACH code block and 
a) either pressing "CTRL SHIFT r" 
b) or from "CTRL SHIFT p" and select "MTX: Renumber Z80 addresses in CODE block". 

Hover over a Z80 mnenomic like LD and it will list possible options, e.g. LD (HL),A . There is no Symbols Label vs address summary at the end of the code block. CTRL F (find) is more convenient to use and it made the coding slightly less cumbersome. The code will flag an error if a LABEL is duplicated.

A quirk of the assembler and to keep consistency with the original, the hexadecimal address in the code block is not preceded by '#' to indicate a hexadecimal number. However, numbers and addresses used in Z80 instructions must be preceded by '#' unless it the user uses the decimal equivalent, see examples below.

20 CODE<return>
     4014 LD A,#0F ;hexadecimal number
     4016 LD A,15 ;decimal number 
     4018 LD HL,#401C ;hexadecimal address
     401B LD HL,16412 ;decimal address
     401E RET ;ensure there is 1 RET in your code to avoid the program from crashing if you want to return to BASIC.

One quirk not applied in this implementation is the frustrating way the built in assembler dealt with changes after an assembly instruction was entered. For example, if you changed LD DE,#7000 to LD DE,#9000 the total length of the code increases by 9 bytes in this example. It leaves a residue of 00 23 39 30 30 b0 00 00 00 behind. Working with VS code does not generate this. Note: mtxdisassembly will strip out these reminants resulting in modified code lengths and if the coder had used fixed memory addresses, these strip outs could result in positional changes that may affect execution after recompiling in this extension. So bewary.

The NODDY editor is not accessible in VS code using NODDY<return>. However, the workaround is this free form text version is at the very end of a BASIC listing and the very last entry, is to use REM NODDY as the placeholder trigger to allow NODDY programs and text pages to be constructed. 

<linenumber><sp><REM><sp><NODDY>   or <linenumber><sp><other BASIC commands...>:<REM><sp><NODDY> 
65535 REM NODDY<return>

DO NOT USED LINE NUMBERS OR HEX ADDRESSES after this placeholder, this is why it is best to use the last BASIC linenumber for REM NODDY. 

The MTX NODDY editor, recommends to use uppercase alphanumeric names. This really only applies to noddy program names that are called by MTX BASIC using PLOD "PROGNAME". Although, I have noted in the MEMU emulator, lowercase alphanumeric program names also work. Text page names can be anything, and can include characters, e.g. @1P.

There are a few other minor caveats.

a) The top of each program page must have "Program title=" followed by the name of the program (e.g. Program title=PROG1) or the text page must have "Text title=" (e.g. Text title=P1). The "Noddy page title is " will be stripped out when compiling to a .mtx file. Only used as a placeholder.

b) if a Program Noddy page, PROG1 is specified as below. The repeat title on the editor page is automatically added in MTX Noddy mode, however, it is easily deleted, therefore is optional, rationale for it explained below.

Program title=PROG1   (this is equivalent to creating a page name at the NODDY> editor prompt on a MTX computer or MEMU emulator)
PROG1 (start of the created page - repeat of the page title is normally at 0,0 at the top left hand corner of the screen, to remind the user which page the user is editing)

you can now type NODDY Program commands as normal, e.g.
^1 *DISPLAY P1.                        
*PAUSE *ENTER                          
*IF C,2                                
*BRANCH 1                              
^2 *DISPLAY P2.                        
*PAUSE *ENTER                          
*IF C,x                                
*BRANCH 2                              
^x *RETURN

c) If a text page, the VS code editor expects a line of characters &/or spaces up to 39 characters. NODDY Text screens are based on 24 rows x 39 columns. This first line can also include the title but MUST be followed by spaces so as not to confuse with a program page. Each text page must be padded out to 39 characters to avoid alignment issues when compiling. If greater than 39 characters an error will appear to help. NOTE: I have updated the code so that if you press <return> at the end of text on each line, it will work out the extra spaces needed to reach column 39 and insert for you. Although, if switching between VS code editor for noddy and MTX computer editor for noddy, it might be best to avoid pressing <return> to not affect muscle memory! 

Text Title=P1
P1 On the bottom left hand corner will 

When saved later, the NODDY code will be correctly confirmed so that on a normal Memotech computer, the NODDY editor is available and you will see the programs and pages as normal. DIR will list them. So this does not disrupt any historical programs that have:-

50 NODDY

calling a NODDY program within MTX BASIC is unchanged.
60 PLOD "PROG1"


SAVING is a 2 step process.

i) Once you have created your MTX BASIC masterpiece, save the VS code text file, using VS Code SAVE AS to save the program listing as a text based file (.bas or .txt).

ii) Using VS Code command CTRL SHIFT P and selecting "MTX: SAVE hex from active editor" or press CTRL SHIFT h.  This will bring up MTX save window, enter the filename.mtx (yes use the .mtx extension as preferred for MEMU emulator). A second prompt at the top middle of the VS code screen will ask if you want to auto-run or not. If auto-run is selected you can either specify the BASIC line number to start from (e.g. 40) or the hexadecimal address to start from (e.g. #401B as used by the MTX game BOMBER.BAS" which auto-runs on loading in the MEMU emulator). If there are any errors, the binary file (.mtx) will not save, error message(s) will appear at the bottom left hand corner of the VS code screen.

The .mtx code generated for use on the Memotech MEMU emulator only uses minimal changes to the standard system variables that are normally saved to tape. In this version, the MTX header block including MTX tape based system variables is equivalent to 619 bytes.

## Contributing

Contributions are welcome! I have tried to sandbox where possible, unfortunately, every eventuality for a rich programming language like MTX BASIC cannot be tested for, so potential errors or inconsistencies still are possible. Please feel free to submit a pull request or open an issue for any enhancements or bug fixes. I don't claim to be anything other than an average hobbyist coder. Thanks.

## License

This project is licensed under the GNU License. See the LICENSE file for more details.

## Creation

This extension was developed on a raspberry pi5 running Ubuntu 25.10 (ARM64) and on piOS. VS code extensions are based on typescript/javascript and node. Rather than learn yet another computer language syntax! other than a cursory scan (see reference 3 below), I decided to use a combination of Microsoft copilot which is integrated into VS code, where a user can select a range of non-Microsoft A.I. Models (from Q4 20026 to Q1 2026) and a range of browser A.I. tools (like duck.ai) to assist in the development of this MTX BASIC extension. The building blocks of the extension were taken from my own python MTX disassembly and hexdump programs. The majority of the underlying MTX BASIC (z80) building blocks were in place, but the one thing that I needed to get started, was a suitable JSON schema. I used https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json which I found in JSJ's zxbasic extension. Coding using A.I. tools needs a LOT  of patience and perseverance to get to a workable end result, even for the simplest of tasks. A lot of time is spent re-defining followed by extensive testing of any recommended code. Different A.I. models also have different approaches, this has lead to unfortunate duplication or fallback fragility even when specifying "avoid complexity and duplication". Each new iteration of the A.I. models has improved over time. I hope the final result makes coding for the Memotech that little more convenient for those not lucky enough to still own a working Memotech MTX computer.

## For more information

Mac users replace CMD for CTRL.

1. "MTX Series Operator's Manual" by Brian Pritchard.
2. "The Memotech Operator's Manual" by Spencer Bateson.
3. "Mastering TypeScript 3" by Nathan Rozentals.
4. http://www.primrosebank.net/computers/mtx/mtx512.htm
5. MTX DISASSEMBLY utility (python) will take an existing binary (Program) file (e.g. .BAS or .mtx) and convert it to a .bas text file (BASIC listing).
6. MTX HEXDUMP utility (python) will generate a hexadecimal byte and ASCII character text file output of the binary (program) input file to assist in debugging (same as the utility "MTX PANEL COPY" which outputted PANEL to a dot matrix printer).


**Enjoy!**
