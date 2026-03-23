4-Aug-2025 to 1-Nov-2025
Revisiting mtx BASIC to TEXT with a view of using it as the basis of an VS code mtx-basic extension.

1st part was setting up a list of mtx basic commands and information to link to VS code hover feature.

VS code extensions use node and typescript/javascript. Rather than learn another language syntax, javascript is known to be troublesome, so will use this as a test bed of using free AI tools to program the extension. 

2-Nov-2025
All variables to be capitalised.
Max nested Gosubs = 34
Maximum variable length is 159 chars (3x40+1x39) later changed to 158 as when edit a line its indented by a character.
Maximum file name is 15 characters
A mtx programm starts with FF (255) in the header followed by the tape name. The memu emulator allws longer filenames and adds .mtx after it which is not required when loading a filename.
Significant figures for numbers is 9 or 10 plus minus character
number range is -1E+38 to 1E+38
trig ranges lower and limited to -1E9 to +1E9 to avoid 0 overflow
+ sign is used for string concatenation.
LEN is a special case as needs a space after it LEN (A$) unlike other functions like CHR$(65), this was supposed to differentiate it from an array definition. Will flag LEN() as an error to keep logic as a minimum.
see mtx BASIC to text for z80 opcodes, mnenomics and BASIC ascii and tokens.

3-Nov-2025
Creating and testing a range of functions
isValidNumericExpression, isValidString, convertToNumber, isStringExpression, isNumericExpression, splitTopLevel, splitLineSegments,stripCharacters, splitStringConcats, splitTopLevelWithStrings

A LOT of testing and refining needed. Struggles with string commands. 

Typescript uses regular expressions (regexes) to parse majority of commands, which is flaky and doesn't always work as intended, leading too much frustration and rework.

19-Nov-2025
created stdFns.ts (note later changed to mtxstdfns.ts)

20-Nov-2025
Colons used as BASIC multiline separator. Addressing colons used in REM statements and between double quotes.
more issues with regex.
VaidExprParts to help address some arithmetic handling.

22-Nov-2025
updated sideways testing regime in argdrivenfunctions.ts as similar diagnostics as allows console output easily.
managed to get LET var or var$ = expr or expr$ to work.

23-Nov-2025
transferred LET code into extension.ts with mixed results.
Issues with LET BX=PX+1+32*(PX=31)
didn't pickup space issue with LEN() or LEN   () (multiple spaces). Revisit complexTokeniser
widened functions to be numeric and expressions.
Issues with COLOUR 4,LEN (D$) giving a false positive
Lots of testing to resolve.

25-Nov-2025
PRINT/LPRINT parser update
NEXT I was fine but NEXT X or NEXT N or NEXT E or NEXT T would throw an error because rawMatch.IndexOf(arg) finds the 1st occurence of the argument text anywhere in the match.

The use of AND, NOT, OR and expr like (NOT 2=2) to test and update LET and IF statements to accommodate.

1-Dec-2025
removed return res in some of the early checks to ensure all errors are returned.
A major issue with SAVE and LOAD errors.

3-Dec-2025
SAVE/LOAD resolved. The groupIndex was not looking at groupIndex=0.

7-Dec-2025
Resolved IF A$=" " or A$= " " and IF A=12+3+6

Added Noddy command option

8-Dec-2025
Used my files afw_Z80_mnemonics.py, afw_mtx_tokens.py and afw_mtx_sys_vars.py as building blocks for z80codes.ts (started today) and mtxtokens.ts and mtxsysvars.ts.

9-Dec-2025
Debugging z80codes.ts, its struggling with labels.
New rules for NN, n, e, d
if starts with # then a hexadecimal number else a decimal number [0-9]
check labels mismatch at end of a codeblock.

10-Dec-2025
moved codeblock code from extension.ts to z80codes.ts due to syncing issues and duplication.
hexaddr doesn't start with a # to match the current mtx z80 inline assembler. This is causing issues with BASIC line numbering. Need to indent the hexaddr in the codeblock.

The AI didn't convert the z80 list from python to typescript properly, large chunks missing. I did this manually after a number of AI attempts!!!

13-Dec-2025 to 21-Dec-2025
confirmed bottom right hand corner of VS Code page, shows MTX-BASIC
the annoying colour swatches which appears if use # followed by 4 numbers, should be surpressed after changes to user preferences but it keeps coming back!
Analysed MTX header default 619 bytes versus the variable length versions, like BSHIPS_84 which was 2827 bytes.
Carrying out investigative work using hexdump and mtx Panel to identify common variables that need to be there and which others can be ignored.

22-Dec-2025
Code inserting an unwanted space between keywords USER and SAVE when the hex dump was reviewed.
100 USER SAVE "PANEL.COD"

added BASTOP, BASBOT, NODTOP and NODBOT counters

24-Dec-2025
Tested changes to basicTokeniseLine and processCodeBlock

10 CODE\n0000 LD A,#C3\n0002 LD (#FA9E),A\n0005 LD HL,#B012
expected and actual bytes matched [16,0,10,0,194,8,0,62,195,50,158,250,33,18,176,255]

2-Jan-2026
Updated processCodeBlock conversion to include mtx directives (LABELS, Comments, DB, DW, DS)

4-Jan-2026 to 11-Jan-2026
in VS Code, compiled PANELCOD.bas to PANELCOD2.mtx  and compared the hexdump to the original PANELCOD.mtx
START label not shown
JR showing numbers instead of labels but JR NZ,POUT and JR Z,END were correct
lots of debugging and refining.

12-Jan-2026
recent changes mean the mtx directives offset by +7 as the offsets are based on the start of the opcodes not the start of the BASIC line CODE.

13-Jan-2026
Fixed the extra FF at the end, only time you would see a double FF is if the last item in a code block was a comment which ends with a FF and then the FF for the end of the code block.

14-Jan-2026
More analysis of mtx header
the key is the 1st byte is FF (so likely to be a program not a text file), next 15 bytes are the tape name
bytes 16 and 17 are a marker for where the variable header ends and the the start of the taped mtx system variables. This is key as need to oull out 
is it a MTX 500 (32k, starts at #8000) or MTX 512 (48k, starts at #4000) => LSTPG = 0 or 1
NODDY start, BASIC start and end

15-Jan-2026
issues with space compression and overall count.

23-Jan-2026
added createHdr to extension.ts
fixed error where forgot that byte zero is FF and had mistakenly had the name as 16 bytes not 15.
PANELCOD2.bas needed blank comments (;) removed as this was inflating the BASIC file length vs the original.
A lot of work interrogating the code to understand compiling byte differences vs original

24-Jan-2026
Eventually forensically analysed the original BASIC listing vs VS code one generated from MTX BASIC to TEXT. Identified 11 byte discrepency
"IS " 3 bytes missing and added to VS code listing
"THE " 4 bytes missing and added to VS code listing
"." 1 byte to remove from VS code listing
" " 5 misisng space bytes and added to VS code listing

25-Jan-2026
orginal and now the VSC compiled version match up with 3022 bytes.
Identified the missing spaces after ; were due to a regex, this was updated.
Also, the total length had been out by 1 byte was because it was already pointing to the next byte, although end of program reached.
Initially the file loaded and crashed. The error was traced to DESAVE system variable, 00 00. This needed to be FB4E + filename (excludes .mtx) length

When loaded into the MEMU emualtor, the symbols table at the code length showed that JPANEL at 0007 instead of 4007. To resolve.

Tested against MTX program (BASIC only - no assembly or noddy) BOMBER.mtx, found a number of issues. Spaces between double quotes were being processed as compressed spaces rather than normal spaces resulting in an 111 byte variance.

VS Code extension sections for IF-THEN-ELSE and LET and PRINT were not showing no space or multiple space errors.


26-Jan-2026
IF-THEN-ELSE and THEN/ELSE flags resolved the space issues, now showing no space or multiple space errors.

Changed logical (<,>, etc) and arithmetic (/,+, etc) to tokenised versions instead of the ascii versions as this is what the mtx assembler does.

BOMBER2.mtx created using VSC starts to run then line 27 appears with error undefined. If I press enter and re-run, the game runs fine. Need to solve the cause.

ALso, need to fix double spaces after TO, THEN and ELSE and to recode so that ELSE RETURN didn't show as an error in VSC.

Did another deep dive of hex byte differences.

27-Jan-2026
stripped out excess spaces after OR, NOT, AND, ELSE identified yesterday, expected 7 byte reduction in compiling but only 6 byte reduction.
loads ok but still the same issue with line 27 undefined. A way around this is to add a new line 1 GOTO 22 which bypasses the genpat definitions in the BASIC listing. 
This worked for the 1st run not the second. Also, the original autostarts on loading, I have to type RUN once loaded. This was due to the value of DESAVE
the original #401B which jumps to line 4, start of the genpat information. When loaded,it still crashed at line 27 undefined.

reviewing the hexdump again, noticed that B$=CHR$(143) was [ 02,24,d4,f5,28,31,34,33,29] then B was offset by #40. After further investigation (should have realised from mtx BASIC to text).

Updated SAVEHEX in extention.ts to ask the user to input an autostart BASIC line number or hex address. default ius the DESAVE speced previously.

28-Jan-2026
further testing to be done with BSHIPS_84.mtx (BASIC and noddy) and CHARTS_V4.mtx (BASIC, CODE and noddy)
Both these programs have larger header bytes than the standard but anything generated from VSC will be the stheader length (includes system vars) of 619 bytes.

BSHIPS_84.mtx testing crashed at line 40 PLOD "PROG3":REM instructions
Wrote a python script to compare VSC and original hexdumps. NOTE: AI was shockingly bad at this, ended up writing the bulk of it myself. I thought AI coding agents were supposed to be a pHD level!!

29-Jan-2026
DATA to have a space after it. Updated extension.ts

31-Jan-2026
BASPO should be NODTOPaddr. This fixed NODDY directory in MEMU - no longer blank.
The string variable offset by #40 had not been implemented fully which caused issues in BSHIPS_84

tested changes with BOMBER2.mtx now auto-runs, no crashes.

NODDY picking up BASIC keywords like FOR. Hover updated to exclude NODDY block.
1st line of INST ad INST2 need to be 39 characters long otherwise the NODDY text page is out of alignment.

1-Feb-2026
regex for LET amd validVarNames amended to allow for arrays. Changes to complexTokeniser and varExprParts stripping out (), so Y(1,1) became 1,1 which is an error as not a function or arithmetic.
radius updated for CIRCLE to allow decimal to align with current mtx programs.

Upadted text width for Noddy to 39 characters after retestsing.

3-Feb-2026
Fixed boolean boundaries as picking up OR with variables like CORR in ANALYSIS.BAS
Further testing found DEV=SQR(ERR OR/...) VSC added a space to spearate the OR in ERROR which was incorrect
Another error TO NUM was represented as TONUM resulting in an error. space removal by VSC was too aggressive.

Analysis then ran fine after VSC compiling.
BOMBER.BAS ran OK once the above change was implemented, as line 36 FOR Z=BY TO22 was resolved.
CHARTS_V$ and BSHIPS_84 all ran  OK after retesting.

4-Feb-2026

issue with mixed case resolved.

NEXT without an optional argument resolved.

resolved hex address 40AF showing hover info for z80 register AF.

5-Feb-2026
removed a lot of /i and /i. regexes in z80codes.ts to ensure mixedcase variables.

updates to TextMate (mtxbasic.tmlanguage.json)

6-Feb-2026
Mixedcase updated for keywords not just variables.
VSC doesn't do <TAB> to trigger the z80 hex address auto generate, so will have to use space.
Z80renumber generated and assigned to CTRL SHIFT r
SAVEHEX assigned to CTRL SHIFT h as CTRL SHIFT S reserved for save

7 to 9-feb-2026
further debugging. Updated extension to github.

14-Feb-2026
MTX BASIC to TEXT renamed as mtxdisassembly as would be helpful to include with the extension.
hexdump renamed as mtxhexdump, again to be included with extension as part of the overall development tools to support IDE use.
mtxdisassembly.py and mtxhexdump.py were written in python by me and will be adapted over the coming month to be integrate with the extension, to minimise inconsistencies other than the inclusion of REM NODDY placeholder.

Test CR at end of Noddy lines to see if had any impact - NONE. Plan to add spaces and end of each noddy line when compiling to ensure 39 character alignment.

in z80codes.ts, detectCodeBlocks, validateCodeBlocks and collectLabels are all hardwired to baseaddr of 0x4000. This should only be as a fallback and to use the baseaddr configuration in extension.ts This is the cause of some hexaddr's not being flagged as an error when the code is scanned.

15-Feb-2026
importing basicLineTokeniser into z80codes.ts
More hexdump analysis / debugging of Noddy page/prog setup.
There was an extra byte in the ANALYSIS6.BAS VSC compilation test. 10825 bytes vs 10824 bytes. There was a blank line after a return which the system processed as a newline <0x80+0x27> for spaces followed by FF to signify end of Noddy page. Removal of the extra space bytes, resulted in the correct compilation bytes vs the original.

TESTMTX.bas crashed as no return in 20 CODE. Also, needed to add VS 4 before CIRCLEas need to be in graphics mode to work.

16-Feb-2026
the BOMBER.mtx header byte 16/17 marker was f2 f4 but the 2nd f2 f4 marker for sys_var was too far on. The default system variable marker f2 f8 was earlier and better aligned with where the system variable start should be

Confirmed REM **   TEST used 0x20 for spaces not compressed and PRINT "**    **", also confirmed 0x20 for spaces not compressed spaces.

17-Feb-2026
TESTMTX.bas correctly assembled by VSC and then disassembled by mtxdisassembly.
mtxdisassembly now injecting REM NODDY placeholder at the end of BASIC as part of VSC code integration requirements.

Noddy text and prog page line lengths must comply with 39 characters. Code updated.

### Summary update to date
CODETEST.BAS (renamed to Z80CODETEST.bas) where z80 code was compared against z80Cmds in z80codes.ts - DONE

Check against PANELCOD.BAS (started 13-Jan-2026) - DONE
    in a number if more than 1 instances, VS code list in order whereas MTX has them in reverse order - is this an issue - doesn't appear to be. 
    To overcome, increase count and insert directly after the count - this was applied 13-Jan-2026 and checked.
    The error of double FF at end of a BASIC line was fixed, should only be 1 FF at the end of a BASIC line. 
    NOTE: might need to check if single FF at end of a CODE block where the last item is a comment which has a FF already.

Generate code for file/tape header - will utilise mtxsysvars.ts changed to mtxsavehdr.ts

in extension.ts added some counter information to be passed back to mtxsavehdr before returning the mtxhdr array for merging with the convert to hexbytes

currently have noddyLength (number of ascii characters in extension.ts but maybe this needs to be added to mtxtokens.ts although better to calculate in extension to save passing additional variables back - which is is more straight forward)

Once ascii hdr is resolved, need to make a few adjustments to translate - No need as they correctly generate the correct bytes.
if any of the following stack pointers are in the code, then another quirk of the Z80 assembler is to convert them
    LD SP,HL to become =>   LDSPHL: DB #F9
    LD SP,IX                LDSPIX: DB ##DD,#F9
    LD SP,IY                LDSPIY: DB #FD,#F9
    need to check how best to code. Also, may require the python disassembler to be updated.

In addition to the potental hover note above, need to add a new hover for RST 10 and how this is used for screen manipulation - STILL to be done

Test .mtx code generated in VS code in the MTX emulator
a) PANELCOD - DONE. Only error appears that the symbols are from 0x0000 instead of 0x4000 when loaded into the emulator! Need to resolve.
b) BSHIPs_84
c) CHARTS_V4
d) a selection of MTX programs
    BOMBER.BAS - loads OK but need to edit 22 to 42 <RET> for the lines to be accepted by the program. Lines 35 and 36 come across as too long and cause an issue. 
    The program used the std hdr size of 619bytes with DESAVE by calc or using the 0x401B option. Didn't appear to impact the loading.
    BASTOP for VS version is 0x46bb and for original 0x464c a delta of 0x6F or 111 bytes. The reason is due to 111 extra spaces (0x20). The original has 14 spaces as 0x20.
    The VS code has 14 spaces as 0x81 (all within double quotes) and 111 spaces as 0x20. The 14 spaces need to be converted back to 0x20 only after the 111 spaces are removed. Only 12 lines with double spaces not within ""
    A number of corrections made.
    Also, DESAVE is set to 0x401B to allow autorun (it starts by loading the GENPAT statements from line 4). work around is to change 1 GOTO 22 to GOTO 4 to achieve the same but you will have type RUN.
    line 27 still randomly throwing up UNDEFINED. This is because the original uses 0x02 instead of 0x42 for the B in B$. If use B$ it loads up the editor with line 27. Pressing enter and re-runnig solves the problem. Not sure if this is meant to be a protection measure on not.

extension.ts consider a prompt here to ask user if auto-run or not and adjust DESAVE accordingly. Revisit RECOVER and TAPE to DISC for background on this.

Update python code for .mtx to .BAS/txt to 
    a) include a space before the hex address to match up with VS code editor for MTX inline assembler (see line 1096 and 1151 in python code)
    b) if NODDY present, check what the last line of BASIC was and if not 65535 or if 65535 then append REM NODDY so that the VS Code knows.
    c) the 3 stack pointers above - Not required.
    d) no requirement for the symbols summary at the end of each CODE section as able to scroll through the document.
    e) check file starts with 0xFF indicating that it has a file header associated with it.

Convert python code to typescript/javascript to have a single coding environment

Refine any corrections/missteps

Test against all AFW MTX BASIC/assembler code to test the completeness and accuracy.

In VS Code generate .mtx listing from VDP Discovered and PowerGraphics assembler code.

Test this code to ensure emulator performing as previous MTX computer, if not feedback to Bill.

Use VS code editor to restructure MTX battleships and update to include a better input mode (rather than placing ship in each position, only need to know type/size (Destroyer (2),Cruiser (3),Battleship (4) (option for aircraft carrier (4) or submarine (3)) - need a bigger grid), starting position and horizontal (LtoR) or vertical (UtoD) or optional diagonal (LtoR or R to L))

once VS code is thoroughly tested share with Dave and Bill for comment/testing

Category 1: Keyword patterns that MUST be changed (keywords should be uppercase only):

Lines 598, 599, 635: REM NODDY
Line 1195, 2207: CODE
Lines 1217, 1265, 1883: ELSE
Line 1383: REM
Line 1415, 1776, 1829, 1895: LET
Lines 1516, 1797, 1850, 1920: PRINT|LPRINT
Line 1556: INPUT
Lines 1259, 1628: IF
Line 1262: THEN
Line 1215: RETURN
Line 1724: NOT
Line 1964: FOR...TO...STEP
Line 2036: ON...GOTO|GOSUB
Line 2100: DIM
Line 2165: DATA
Line 2181: READ
Line 2243: NEXT
Lines 2582, 2621: REM NODDY
Category 2: Variable/character class patterns (may need to stay case-insensitive for matching variable names):

Lines 1215, 1259, 1262, 1265, 1294 (2x): /[A-Z0-9_$]/i - these check word boundaries and SHOULD stay case-insensitive to match variable names like abc or ABC
Category 3: Hex pattern (should be uppercase):

Line 252: Should be [0-9A-F] without /i for uppercase hex
Category 4: Already commented out (can ignore):

Line 305, 1398: Commented out code
Yes, you're correct about the hex pattern! For [0-9a-f] with /i, the flag makes it also match uppercase. Since you want "only capitalised keywords and variables containing letters are allowed", hex should be [0-9A-F] without the /i flag.

currently left in lowercase hex and letters because of the way regexes work, ability to flag PRint for example. The aim is to remove i and deal with it that way. The solution to lowercase hex has been dealt with.
This pattern uses [A-Z0-9_]* which allows any combination of uppercase letters, digits, and underscores after the first character. It doesn't enforce that all letters are uppercase - it just doesn't match lowercase letters at all.

In "LABELtest:", the pattern only matches "LABEL" (stopping at the lowercase 't') because lowercase letters aren't included in the character class. However, TextMate grammars don't flag incorrect syntax - they only highlight what matches. Since "LABELtest:" doesn't fully match the pattern, it's simply not highlighted as a label, but it's also not marked as an error.

A future option might be to use # before hexaddress and strip out in mtxtokens and insert in the disassembly program

Code up Powergraphics for testing, see if can get to the heart of out/in VDP setup. Ensure VS 4 mode.

The Real Issue:

hexBaseAddress = 0x4000 is defined in extension.ts (line 138)
validateCodeBlocks(allDocLines) is called from extension.ts (line 2672)
But validateCodeBlocks in z80codes.ts hardcodes currentAddress = 0x4000 (line 1501)
It doesn't account for the BASIC bytes before the CODE block!
In TESTMTX.BAS:

Line 10 PRINT "HELLO" tokenizes to ~X bytes
Line 20 CODE tokenizes to ~Y bytes
So Z80 code actually starts at 0x4000 + X + Y = 0x4014 (or similar)
But validation thinks Z80 starts at 0x4000, so when it sees address 4015 in the file, it checks against the wrong baseline.

The Fix:

validateCodeBlocks needs to:

Receive hexBaseAddress as a parameter
Receive basicTokeniseLine function to calculate BASIC byte lengths
For each CODE block, calculate bytes consumed by preceding BASIC lines
Pass the correct starting address to validateCodeBlock
Would you like me to implement this fix? It will require modifying:

validateCodeBlocks and validateCodeBlock signatures in z80codes.ts
The call site in extension.ts line 2672
Importing basicTokeniseLine into z80codes.ts

The original code planner log, now called development log was uploaded to the cloud as part of an inadvertent ask vscode and it was lost!! This backup was last updated on the 14th Feb 2026, so lost all the logs from then until 5th March.
### END OF summary

22/23-Feb-2026
FIXED the JR/DJNZ jumps going upwards. 

25-Feb-2026
Updated BASIC significant figures and a number of ranges in cmdspec.

26/28-Feb-2026
FIXED now includes a z80 code duplicate labels check.
Identified an parentheses issue with ON MOD(Z(1),2) GOSUB 100,200. The second argument of MOD was not being detected properly.
local change to remove 
                const onMatch = /^\s*ON\s+(.+?)\s+(GOTO|GOSUB)\s+(.+?)\s*$/.exec(seg.text);
                if (onMatch) {
                    const [, selectorExprRaw, branchKeyword, targetsRaw] = onMatch;
                    //parenthesis caused an issue with ON MOD(Z(1),2) not detecting the inner comma resulting insufficient arguments 
                    //const selectorExpr = stripOuterParentheses(stripTrailingCommentUnquoted(selectorExprRaw.trim())); //didn't work
                    let selectorExpr = stripTrailingCommentUnquoted(selectorExprRaw.trim());
                    // drop the function name and its parentheses, leaving just the contents
                        selectorExpr = selectorExpr.replace(/^[A-Z][A-Z0-9]*\s*\((.*)\)$/,'$1');

1-Mar-20026 to 3rd-Mar-2026
Added EDITOR and NEW to cmdspecs list/
updated to detect lowercase rem at the start of line as an error.
                        if (/^\s*rem\b/.test(stripped) && !/^\s*REM\b/.test(stripped)) {
                                const idx = origLine.search(/\brem\b/i);     // location of bad keyword
                                diags.push(new vscode.Diagnostic(
                                new vscode.Range(i, idx, i, idx + 3),
                                'keyword REM must be upper‑case',
                                vscode.DiagnosticSeverity.Error));
                        }

3/4-Mar-2026
Identified code hexaddress provider and renumberZ80 in codeblocks 2 and 3 incorrectly specifying a hexaddresses when testing against panelcod.bas and DRAWMODULES.bas 
2 days spent with 4 different AI agents failed repeatedly to solve the issue. I thought by settingto cloud rather than local that this would help solve the problem but this uploaded all the files and wiped from the PC. I cancelled the cloud work. backed up from a earlier archive. Still to resolve this issue.

used panelcod.bas as an example and broke down the code
0x4000 0x23 0x08 => length of code (MSB/LSB format) for 1st BASIC line
0x4002 0x0A 0x00 => BASIC line 10
0x4004 0xC2 => BASIC keyword token for CODE. Now CODE detection as the 1st keyword means what follows is a codeblock
0x4005 0xBA 0x00 =>length of the z80 opcode (MSB/LSB format) part of the codeblock 1
0x4007 to 0x40C0 => z80 opcodes
0x40C1 to 0x4821 => mtx directives (length of mtx directives = 0x0823 code length - 0x00BA z80 opcode length - 2 bytes for code length - 2 bytes for BASIC linenum= - 1 for CODE keyword - 2 for z80 opcode length - 1 for end of line)
0x4822 0xFF => end of BASIC line (and end of codeblock1)

0x4823 0x9E 0x00 =>length of code (MSB/LSB format) for next BASIC line
0x4825 0x14 0x00 => BASIC line 20
0x4827 0xC2 => => BASIC keyword token for CODE. Now CODE detection as the 1st keyword means what follows is a codeblock
0x4828 0x0C 00 =>length of the z80 opcode (MSB/LSB format) part of the codeblock 2
0x482A to 0x4835  => z80 opcodes
0x4836 to 48BF => mtx directives
0x48C0 0xFF => end of BASIC line (and end of codeblock2)

0x48C1 0x06 0x00 =>length of code (MSB/LSB format) for next BASIC line
0x48C3 0x1E 0x00 => BASIC line 30
0x48C5 0xAF => BASIC keyword token for RETURN. This is a standard BASIC line.
0x48C6 0xFF => end of BASIC line

0x48C7 0x11 0x00 =>length of code (MSB/LSB format) for next BASIC line
0x48C9 0x64 0x00 => BASIC line 100
0x48CB 0xB5 => BASIC keyword token for SAVE. This is a standard BASIC line.
0x48CC to 0x48D6 =>ascii bytes for "PANEL.COD"
0x48D7 0xFF => end of BASIC line

and so...

5-Mar-2026
added in some of the lost development_log information
Identified that the rem change above only detected rem if at the start of a line and ignored rem in a multiline. FIXED.
                for (const seg of segments) {

                        // lowercase REM is a syntax error; seg.text has already been
                        // upper‑cased by the segmentiser, so look at the original line.
                        //updated to include rem errros if part of a multi-line
                        const origLine = doc.lineAt(i).text;
                        const origSeg = origLine.substring(seg.start,
                                                        seg.start + seg.text.length);

                        const remMatch = /^\s*rem\b/i.exec(origSeg);
                        if (remMatch && !/^\s*REM\b/.test(origSeg)) {
                                // location of the rem keyword within the entire line
                                const idx = seg.start + remMatch.index +
                                        origSeg.slice(remMatch.index)
                                                .search(/rem/i);
                                const range = new vscode.Range(i, idx, i, idx + 3);
                                diags.push(new vscode.Diagnostic(
                                range,
                                'keyword REM must be upper‑case',
                                vscode.DiagnosticSeverity.Error));
                        }

Trying to solve the miscalculation of hexaddresses
1. const bytes = convertTextToHex(text, hexBaseAddress); generates a correctly specified binary file.
2. byteCountTot=bytes.length and tmpBcount=0 and tmpLineLen=0 tmpOffset=0
3. Scan through bytes, We know for each BASIC line number, the 1st 5 bytes of bytes will always comply with
3.1 tmpLineLen@tmpOffset +0 = read bytes 0 and 1 (MSB/LSB format)
3.2 tmpLineNum @tmpOffset +2 = read bytes 2 and 3  (MSB/LSB format)
3.3 tmpKeyword@ tmpOffset +4 = read byte 4
4. If tmpKeyword == 0xC2 (CODE) then we know its a codeblock and 1 of 2 possibilities
4a. if tmpKeyword==0xC2  //codeblock
        startHexaddr = tmpOffset+ hexBaseAddress + 7 /start hex address for any codeblock
        tmpOffset=tmpoffset+tmpLineLen //only update after calculating 
    else //standard BASIC line
        tmpOffset=tmpoffset+tmpLineLen

1st step
tmpOffset=0
tmpLineLen at tmpoffset +0 = 0 + 0x0823
tmpLineNum at tmpoffset +2 = 0x000A
tmpkeyword at tmpoffset +4 = 0xC2
startHexaddr = tmpOffset+ hexBaseAddress + 7 = 0 + 0x4000 +7 = 0x4007
tmpOffset=tmpOffset + tmpLineLen = 0 + 0x0823 = 0x0823

Next step
tmpOffset=0x0823
tmpLineLen at tmpoffset +0 = 0 + 0x009E
tmpLineNum at tmpoffset +2 = 0x0014
tmpkeyword at tmpoffset +4 = 0xC2
startHexaddr = tmpOffset+ hexBaseAddress + 7 = 0x0823+ 0x4000 +7 = 0x482A
tmpOffset=tmpOffset + tmpLineLen =  0x0823 +0x009E = 0x08C1

Next step
tmpOffset=0x08C1
tmpLineLen at tmpoffset +0 = 0 + 0x0006
tmpLineNum at tmpoffset +2 = 0x001E
tmpkeyword at tmpoffset +4 = 0xAF
tmpOffset=tmpOffset + tmpLineLen =  0x08C1 +0x0006 = 0x08C7

Next step
tmpOffset=0x08C7
tmpLineLen at tmpoffset +0 = 0 + 0x0011
tmpLineNum at tmpoffset +2 = 0x0064
tmpkeyword at tmpoffset +4 = 0xB5
tmpOffset=tmpOffset + tmpLineLen =  0x08C7 +0x0011 = 0x08D8

There is a discrepancy either SAVEHEX or the way mtxdisassembly works, although PANELCOD6.mtx and its disassembly appear to be correct.

Another check to be added as part of SAVE HEX or part of codeblock,  to check that any label reference in a codeblock actual has a label defined otherwise any error should be flagged. This is flagged in the mtx inline assembler.

10-Mar-2026
I have identified a number of convertTextToHex changes that need to be applied which may be the cause. I will add the changes sequentially to allow for testing. 

a) hybridisation of numbers (byte and word type references) in mtx directives
There should be 4 number instances of the decimal number 40 in the disassembly of PC11.bas
0x00 0x34 0xb0 
0x03 (3 LD A,40 there are 3 byte type numbers)
0x48 0x00 
0x30 0x00 
0x26 0x00 
0x01 (1 LD DE,40 which is a word type number)
0x98 0x00 
0x00 (single pad byte to make from 0x03 to 0x00 to be 11 bytes and odd)
Also, this goes some way to explain why numbers are out of sync because the coding has not accounted for mixed byte types and word types dictated by z80 opcode being a byte type like LD A,40 or a word type like LD DE,40

b) hybridisation of labels (word and relative jump references) in mtx directives
JR #4009
LD A,(#4009)
LD HL,#4009
0x00 0x23 0x34 0x30 0x30 0xb9
0x00 0x02 Word type, and 2 references
0x06 0x00 0x03 0x00 
0x01 Relative jump reference
0x01 0x00 
NO pad byte

c) Label not defined but used as a reference. The issue here is the use of a reference to a label but the label definition doesn't exist. The original mtx inline assembler in this circumstance where no label exists (typically during code development), defines it as a number and uses the label ascii characters. This is a special case that needs to included in the numbers section.This is allowed in the MTX emulator but hoping to flag as an error in this extension. However, historical code will impact hex addresses due to the adapation used bt the original mtx assembler

42C1 TXTSCRCOL:LD A,(#40CC)
when it should have been
42C1 TXTSCRCOL:LD A,(COL)
0x00 => number
0x43 0x4f 0xcc => ascii characters COL
0x00 0x01 => word type
0x01 0x00 => reference
0x00 =>pad byte

The above changes resolved the z80 renumber and providercompletionitem hex address misalignement. Tested in list2-3b.bas All the errors disappeared.
block 3 used to be reported as starting at 4460 instead of 4469, which is why the diagnostics complained and the emulator
looked “wrong”. The only thing that ever affects those numbers is the byte stream returned by
convertTextToHex(docLines.join('\n'), hexBaseAddress)

Providing or renumbering the hex addresses appears to have been resolved, tested against list2-3b.bas. Copies made today at 19:01 (mtxtokens.ts),19:04 (z80codes.ts) and 19:11 (extension.ts) of files changed.

Z80 CODE BLOCK VALIDATION, there are 2 sections of code with the same title. Added PART 1 and PART 2 to them to clearly differentiate.
What you’ve labelled PART 1 and PART 2 are doing two completely
different jobs.
They just happen to live in the same big if (codeBlockRanges.length > 0)
block, so it looks as if they might be doing the same thing, but they
aren’t.

PART 1 – the call to validateCodeBlocks() – walks the text of the entire document, tokenises the BASIC/CODE mixture and runs the little
three‑pass Z‑80 validator that lives in z80codes.ts.

it complains about bad mnemonics (AND Z, XOR AB, …), illegal operands, undefined labels, out‑of‑range immediates, duplicate label
definitions, etc.
it does not know anything about the 4‑digit hexadecimal address that the user types at the start of each assembly line; it treats
each line as a sequence of bytes.
the errors it returns are exactly the ones you asked for earlier: “Label not found: COL”, “Invalid Z80 instruction …”, and so on.

PART 2 – the hand‑rolled loop that builds a map with buildCodeAddressMap() and then compares the value printed on the
first assembly line of each block with the address that the map computed – is purely a consistency check on the header numbers.

it has nothing to do with instruction syntax or labels; it only triggers if the user has mistyped 401E when the assembler
believes the next opcode should be at 401F, for example. 
the validator in z80codes.ts does not perform this test, so PART 2 is not redundant.

Because they’re orthogonal there is no need to duplicate either set of checks. You can keep them as two separate sections (as you’ve already done, with your “PART 1”/“PART 2” comments).

Still to add the following error checks
If use a label in say LD A,(COL) or JR ROTSTART but the label is not defined before or later as COL: or ROTSTART: then flag an error (Label not defined)
AND Z or AND AA not showing as an error even though these operands are not valid. Why?

FIXED incorrect operands not flagging as errors

11-Mar-2026
removal of debugging code
Active Console Debug Logs (in-use files)

out/mtxtokens.ts:628
out/mtxtokens.ts:632
out/mtxtokens.ts:642
out/mtxtokens.ts:643
out/mtxtokens.ts:644
out/mtxtokens.ts:645
out/mtxtokens.ts:655
out/mtxtokens.ts:1007
out/mtxtokens.ts:1018
out/mtxtokens.ts:1044
out/mtxtokens.ts:1143
out/mtxtokens.ts:1146
out/mtxtokens.ts:1165
out/mtxtokens.ts:1169
out/mtxtokens.ts:1465
out/mtxtokens.ts:1614
out/mtxtokens.ts:1615
out/mtxstdfns.ts:266
out/mtxstdfns.ts:268
out/mtxstdfns.ts:272
out/mtxstdfns.ts:297
out/mtxstdfns.ts:300
out/mtxstdfns.ts:304

Likely Debug/Trace But Could Be Intentional Error Reporting

out/mtxtokens.ts:1210
out/mtxtokens.ts:1211
out/mtxtokens.ts:1212
out/mtxtokens.ts:1217
out/mtxtokens.ts:1224
out/mtxtokens.ts:1622
out/mtxtokens.ts:1677

Commented-Out Debug Console Lines (cleanup only)

out/extension.ts:367
out/extension.ts:369
out/extension.ts:375
out/extension.ts:1031
out/mtxstdfns.ts:85
out/mtxstdfns.ts:88
out/mtxstdfns.ts:193
out/mtxstdfns.ts:213
out/mtxstdfns.ts:215
out/mtxstdfns.ts:219
out/mtxstdfns.ts:259
out/mtxstdfns.ts:279
out/mtxstdfns.ts:281
out/mtxstdfns.ts:285
out/mtxstdfns.ts:312
out/mtxstdfns.ts:315
out/mtxstdfns.ts:319
out/mtxstdfns.ts:327
out/mtxstdfns.ts:330
out/mtxstdfns.ts:334
out/mtxstdfns.ts:387
out/mtxstdfns.ts:619
out/mtxstdfns.ts:622
out/mtxstdfns.ts:670
out/mtxstdfns.ts:672

to test code after changes. will do this as part of wider checking.
