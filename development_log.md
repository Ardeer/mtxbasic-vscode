Check CODETEST.BAS - DONE

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

In addition to the hover note above, need to add a new hover for RST 10 and how this is used for screen manipulation.

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
