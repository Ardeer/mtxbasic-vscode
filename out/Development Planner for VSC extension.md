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

fixed NODDY page width and length to apply to both text and program pages.

Note: the repeat title doesn't need to appear, its optional.
the C9 or > is ambiguous and not always generated. Sometimes its generated for text page and not the prog page!
consider removing this ambiguous coding.
Also MEMU allows lower case alphanumeric program pages and any visible ascii character (32 to 126) in a text page length
Although author of the manual recommends only using capital letters and numbers in page names (PROG or text)

FIXED NODDY Program and Text to align with mtxdisassembly

22-Feb-2025
FIXED JR and DJNZ jumping negatively.

23/24-Feb-2026
Test DEMOCAD.bas and DRAWMODULES.bas based on PowerGraphics.

Still to add more text options for DRAWMODULES.

25-Feb-2026
updating the floating point range based on phoenixMTXownersManual
A new general flag segHandled is set to true if blocks correctly tested as correct or errors. A new finalStrayTextCheck function to pickup
rogue text like fhein v=19. This is shown as a amberish squiggly warning line rather than the red if an error.
updated the ranges to include signficant figure checks for floats.
also added a general significant digits check
In a proper BASIC the whole of the remainder of the line should be ignored, but the current parser in the extension doesn’t keep the :‑in‑REM rule, so it “leaks” the comment text back into the token stream. So REM some text : some other text will generate the new segHandled check. Either don't use colon in REM or enclose with double quotes.

26-Feb-2026
not picking up duplicate labels in a code block. FIXED

27-Feb-2027
Not picking up EDITOR B$ in CHARTS2.bas FIXED.

//parenthesis caused an issue with ON MOD(Z(1),2) not detecting the inner comma resulting insufficient arguments 

                const onMatch = /^\s*ON\s+(.+?)\s+(GOTO|GOSUB)\s+(.+?)\s*$/.exec(seg.text);
                if (onMatch) {
                    const [, selectorExprRaw, branchKeyword, targetsRaw] = onMatch;
                    //parenthesis caused an issue with ON MOD(Z(1),2) not detecting the inner comma resulting insufficient arguments 
                    //const selectorExpr = stripOuterParentheses(stripTrailingCommentUnquoted(selectorExprRaw.trim())); //didn't work
                    let selectorExpr = stripTrailingCommentUnquoted(selectorExprRaw.trim());
                    // drop the function name and its parentheses, leaving just the contents
                        selectorExpr = selectorExpr.replace(/^[A-Z][A-Z0-9]*\s*\((.*)\)$/,'$1');

                    const selectorType = classifyExpr(selectorExpr);
                    if (!selectorType.hasNumeric) {
                        const idx = seg.text.indexOf(selectorExpr, onMatch.index ?? 0);
                        const startChar = seg.start + (idx >= 0 ? idx : 0);
                        const endChar = startChar + selectorExpr.length;
                        diags.push(new vscode.Diagnostic(
                            new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)),
                            `ON ${branchKeyword}: selector must be numeric (got "${selectorExpr}")`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    }


28-Feb-2026
FIXED the lowercase rem not being flagged as an error
insert at line 1517ish directly after const segments = splitLineSegments(processedLineText); // Changed from line.text

                        // lowercase REM is a syntax error; seg.text has already been
                        // upper‑cased by the segmentiser, so look at the original line.
                        const origLine = doc.lineAt(i).text;
                        // throw away an optional line number and following spaces
                        const stripped = origLine.replace(/^\s*\d+\s*/, '');

                        if (/^\s*rem\b/.test(stripped) && !/^\s*REM\b/.test(stripped)) {
                                const idx = origLine.search(/\brem\b/i);     // location of bad keyword
                                diags.push(new vscode.Diagnostic(
                                new vscode.Range(i, idx, i, idx + 3),
                                'keyword REM must be upper‑case',
                                vscode.DiagnosticSeverity.Error));
                        }
1-Mar-2026
Fixing VDP/VRAM errors in DRAWMODULES.bas by updating and adding extra text before testing. Border error in DRAWMODULES.bas resolved.

Still to update README.md to include additional extension install information as not currently available on the extension store as still undergoing testing.

On linux:
/home/afw2/.vscode/extensions
md mtxbasic-extension
copy the unzip folders and files into this folder (ensure only 1 mtxbasic-extension folder and no sub-folder by that name either)
nano or other text editor /home/afw2/.vscode/extensions.extension.json
    {
        "identifier": {
            "id": "mtxbasic-extension",
            "uuid": "60e22a20-246c-4726-8a96-08eba935788c"
        },
        "version": "0.1.0",
        "location": {
            "$mid": 1,
            "path": "/home/USERNAME/.vscode/extensions/mtxbasic-extension",
            "scheme": "file"
        },
        "relativeLocation": "mtxbasic-extension",
        "metadata": {
            "installedTimestamp": 1757332156297,
            "pinned": false,
            "source": "gallery",
            "id": "60e22a20-246c-4726-8a96-08eba935788c",
            "publisherId": "8f09dc51-95d7-48a7-91ef-f95f7ab2cd1b",
            "publisherDisplayName": "Ardeer",
            "targetPlatform": "undefined",
            "updated": false,
            "private": false,
            "isPreReleaseVersion": false,
            "hasPreReleaseVersion": false
        }
    },

    change the path USERNAME
    note the metatdata publisherID was copied from jsjlogin.zxbasic extesnion to allow the testing of this extension without having to generate an existing MS marketplace ID. That is to follow soon.
    
    the uuid above is randomly generated for VS code own booking keeping needs to be unique among installed extensions so the host can tell one extension from another. 

don't use my PC uuid.
    my linuc PC uuid is 7f0feb2fe142431a836be5de5345818a
    formated as above   7f0feb2f-e142-431a-836b-e5de5345818a

There’s nothing “mystical” about the value – it just has to be a
globally‑unique 128‑bit identifier. VS Code doesn’t care how you obtain
it, it only uses it to tell one installed extension from another, so any
reasonably‑good UUID/ GUID generator will do.

On a Linux box you already have a couple of ways that are convenient from
the shell:

$ uuidgen
60e22a20-246c-4726-8a96-08eba935788c

# or via the kernel’s random UUID interface
$ cat /proc/sys/kernel/random/uuid
b8f2d9fb-4a12-4dfd-90de-fb2a7c0c6e0c

(Windows has powershell -Command [guid]::NewGuid(); macOS has uuidgen
too.)

You can also generate one from JavaScript/TypeScript if you prefer:

or with a library such as uuid in
a node script.

When you run the extension‑scaffolding generator (yo code) it creates a
UUID for you automatically and writes it into package.json/the .json
files; you can just leave that, or replace it with any other GUID you
generate with the above commands.

So: run uuidgen (or use an online UUID generator, npm pkg, etc.) and
paste the resulting string into your extensions.extension.json – it
doesn’t have to match anything on your machine.

If you ever want to publish your extension to the gallery you’ll need to
create a publisher account. The normal workflow is:

sudo npm install -g vsce          # or use the CLI built into the generator
vsce login <your‑publisher‑name>   # sign in with a Microsoft/GitHub account
# …then
vsce create-publisher <your‑publisher‑name>

The sign‑in can be done with a Microsoft account or a GitHub account; the
Marketplace supports both, but the publisher id you end up with is still
a GUID issued by the Marketplace, not your GitHub username or Azure AD
tenant id.

That string must be a Personal Access Token issued by the Marketplace
(it’s sometimes referred to as a “PAT”, “access token” or “publisher
token”). You obtain it from the web UI – it is not your GitHub
token, nor an Azure AD token, nor anything from gh/az etc.

The usual way to get one is:

sign in to the Marketplace with the same Microsoft/GitHub account
you’ll use to publish:

https://marketplace.visualstudio.com/manage

click your publisher name in the sidebar, then choose Personal
access tokens (or go directly to
https://marketplace.visualstudio.com/manage/publishers/<your‑publisher‑name>/tokens).

click New Token, give it a name, set an expiration, and make sure
the scope includes Marketplace (publish) (older docs say “All
accessible organizations – Marketplace” – in any case it needs the
publish/extension scopes).

create the token and copy the long GUID‑like string that is returned.

paste that string at the vsce login prompt and hit Enter.

Once that is done vsce stores the token in ~/.vsce and you can run
vsce publish etc. without being asked again.

3-Mar-2026
add NEW in extension.ts
{ id: 'NEW', pattern: 'NEW',  cmdname:'stdcmd'  ,args: [] , expectEnd: true },

z80 linenumbering for LIST2-3.bas is showing error when multiple code blocks are in play. 3 attempts with different models and no solution

"Save HEX" Uses convertTextToHex: The export command calls convertTextToHex(text, hexBaseAddress), which processes the entire document text at once. It already correctly handles multiline CODE blocks, parses the Z80 instructions and MTX directives, and returns the accurate binary footprint.
The Bug is Only in the UI/Validators: The current issue only affects the Z80 address diagnostics (validateCodeBlocks in z80codes.ts) and the IDE's renumbering tool (renumberZ80 in extension.ts). These specific functions were manually estimating the start address of a block by calling basicTokeniseLine on individual lines. Because basicTokeniseLine only processes the 10 CODE line (7 bytes) and doesn't process the following assembly lines, the calculated address for the next code block was falling short.
The Fix Aligns the UI with the Exporter: By changing the validators/renumber functions to extract the multiline block and pass it into assembleCodeBlock, you are simply teaching the IDE's error checker to calculate the length exactly the same way the compiler (convertTextToHex) already does.
Since we are not touching convertTextToHex or the logic inside mtxbasic.saveHex, your final compiled .mtx binaries will remain perfectly safe and correct!
