
// Import the VS Code extensibility API
import * as vscode from 'vscode';

import { 
        isValidVarName,
        isValidStrVarName,
        stripAllCharacters,
        stripOuterParentheses,
        convertToNumber,
        stringExprParts,
        varExprParts,
        isValidVarExprArithmetic,
        isValidArithmetic,
        classifyExpr,
        isSpaceNeeded,
        isNoSpaceFound,
        isMultiSpaceFound,
        splitLineSegments,
        splitTopLevel,
        isParenthesisedBooleanExpression,
        findBooleanOperatorSpacingIssues,
        validateBooleanConnectors,
        splitBooleanExpression,
        trimCommaList,
        trimArray,
        parseNoddyContent,
        validateNoddyProgram,
        isHexNumber,
        parseSignedHex,
        parseHex,
        isValidString,
        isBalancedParentheses,
        isBalancedDoubleQuotes,
        captureParenthesesGroup,
        simpleTokeniser,
        complexTokeniser,
        splitCommandsByColon,
        isNoddyTrigger,
        findPlodReferences,
        NoddyPage}
from './mtxstdfns.js';

 
import {
        detectCodeBlocks,
        validateCodeBlocks,
        getZ80InstructionInfo,
        parseZ80Line,
        getInstructionLength,
        getDirectiveLength,
        z80Cmds,
        Z80Error,
        Z80ParsedLine,
        CodeBlock,
        LabelInfo,
        splitOperands,
        collectLabels,
        normalizeInstruction,
        findZ80Command,
        validateZ80Instruction,
        validateZ80InstructionWithLabels,
        validateCodeBlock
} from './z80codes.js';

import {
        convertTextToHex,
        convertNoddyBlock,
        assembleCodeBlock,
        basicTokeniseLine,
        refineConvertTextToHex,
        compressSpacesAndAscii,
        findBestZ80Match,
        mtxTokens,
        parseImmediateOperand,
        opCodePatternToBytes,
        processMTXDirectives,
        processCodeBlock,
        updateCodeBlockLength,
        extractMTXDirectives,
        isAtWordBoundary
 } from './mtxtokens.js';

import { createHdr, initCreateHdr} from './mtxsavehdr.js';


// ------------------------------------------------------------
//  Types used by functions below
// ------------------------------------------------------------

type CheckResult = { groupIndex: number; message: string } | null;
type Validator = {
name: string;
re: RegExp;
expectEnd?: boolean;
validate: (groups: string[], rawMatch: string) => CheckResult[];
};


export function activate(ctx: vscode.ExtensionContext) {
  const diagCollection = vscode.languages.createDiagnosticCollection('mtxbasic');
  ctx.subscriptions.push(diagCollection);


        // Returns the address (baseAddr + offset) of a BASIC line number inside tokenized bytes.
        // Stops safely if it reaches non-BASIC data (e.g., NODDY bytes).
        function findAddressForLineNumber(
        targetLine: number,
        bytes: number[],
        baseAddr: number
        ): number | null {
        let i = 0;

        while (i < bytes.length) {
        // Program terminator (single 0xFF at end)
        if (i === bytes.length - 1 && bytes[i] === 0xff) break;

        if (i + 3 >= bytes.length) break;

        const len = bytes[i] | (bytes[i + 1] << 8);
        if (len < 4) break; // invalid/guard
        if (i + len > bytes.length) break; // beyond buffer -> likely non-BASIC section

        const lineNum = bytes[i + 2] | (bytes[i + 3] << 8);
        if (lineNum === targetLine) {
        return baseAddr + i;
        }

        i += len;
        }

        return null;
        }

        // default start address for MTX BASIC programs (depends on RAM size)
        const ramSize = 48; // assumes MTX512, if MTX500 use 32KB. Future option for user settings
        const mtxRamSize = ramSize * 1024;
        const hexBaseAddress = ramSize === 48 ? 0x4000 : 0x8000;

        let noddyLength = 0; // Tracks ASCII characters in the current document's NODDY section


        // Command: save converted HEX bytes from active editor to a file
        const saveHexCmd = vscode.commands.registerCommand('mtxbasic.saveHex', async () => {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                        vscode.window.showErrorMessage('No active MTX BASIC editor');
                        return;
                }
                const doc = editor.document;
                const text = doc.getText();
                try {
                        initCreateHdr(); //initialize the createHdr array before populating it with updated values
                        const { noddyStartLine } = validateLineNumbers(doc);
                        //const noddyLengthForDoc = computeNoddyAsciiLength(doc, noddyStartLine);
                        //noddyLength = noddyLengthForDoc;

                        // FIX: Use byte length, not char length, for correct BASTOP calculation
                        const noddyByteCount = computeNoddyByteLength(doc, noddyStartLine);
                        noddyLength = noddyByteCount;

                        /**
                         * The calculation of BASTOPaddr and NODTOPaddr appears to be using an inclusive "start + length" approach, 
                         * which points to the byte after the last byte of the program. Based on your expected value of 0x4962 (vs 0x4963) and the file integrity check, 
                         * these system variables are intended to point to the last utilized byte rather than the next free address.
                         */

                        const bytes = convertTextToHex(text, hexBaseAddress);
                        const totalBytelength=bytes.length; //calculate total BASIC length (PROGRAM, CODE and NODDY) from converted bytes                                
                        const LSTPGsize = ramSize === 48 ? 0x01 : 0x00; // Placeholder for number of 32K pages (0x00 for MTX500 and 0x01 for MTX512)
                        const BASBOTaddr = hexBaseAddress; // Placeholder to calculate the length of BASIC from BOTTOM to TOP of BASIC
                        const BASTOPaddr = BASBOTaddr+(totalBytelength-noddyLength - 1); // Calculate BASIC top excluding NODDY bytes
                        const NODTOPaddr = BASBOTaddr + totalBytelength - 1; // Calculate TOP of NODDY (End of Noddy code in memory)
                        const ARRTOPdispl = NODTOPaddr - BASBOTaddr; // Calculate the TOP of ARRAYS (from BASIC BOTTOM to NODDY TOP)
                        const maxBasicAddr = 0xC000 - 1; // Maximum working RAM space for BASIC is either from 0x4000 or 0x8000 to 0xBFFF inclusive
                        const maxCode_noBasicAddr = 0xFA50 - 1; // Maximum working RAM space for CODE when no BASIC or NODDY is present                       
                        //Pass the above data to update the system variables in createHdr array before inserting the header
                        const BASELINaddr=BASBOTaddr // default is BASBOTaddr. This is a test

                        initCreateHdr();
                        const sysVarStart = 368;
                        const setSysVar = (offset: number, value: number) => {
                                createHdr[sysVarStart + offset] = value & 0xFF;
                                createHdr[sysVarStart + offset + 1] = (value >> 8) & 0xFF;
                        };

                        createHdr[sysVarStart + 42] = LSTPGsize; // LSTPG
                        setSysVar(84, NODTOPaddr); // NBTOP
                        setSysVar(87, BASTOPaddr); // BASTOP
                        setSysVar(90, BASBOTaddr); // BASBOT
                        setSysVar(92, NODTOPaddr); // BASTPO
                        setSysVar(124,ARRTOPdispl); // ARRTOP
                        setSysVar(127,BASELINaddr); // BASELIN Apparently this can be any of the BASIC lines not just BASBOTaddr
                        //setSysVar(131,0x00); // Current page 00 or default 10
                        setSysVar(134,BASTOPaddr); // PGTOP
                        //setSysVar(136,GOSUBSTaddr); // Start of GOSUB stack
                        setSysVar(246,BASBOTaddr); // DATAAD
                        
                        //insert MTX header before the BASIC program bytes above - still to be added here
                        const defaultFileName = doc.uri && doc.uri.fsPath ? doc.uri.fsPath.replace(/\.[^.]*$/, '') + '.mtx' : 'output.mtx';
                        const uri = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.file(defaultFileName), saveLabel: 'Save HEX' });
                        if (!uri) return;

                        // Check filename length and update createHdr
                        let fileName = uri.fsPath.split(/[/\\]/).pop() || '';
                        
                        const lastDotIdx = fileName.lastIndexOf('.');
                        let nameOnly = lastDotIdx > -1 ? fileName.substring(0, lastDotIdx) : fileName;
                        const extension = lastDotIdx > -1 ? fileName.substring(lastDotIdx) : '';

                        nameOnly = nameOnly.toUpperCase();
                        let headerName = "";

                        // 1) strip .mtx from the name saved to createHdr only
                        // doesn't apply if extension is .BAS for example
                        if (extension.toLowerCase() === '.mtx') {
                                headerName = nameOnly;
                        } else {
                                headerName = nameOnly + extension.toUpperCase();
                        }
                        
                        // 2) filename length can be 15 bytes without .mtx
                        if (headerName.length > 15) {
                                vscode.window.showErrorMessage(`Filename header "${headerName}" is too long. Must be 15 chars or less.`);
                                return;
                        }

                        // Populate createHdr (bytes 1-15)
                        for (let i = 1; i < 16; i++) {
                                // Use (i - 1) because headerName is 0-indexed
                                createHdr[i] = (i - 1) < headerName.length ? headerName.charCodeAt(i - 1) : 0x20;
                        }
                        // DESAVE for non-auto run programs uses the DESAVE 0xFB4E + headerName.length; 
                        // auto-run programs will depend on the program. For BOMBER.BAS its 0x401B (equivalent of line 4 where the GENPAT statements are located)
                        // need to consider a prompt here to ask user if auto-run or not and adjust DESAVE accordingly
                        let DESAVEaddr = 0xFB4E + headerName.length; //default non auto-run DESAVE address
                        const desavePrompt = await vscode.window.showQuickPick(
                                ['Yes', 'No'],
                                { placeHolder: 'Is this an auto-run program? (affects DESAVE address)' }
                        );
                        if (!desavePrompt) {
                                return;
                        }
                        if (desavePrompt === 'Yes') {
                                DESAVEaddr = hexBaseAddress; //default auto-run DESAVE address to start of BASIC program
                                //user to input BASIC linenumber or hexadecimal address for DESAVE (#xxxx)
                                //if a BASIC line number is provided then need to convert to address by scanning the converted bytes for the line number (user the 1st 2 bytes as the starting address (LSB/MSB format))
                                const input = await vscode.window.showInputBox({
                                        prompt: 'Enter BASIC line number (decimal) or hex address (#xxxx)',
                                        placeHolder: 'e.g. 120 or #401B'
                                });
                                if (!input) {
                                        return;
                                }

                                const trimmed = input.trim();

                                // Hex address in #xxxx format
                                if (/^#([0-9A-F]{1,4})$/.test(trimmed)) {
                                        const addr = parseInt(trimmed.slice(1), 16);
                                        if (Number.isNaN(addr)) {
                                                vscode.window.showErrorMessage('Invalid hex address.');
                                                return;
                                        }
                                        // Optional bounds check
                                        if (addr < hexBaseAddress || addr > (hexBaseAddress + bytes.length - 1)) {
                                                vscode.window.showErrorMessage('Hex address is outside the BASIC program range.');
                                                return;
                                        }
                                        DESAVEaddr = addr; //USER input hex address for DESAVE
                                } else if (/^\d+$/.test(trimmed)) {
                                        const lineNum = parseInt(trimmed, 10);
                                        if (lineNum < 0 || lineNum > 65535) {
                                                vscode.window.showErrorMessage('Line number must be in the range 0 to 65535.');
                                                return;
                                        }
                                        const addr = findAddressForLineNumber(lineNum, bytes, hexBaseAddress);
                                        if (addr == null) {
                                                vscode.window.showErrorMessage(`Line number ${lineNum} not found in tokenized BASIC bytes.`);
                                                return;
                                        }
                                        DESAVEaddr = addr-1; //count is from 4000 or 8000 need to minus 1 to get correct DESAVE address
                                } else {
                                        vscode.window.showErrorMessage('Invalid input. Use decimal line number or #xxxx hex address.');
                                        return;
                                }
                        } else {        
                                DESAVEaddr = 0xFB4E + headerName.length; //non auto-run DESAVE address
                        }
                        vscode.window.showInformationMessage(`Setting DESAVE for non-auto-run program at 0x${DESAVEaddr.toString(16).toUpperCase()}`);
                        
                        
                        setSysVar(249,DESAVEaddr); // DESAVE address

                        const data = Uint8Array.from([...createHdr, ...bytes]);
                        await vscode.workspace.fs.writeFile(uri, data);
                        vscode.window.showInformationMessage(`Wrote ${data.length} bytes to ${uri.fsPath}`);
                } catch (e) {
                        vscode.window.showErrorMessage('Failed to generate or write HEX: ' + String(e));
                }
        });
        ctx.subscriptions.push(saveHexCmd);

        // #############################  START of REUSABLE COMMON FUNCTIONS #############################

        //FUNCTIONS THAT CAN SIT INSIDE OR OUTSIDE THE MAIN FUNCTION and don't require vscode - part of stdFns

        // Functions that require vscode or less common

        function letCheck(lhsCheck: string,rhsCheck: string, vsRange:vscode.Range, vsDiags: vscode.Diagnostic[]): string [] {
        // Check LET assignments for type compatibility helper
        //const letMatch = /^\s*LET\s+([A-Z][A-Z0-9]*\$?)\s*=\s*(.+)$/.exec(letStr); // removed \s*:\s* for end of line
        if (lhsCheck && rhsCheck)   {

                // The leading comma skips element 0 (the full match)
                // lhs receives element 1 (the identifier after LET).
                // rhs receives element 2 (the expression after =).

                const lhsIsString = isValidStrVarName(lhsCheck);//lhs.endsWith('$');
                const lhsIsVariable = isValidVarName(lhsCheck);
                
                // Validate variable name format (must start with [A-Z], followed by [A-Z0-9])
                if (!lhsIsString && !lhsIsVariable) {
                        vsDiags.push(new vscode.Diagnostic(vsRange,
                                `Invalid variable name: "${lhsCheck}". Variable names must start with uppercase letter [A-Z] and contain only uppercase letters and digits [A-Z0-9]`,
                                vscode.DiagnosticSeverity.Error));
                        return [];
                }
                
                const rhsNonNull = rhsCheck ?? ''; // ensure a string for downstream validators
                const rhsIsString = stringExprParts(rhsNonNull);
                const rhsIsNumeric = varExprParts(rhsNonNull); //checks for numeric variables and numeric expressions
                // Treat parenthesised boolean/comparison expressions (e.g. "(PX=31)") as numeric subparts
                // so they don't trigger a type-mismatch when used inside arithmetic: 32*(PX=31)
                const rhsIsNumericAdjusted = rhsIsNumeric.map(([text, ok]) => {
                if (ok) return [text, ok] as [string, boolean];
                // isParenthesisedBooleanExpression is imported from stdFns.js
                if (isParenthesisedBooleanExpression(text)) return [text, true] as [string, boolean];
                return [text, ok] as [string, boolean];
                });

                //still to check for valid numerical expressions.
                //Appears the split errors occur in the validation section of the code, so conside converting to a function once rhsIsNumeric is conpleted.
                //at this point only looking for highlevel overview if the LET statement is valid or not. The validation section to assess the validity of each component.

                if (!lhsCheck) {
                                vsDiags.push(new vscode.Diagnostic(vsRange, `LET statement missing left-hand side variable` ,
                                                vscode.DiagnosticSeverity.Error));
                } 
                if (!rhsCheck) {
                                vsDiags.push(new vscode.Diagnostic(vsRange, `LET statement missing right-hand side expression`,
                                        vscode.DiagnosticSeverity.Error));
                        }
                // Numeric expression assigned to string/string variable -> mismatch  
                if (lhsIsString && rhsIsString.some(row => row[1] === false)) { //also detects if no or multiple spaces without returning this error msg  
                                vsDiags.push(new vscode.Diagnostic(vsRange,
                                `Type mismatch or no or multiple spaces found or other LET statement construction error`,
                                vscode.DiagnosticSeverity.Error));   
                        }
                // String expression assigned to numeric variable -> mismatch
                else if (lhsIsVariable && rhsIsNumericAdjusted.some(row => row[1] === false)) { //also detects if no or multiple spaces without returning this error msg
                                vsDiags.push(new vscode.Diagnostic(vsRange,
                                `Type mismatch or no or multiple spaces found or other LET statement construction error`,
                                vscode.DiagnosticSeverity.Error));
                }
                else { //valid LET statement
                if (lhsIsString && rhsIsString.every(row => row[1] === true)) {
                        //use rhs to process as individual components separated by + operators using strExprParts in the validation section below
                        return rhsIsString.map(row => row[0])  ;
                        
                }
                else if (lhsIsVariable && rhsIsNumericAdjusted.every(row => row[1] === true)) {
                        //use rhs to process further as individual components separeted by + - * / ^ operators using varExprParts in the validation section below
                        return rhsIsNumericAdjusted.map(row => row[0]) ;
                }   
                //process further in validation section below using validators
                }   
        } // end of LET type check
        return [];

        } // END of letCheck function

        // helper: is index inside a double-quoted string in 'expr'?
        function isIndexInQuotedString(line: string, idx: number): boolean {
        let inString = false;
        for (let i = 0; i < idx && i < line.length; i++) {
                const ch = line[i];
                if (ch === '"') {
                // toggle; simple approach assumes no escaped quotes in source
                inString = !inString;
                }
        }
        return inString;
        } //END of isIndexInQuotedString function

        // Simple check: does the token look like a numeric literal (decimal, sci, or hex '#xxxx')?
        function isNumericLiteral(tok: string): boolean {
                if (!tok) return false;
                const t = tok.trim();
                // hex literal form used elsewhere might be prefixed with # (e.g. #401C) or 0x
                if (/^#([0-9A-F]+)$/.test(t)) return true;
                //if (/^0x[0-9A-Fa-f]+$/i.test(t)) return true;
                // decimal or scientific notation (allow leading + / -)
                if (/^[+-]?(?:\d+(\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?$/.test(t)) return true;
                return false;
        }

        // Count significant digits of a finite, non-zero number.
        // Uses the normalized scientific notation mantissa to compute the number
        // of significant digits in the value's representation.
        function countSignificantDigits(n: number): number {
                if (!Number.isFinite(n) || n === 0) return 0;
                // toExponential returns a string like "1.2345e+6".
                const mantissa = Math.abs(n).toExponential().split('e')[0];
                // Remove decimal point and any leading zeros that may appear (shouldn't in toExponential,
                // but defensive).
                const digits = mantissa.replace('.', '').replace(/^0+/, '');
                // If for some reason nothing left, count at least 1
                return digits.length || 1;
        }

        // FEATURE FLAG: MTX BASIC does NOT use single-quote comments by default
        const ALLOW_SINGLE_QUOTE_COMMENT = false;

        //helper to strip trailing unquoted single‑quote comments
        function stripTrailingCommentUnquoted(s: string): string {
        if (!ALLOW_SINGLE_QUOTE_COMMENT) return s;
        let inString = false;
        for (let i = 0; i < s.length; i++) {
                const ch = s[i];
                if (ch === '"') { inString = !inString; continue; }
                if (!inString && ch === "'") {
                // found an unquoted single-quote -> treat rest as comment
                return s.slice(0, i);
                }
        }
        return s;
        } //END of stripTrailingCommentUnquoted function

        // Count ASCII characters in the NODDY section (marker line excluded)
        function computeNoddyAsciiLength(doc: vscode.TextDocument, noddyStartLine: number): number {
        if (noddyStartLine < 0) return 0;
        const startLine = noddyStartLine + 1;
        if (startLine >= doc.lineCount) return 0;
        const start = new vscode.Position(startLine, 0);
        const end = doc.lineAt(doc.lineCount - 1).range.end;
        const noddyText = doc.getText(new vscode.Range(start, end));
        return noddyText.length;
        }

        // Count BYTES in the NODDY section (using Page structure)
        function computeNoddyByteLength(doc: vscode.TextDocument, noddyStartLine: number): number {
        // FIX: Return 0 immediately if no NODDY section serves as the fix
        if (noddyStartLine < 0) {
                return 0;
        }

        const startLine = noddyStartLine + 1;
        if (startLine >= doc.lineCount) {
                return 0; // Handle edge case where NODDY header is the last line
        }
        
        const start = new vscode.Position(startLine, 0);
        const end = doc.lineAt(doc.lineCount - 1).range.end;
        const noddyText = doc.getText(new vscode.Range(start, end));
        
        const lines = noddyText.split(/\r?\n/);
        
        // This now returns the full binary size including Page headers (Len) and footers (0xFF)
        const bytes = convertNoddyBlock(lines);
        return bytes.length;
        }

        // Run all validators over `segment` and call `onError` for each CheckResult.
        // - Skips matches that begin inside double-quoted strings (isIndexInQuotedString)
        function runValidatorsOnSegment(
                segment: string,
                validatorsList: Validator[],
                onError: (
                        err: CheckResult,
                        rawMatch: string,
                        absoluteMatchIndex?: number,
                        matchArray?: RegExpExecArray
                ) => void,
                baseOffset: number = 0
                ) {                               
                let commandMatchedAtStart = false;
                for (const validator of validatorsList) {
                        const flags = validator.re.flags.includes('g') ? validator.re.flags : validator.re.flags + 'g';
                        const iter = new RegExp(validator.re.source, flags);
                        let match: RegExpExecArray | null;
                        while ((match = iter.exec(segment)) !== null) {
                        const localIdx = match.index ?? 0;
                        if (isIndexInQuotedString(segment, localIdx)) continue;

                        // Check word boundaries for keywords (BACKUP SOLUTION) - Not implemented or tested yet
                        //const matchEnd = localIdx + match[0].length;
                        //if (!isAtWordBoundary(segment, localIdx, match[0].length)) {
                        //        continue;
                        //}

                        if (validator.name === 'INK' && (match[0] || '').toUpperCase().includes('INKEY$')) continue;

                        // If a command matched at the start of the segment, skip ALL other validators
                        // This prevents INT from matching inside "CSR INT(x),INT(y)" or SIN inside "CIRCLE SIN(a),COS(b),R"
                        if (commandMatchedAtStart) continue;

                        const groups = match.slice(1);
                        const failures = validator.validate(groups, match[0]);
                        failures.forEach(f => {
                                if (f) onError(f, match![0], baseOffset + localIdx, match!);
                        });

                        // Mark that we matched a command at the segment start to prevent other validators from running
                        if (localIdx === 0 && validator.expectEnd) {
                                commandMatchedAtStart = true;
                        }
                        }
                }
        } // END of runValidatorsOnSegment

        // add a dedicated PRINT/LPRINT/INPUT handler (mirrors letCheck idea; returns CheckResult[])
        // keep this separate so the generic validators building (specs -> validators) can remain simple
        function printCheck(argsTextRaw: string, validatorsList: Validator[]): CheckResult[] {
        const res: CheckResult[] = [];
        const argsText = stripTrailingCommentUnquoted((argsTextRaw || '').trim());
        if (!argsText) return res;

        const parts = splitTopLevel(argsText);

        const hasTopLevelAssignment = (s: string): boolean => {
                let inString = false;
                let parenDepth = 0;
                for (let i = 0; i < s.length; i++) {
                const ch = s[i];
                if (ch === '"') { inString = !inString; continue; }
                if (inString) continue;
                if (ch === '(') { parenDepth++; continue; }
                if (ch === ')') { if (parenDepth > 0) parenDepth--; continue; }
                if (ch === '=' && parenDepth === 0) {
                        if (/([A-Z][A-Z0-9]*\$?)\s*$/.test(s.slice(0, i))) return true;
                }
                }
                return false;
        };

        for (let i = 0; i < parts.length; i++) {
                const text = (parts[i] ?? '').trim();
                if (!text) {
                res.push({ groupIndex:  1, message: 'empty expression between separators' });
                continue;
                }
                if (/^".*"$/.test(text)) continue;

                const candidate = isParenthesisedBooleanExpression(text) ? text.slice(1, -1) : text;

                const boolSpacing = findBooleanOperatorSpacingIssues(candidate);
                boolSpacing.forEach(issue => {
                res.push({
                        groupIndex:  1,
                        message: `Boolean operator ${issue.token} must be separated by whitespace (found "${issue.fragment}")`
                });
                });

                const boolSpans = splitBooleanExpression(candidate);
                if (boolSpans.length > 0) {
                        validateBooleanConnectors(candidate, boolSpans, (spanStart: number, spanEnd: number, bad: string) => {
                        res.push({
                                groupIndex:  1,
                                message: `Invalid boolean connector "${bad}" inside PRINT argument (expected AND, OR, or NOT)`
                        });
                        });
                }
                if (hasTopLevelAssignment(text)) {
                res.push({
                        groupIndex:  1,
                        message: 'PRINT: assignment not allowed here; use LET for assignments'
                });
                }

                runValidatorsOnSegment(text, validatorsList, (err, rawMatch) => {
                if (!err) return;
                const context = rawMatch && rawMatch.trim().length ? rawMatch.trim() : text;
                res.push({
                        groupIndex:  1 + (err.groupIndex || 0),
                        message: `${context}: ${err.message}`
                });
                });
        }

        return res;
        }       //END of printCheck function        
    
        // Add this helper function before refreshDiagnostics
        // Update validateLineNumbers function to include format and range checks:
        // Update validateLineNumbers function to handle NODDY internally:
        // Cleaner alternative - return an object with both errors and noddyStartLine:

        function validateLineNumbers(doc: vscode.TextDocument): { 
        errors: { line: number; start: number; end: number; message: string }[]; 
        noddyStartLine: number;
        codeBlockRanges: { start: number; end: number }[];
        } {
        const errors: { line: number; start: number; end: number; message: string }[] = [];
        let noddyStartLine = -1;
        let lastLineNum = -1;
        
        // Detect CODE block ranges using the centralized detector from z80codes.ts.
        // `detectCodeBlocks` returns blocks with `startLine` pointing at the
        // numbered CODE marker and `endLine` pointing at the final assembly line.
        // Convert these to ranges of actual assembly lines (start = startLine+1).
        const codeBlockRanges: { start: number; end: number }[] = [];
        const documentLines: string[] = [];
        for (let i = 0; i < doc.lineCount; i++) documentLines.push(doc.lineAt(i).text);
        try {
                const blocks = detectCodeBlocks(documentLines, hexBaseAddress) || [];
                for (const b of blocks) {
                        const s = (typeof b.startLine === 'number') ? b.startLine + 1 : -1;
                        const e = (typeof b.endLine === 'number') ? b.endLine : -1;
                        if (s >= 0 && e >= s) codeBlockRanges.push({ start: s, end: e });
                }
        } catch (err) {
                // Detection failed unexpectedly; fall back to no CODE blocks
                // (leave codeBlockRanges empty) — errors will be reported elsewhere.
        }

        // Helper function to check if a line is inside a CODE block
        function isInCodeBlock(lineNum: number): boolean {
                for (const block of codeBlockRanges) {
                        if (lineNum >= block.start && lineNum <= block.end) return true;
                }
                return false;
        }

        const isNoddyMarkerText = (text: string): boolean => {
                const trimmedText = (text || '').trim();
                if (/^REM\s+NODDY\s*$/.test(trimmedText)) return true;
                return /:\s*REM\s+NODDY\s*$/.test(trimmedText);
        };

        // Determine the last BASIC line (digits followed by whitespace, not in CODE blocks)
        let lastBasicLine = -1;
        for (let i = 0; i < doc.lineCount; i++) {
                const text = doc.lineAt(i).text.trim();
                if (!text) continue;
                if (isInCodeBlock(i)) continue;
                if (/^\d+\s+/.test(text)) lastBasicLine = i;
        }
        
        // Second pass: validate BASIC line numbers (skip CODE block lines and NODDY section)
        for (let i = 0; i < doc.lineCount; i++) {
                const line = doc.lineAt(i);
                const text = line.text;
                const trimmed = text.trim();

                // Skip empty lines
                if (!trimmed) {
                continue;
                }

                // Skip lines inside CODE blocks - they are assembly, not BASIC
                if (isInCodeBlock(i)) {
                continue;
                }

                // Check for NODDY trigger (REM NODDY only, must be final BASIC line)
                const noddyLineMatch = /^(\d+)\s+(.*)$/.exec(trimmed);
                if (noddyLineMatch) {
                const body = noddyLineMatch[2] || '';
                if (isNoddyMarkerText(body)) {
                        if (i === lastBasicLine) {
                        noddyStartLine = i;
                        } else {
                        const remMatch = /REM\s+NODDY/.exec(text);
                        const start = remMatch ? remMatch.index : 0;
                        const end = remMatch ? remMatch.index + remMatch[0].length : Math.min(text.length, start + 10);
                        errors.push({
                                line: i,
                                start,
                                end,
                                message: 'REM NODDY must be the final BASIC line in the listing'
                        });
                        }
                }
                }

                // Skip lines after NODDY trigger
                if (noddyStartLine >= 0 && i > noddyStartLine) {
                continue; // <-- This skips BASIC line number validation after NODDY
                }

                // Check if line starts with a BASIC line number
                // Must be decimal digits only (not hex like 400C)
                // Skip lines that start with whitespace (assembly lines)
                if (/^\s/.test(text)) {
                        continue; // Assembly line (indented), not a BASIC line
                }
                const lineNumMatch = /^(\d+)/.exec(trimmed);
                if (!lineNumMatch) {
                errors.push({
                        line: i,
                        start: 0,
                        end: Math.min(10, text.length),
                        message: 'Line must start with a BASIC line number'
                });
                continue;
                }

                const lineNum = parseInt(lineNumMatch[1], 10);

                // Check line number is in valid range
                if (lineNum < 0 || lineNum > 65535) {
                errors.push({
                        line: i,
                        start: 0,
                        end: lineNumMatch[1].length,
                        message: `Line number ${lineNum} is out of valid range (0-65535)`
                });
                }

                // Check line numbers are ascending
                if (lineNum <= lastLineNum) {
                errors.push({
                        line: i,
                        start: 0,
                        end: lineNumMatch[1].length,
                        message: `Line number ${lineNum} must be greater than previous line number ${lastLineNum}`
                });
                }

                // Check that statement after line number doesn't start with another number
                const afterLineNum = trimmed.substring(lineNumMatch[1].length).trim();
                if (afterLineNum && /^\d+/.test(afterLineNum)) {
                const secondNumMatch = /^\d+/.exec(afterLineNum);
                if (secondNumMatch) {
                        const secondNumStart = text.indexOf(secondNumMatch[0], lineNumMatch[1].length);
                        errors.push({
                        line: i,
                        start: secondNumStart,
                        end: secondNumStart + secondNumMatch[0].length,
                        message: `Unexpected line number after statement start. Only one line number is allowed per line.`
                        });
                }
                }

                lastLineNum = lineNum;
        } // END of BASIC line number validation loop

        return { errors, noddyStartLine, codeBlockRanges };
        } // END of validateLineNumbers function 

        function refreshDiagnostics(doc: vscode.TextDocument) {
                if (doc.languageId !== 'mtxbasic') { return; }
                // fresh diagnostics for this document run
                const diags: vscode.Diagnostic[] = []; //needs to be here to avoid accumalation across multiple calls

                // types CheckResult and Validator moved outside of refreshDiagnostic, top-level type aliases so functions declared earlier can use them
            
        
                // data-driven command/function specs
                // option to add to ArgSpec varName?: string and errMsg?: string for more specific reporting of issues and linking with hover info
                // option if data non continuous like baud or CRVS  32 or 40
                type ArgSpec = { kind: 'expr' | 'numeric' | 'string' | 'strexpr'; required?: boolean; min?: number; max?: number; absMin?: number; significantDigits?: number }; 
                type CmdSpec = {
                id: string;           // logical id / name shown in messages
                pattern: string;      // regex-safe name (escape $ as \\$ if needed)
                cmdname: string      //add an extra cmdtype = 'stdcmd', 'strcmd', 'numfn','strfn'
                args?: ArgSpec[];     // ordered arg expectations
                expectEnd?: boolean;
                description?: string; // optional description for hover/documentation
                };
                
                // use batticks instead of single quotes for patterns used in regex expressions. with batticks `CHR\$` rather than 'CHR\\$'. Example below uses quotes and works
                //numfn's ASC() and VAL() uses a string to return a number. strfn's CHR$ uses a number to return a string
                // , expectEnd: true  is needed for standalone commands with no arguments to avoid false positives. Still to decide if needed for AND, NOT, OR and PI
                 //use args[] as an alternative to commenting out commands to retain position in the list where validation is handled by a special block.
                const specs: CmdSpec[] = [ //consider adding specific error msgs for non-standard like theta for ARC.
                { id: 'ABS', pattern: 'ABS', cmdname:'numfn' ,args: [{ kind: 'numeric', min: -1.7014118E+38, max: 1.7014118E+38, absMin: 9.9999999E-39, significantDigits: 9 }], expectEnd: true }, //float number range +/- 1.7014118E+38 and smallest positive 9.9999999E-39
                { id: 'ADJSPR', pattern: 'ADJSPR', cmdname:'stdcmd' ,args: [{ kind: 'numeric', min: 0, max: 5 }, { kind: 'numeric', min: 0, max: 32 }, { kind: 'numeric', min: 0, max: 255 }], expectEnd: true },
                { id: 'AND', pattern: 'AND',  cmdname:'stdcmd'  ,args: [] }, //removed , expectEnd: true so that A AND B is valid
                { id: 'ANGLE', pattern: 'ANGLE',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: Math.PI*2 }], expectEnd: true }, //float number, angle in radians
                { id: 'ARC', pattern: 'ARC',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 255 }, { kind: 'numeric', min: 0 }], expectEnd: true }, //1st param is integer, 2nd param is float radians
                { id: 'ASC', pattern: 'ASC', cmdname:'numfn'  ,args: [{ kind: 'expr', min: 0, max: 255 }], expectEnd: true }, // string expression. LET A=ASC(CHR$(I)) or PRINT ASC(CHR$(I)) are allowed
                { id: 'ATN', pattern: 'ATN', cmdname:'numfn'  ,args: [{ kind: 'numeric', min: -1E+9, max: 1E+9, absMin: 9.9999999E-9, significantDigits: 9 }], expectEnd: true }, //float number, range set to avoid div by 0 overflow
                { id: 'ATTR', pattern: 'ATTR',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 3 }, { kind: 'numeric', min: 0, max: 1 }], expectEnd: true },
                { id: 'BAUD', pattern: 'BAUD',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 1 }, { kind: 'numeric', min: 75, max: 19200 }], expectEnd: true }, //BAUD allowable values 75, 110, 150, 300, 600, 1200, 2400, 4800, 9600, 19200
                { id: 'CHR$', pattern: 'CHR\\$',  cmdname:'strfn'  ,args: [{ kind: 'expr', min: 0, max: 255 }], expectEnd: true },
                { id: 'CIRCLE', pattern: 'CIRCLE',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 255}, { kind: 'numeric', min: 0, max: 191 }, { kind: 'numeric', min: 0.1, max: 255.0 }], expectEnd: true },
                { id: 'CLEAR', pattern: 'CLEAR',  cmdname:'stdcmd'  ,args: [] , expectEnd: true },
                { id: 'CLOCK', pattern: 'CLOCK',  cmdname:'strcmd'  ,args: [{ kind: 'string', min: 0, max: 999999 }], expectEnd: true },
                { id: 'CLS', pattern: 'CLS',  cmdname:'stdcmd'  ,args: [] , expectEnd: true },
                { id: 'CODE', pattern: 'CODE',  cmdname:'stdcmd'  ,args: [] , expectEnd: true },
                { id: 'COLOUR', pattern: 'COLOUR',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 4 }, { kind: 'numeric', min: 0, max: 15 }], expectEnd: true },
                { id: 'CONT', pattern: 'CONT',  cmdname:'stdcmd'  ,args: [], expectEnd: true  },
                { id: 'COS', pattern: 'COS', cmdname:'numfn'  ,args: [{ kind: 'numeric', min: -1E+9, max: 1E+9, absMin: 9.9999999E-9, significantDigits: 9 }], expectEnd: true }, //float number, range set to avoid div by 0 overflow
                { id: 'CRVS', pattern: 'CRVS',  cmdname:'stdcmd'  ,
                        args: [{ kind: 'numeric', min: 0, max: 7 }, { kind: 'numeric', min: 0, max: 1 },
                        { kind: 'numeric', min: 0, max: 255 }, { kind: 'numeric', min: 0, max: 191 },
                        { kind: 'numeric', min: 1, max: 40 }, { kind: 'numeric', min: 1, max: 24 },
                        { kind: 'numeric', min: 32, max: 40 }] // either 32 or 40 not a range. Maybe add a new flag to detect is Discrete (True) or is Continuous rage (False)
                        , expectEnd: true },
                { id: 'CTLSPR', pattern: 'CTLSPR',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 6 }, { kind: 'numeric', min: 0, max: 255 }], expectEnd: true },
                { id: 'CSR', pattern: 'CSR',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 39 }, { kind: 'numeric', min: 0, max: 23 }], expectEnd: true }, //if VS 5 (0to39) if VS 4 (0to31)
                { id: 'DATA', pattern: 'DATA',  cmdname:'stdcmd'  ,args: [], expectEnd: false},   //requires at least one value or expr. no error checking as data can be anything but it must match up with the READ statements (typically a run time error)     
                //{ id: 'DIM', pattern: 'DIM',  cmdname:'stdcmd'  ,args: [{ kind: 'expr', min: 1}], expectEnd: true }, // size ofthe array is dependent on RAM available. So DIM A(1000) is OK and DIM A(100,100) is OK but difficult to be specific.
                { id: 'DRAW', pattern: 'DRAW',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 255 }], expectEnd: true },
                { id: 'DSI', pattern: 'DSI',  cmdname:'strcmd'  ,args: [] , expectEnd: true },
                { id: 'EDITOR', pattern: 'EDITOR',  cmdname:'strcmd'  ,args: [{ kind: 'strexpr'}] , expectEnd: true }, //typically A$ format
                //{ id: 'ELSE', pattern: 'ELSE', cmdname:'stdcmd'  ,args: [{ kind: 'expr'}], expectEnd: true }, //CONTROL STRUCTURE e.g. ELSE LET B=20
                { id: 'EXP', pattern: 'EXP', cmdname:'numfn'  ,args: [{ kind: 'numeric',min:-88.0,max:88.0, absMin: 9.9999999E-9, significantDigits: 9 }], expectEnd: true }, 
                //{ id: 'FOR', pattern: 'FOR', cmdname:'stdcmd'  ,args: [{ kind: 'expr'}], expectEnd: true }, //CONTROL STRUCTURE SPECIAL
                { id: 'GENPAT', pattern: 'GENPAT',  cmdname:'stdcmd'  ,
                        args: [{ kind: 'numeric', min: 0, max: 7 }, { kind: 'numeric', min: 0, max: 255 },
                        { kind: 'numeric', min: 0, max: 255 }, { kind: 'numeric', min: 0, max: 255 },
                        { kind: 'numeric', min: 0, max: 255 }, { kind: 'numeric', min: 0, max: 255 },
                        { kind: 'numeric', min: 0, max: 255 }, { kind: 'numeric', min: 0, max: 255 },
                        { kind: 'numeric', min: 0, max: 255 },{ kind: 'numeric', min: 0, max: 255 }] 
                        , expectEnd: true },
                { id: 'GOSUB', pattern: 'GOSUB', cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 65535}] },   //CONTROL STRUCTURE range based on line number. Cannot be an expression. Can be a list of linenumbers associated with ON..GOTO
                { id: 'GOTO', pattern: 'GOTO', cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 65535}]},    //CONTROL STRUCTURE  range based on line number. Cannot be an expression. Can be a list of linenumbers associated with ON..GOTO
                { id: 'GR$', pattern: 'GR\\$',  cmdname:'strfn'  ,args: [{ kind: 'numeric', min: 0, max: 255 }, { kind: 'numeric', min: 0, max: 191 }, { kind: 'numeric', min: 0, max: 7 }], expectEnd: true },
                //{ id: 'IF', pattern: 'IF', cmdname:'stdcmd'  ,args: [{ kind: 'expr'}], expectEnd: true }, //CONTROL STRUCTURE e.g. IF A>=0 A followed by relational operator <>|<=|>=|=|<|> and can use AND,OR, NOT
                { id: 'INK', pattern: 'INK',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 15 }], expectEnd: true }, //CONTROL STRUCTURE  
                { id: 'INKEY$', pattern: 'INKEY\\$',  cmdname:'strcmd'  ,args: [], expectEnd: true }, 
                { id: 'INP', pattern: 'INP', cmdname:'numfn'  ,args: [{ kind: 'numeric', min: 0, max: 255 }], expectEnd: true },
                //{ id: 'INPUT', pattern: 'INPUT',  cmdname:'stdcmd'  ,args: [{ kind: 'expr'}], expectEnd: true }, // Can have string before a variable list. allows comma and semicolon between exprs and at end of line. Only allows ; or , before a : if another command after it (common to all)
                { id: 'INT', pattern: 'INT', cmdname:'numfn'  ,args: [{ kind: 'numeric', min: -1.7014118E+38, max: 1.7014118E+38, absMin: 9.9999999E-9, significantDigits: 9 }], expectEnd: true },
                { id: 'LEFT$', pattern: 'LEFT\\$',  cmdname:'strfn'  ,args: [{ kind: 'string'}, { kind: 'numeric', min: 0, max: 120 }], expectEnd: true }, // editor is 158 chars minus the strcmd, so limit to say 120 chars based on lnum LET NAME$=LEFT$("str..",num) = 28chars or more 
                { id: 'LEN', pattern: 'LEN', cmdname:'numfn'  ,args: [{ kind: 'expr'}], expectEnd: true },  // string expression. must have a space after LEN not to confuse with an array which has no space
                //{ id: 'LET', pattern: 'LET',  cmdname:'stdcmd'  ,args: [{ kind: 'expr'}], expectEnd: true },
                { id: 'LINE', pattern: 'LINE',  cmdname:'stdcmd'  ,
                        args: [{ kind: 'numeric', min: 0, max: 255 }, { kind: 'numeric', min: 0, max: 191 },
                        { kind: 'numeric', min: 0, max: 255 }, { kind: 'numeric', min: 0, max: 191 },] // either 32 or 40 not a range
                        , expectEnd: true },
                //{ id: 'LPRINT', pattern: 'LPRINT',  cmdname:'stdcmd'  ,args: [{ kind: 'expr'}], expectEnd: true }, // Can have string before a variable list. allows comma and semicolon between exprs and at end of line. Only allows ; or , before a : if another command after it (common to all)
                { id: 'LN', pattern: 'LN', cmdname:'numfn'  ,args: [{ kind: 'numeric',min: -1.7014118E+38, max: 1.7014118E+38, absMin: 9.9999999E-9, significantDigits: 9 }], expectEnd: true }, 
                { id: 'LOAD', pattern: 'LOAD', cmdname:'strcmd'  ,args: [{ kind: 'string' ,min: 0, max:14}], expectEnd: true }, 
                { id: 'MID$', pattern: 'MID\\$',  cmdname:'strfn'  ,args: [{ kind: 'string'}, { kind: 'numeric', min: 0, max: 120 },{ kind: 'numeric', min: 0, max: 120 }], expectEnd: true }, // editor is 158 chars minus the strcmd, so limit to say 120 chars based on lnum LET NAME$=MID$("str..",num,num) = 28chars or more 
                { id: 'MOD', pattern: 'MOD', cmdname:'numfn'  ,args: [{ kind: 'numeric'},{ kind: 'numeric' }], expectEnd: true }, //range to be confirmed
                { id: 'MVSPR', pattern: 'MVSPR', cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 1, max: 8 }, { kind: 'numeric', min: 0, max: 32 }, { kind: 'numeric', min: 0, max: 255 }], expectEnd: true }, //3rd param needs for detail
                { id: 'NEXT', pattern: 'NEXT', cmdname:'stdcmd'  ,args: [{ kind: 'expr', required:false}], expectEnd: true }, //CONTROL STRUCTURE MUST BE Alphanumeric expr. No expr is also valid
                { id: 'NEW', pattern: 'NEW',  cmdname:'stdcmd'  ,args: [] , expectEnd: true },
                { id: 'NODDY', pattern: 'NODDY',  cmdname:'stdcmd'  ,args: [], expectEnd: true,description: 'Marks the start of NODDY text language section'  }, //setup similar to CODE
                { id: 'NOT', pattern: 'NOT',  cmdname:'stdcmd'  ,args: [] },// removed , expectEnd: true so that A=NOT*5 is valid
                //{ id: 'ON', pattern: 'ON', cmdname:'stdcmd'  ,args: [{ kind: 'expr'}] }, //CONTROL STRUCTURE and associated with GOTO or GOSUB
                { id: 'OR', pattern: 'OR',  cmdname:'stdcmd'  ,args: [] }, // removed , expectEnd: true so that A=OR*5 is valid
                { id: 'OUT', pattern: 'OUT', cmdname:'numfn'  ,args: [{ kind: 'numeric', min: 0, max: 255 },{ kind: 'numeric', min: 0, max: 255 }], expectEnd: true },
                { id: 'PAPER', pattern: 'PAPER',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 15 }], expectEnd: true },
                { id: 'PAUSE', pattern: 'PAUSE',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 100000 }], expectEnd: true }, //range to be confirmed
                { id: 'PEEK', pattern: 'PEEK', cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 65535}], expectEnd: true },
                { id: 'PHI', pattern: 'PHI',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0}], expectEnd: true }, //float number, angle in radians
                { id: 'PI', pattern: 'PI',  cmdname:'stdcmd'  ,args: [] }, //removed , expectEnd: true so that A=PI*5 is valid
                { id: 'PLOD', pattern: 'PLOD',  cmdname:'strcmd'  ,args: [{ kind: 'string' }], expectEnd: true,description: 'Execute a NODDY program' },
                { id: 'PLOT', pattern: 'PLOT', cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 255},{ kind: 'numeric', min: 0, max: 191}], expectEnd: true },
                { id: 'POKE', pattern: 'POKE', cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 65535},{ kind: 'numeric', min: 0, max: 255}], expectEnd: true },
                //{ id: 'PRINT', pattern: 'PRINT',  cmdname:'stdcmd'  ,args: [{ kind: 'expr'}], expectEnd: true }, // allows comma and semicolon between exprs and at end of line. Only allows ; or , before a : if another command after it (common to all)
                { id: 'RAND', pattern: 'RAND', cmdname:'stdcmd'  ,args: [{ kind: 'numeric',min: -1.7014118E+38, max: 1.7014118E+38, absMin: 9.9999999E-39, significantDigits: 9}], expectEnd: true },
                { id: 'READ', pattern: 'READ',  cmdname:'stdcmd'  ,args: [], expectEnd: false },   //requires at least one value or expr. no error checking as data can be anything but it must match up with the DATA statements (typically a run time error)     
                { id: 'REM', pattern: 'REM',  cmdname:'strcmd'  ,args: [{ kind: 'string' }], expectEnd: true }, // can be anything - how do we avoid false positives like REM valid information where code determines that valid or Valid or VALID is part of VAL!
                { id: 'RESTORE', pattern: 'RESTORE', cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 65535}], expectEnd: true },
                { id: 'RETURN', pattern: 'RETURN',  cmdname:'stdcmd'  ,args: [], expectEnd: true  },
                { id: 'RIGHT$', pattern: 'RIGHT\\$',  cmdname:'strfn'  ,args: [{ kind: 'string'}, { kind: 'numeric', min: 0, max: 120 }], expectEnd: true }, // editor is 158 chars minus the strcmd, so limit to say 120 chars based on lnum LET NAME$=RIGHT$("str..",num) = 28chars or more 
                { id: 'RND', pattern: 'RND',  cmdname:'stdcmd'  ,args: []  }, //removed , expectEnd: true so that A=RND*5 is valid
                { id: 'ROM', pattern: 'ROM', cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 1, max: 255}], expectEnd: true }, //range to be confirmed
                { id: 'SAVE', pattern: 'SAVE', cmdname:'strcmd'  ,args: [{ kind: 'string' ,min: 0, max:14}], expectEnd: true }, 
                { id: 'SBUF', pattern: 'SBUF', cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 1, max: 8160}], expectEnd: true }, //range confirmed, see appendix 8
                { id: 'SGN', pattern: 'SGN', cmdname:'numfn'  ,args: [{ kind: 'numeric', min: -1, max: 1}], expectEnd: true }, //-1 if -ve 0 if 0 and +1 if +ve
                { id: 'SIN', pattern: 'SIN', cmdname:'numfn'  ,args: [{ kind: 'numeric', min: -1E+9, max: 1E+9, absMin: 9.9999999E-9, significantDigits: 9 }], expectEnd: true }, //float number, range set to avoid div by 0 overflow
                { id: 'SOUND', pattern: 'SOUND',  cmdname:'stdcmd'  , // 3 (direct sound) or 7 parameter continuous sound, more flexible options allowed
                        args: [{ kind: 'numeric', min: 0, max: 4 }, { kind: 'numeric', min: 0, max: 8192 }, //0-1023 for direct and 0 to 8192 for continuous sound
                        { kind: 'numeric', min: 0, max: 1023 }, { kind: 'numeric', min: -8192, max: 8192}, //vol 0-15 for direct sound, 0-1023 for continuous sound. Frequency change +/-8192
                        { kind: 'numeric', min: -1023, max: 1023 }, { kind: 'numeric', min: 0, max:65536 }, //vol change +/- 32767 but recommend +/-1023. For time, measured in 1/64ths of a second, max duration of 1024s over 17mins
                        { kind: 'numeric', min: 0, max: 1 }] 
                        , expectEnd: true },
                { id: 'SPK$', pattern: 'SPK\\$',  cmdname:'strcmd'  ,args: [] , expectEnd: true },
                { id: 'SPRITE', pattern: 'SPRITE',  cmdname:'stdcmd'  ,
                        args: [{ kind: 'numeric', min: 1, max: 32 }, { kind: 'numeric', min: 0, max: 127 }, // size 0 = 0 to 127 and size 1 = 0 to 31
                        { kind: 'numeric', min: -4095, max: 4095 },{ kind: 'numeric', min: -4095, max: 4095 },
                        { kind: 'numeric',  min: -128, max: 127  }, { kind: 'numeric',  min: -128, max: 127 }, //maxs to be confirmed
                        { kind: 'numeric', min: 0, max: 15 }] 
                        , expectEnd: true },
                { id: 'SQR', pattern: 'SQR', cmdname:'numfn'  ,args: [{ kind: 'numeric',min: -1.7014118E+38, max: 1.7014118E+38, absMin: 9.9999999E-9, significantDigits: 9}], expectEnd: true }, 
                //{ id: 'STEP', pattern: 'STEP', cmdname:'stdcmd'  ,args: [{ kind: 'numeric'}], expectEnd: true }, //CONTROL STRUCTURE . Float number, e.g. 0.1
                { id: 'STOP', pattern: 'STOP',  cmdname:'stdcmd'  ,args: [] , expectEnd: true },
                { id: 'STR$', pattern: 'STR\\$',  cmdname:'strfn'  ,args: [{ kind: 'expr', min: -1.7014118E+38, max: 1.7014118E+38, absMin: 9.9999999E-39, significantDigits: 9 }], expectEnd: true }, // e.g. STR(2+2) returns 4 as a string "4"
                { id: 'TAN', pattern: 'TAN', cmdname:'numfn'  ,args: [{ kind: 'numeric', min: -1E+9, max: 1E+9, absMin: 9.9999999E-9, significantDigits: 9 }], expectEnd: true }, //float number, range set to avoid div by 0 overflow
                //{ id: 'THEN', pattern: 'THEN', cmdname:'stdcmd'  ,args: [{ kind: 'expr'}], expectEnd: true }, //CONTROL STRUCTURE e.g. THEN LET B=10
                { id: 'TIME$', pattern: 'TIME\\$',  cmdname:'strcmd'  ,args: [], expectEnd: true  },
                //{ id: 'TO', pattern: 'TO', cmdname:'stdcmd'  ,args: [{ kind: 'expr'}], expectEnd: true }, //CONTROL STRUCTURE
                { id: 'USER', pattern: 'USER',  cmdname:'stdcmd'  ,args: [{ kind: 'string'}], }, //to be confirmed, a bit like LET
                { id: 'USR', pattern: 'USR', cmdname:'numfn'  ,args: [{ kind: 'numeric', min: 0, max: 65535}], expectEnd: true }, // typically starts at user free memory at 16384 or 32768 as before is ROM code
                { id: 'VAL', pattern: 'VAL', cmdname:'numfn'  ,args: [{ kind: 'expr' }], expectEnd: true }, // string expression. range to be confirmed
                { id: 'VIEW', pattern: 'VIEW',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 7 }, { kind: 'numeric', min: 0, max: 255 }], expectEnd: true },
                { id: 'VS', pattern: 'VS',  cmdname:'stdcmd'  ,args: [{ kind: 'numeric', min: 0, max: 7 }], expectEnd: true },
                // add other specs here; use '\\$' in pattern for names ending with $
                ];

                // build generic validators from specs and confirm MTX BASIC line and commands/functions are correctly formatted
                const validators: Validator[] = specs.map((spec) => {

                //const re = new RegExp(`\\b(?:${spec.pattern})\\s*([^:']*)`, 'gi'); 
                const re = new RegExp(`\\b(?:${spec.pattern})\\b\\s*(.*)`, ''); // case-sensitive: only uppercase keywords match specs, mixed-case caught by MIXED_CASE_KEYWORD validator
                //colon and single quote handling moved to stripTrailingCommentUnquoted function, 
                // although single quotes are not allowed in MTX BASIC unless within a double quotation string literal
                // capture args up to comment/colon Also needs to be \\b not \b as before. 
                // Also, the 2nd \\b needs to be removed as fails to pickup CIRCLE10,10,10 as an error
            return {
                    name: spec.id,
                    re,
                    expectEnd: spec.expectEnd,
                    validate: (groups: string[], rawMatch: string) => {

                    const res: CheckResult[] = [];

/**                 BEFORE the for loop (spacing and argument count errors):
                    groupIndex: 0  // Command-level errors (spacing, unexpected args)

                    INSIDE the for loop (argument-specific errors):
                    groupIndex: 1  // All argument errors - points to the argument capture group
*/

                    // after `const argsText = (groups[0] || '').trim();` or before splitting: - MIGHT NOT BE REQUIRED
                    groups[0] = stripTrailingCommentUnquoted(groups[0] ?? '');

/**                   check for too many spaces between MTX BASIC command and first argument and a check for missing space after the command
                    Most indexOf calls target fixed substrings like command names or compute positions with safe anchors 
                    (seg.text.indexOf(cond, …), etc.). The “NEXT X” issue happens only in the spacing check because it searches for the 
                    argument within rawMatch without constraining the start, so it can hit the keyword itself. Other indexOf sites already 
                    pass an offset or rely on unique tokens, so they don’t suffer the same bug. The bug is it sees 2 Xs in "NEXT X" and matches the 2nd X as the argument
                    start, leading to incorrect space calculation.
                    To fix this, we can calculate the position of the argument more reliably by using the length of the command and any known spacing.
                    This way, we avoid mistakenly matching keywords as arguments.
*/                    
                    if (rawMatch) {       
                    const trimRawMatch=rawMatch.trimStart(); //trim leading spaces to get accurate position
                    const avoidArgs=trimRawMatch.toUpperCase().indexOf(spec.id) + spec.id.length; //find first space after command name                 
                    const argText = groups[0] ?? '';
                    const hasArgsSpec = !!(spec.args && spec.args.length > 0);
                    // No-arg commands: flag multiple spaces before any following token (e.g. RETURN  ELSE)
                    if (!hasArgsSpec) {
                    const tail = trimRawMatch.slice(avoidArgs);
                    const mSpace = /^(\s+)(\S+)?/.exec(tail);
                    const space = mSpace?.[1] ?? '';
                    const hasFollowing = !!(mSpace && mSpace[2]);
                    const { multiSpaceYes, msg2 } = isMultiSpaceFound(space);
                    if (multiSpaceYes && hasFollowing && spec.id !== 'REM') {
                            res.push({ groupIndex: 0, message: msg2 });
                    }
                    }
                    const argPos = argText ? trimRawMatch.indexOf(argText, avoidArgs) : -1;
                    // extract space between COMMAND and first argument/parameter
                    // Check if this command has optional arguments
                    const isOptionalArg = spec.args && spec.args.length > 0 && spec.args[0].required === false;
                    const hasNoArgument = !argText || argText.trim() === '';
                    
                    // Special handling for commands with optional arguments (like NEXT)
                    if (isOptionalArg && hasNoArgument) {
                        // No argument provided for optional parameter - only check for multiple spaces
                        const tailAfterCmd = trimRawMatch.slice(avoidArgs);
                        const spaceMatch = /^(\s+)/.exec(tailAfterCmd);
                        if (spaceMatch) {
                            const space = spaceMatch[1];
                            const {multiSpaceYes, msg2} = isMultiSpaceFound(space);
                            if (multiSpaceYes) {
                                res.push({ groupIndex: 0, message: msg2 });
                            }
                        }
                        // Skip all other spacing checks for optional args with no argument
                    } else if (argText && argText.trim() && argPos >= 0) {
                        // Argument provided - check all spacing rules
                        const space = trimRawMatch.slice(avoidArgs, argPos);  
                        const spaceYes=isSpaceNeeded(spec.id); //true needs space. false then no space
                        const {spaceMissingYes, msg0} = isNoSpaceFound(space); 
                        const {multiSpaceYes, msg2} = isMultiSpaceFound(space);
                        const msg1=`Remove the space(s) after the command or between the function and parenthesis`;
                        if (spaceMissingYes && spaceYes) {res.push({ groupIndex: 0, message: msg0 }); 
                                } // option to delete this and return result with other results later
                        if (!spaceMissingYes && !spaceYes ) {res.push({ groupIndex: 0, message: msg1}); 
                                } // option to delete this and return result with other results later           
                        if ((multiSpaceYes && spaceYes) && spec.id!=='REM') {res.push({ groupIndex: 0, message: msg2 }); 
                                }  // option to delete this and return result with other results later
                    } else if (isOptionalArg && hasNoArgument) {
                        // No argument but optional - only check for multiple spaces (not missing space)
                        const tailAfterCmd = trimRawMatch.slice(avoidArgs);
                        const spaceMatch = /^(\s+)/.exec(tailAfterCmd);
                        if (spaceMatch) {
                            const space = spaceMatch[1];
                            const {multiSpaceYes, msg2} = isMultiSpaceFound(space);
                            if (multiSpaceYes) {
                                res.push({ groupIndex: 0, message: msg2 });
                            }
                        }
                    }}

                    

                    //LET covered earlier as could be complex expression. REM could be anything so no validation
                    // PRINT / LPRINT / INPUT are handled outside the generic validator loop via printCheck()
                    // keep the generic validator code free of PRINT/LPRINT/INPUT special cases

                    if (spec.id==='CHR$' || spec.id==='GR$' ||  spec.id==='LEFT$' || spec.id==='MID$' || spec.id==='RIGHT$' || spec.id==='STR$' ) {
                        //strip outer parentheses if present for string functions otherwise it will not correctly determine the number of arguments
                        const s=stripOuterParentheses(groups[0] || '');
                        groups[0]=s;
                    }
                    // Use splitTopLevel so commas inside parentheses or quoted strings are ignored
                    const splitGroups = splitTopLevel(groups[0] || '') || []; // replaces code below
      
                    let argsText = (groups[0] || '').trim(); 

                    let want = spec.args || [];
                
                    const parts = splitTopLevel(argsText); //why is this not splitting when args are present within function calls?
                    

                    // special case as SOUND with 1st 3 params is also OK as well as the long 7 params version
                    if (spec.id==="SOUND") {
                            if (splitGroups.length===3) { //7 args is normal, 3 args is the shortened version
                                    //skip additonal arguments
                                    argsText=trimCommaList(argsText,3);
                                    want=trimArray(want,3);
                            }
                            else if (parts.length !== 7) {
                                    res.push({ groupIndex: 1, message: `${spec.id} requires either 3 or 7 argument(s)` });
                            } 
                    } //END of SOUND argument check
                            
                    if (want.length === 0) {
                            if (argsText && spec.expectEnd) {
                            res.push({ groupIndex: 1, message: `${spec.id}: unexpected argument(s): ${argsText}` });
                            }
                            return res; //this is important to exit if no arguments wanted.
                    }

                    if (!parts[0]) { // no arguments provided
                        const a = want[0];      
                        if (a.required) {
                                res.push({ groupIndex: 1, message: `${spec.id} requires ${want.length} argument(s)` });
                        }
                        
                }

                    if (parts.length < want.length) { 
                        // Only error if at least one of the missing arguments is required
                        const hasMissingRequired = want.slice(parts.length).some(a => a.required !== false);
                        if (hasMissingRequired) {
                            res.push({ groupIndex: 1, message: `${spec.id} requires ${want.length} argument(s)` });
                        }
                     } 

                    if (spec.expectEnd && parts.length > want.length) {
                            res.push({ groupIndex: 1, message: `unexpected extra argument(s): ${parts.slice(want.length).join(', ')}` });
                    }
                    for (let i = 0; i < want.length; i++) {

                                    const a = want[i];
                                    const text = parts[i] ?? '';
                                    
                                    // Skip validation if argument is optional and empty
                                    if (a.required === false && !text.trim()) {
                                        continue;
                                    }
                                    
                                    if (a.required && !text) {
                                    res.push({ groupIndex:  1, message: `argument ${i + 1} required` });
                                    continue;
                                    }

                                    const isNumExprValid=isValidVarExprArithmetic(text); //Note isValidVarExprArithmetic tests without any parentheses
                                    const isNumValid=isValidArithmetic(text); //Note isValidArithmetic tests without any parentheses
                                    const isStrExprValid=stringExprParts(text).every(row => row[1] === true); 

                                    //At this point, the validator Command/Function is stripped out, only nested commands/functions like those above and SP$ or INKEY$
                                    //LET , LPRINT, PRINT, INPUT & IF typically can cause this issue. These are likely to be tackled in the main before validation.



                                            if ((spec.cmdname==='numfn' || spec.cmdname==='stdcmd') && (a.kind === 'expr' || a.kind === 'numeric'))  {
                                                        
                                                        if ((spec.id==='ASC' || spec.id==='LEN' || spec.id==='VAL' || text.startsWith('ASC') || text.startsWith('LEN') || text.startsWith('VAL')) && (!isStrExprValid) ){
                                                                res.push({ groupIndex:  1, message: `argument ${i + 1} is not a valid string or string expression for ${spec.id} (got ${text})` });
                                                        }
                                                        else if ((!isNumExprValid && !isNumValid && isStrExprValid)) { 
                                                            if ((spec.id==='ASC' || spec.id==='LEN' || spec.id==='VAL' || text.startsWith('ASC') || text.startsWith('LEN') || text.startsWith('VAL')) && (isStrExprValid) ){ 
                                                                //valid string expression we accept it here
                                                                } else   {
                                                                    res.push({ groupIndex:  1, message: `argument ${i + 1} is not a valid variable or arithmetic expression (got ${text})` });
                                                                }
                                                        }
                                                        else if (!isNumExprValid && !isNumValid && !isStrExprValid) { 
                                                            //example that satisfies this criteria is COLOUR 2A,A-B$ or COLOUR (),(b-a)
                                                            res.push({ groupIndex:  1, message: `argument ${i + 1} is not a valid variable or arithmetic expression (got ${text})` });
                                                        }
                                                        else if (isNumExprValid || isNumValid){ 
                                                                if (isNumValid) {
                                                                const nval = convertToNumber(text);
                                                                if (nval === null) {
                                                                        res.push({ groupIndex: 1, message: `argument ${i + 1} is not a valid number (got ${text})` });
                                                                } else {
                                                                        // existing min/max checks using nval
                                                                        if (a.min !== undefined && a.max !== undefined && Number.isSafeInteger(a.min) && Number.isSafeInteger(a.max)) {
                                                                        if (!Number.isInteger(nval) || nval < a.min || nval > a.max) {
                                                                                res.push({ groupIndex: 1, message: `argument ${i + 1} must be integer in the range ${a.min}..${a.max} (got ${text})` });
                                                                        }
                                                                        } else {
                                                                        if (!Number.isFinite(nval) || (a.min !== undefined && nval < a.min) || (a.max !== undefined && nval > a.max)) {
                                                                                res.push({ groupIndex: 1, message: `argument ${i + 1} must be in the range ${a.min}..${a.max} (got ${text})` });
                                                                        }
                                                                        // Additional MTX float constraints: smallest non-zero magnitude and significant digits
                                                                        if (typeof a.absMin === 'number' && nval !== 0 && Math.abs(nval) < a.absMin) {
                                                                                res.push({ groupIndex: 1, message: `argument ${i + 1} magnitude must be >= ${a.absMin} (got ${text})` });
                                                                        }
                                                                        if (typeof a.significantDigits === 'number' && nval !== 0 && Number.isFinite(nval)) {
                                                                                const sigDigits = countSignificantDigits(nval);
                                                                                if (sigDigits > a.significantDigits) {
                                                                                        res.push({ groupIndex: 1, message: `argument ${i + 1} must have <= ${a.significantDigits} significant digits (got ${sigDigits})` });
                                                                                }
                                                                        }
                                                                        }
                                                                }
                                                                }
                                                        }
                                            } // END of Numerical checks

                                            // if val === null we accept (expression/variables present) — other validators can analyse further

                                            else if ((spec.cmdname==='strfn' || spec.cmdname==='strcmd') && (a.kind === 'expr' || a.kind ==='string')) {

                                                    const txtNoParen=stripOuterParentheses(text); //only strips parentheses if presen

                                                    if (spec.id==='CHR$' || spec.id==='GR$' || spec.id==='STR$') {
                                                        if (!isNumExprValid && !isNumValid) {
                                                                res.push({ groupIndex:  1, message: `argument ${i + 1} should be numerical for ${spec.id} (got ${text})` });
                                                        }
                                                   else if (isNumExprValid || isNumValid){ 
                                                        if (isNumValid){
                                                                const nval = convertToNumber(text);
                                                                if (nval !== null) {  // Add null guard
                                                                if (spec.id==='CHR$' || spec.id==='GR$' || spec.id==='STR$' || text.startsWith('CHR$') || text.startsWith('GR$') || text.startsWith('STR$')) {
                                                                        if (a.min !== undefined && a.max !== undefined && Number.isSafeInteger(a.min) && Number.isSafeInteger(a.max)) {
                                                                        if ((!Number.isInteger(nval) || nval < a.min || nval > a.max)) {
                                                                                res.push({ groupIndex: 1, message: `argument ${i + 1} must be integer in the range ${a.min}..${a.max} (got ${text})` });                                                               
                                                                        }
                                                                        }
                                                                }
                                                                else if (spec.id==='STR$' || text.startsWith('STR$')) {
                                                                        if ((!Number.isFinite(nval) || (a.min !== undefined && nval < a.min) || (a.max !== undefined && nval > a.max))) {
                                                                        res.push({ groupIndex: 1, message: `argument ${i + 1} must be in the range ${a.min}..${a.max} (got ${text})` });                                                               
                                                                        }
                                                                }
                                                                }
                                                        }
                                                        }
                                                    } // END of CHR$, GR$ and STR$ checks
                                                

                                                    else if (spec.id==='LEFT$' || spec.id==='MID$'|| spec.id==='RIGHT$' || text.startsWith('LEFT$') || text.startsWith('MID$') ||text.startsWith('RIGHT$') ) { // these checks are a combination of string and numeric
                                                        if (i===0){ // first argument is string
                                                            if (!isStrExprValid ){
                                                                res.push({ groupIndex:  1, message: `argument ${i + 1} should be a string or string variable (got ${text})` });
                                                            }
                                                        } else if (i>=1){ // second and third arguments are numeric
                                                            if (!isNumExprValid && !isNumValid) {
                                                                res.push({ groupIndex:  1, message: `argument ${i + 1} should be numeric for ${spec.id} (got ${text})` });
                                                            }
                                                            else if (isNumExprValid || isNumValid){ 
                                                                if (isNumValid){
                                                                        const nval = convertToNumber(text);
                                                                        if (nval !== null) {  // Add null guard
                                                                        if ((!Number.isInteger(nval) || (a.min !== undefined && nval < a.min) || (a.max !== undefined && nval > a.max))) {
                                                                                res.push({ groupIndex: 1, message: `argument ${i + 1} must be integer and in the range ${a.min}..${a.max} (got ${text})` });                                                               
                                                                        }
                                                                        }
                                                                }
                                                            }                      
                                                        } // end of else if (i>=1)  
                                                } // END of LEFT$, MID$, RIGHT$ checks

                                                else if ((spec.id==='LOAD'|| spec.id==='SAVE'|| text.startsWith('LOAD') || text.startsWith('SAVE')) && isStrExprValid) { // LOAD and SAVE additional checks
                                                        const fn=stripAllCharacters(txtNoParen,'"'); // captured filename string, no quotes.                                                           
       
                                                        if (fn.length>14){ //only single string, not expression  
                                                                        res.push({ groupIndex:  0, 
                                                                                message: `Filename string too long for ${spec.id} (maximum 14 characters allowed)` 
                                                                        });
                                                                } // end of length check
                                                        } // END of LOAD and SAVE checks

                                                else if ((spec.id==='CLOCK' || text.startsWith('CLOCK')) && isStrExprValid) { //Clock additional checks
                                                            const digits = stripAllCharacters(txtNoParen,'"'); // captured numeric component of the string, no quotes.
                                                            //format / length check: must be exactly 6 digits
                                                            if (digits.length !== 6) {
                                                                    res.push({ groupIndex:  0, message: `CLOCK string must be exactly 6 digits (HHMMSS) (got "${digits}")` });
                                                            }
                                                            // single-number range check (leave as single number test per request)
                                                            const n = parseInt(digits, 10);
                                                            if (!Number.isInteger(n) ||(a.min !== undefined && n < a.min) || (a.max !== undefined && n > a.max)) {
                                                                    res.push({ groupIndex:  0, message: `CLOCK value out of allowed range "000000".."999999" (got "${digits}")` });
                                                                    //return results;
                                                            }
                                                        } // END of clock checks
                                                     else if (!isStrExprValid ){
                                                            res.push({ groupIndex:  1, message: `argument ${i + 1} should be a string or string variable (got ${text})` });
                                                    }
                                            } // END of String checks
                            } // END of for loop

                    return res;
                    }
            } as Validator;
            } // END of general validator code
        
        ); // END of validator

                // MTX BASIC known keywords list
                const knownKeywords = [
                        'PRINT', 'LPRINT', 'INPUT', 'LET', 'IF', 'THEN', 'ELSE', 'FOR', 'TO', 'STEP', 'NEXT',
                        'GOTO', 'GOSUB', 'RETURN', 'REM', 'DATA', 'READ', 'DIM', 'STOP', 'CONT', 'CLEAR',
                        'CODE', 'PLOT', 'CIRCLE', 'LINE', 'DRAW', 'CLS', 'COLOUR', 'COLOR', 'INK', 'PAPER', 'SOUND',
                        'ABS', 'ASC', 'ATN', 'COS', 'EXP', 'INT', 'LN', 'RND', 'SGN', 'SIN', 'SQR', 'TAN', 'VAL',
                        'CHR$', 'LEFT$', 'MID$', 'RIGHT$', 'STR$', 'LEN', 'INKEY$', 'TIME$', 'SPK$', 'GR$',
                        'PEEK', 'POKE', 'OUT', 'INP', 'USR', 'AND', 'OR', 'NOT', 'MOD', 'ON',
                        'SAVE', 'LOAD', 'VERIFY', 'RUN', 'LIST', 'NEW', 'AUTO', 'EDIT', 'PI', 'PHI',
                        'ADJSPR', 'ANGLE', 'ARC', 'ATTR', 'BAUD', 'CLOCK', 'CRVS', 'CSR', 'CTLSPR',
                        'DSI', 'EDITOR', 'GENPAT', 'LLIST', 'MVSPR', 'NODDY', 'PAUSE', 'PLOD', 'RAND',
                        'RESTORE', 'ROM', 'SBUF', 'SPRITE', 'USER', 'VIEW', 'VS'
                ];

                // Shared helper: check if a word is a mixed-case MTX BASIC keyword
                // Returns the uppercase version if it's a keyword, null otherwise
                const checkMixedCaseKeyword = (word: string): string | null => {
                        // Skip if already fully uppercase (valid)
                        if (word === word.toUpperCase()) return null;
                        
                        const upperCase = word.toUpperCase();
                        return knownKeywords.includes(upperCase) ? upperCase : null;
                };

                // Catch mixed-case keywords at the start of commands
                // Catch keywords with embedded or trailing underscores (e.g., COLOUR_, Col_our)
                validators.push({
                        name: 'MIXED_CASE_KEYWORD',
                        re: /^\s*([A-Za-z_][A-Za-z0-9_]*\$?)/,
                        expectEnd: false,
                        validate: (groups: string[], rawMatch: string) => {
                                const keyword = groups[0] || '';
                                
                                // Check if keyword contains underscores
                                if (keyword.includes('_')) {
                                        // Remove underscores and check if it matches a keyword
                                        const withoutUnderscore = keyword.replace(/_/g, '');
                                        const upperWithoutUnderscore = withoutUnderscore.toUpperCase();
                                        
                                        if (knownKeywords.includes(upperWithoutUnderscore)) {
                                                return [{
                                                        groupIndex: 1,
                                                        message: `Keywords cannot contain underscores: "${keyword}" should be "${upperWithoutUnderscore}"`
                                                }];
                                        }
                                }
                                
                                // Check for mixed-case keywords (only if no underscores)
                                const upperCase = checkMixedCaseKeyword(keyword);
                                
                                if (upperCase) {
                                        return [{
                                                groupIndex: 1,
                                                message: `Keywords must be uppercase: "${keyword}" should be "${upperCase}"`
                                        }];
                                }
                                
                                // Not a keyword or already uppercase
                                return [];
                        }
                });

                

                // Catch mixed-case keywords used as variable names in LET statements
                validators.push({
                        name: 'INVALID_LET_VARIABLE',
                        re: /^\s*LET\s+([^=\s]+)\s*=/,
                        expectEnd: false,
                        validate: (groups: string[], rawMatch: string) => {
                                const varName = groups[1] || '';
                                
                                // Check if it's NOT a valid variable name pattern [A-Z][A-Z0-9]*(\$|())
                                if (!/^[A-Z][A-Z0-9]*(?:\$(?:\([^)]+\))?|(?:\([^)]+\))?)$/.test(varName)) {
                                        // Check if it's a mixed-case keyword
                                        const upperCase = checkMixedCaseKeyword(varName);
                                        if (upperCase) {
                                                return [{
                                                        groupIndex: 1,
                                                        message: `Keywords must be uppercase: "${varName}" should be "${upperCase}"`
                                                }];
                                        }
                                        
                                        // Not a keyword, so it's an invalid variable name
                                        return [{
                                                groupIndex: 1,
                                                message: `Invalid variable name in LET statement: "${varName}". Variable names must start with uppercase letter [A-Z] and contain only uppercase letters and digits [A-Z0-9]`
                                        }];
                                }
                                return [];
                        }
                });

                // Check line numbers first and suppress NODDY lines
                // Check line numbers first - also detects NODDY trigger line AND CODE block ranges
                const { errors: lineNumErrors, noddyStartLine,codeBlockRanges } = validateLineNumbers(doc);

                for (const err of lineNumErrors) {
                const range = new vscode.Range(
                        new vscode.Position(err.line, err.start),
                        new vscode.Position(err.line, err.end)
                );
                diags.push(new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Error));
                }  // END of line number errors check

                // Helper function to check if a line is inside a CODE block
                function isInCodeBlock(lineNum: number): boolean {
                        for (const block of codeBlockRanges) {
                        if (lineNum >= block.start && lineNum <= block.end) {
                                return true;
                        }
                        }
                        return false;
                }

                // ============================================
                // Z80 CODE BLOCK VALIDATION - PART 1
                // Validate assembly lines BEFORE the main BASIC loop
                // ============================================
                
                for (const block of codeBlockRanges) {
                        for (let i = block.start; i <= block.end; i++) {
                        const lineText = doc.lineAt(i).text;
                        const trimmed = lineText.trim();
                        
                        // Skip empty lines
                        if (!trimmed) continue;
                        
                        // Parse and validate Z80 assembly line
                        // This is where your Z80 validation goes
                        // For now, just skip - no errors for assembly lines
                        
                        // Optional: Add Z80 validation here using z80codes.ts functions
                        // const parsed = parseZ80Line(lineText, i);
                        // if (parsed) {
                        //     const z80Errors = validateZ80Instruction(parsed);
                        //     for (const err of z80Errors) {
                        //         diags.push(new vscode.Diagnostic(...));
                        //     }
                        // }
                        }
                }

                // ============================================
                // MAIN BASIC VALIDATION LOOP
                // ============================================

                // GOSUB nesting counter: count occurrences of GOSUB segments
                // encountered during static validation. If the count exceeds the
                // MTX BASIC limit of 34 nested GOSUBs, emit an error on the
                // offending segment. This is a conservative static check.
                let gosubCount = 0;

                // run validators over each line (updated to handle multiple commands per line)
                // STOP at NODDY trigger line - lines after it are NODDY content, not BASIC
                for (let i = 0; i < doc.lineCount; i++) {
                        // Skip lines after NODDY trigger
                        if (noddyStartLine >= 0 && i > noddyStartLine) {
                        break;
                        }

                        // Skip lines inside CODE blocks - these are Z80 assembly, not BASIC
                        if (isInCodeBlock(i)) {
                        continue; // Skip entire line - already validated above
                        }

                        const line = doc.lineAt(i);
                        const lineText = line.text;
                        const trimmedLine = lineText.trim();

                        // Skip empty lines
                        if (!trimmedLine) {
                        continue;
                        }

                        // Check if this is a single-line numbered CODE marker (e.g. "57 CODE").
                        // This line is a valid BASIC directive that signals the start of a Z80
                        // assembly block; the assembly lines inside the block are validated
                        // earlier via `codeBlockRanges`. Skip generic BASIC validators for
                        // this marker only so we don't flag the correct form as an error.
                        if (/^\d+\s+CODE\s*$/.test(trimmedLine)) {
                                // valid marker - nothing more to check here
                                continue;
                        }

                // MTX BASIC inline editor has a max line length of 158 characters
                // the 1st line is indented by 1 character and the last line requires a character space for the cursor at the end of the line.
                // Maximum line length is 158 characters including line number and space.
                if (line.text.length>=158){ // range is 0 to 158 (158 characters max)
                        const range = new vscode.Range(new vscode.Position(i, 158), new vscode.Position(i, line.text.length));
                        diags.push(new vscode.Diagnostic(range, `Line exceeds maximum length of 158 characters (got ${line.text.length})`, vscode.DiagnosticSeverity.Error));
                }

                // Flag RETURN  ELSE (double space) before ELSE colon injection
                const returnElseDoubleSpace = (() => {
                let inString = false;
                const upper = line.text.toUpperCase();
                for (let j = 0; j < line.text.length; j++) {
                        if (line.text[j] === '"') { inString = !inString; continue; }
                        if (inString) continue;
                        if (upper.startsWith('RETURN', j) && (j === 0 || !/[A-Z0-9_$]/.test(line.text[j - 1]))) {
                                const after = line.text.slice(j + 6);
                                const m = /^(\s{2,})ELSE\b/.exec(after);
                                if (m) {
                                        return { start: j + 6, len: m[1].length };
                                }
                        }
                }
                return null;
                })();

                if (returnElseDoubleSpace) {
                const rangeStart = returnElseDoubleSpace.start;
                const rangeEnd = rangeStart + returnElseDoubleSpace.len;
                diags.push(new vscode.Diagnostic(
                        new vscode.Range(new vscode.Position(i, rangeStart), new vscode.Position(i, rangeEnd)),
                        'RETURN must be followed by a single space before ELSE',
                        vscode.DiagnosticSeverity.Error
                ));
                }

                // Pre-process: inject colon before ELSE if it follows a command without one
                // Only applies to lines containing IF...THEN...ELSE
                let processedLineText = line.text;

                // Check if line has IF...THEN...ELSE pattern (ELSE not in quotes)
                const hasIfThenElse = (() => {
                let inString = false;
                const upper = line.text.toUpperCase();
                for (let j = 0; j < line.text.length; j++) {
                        if (line.text[j] === '"') { inString = !inString; continue; }
                        if (inString) continue;
                        // Look for IF...THEN before checking for ELSE
                        if (upper.slice(j).match(/^\s*IF\b.*\bTHEN\b.*\bELSE\b/)) {
                        return true;
                        }
                }
                // Simpler check: does the line contain IF, THEN, and ELSE outside quotes?
                let ifFound = false, thenFound = false, elseFound = false;
                inString = false;
                for (let j = 0; j < line.text.length; j++) {
                        if (line.text[j] === '"') { inString = !inString; continue; }
                        if (inString) continue;
                        const slice = upper.slice(j);
                        if (!ifFound && slice.startsWith('IF') && (j === 0 || !/[A-Z0-9_$]/.test(line.text[j-1]))) {
                        ifFound = true;
                        }
                        if (ifFound && !thenFound && slice.startsWith('THEN') && (j === 0 || !/[A-Z0-9_$]/.test(line.text[j-1]))) {
                        thenFound = true;
                        }
                        if (thenFound && !elseFound && slice.startsWith('ELSE') && (j === 0 || !/[A-Z0-9_$]/.test(line.text[j-1]))) {
                        elseFound = true;
                        }
                }
                return ifFound && thenFound && elseFound;
                })();

                if (hasIfThenElse) {
                // Inject colon before ELSE (outside quotes) if not already preceded by colon
                let result = '';
                let inString = false;
                const upper = line.text.toUpperCase();
                
                for (let j = 0; j < line.text.length; j++) {
                        if (line.text[j] === '"') { 
                        inString = !inString; 
                        result += line.text[j];
                        continue; 
                        }
                        if (inString) {
                        result += line.text[j];
                        continue;
                        }
                        
                        // Check for ELSE keyword at this position
                        if (upper.slice(j, j + 4) === 'ELSE') {
                        const charBefore = j > 0 ? line.text[j - 1] : ' ';
                        const charAfter = j + 4 < line.text.length ? line.text[j + 4] : ' ';
                        // Verify it's a word boundary
                        if (!/[A-Z0-9_$]/.test(charBefore) && !/[A-Z0-9_$]/.test(charAfter)) {
                                // Check if already preceded by colon (ignoring whitespace)
                                const beforeElse = result.trimEnd();
                                if (!beforeElse.endsWith(':')) {
                                result = result.trimEnd() + ': ';
                                }
                        }
                        }
                        result += line.text[j];
                }
                processedLineText = result;
                }

                const segments = splitLineSegments(processedLineText); // Changed from line.text                

                //const segments = splitLineSegments(line.text); // each { text, start }

                for (const seg of segments) {

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
                        
                        // --- compute quoted-string ranges for this segment so diagnostics ignore text inside quotes ---
                        const stringRanges: [number, number][] = [];
                        let inStr = false;
                        let strStart = 0;
                        for (let si = 0; si < seg.text.length; si++) {
                                if (seg.text[si] === '"') {
                                if (!inStr) { inStr = true; strStart = si; }
                                else { inStr = false; stringRanges.push([strStart, si + 1]); }
                                }
                        }
                        const isInString = (pos: number | undefined) => {
                                if (typeof pos !== 'number' || pos < 0) return false;
                                //the final validator block thinks every position is “inside a quoted string” and skips all diagnostics. 
                                //return stringRanges.every(r => pos >= r[0] && pos < r[1]);
                                return stringRanges.some(r => pos >= r[0] && pos < r[1]);
                        };
                // --- end quoted-string helper ---  
                // simple scan to flag any numeric literal over 9 significant digits
                // this runs once per BASIC segment and skips CODE/NODDY lines so we
                // don't need to duplicate the check in every validator callback.
                const scanNumericLiteralsInSegment = (text: string, absStart: number, lineNum: number) => {
                if (/^\s*(?:\d+\s+)?CODE\b/i.test(text)) return;
                if (/^\s*NODDY\b/i.test(text)) return;
                const numRe = /([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g;
                let m: RegExpExecArray | null;
                while ((m = numRe.exec(text)) !== null) {
                        const raw = m[1];
                        const relIdx = m.index + (m[0].indexOf(raw) >= 0 ? m[0].indexOf(raw) : 0);
                        const absIdx = absStart + relIdx;
                        if (isInString(absIdx)) continue;
                        if (!isNumericLiteral(raw)) continue;
                        const nval = convertToNumber(raw);
                        if (!Number.isFinite(nval)) continue;
                        if (nval !==null){
                                const sig = countSignificantDigits(nval);
                                if (sig > 9) {
                                const r = new vscode.Range(new vscode.Position(lineNum, absIdx), new vscode.Position(lineNum, absIdx + raw.length));
                                diags.push(new vscode.Diagnostic(r, `Numeric literal has ${sig} significant digits (max 9)`, vscode.DiagnosticSeverity.Error));
                                }}
                }
                };

                // run once per segment to catch any bare literal anywhere
                scanNumericLiteralsInSegment(seg.text, seg.start, i);

                // START OF VALIDATION, starting with the specials then the general

                let rhs: string[] = [];

                //new flags to avoid double validation
                let segHandled: boolean = false; 
                let letFlag:boolean =false; 
                let printFlag: boolean = false;
                let ifFlag: boolean = false;
                let thenFlag: boolean = false;
                let elseFlag: boolean = false;
                let forFlag: boolean = false;
                let toFlag: boolean = false;
                let stepFlag: boolean = false;
                let nextFlag: boolean = false;
                let onFlag: boolean = false;
                let gotoFlag: boolean = false;
                let gosubFlag: boolean = false;
                let returnFlag: boolean = false;
                let dataFlag: boolean = false;
                let readFlag: boolean = false;
                let inputFlag: boolean = false;
                let dimFlag: boolean = false;
                let codeFlag: boolean = false;

                // Match assignments not preceded by LET (BareAssignment) when they should
                const bareAss= /^\s*(?:\d+\s+)?(?!LET\b)([A-Z][A-Z0-9]*\$?)\s*=/.exec(seg.text);
                const bstart = seg.start
                const brange = new vscode.Range(new vscode.Position(i, bstart), new vscode.Position(i, bstart + 3)); //length for testing only
                if (bareAss){
                        const varName = bareAss[1] || '';

                        // Skip built-in variables - not sure the validity of these builtInVars exceptions
                        const builtInVars = new Set([ 'INKEY$', 'SPK$', 'TIME$']); //removed GR$ as this is a string function
                        if (!builtInVars.has(varName.toUpperCase())) {
                                diags.push(new vscode.Diagnostic(brange,
                                `Assignment requires LET command - use 'LET ${varName}='`,
                        vscode.DiagnosticSeverity.Error));
                        }
                } // END of BareAssignment validator

                //Guard to capture a string only line, for example "string only test"
                const strOnlyLine=/^\s*"(?:[^"\\]|\\.)*"\s*$/.exec(seg.text);
                const srange = new vscode.Range(new vscode.Position(i, seg.start), new vscode.Position(i, seg.start + seg.text.length));
                if (strOnlyLine){
                                diags.push(new vscode.Diagnostic(srange,
                                `Unexpected literal: string only not a proper assignment ${seg.text}='`,
                        vscode.DiagnosticSeverity.Error));
                        continue;
                } 

                //guard to capture REM without space after it
                const remNoSpace = /^\s*REM\S+/.exec(seg.text);
                if (remNoSpace) {
                const start = seg.start + remNoSpace.index! + 3;
                const range = new vscode.Range(new vscode.Position(i, start), new vscode.Position(i, start + seg.text.length));
                diags.push(new vscode.Diagnostic(
                        range,
                        'REM must be followed by a space before comment text',
                        vscode.DiagnosticSeverity.Error
                ));
                }
                
                // GOSUB nested-call counter: if this segment is a GOSUB command - THIS CODE ONLY COUNTS TOTAL NUMBER OF GOSUBS
                //NESTED is when a GOSUB is called within another GOSUB subroutine. This is hard to determine with static analysis.
                // (not inside a REM or a quoted string) increment the counter and
                // report an error when it exceeds 34.
/**                 const gosubStartMatch = /^\s*GOSUB\b/.exec(seg.text);
                if (gosubStartMatch) {
                        // Ensure this occurrence is not inside a quoted string
                        const gosubIdx = seg.text.toUpperCase().indexOf('GOSUB');
                        if (!isInString(gosubIdx)) {
                                gosubCount++;
                                if (gosubCount > 34) {
                                        const absIdx = seg.start + gosubIdx;
                                        const range = new vscode.Range(new vscode.Position(i, absIdx), new vscode.Position(i, absIdx + 6));
                                        diags.push(new vscode.Diagnostic(range, 'Too many nested GOSUBs (maximum 34)', vscode.DiagnosticSeverity.Error));
                                }
                        }
                }
*/               

                // Check LET assignments for type compatibility helper
                // Allow array subscripts: YCMAX=5, Y(I,J)=10, F$(1)="text"
                const letMatch = /^\s*LET\s+([A-Z][A-Z0-9]*(?:\$(?:\([^)]+\))?|(?:\([^)]+\))?))\s*=\s*(.+)$/.exec(seg.text);
                if (letMatch) {

                        // The leading comma skips element 0 (the full match)
                        // lhs receives element 1 (the identifier after LET).
                        // rhs receives element 2 (the expression after =).
                        const [, lhsText, rhsText] = letMatch; //is array destructuring with a hole (the empty slot before the first comma)
                        const lhsIsString =isValidStrVarName(lhsText ?? '');//lhs.endsWith('$');
                        const lhsIsVariable=isValidVarName(lhsText ?? '');
                        const rhsIsString = stringExprParts(rhsText ?? ''); 
                        const rhsIsNumeric = varExprParts(rhsText ?? ''); //checks for numeric variables and numeric expressions
                        

                        const start = seg.start + Math.max(0, seg.text.indexOf(rhsText));
                        const range = new vscode.Range(new vscode.Position(i, start), new vscode.Position(i, start + rhsText.length));
                        rhs=letCheck(lhsText ?? '',rhsText ?? '',range,diags); //returns an array of RHS parts to process further or [] if error 

                        //still to check for valid numerical expressions.
                        //Appears the split errors occur in the validation section of the code, so conside converting to a function once rhsIsNumeric is conpleted.
                        //at this point only looking for highlevel overview if the LET statement is valid or not. The validation section to assess the validity of each component.

                                //special handling for LET as could be complex expression on RHS
                                if (rhs.length!==0){
                                // process each part of RHS further
                                for (const itemInRhs of rhs) {
                                const rhsPart = typeof itemInRhs === 'string' ? itemInRhs : (itemInRhs[0] ?? '');
                                const t = rhsPart.trim();

                                // skip standalone arithmetic operator tokens
                                if ((!t || t === '+' || t === '-' || t === '*' || t === '/' || t === '^') && t.length === 1) {
                                        continue;
                                }

                                // detect double operators like ++, ** etc.
                                if (/[+\-*\/\^]{2,}/.test(t)) {
                                        diags.push(new vscode.Diagnostic(range,
                                        `Error in LET RHS: double arithmetic operators found (NB: exception double -ve gives a +ve). (got '${t}')`,
                                        vscode.DiagnosticSeverity.Error));
                                        continue;
                                }

                                // Accept only parenthesised boolean comparisons (e.g. (PX=31)) when '=' appears in part
                                if (!isParenthesisedBooleanExpression(t) && t.includes('=')) {
                                        diags.push(new vscode.Diagnostic(range,
                                        `LET RHS does not contain a parenthesised boolean expression (e.g. (PX=31)); got '${t}'`,
                                        vscode.DiagnosticSeverity.Error));
                                        continue;
                                }

                                // re-apply validators to RHS expression
                                runValidatorsOnSegment(rhsPart, validators, (err, rawMatch2) => {
                                if (!err) return;
                                // try to locate rawMatch2 within rhsText to get a useful highlight; fall back to whole rhs range
                                const innerIdx = rhsText ? rhsText.indexOf(rawMatch2) : -1;
                                const absIdx = (innerIdx >= 0) ? (start + innerIdx) : seg.text.indexOf(rawMatch2, (letMatch.index ?? 0));
                                const diagStart = (absIdx >= 0) ? absIdx : start;
                                const diagEnd = diagStart + (rawMatch2.length || 1);
                                if (isInString(diagStart)) return;
                                // If the matched token is a numeric literal, double-check significant digits
                                if (isNumericLiteral(rawMatch2)) {
                                        const nval = convertToNumber(rawMatch2);
                                        if (Number.isFinite(nval) && nval !==null) {
                                        const sig = countSignificantDigits(nval);
                                        if (sig > 9) {
                                                diags.push(new vscode.Diagnostic(
                                                new vscode.Range(new vscode.Position(i, diagStart), new vscode.Position(i, diagEnd)),
                                                `LET RHS numeric literal has ${sig} significant digits (max 9)`,
                                                vscode.DiagnosticSeverity.Error
                                                ));
                                                return;
                                        }
                                        }
                                }
                                diags.push(new vscode.Diagnostic(
                                        new vscode.Range(new vscode.Position(i, diagStart), new vscode.Position(i, diagEnd)),
                                        `Error in group '${err.groupIndex}': ${err.message}`,
                                        vscode.DiagnosticSeverity.Error));
                                });
                                } // end for
                        } else {
                                // letCheck already pushed diagnostics for malformed LET; nothing more to do here
                        }

                        letFlag = true; // skip further generic validation for this segment
                        segHandled = true;
                        } else {
                        // no LET on this segment
                        rhs = [];
                        letFlag = false;
                } // end of LET type check 


/**               Specials capture the rest of the PRINT/LPRINT arguments (no global flag)
                Rules and Examples
                1 PRINT A=5         -> Error (assignment not allowed)
                2 PRINT "A=5"      -> OK (inside quotes)
                3 PRINT A + B=10   -> Error (assignment not allowed)
                4 PRINT A + "B=10" -> OK (inside quotes)
                5 PRINT A + B       -> OK (no assignment)
                6 PRINT "A" + "B=10" -> OK (inside quotes)
                7 PRINT
                8 PRINT A,,,         // multiple commas allowed
                9 PRINT A;B;C
                10 PRINT 1;A,2,,
                11 PRINT "TEST";A$,C
                12 PRINT (NOT 2=2)            // OK (BOOLEAN comparison must be inside parentheses)
                13 PRINT (NOT 2=2 OR 3=2)
                14 PRINT (2*2=5 OR 3+34 OR 2=2 AND 1=2)
                15 PRINT FUNCN(expr) // VALID function with numeric expression including specials like ASC(expr$)
                16 PRINT FUNC$(expr$) // VALID function with string expression including specials like CHR$(expr)
                17 PRINT TIME$;CHR$(26)
                18 PRINT "VALUE=";VAL("123")+10
                19 PRINT "LEN=";LEN("TEST")+5
                20 BOOLEAN EXPRESSIONS (AND, NOT, OR) and relational operators (=|<>|<=|>=|<|>) must be inside parentheses
                21 IF A=10 THEN PRINT "A is ten" ELSE PRINT "A is not ten"  // OK (assignment in IF, not PRINT)
                as above for LPRINT
*/
                const printAss = /^\s*(?:PRINT|LPRINT)\s*(.*)$/.exec(seg.text);
                if (printAss) {
                const argsTextRaw = (printAss[1] || '').trim();
                const printErrors = printCheck(argsTextRaw, validators);
                    if (printErrors && printErrors.length) {
                        // locate args start within this segment (best-effort)
                        const segMatchIndex = printAss.index ?? seg.text.indexOf(printAss[0]);
                        const argsOffsetInSeg = Math.max(0, seg.text.indexOf(argsTextRaw, segMatchIndex));
                        const startChar = seg.start + argsOffsetInSeg;
                        const endChar = startChar + (argsTextRaw.length || 1);
                        for (const e of printErrors) {
                        if (!e) continue;  // Skip null entries
                        const range = new vscode.Range(
                                new vscode.Position(i, startChar),
                                new vscode.Position(i, endChar)
                        );
                        diags.push(new vscode.Diagnostic(
                                range,
                                e?.message ?? 'PRINT argument error',
                                vscode.DiagnosticSeverity.Error
                        ));
                        }
                    }
                printFlag = true;
                segHandled = true;
                } //END of printAss
        
/**               Special
                Rules for INPUT statements
                INPUT {optional <string> surrounded by double quotes};<variable_list separated by commas>
                If the <string> is present it must be followed by a semicolon
                INPUT: check for valid variable names only (no expressions) separated by commas or semicolons
                INPUT "ENTER TEXT";A$
                INPUT "ENTER NUMBER";A
                INPUT A,B,ABC$
                invalid cases include
                INPUT "prompt text",A => error missing semicolon after prompt, comma used instead
                INPUT "prompt text" A => erro misisng semicolon after prompt
                INPUT "prompt text";A;B,C;D  => error variables only separated by commas
                INPUT A B => error missing comma between variables
*/
                const inputMatch = /^\s*INPUT\s+(.+)$/.exec(seg.text);
                if (inputMatch) {
                const raw = inputMatch[1].trim();
                let promptPart = '';
                let varsPart = raw;
                let varsPartOffset = (inputMatch.index ?? 0) + (seg.text.slice(inputMatch.index ?? 0).indexOf(raw) || 0);

                // Detect optional quoted prompt followed by exactly one semicolon
                if (raw.startsWith('"')) {
                        const closingQuote = raw.indexOf('"', 1);
                        if (closingQuote > 0 && raw[closingQuote + 1] === ';') {
                        promptPart = raw.slice(0, closingQuote + 1);
                        varsPart = raw.slice(closingQuote + 2).trimStart();
                        varsPartOffset += closingQuote + 2 + (raw.slice(closingQuote + 2).length - varsPart.length);
                        } else {
                        const start = seg.start + seg.text.toUpperCase().indexOf('INPUT');
                        diags.push(new vscode.Diagnostic(
                                new vscode.Range(new vscode.Position(i, start), new vscode.Position(i, start + 5)),
                                'INPUT prompt must be a quoted string followed by a semicolon',
                                vscode.DiagnosticSeverity.Error
                        ));
                        }
                }

                // Any semicolon that survives in varsPart is invalid (only the prompt delimiter may be a semicolon)
                let searchIdx = varsPart.indexOf(';');
                while (searchIdx !== -1) {
                        const absolute = seg.start + varsPartOffset + searchIdx;
                        diags.push(new vscode.Diagnostic(
                        new vscode.Range(new vscode.Position(i, absolute), new vscode.Position(i, absolute + 1)),
                        'INPUT: only the semicolon after the prompt is allowed; use commas between variables',
                        vscode.DiagnosticSeverity.Error
                        ));
                        searchIdx = varsPart.indexOf(';', searchIdx + 1);
                }

                const vars = splitTopLevel(varsPart).map(v => v.trim()).filter(Boolean);
                if (!vars.length) {
                        const start = seg.start + seg.text.toUpperCase().indexOf('INPUT');
                        diags.push(new vscode.Diagnostic(
                        new vscode.Range(new vscode.Position(i, start), new vscode.Position(i, start + 5)),
                        'INPUT requires at least one target variable',
                        vscode.DiagnosticSeverity.Error
                        ));
                } else {
                        vars.forEach(v => {
                        if (!isValidVarName(v) && !isValidStrVarName(v)) {
                                const idx = seg.text.indexOf(v, inputMatch.index ?? 0);
                                const startChar = seg.start + (idx >= 0 ? idx : 0);
                                diags.push(new vscode.Diagnostic(
                                new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, startChar + v.length)),
                                `INPUT target must be a simple variable (got "${v}")`,
                                vscode.DiagnosticSeverity.Error
                                ));
                        }
                        });
                }

                inputFlag = true;
                segHandled = true;
                } // END of INPUT statement validation

/**               Special
                Rules for IF..THEN..ELSE statements
                IF: check comparisons in the condition for string vs numeric mismatches
                IF test_condition THEN outcome1 (optional ELSE outcome2)
                test_condition can have multiple comparisons combined with AND, OR, NOT etc and involves relational operators
                outcomes 1 and 2 to be split out later for further processing if needed
                outcomes 1 and 2 are typically PRINT, LET or GOTO linenumber or GOSUB linenumber and occasionally other commands/functions
                For now, just check that comparisons do not mix string and numeric types
                all must be on the same line. If separated over multiple lines, throw a syntax error as required by MTX BASIC
                Consider return indices and substrings: {condStart,condEnd,thenStart,thenEnd,elseStart,elseEnd,cond,then,else}.
*/
                const ifMatch = /^\s*IF\s+(.+?)\s+THEN\s+(.+?)(?:\s+ELSE\s+(.+?))?\s*$/.exec(seg.text);
                if (ifMatch) {
                const cond = ifMatch[1] ?? '';
                const thenPart = (ifMatch[2] ?? '').trim();
                const elsePart = (ifMatch[3] ?? '').trim();
                const condStart = seg.text.indexOf(cond, ifMatch.index ?? 0); // used for position of error

                const boolCondIssues = findBooleanOperatorSpacingIssues(cond);
                boolCondIssues.forEach(issue => {
                const startChar = seg.start + condStart + issue.start;
                const endChar = seg.start + condStart + issue.end;
                const range = new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar));
                diags.push(new vscode.Diagnostic(
                        range,
                        `Boolean operator ${issue.token} must be separated by whitespace (found "${issue.fragment}")`,
                        vscode.DiagnosticSeverity.Error
                ));
                });

                // Validate comparisons in condition (skip comparisons inside quoted strings)
//                const cmpRe = /([^<>=!]+?)\s*(=|<>|<=|>=|<|>)\s*([^<>=!]+)/g;
//                let cm: RegExpExecArray | null;

                const condSpans = splitBooleanExpression(cond);
                validateBooleanConnectors(cond, condSpans, (spanStart: number, spanEnd: number, bad: string) => {
                const startChar = seg.start + condStart + spanStart;
                const endChar = seg.start + condStart + spanEnd;
                diags.push(new vscode.Diagnostic(
                        new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)),
                        `Invalid boolean connector "${bad}" (expected AND, OR, or NOT)`,
                        vscode.DiagnosticSeverity.Error
                ));
                });

/**             The mismatch happens because the IF comparison logic currently decides “string vs. numeric” 
                by running stringExprParts / varExprParts on the whole side. For ASC(SPK$) that returns 
                “string” (it sees the $ argument) before varExprParts ever marks it numeric, so the comparison
                trips the (lhsHasStr && rhsHasNum) rule.
                Fix: classify each side with a helper that looks at the top-level expression 
                (simple variable vs. known string / numeric functions) before falling back to the 
                expansive part-scans. Use classifyExpr to get lhsType and rhsType.
*/
                // Split condition by AND/OR first, then validate each comparison
                const condUpper = cond.toUpperCase();
                let inString = false;
                let currentPart = '';
                let currentStart = 0;
                const condParts: { text: string; start: number }[] = [];

                for (let j = 0; j <= cond.length; j++) {
                    if (j < cond.length && cond[j] === '"') {
                        inString = !inString;
                        currentPart += cond[j];
                        continue;
                    }
                    
                    if (inString) {
                        if (j < cond.length) currentPart += cond[j];
                        continue;
                    }
                    
                    // Check for AND/OR at word boundary
                    const slice = condUpper.slice(j);
                    let matched = false;
                    
                    for (const op of [' AND ', ' OR ']) {
                        if (slice.startsWith(op)) {
                            if (currentPart.trim()) {
                                condParts.push({ text: currentPart.trim(), start: currentStart });
                            }
                            j += op.length - 1;
                            currentStart = j + 1;
                            currentPart = '';
                            matched = true;
                            break;
                        }
                    }
                    
                    if (!matched && j < cond.length) {
                        if (currentPart === '') {
                            currentStart = j;
                        }
                        currentPart += cond[j];
                    }
                }

                // Don't forget the last part
                if (currentPart.trim()) {
                    condParts.push({ text: currentPart.trim(), start: currentStart });
                }

                // Now validate each individual comparison
                for (const part of condParts) {
                    // Strip leading NOT if present
                    let compText = part.text.trim();
                    let notOffset = 0;
                    const notMatch = /^\s*NOT\s+/.exec(compText);
                    if (notMatch) {
                        notOffset = notMatch[0].length;
                        compText = compText.slice(notOffset);
                    }
                    
                    const cmpRe = /([^<>=!]+?)\s*(=|<>|<=|>=|<|>)\s*([^<>=!]+)/g;
                    let cmpMatch: RegExpExecArray | null;
                    
                    while ((cmpMatch = cmpRe.exec(compText)) !== null) {
                        const lhs = (cmpMatch[1] ?? '').trim();
                        const rhs = (cmpMatch[3] ?? '').trim();
                        
                        const lhsType = classifyExpr(lhs);
                        const rhsType = classifyExpr(rhs);
                        
                        if ((lhsType.hasString && rhsType.hasNumeric) || (lhsType.hasNumeric && rhsType.hasString)) {
                            const absStart = seg.start + condStart + part.start + notOffset + (cmpMatch.index ?? 0);
                            if (isInString(absStart)) continue;
                            const range = new vscode.Range(
                                new vscode.Position(i, absStart),
                                new vscode.Position(i, absStart + cmpMatch[0].length)
                            );
                            diags.push(new vscode.Diagnostic(
                                range,
                                `Type mismatch in IF comparison: ${lhs} (${lhsType.hasString ? 'string' : 'numeric'}) vs ${rhs} (${rhsType.hasString ? 'string' : 'numeric'})`,
                                vscode.DiagnosticSeverity.Error
                            ));
                        }
                    }
                }


                    // helper to compute chunk start index in seg.text (best-effort)
                    const chunkStartIndex = (piece: string) => {
                        // prefer searching after the IF match index (to avoid earlier same-text matches)
                        const searchFrom = (ifMatch.index ?? 0) + (cond.length || 0);
                        const idx = seg.text.indexOf(piece, searchFrom);
                        return idx >= 0 ? idx : seg.text.indexOf(piece);
                    };

                // Validate the THEN and ELSE outcome expressions/commands using the same safe validator runner
                // thenPart/elsePart may be command sequences (e.g. PRINT ..., LET ...), validate them as segments
                // Validate THEN chunks
                if (thenPart) {
                const thenText = stripTrailingCommentUnquoted(thenPart).trim();
                if (thenText && !/^".*"$/.test(thenText)) {
                        const chunkIdx = chunkStartIndex(thenText);
                        const chunkStart = seg.start + (chunkIdx >= 0 ? chunkIdx : 0);
                        const chunkRange = new vscode.Range(new vscode.Position(i, chunkStart), new vscode.Position(i, chunkStart + thenText.length));

                        // Allow array subscripts in THEN: LET Y(I,J)=10, F$(1)="text"
                        const letM = /^\s*LET\s+([A-Z][A-Z0-9]*(?:\$(?:\([^)]+\))?|(?:\([^)]+\))?))\s*=\s*(.+)$/.exec(thenText);
                        if (letM) {
                        const [, lhs, rhsText] = letM;
                        const rhsParts = letCheck(lhs ?? '', rhsText ?? '', chunkRange, diags);
                        if (!rhsParts || rhsParts.length === 0) {
                                diags.push(new vscode.Diagnostic(chunkRange, `THEN: invalid LET statement`, vscode.DiagnosticSeverity.Error));
                        } else {
                                rhsParts.forEach(itemInRhs => {
                                const rhsPart = typeof itemInRhs === 'string' ? itemInRhs : (itemInRhs[0] ?? '');
                                if (!rhsPart.trim() || isParenthesisedBooleanExpression(rhsPart)) return;
                                runValidatorsOnSegment(rhsPart, validators, (err, rawMatch2) => {
                                        if (!err) return;
                                        const innerIdx = thenText.indexOf(rawMatch2);
                                        const globalIdx = (innerIdx >= 0 && chunkIdx >= 0) ? seg.start + chunkIdx + innerIdx : seg.text.indexOf(rawMatch2, (ifMatch.index ?? 0));
                                        if (isInString(globalIdx)) return;
                                        const startChar = globalIdx >= 0 ? globalIdx : chunkStart;
                                        const endChar = startChar + (rawMatch2.length || 1);
                                        diags.push(new vscode.Diagnostic(new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)), `THEN->LET RHS: ${err.message}`, vscode.DiagnosticSeverity.Error));
                                });
                                });
                        }
                        } else if (/^\s*(?:PRINT|LPRINT)\b/.test(thenText)) {
                        const args = thenText.replace(/^\s*(?:PRINT|LPRINT)\b/, '').trim();
                        const perr = printCheck(args, validators);
                        perr.forEach(e => {
                                if (!e) return;  // Skip null entries
                                diags.push(new vscode.Diagnostic(
                                new vscode.Range(new vscode.Position(i, chunkStart), new vscode.Position(i, chunkStart + Math.min(thenText.length, 1))),
                                `THEN->PRINT: ${e.message}`,
                                vscode.DiagnosticSeverity.Error
                                ));
                        });
                        } else {
                        runValidatorsOnSegment(thenText, validators, (err, rawMatch) => {
                                if (!err) return;
                                const innerIdx = thenText.indexOf(rawMatch);
                                const globalIdx = (innerIdx >= 0 && chunkIdx >= 0) ? seg.start + chunkIdx + innerIdx : seg.text.indexOf(rawMatch, (ifMatch.index ?? 0));
                                if (isInString(globalIdx)) return;
                                const startChar = globalIdx >= 0 ? globalIdx : chunkStart;
                                const endChar = startChar + (rawMatch.length || 1);
                                diags.push(new vscode.Diagnostic(new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)), `THEN part: ${err.message}`, vscode.DiagnosticSeverity.Error));
                        });
                        }
                }
                }

                if (elsePart) {
                const elseText = stripTrailingCommentUnquoted(elsePart).trim();
                if (elseText && !/^".*"$/.test(elseText)) {
                        const chunkIdx = chunkStartIndex(elseText);
                        const chunkStart = seg.start + (chunkIdx >= 0 ? chunkIdx : 0);
                        const chunkRange = new vscode.Range(new vscode.Position(i, chunkStart), new vscode.Position(i, chunkStart + elseText.length));

                        const letM2 = /^\s*LET\s+([A-Z][A-Z0-9]*\$?(?:\([^)]+\))?)\s*=\s*(.+)$/.exec(elseText);
                        if (letM2) {
                        const [, lhs, rhsText] = letM2;
                        const rhsParts = letCheck(lhs ?? '', rhsText ?? '', chunkRange, diags);
                        if (!rhsParts || rhsParts.length === 0) {
                                diags.push(new vscode.Diagnostic(chunkRange, `ELSE: invalid LET statement`, vscode.DiagnosticSeverity.Error));
                        } else {
                                rhsParts.forEach(itemInRhs => {
                                const rhsPart = typeof itemInRhs === 'string' ? itemInRhs : (itemInRhs[0] ?? '');
                                if (!rhsPart.trim() || isParenthesisedBooleanExpression(rhsPart)) return;
                                runValidatorsOnSegment(rhsPart, validators, (err, rawMatch2) => {
                                        if (!err) return;
                                        const innerIdx = elseText.indexOf(rawMatch2);
                                        const globalIdx = (innerIdx >= 0 && chunkIdx >= 0) ? seg.start + chunkIdx + innerIdx : seg.text.indexOf(rawMatch2, (ifMatch.index ?? 0));
                                        if (isInString(globalIdx)) return;
                                        const startChar = globalIdx >= 0 ? globalIdx : chunkStart;
                                        const endChar = startChar + (rawMatch2.length || 1);
                                        diags.push(new vscode.Diagnostic(new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)), `ELSE->LET RHS: ${err.message}`, vscode.DiagnosticSeverity.Error));
                                });
                                });
                        }
                        } else if (/^\s*(?:PRINT|LPRINT)\b/.test(elseText)) {
                        const args = elseText.replace(/^\s*(?:PRINT|LPRINT)\b/, '').trim();
                        const perr = printCheck(args, validators);
                        perr.forEach(e => {
                                if (!e) return;  // Skip null entries
                                diags.push(new vscode.Diagnostic(
                                new vscode.Range(new vscode.Position(i, chunkStart), new vscode.Position(i, chunkStart + Math.min(elseText.length, 1))),
                                `ELSE->PRINT: ${e.message}`,
                                vscode.DiagnosticSeverity.Error
                                ));
                        });
                        } else {
                        runValidatorsOnSegment(elseText, validators, (err, rawMatch) => {
                                if (!err) return;
                                const innerIdx = elseText.indexOf(rawMatch);
                                const globalIdx = (innerIdx >= 0 && chunkIdx >= 0) ? seg.start + chunkIdx + innerIdx : seg.text.indexOf(rawMatch, (ifMatch.index ?? 0));
                                if (isInString(globalIdx)) return;
                                const startChar = globalIdx >= 0 ? globalIdx : chunkStart;
                                const endChar = startChar + (rawMatch.length || 1);
                                diags.push(new vscode.Diagnostic(new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)), `ELSE part: ${err.message}`, vscode.DiagnosticSeverity.Error));
                        });
                        }
                }
                }

                                        // mark IF handled so main validator pass doesn't re-run over the same text
                                        ifFlag = true;
                                        thenFlag = true;
                                        if (elsePart) elseFlag = true;
                } // end of IF handling 

                // Handle standalone ELSE segment (result of colon injection before ELSE)
                // This occurs when IF...THEN...ELSE has multiple commands between the THEN and ELSE parts
                const elseMatch = /^\s*ELSE\s+(.+)$/.exec(seg.text);
                if (elseMatch) {
                const elseContent = (elseMatch[1] ?? '').trim();
                
                if (elseContent) {
                        const elseStart = seg.start + seg.text.indexOf(elseContent);
                        const elseRange = new vscode.Range(
                        new vscode.Position(i, elseStart),
                        new vscode.Position(i, elseStart + elseContent.length)
                        );

                        // Check for LET in ELSE
                        const letM = /^\s*LET\s+([A-Z][A-Z0-9]*\$?(?:\([^)]+\))?)\s*=\s*(.+)$/.exec(elseContent);
                        if (letM) {
                        const [, lhs, rhsText] = letM;
                        const rhsParts = letCheck(lhs ?? '', rhsText ?? '', elseRange, diags);
                        if (rhsParts && rhsParts.length > 0) {
                                rhsParts.forEach(itemInRhs => {
                                const rhsPart = typeof itemInRhs === 'string' ? itemInRhs : (itemInRhs[0] ?? '');
                                if (!rhsPart.trim() || isParenthesisedBooleanExpression(rhsPart)) return;
                                runValidatorsOnSegment(rhsPart, validators, (err, rawMatch2) => {
                                        if (!err) return;
                                        const innerIdx = elseContent.indexOf(rawMatch2);
                                        const globalIdx = innerIdx >= 0 ? elseStart + innerIdx : elseStart;
                                        if (isInString(globalIdx)) return;
                                        const startChar = globalIdx;
                                        const endChar = startChar + (rawMatch2.length || 1);
                                        diags.push(new vscode.Diagnostic(
                                        new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)),
                                        `ELSE->LET RHS: ${err.message}`,
                                        vscode.DiagnosticSeverity.Error
                                        ));
                                });
                                });
                        }
                        }
                        // Check for PRINT/LPRINT in ELSE
                        else if (/^\s*(?:PRINT|LPRINT)\b/.test(elseContent)) {
                        const args = elseContent.replace(/^\s*(?:PRINT|LPRINT)\b/, '').trim();
                        const perr = printCheck(args, validators);
                        perr.forEach(e => {
                                diags.push(new vscode.Diagnostic(
                                elseRange,
                                `ELSE->PRINT: ${e?.message}`,
                                vscode.DiagnosticSeverity.Error
                                ));
                        });
                        }
                        // Generic validation for other commands in ELSE
                        else {
                        runValidatorsOnSegment(elseContent, validators, (err, rawMatch, absIdx) => {
                                if (!err) return;
                                const innerIdx = elseContent.indexOf(rawMatch);
                                const globalIdx = innerIdx >= 0 ? elseStart + innerIdx : elseStart;
                                if (isInString(globalIdx)) return;
                                const startChar = globalIdx;
                                const endChar = startChar + (rawMatch.length || 1);
                                diags.push(new vscode.Diagnostic(
                                new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)),
                                `ELSE part: ${err.message}`,
                                vscode.DiagnosticSeverity.Error
                                ));
                        }, elseStart);
                        }
                }
                
                // Set flag to skip further processing of this segment
                ifFlag = true;
                elseFlag = true;
                }                


/**               Special
                Rules FOR ... TO ... STEP construct
                FOR <control variable> = <start> TO <end> {optional STEP increment}
                <start> typically of the type  I= 1
                <end> typically a number (e.g. 10)
                <increment> typically 1 but can also be a float (e.g. 0.1) or negative (e.g. -1)
                FOR I = 1 TO 10 STEP 1
                FOR A = B to C STEP D
*/
                const forMatch = /^\s*FOR\s+([A-Z][A-Z0-9]*)\s*=\s*(.+?)\s+TO\s+(.+?)(?:\s+STEP\s+(.+?))?\s*$/.exec(seg.text);
                if (forMatch) {
                    const [, ctrlVar, startExprRaw, endExprRaw, stepExprRaw] = forMatch;
                    const ctrlIsNumeric = !!ctrlVar && isValidVarName(ctrlVar);
                    const segBase = seg.start + (forMatch.index ?? 0);

                    const reportForError = (text: string, msg: string) => {
                        const idx = seg.text.indexOf(text, forMatch.index ?? 0);
                        const startChar = seg.start + (idx >= 0 ? idx : 0);
                        const endChar = startChar + (text.length || 1);
                        diags.push(new vscode.Diagnostic(
                            new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)),
                            `FOR: ${msg}`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    };

                    if (!ctrlIsNumeric) {
                        reportForError(ctrlVar ?? '', `control variable must be alphanumeric without $ (got "${ctrlVar ?? ''}")`);
                    }

                    const startExpr = stripTrailingCommentUnquoted(startExprRaw.trim());
                    const endExpr = stripTrailingCommentUnquoted(endExprRaw.trim());
                    const stepExpr = stepExprRaw ? stripTrailingCommentUnquoted(stepExprRaw.trim()) : undefined;

                    const startType = classifyExpr(startExpr);
                    const endType = classifyExpr(endExpr);
                    if (!startType.hasNumeric) {
                        reportForError(startExpr, `start expression must be numeric (got "${startExpr}")`);
                    }
                    if (!endType.hasNumeric) {
                        reportForError(endExpr, `end expression must be numeric (got "${endExpr}")`);
                    }
                    if (stepExpr) {
                        const stepType = classifyExpr(stepExpr);
                        if (!stepType.hasNumeric) {
                            reportForError(stepExpr, `STEP expression must be numeric (got "${stepExpr}")`);
                        }
                    }

                    const validateChunk = (expr: string, label: string) => {
                        runValidatorsOnSegment(expr, validators, (err, rawMatch, absIdx) => {
                            if (!err || typeof absIdx !== 'number') return;
                            const startChar = absIdx;
                            const endChar = startChar + Math.max(1, rawMatch.length);
                            if (isInString(startChar)) return;
                            diags.push(new vscode.Diagnostic(
                                new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)),
                                `${label}: ${err.message}`,
                                vscode.DiagnosticSeverity.Error
                            ));
                        }, seg.start);
                    };

                    validateChunk(startExpr, 'FOR start');
                    validateChunk(endExpr, 'FOR end');
                    if (stepExpr) validateChunk(stepExpr, 'FOR step');

                                        forFlag = true;
                                        toFlag = true;
                                        if (stepExpr) stepFlag = true;
                } // end of FOR handling

                
/**               Special
                Rules for ON expr GOTO .. and ON expr GOSUB ...
                ON expr GOTO <one or more linenumbers separated by commas>
                ON expr GOSUB <one or more linenumbers separated by commas>
                Different from the standalone GOTO <linenumber> and GOSUB <linenumber>
                Should CmdSpecs have expectEnd = true removed as the ON case allows multiple linenumbers?
*/

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

                    const targets = splitTopLevel(targetsRaw).map(t => t.trim()).filter(Boolean);
                    if (targets.length === 0) {
                        const idx = seg.text.indexOf(branchKeyword, onMatch.index ?? 0);
                        const startChar = seg.start + (idx >= 0 ? idx : 0);
                        diags.push(new vscode.Diagnostic(
                            new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, startChar + branchKeyword.length)),
                            `ON ${branchKeyword}: requires at least one line number`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    } else {
                        targets.forEach(target => {
                            const n = Number(target);
                            const valid = Number.isInteger(n) && n >= 0 && n <= 65535;
                            if (!valid) {
                                const idx = seg.text.indexOf(target, onMatch.index ?? 0);
                                const startChar = seg.start + (idx >= 0 ? idx : 0);
                                const endChar = startChar + target.length;
                                diags.push(new vscode.Diagnostic(
                                    new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)),
                                    `ON ${branchKeyword}: line numbers must be integers 0..65535 (got "${target}")`,
                                    vscode.DiagnosticSeverity.Error
                                ));
                            }
                        });
                    }

                    runValidatorsOnSegment(selectorExpr, validators, (err, rawMatch, absIdx) => {
                        if (!err || typeof absIdx !== 'number' || isInString(absIdx)) return;
                        const startChar = absIdx;
                        const endChar = startChar + Math.max(1, rawMatch.length);
                        diags.push(new vscode.Diagnostic(
                            new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)),
                            `ON ${branchKeyword} selector: ${err.message}`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    }, seg.start);

                                        onFlag = true;
                                        if (branchKeyword.toUpperCase() === 'GOTO') gotoFlag = true;
                                        if (branchKeyword.toUpperCase() === 'GOSUB') gosubFlag = true;
                } // end of ON handling

/**               Special
                DIM A(10),B(20)
                DIM A$(5),B$(10)
                DIM A(10,20),B$(5,10)
                Check that each variable is a valid name and that each dimension expression is numeric
*/
                const dimMatch = /^\s*DIM\s+(.+)$/.exec(seg.text);
                if (dimMatch) {
                    const payload = dimMatch[1].trim();
                    if (!payload) {
                        const start = seg.start + seg.text.toUpperCase().indexOf('DIM');
                        diags.push(new vscode.Diagnostic(
                            new vscode.Range(new vscode.Position(i, start), new vscode.Position(i, start + 3)),
                            'DIM requires at least one array specification',
                            vscode.DiagnosticSeverity.Error
                        ));
                    } else {
                        const arrays = splitTopLevel(payload).map(a => a.trim()).filter(Boolean);
                        const dimRe = /^([A-Z][A-Z0-9]*\$?)\s*\(([^)]+)\)$/;
                        arrays.forEach(arr => {
                            const dm = dimRe.exec(arr);
                            if (!dm) {
                                const idx = seg.text.indexOf(arr, dimMatch.index ?? 0);
                                const startChar = seg.start + (idx >= 0 ? idx : 0);
                                diags.push(new vscode.Diagnostic(
                                    new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, startChar + arr.length)),
                                    `DIM: invalid array declaration "${arr}"`,
                                    vscode.DiagnosticSeverity.Error
                                ));
                                return;
                            }
                            const [_, name, boundsRaw] = dm;
                            const dims = boundsRaw.split(',').map(v => v.trim()).filter(Boolean);
                            if (dims.length === 0) {
                                const idx = seg.text.indexOf(boundsRaw, dimMatch.index ?? 0);
                                const startChar = seg.start + (idx >= 0 ? idx : 0);
                                diags.push(new vscode.Diagnostic(
                                    new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, startChar + boundsRaw.length)),
                                    `DIM ${name}: must specify at least one bound`,
                                    vscode.DiagnosticSeverity.Error
                                ));
                                return;
                            }
                            dims.forEach(bound => {
                                // Allow integer literals (1-255) OR variable names (B, MAX, etc.)
                                const n = Number(bound);
                                const isIntegerLiteral = Number.isInteger(n) && n >= 1 && n <= 255;
                                const isVariableName = /^[A-Z][A-Z0-9]*$/.test(bound);
                                
                                if (!isIntegerLiteral && !isVariableName) {
                                        const idx = seg.text.indexOf(bound, dimMatch.index ?? 0);
                                        const startChar = seg.start + (idx >= 0 ? idx : 0);
                                        diags.push(new vscode.Diagnostic(
                                        new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, startChar + bound.length)),
                                        `DIM ${name}: bounds must be integers 1..255 or variable names (got "${bound}")`,
                                        vscode.DiagnosticSeverity.Error
                                        ));
                                }
                                });
                        });
                    }
                    dimFlag = true; // add boolean, include in final guard
                } // END of DIM handling


/**               Special
                DATA command handling
                DATA can have multiple types of data items separated by commas
                DATA 10,20,30,40
                DATA "HELLO",WORLD,65,66,67
*/
                const dataMatch = /^\s*DATA\s+(.+)$/.exec(seg.text);
                if (dataMatch) {
                const payload = dataMatch[1].trim();
                if (!payload) {
                        const startChar = seg.start + seg.text.toUpperCase().indexOf('DATA');
                        const range = new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, startChar + 4));
                        diags.push(new vscode.Diagnostic(range, 'DATA requires at least one value', vscode.DiagnosticSeverity.Error));
                }
                dataFlag = true; // new boolean so the generic validator block skips this segment
                } //END of DATA handling

/**               Special
                READ command handling
                READ can have multiple variables separated by commas
                READ A$,B$,C,D,E
*/
                const readMatch = /^\s*READ\s+(.+)$/.exec(seg.text);
                if (readMatch) {
                const payload = readMatch[1].trim();
                if (!payload) {
                        const start = seg.start + seg.text.toUpperCase().indexOf('READ');
                        diags.push(new vscode.Diagnostic(
                        new vscode.Range(new vscode.Position(i, start), new vscode.Position(i, start + 4)),
                        'READ requires at least one target variable',
                        vscode.DiagnosticSeverity.Error
                        ));
                }
                readFlag = true; // add this boolean and include it in the final guard
                } //END of READ handling

/**               Special
                before running the generic validators, detect misplaced occurrences of CODE (outside quoted strings)
                CODE EXCEPTION exact-match allowed form (optional lineno + CODE) — if the entire segment equals this, it's valid
                STILL TO ADD CAPABILITY FOR ADDING HEXADECIMAL addresses and Z80 instruction, the construct will be
                <16-bit hex address (2 bytes)> <label> <Z80 instruction> {; comment text}
                When CODE is first invoked it will automatically Add
                <16-bit address> RET  (RET = C9 in hexadecimal and 1 byte)
                as the original MTX inline assembler did. There will need to be some inline processing to handle the hexaddress program counter
                The user can then add Z80 instructions which involve looking up a table to see if the instruction is correct 
                and to increase the hexadecimal addresss counter by <x> bytes,either 1, 2, 3 or 4.
                the assembler has specials, like labels, reserves for DB, DW and DS, etc.
*/                
                { if (/^\s*(?:\d+\s+)?CODE\s*$/.test(seg.text)) {
                        /* valid; nothing to do */
                        codeFlag=true; // set flag so generic validator block skips this segment
                } else {
                        // 2) any occurrence of the standalone word CODE (not in quotes) is an error in this context
                        const codeWordRe = /\bCODE\b/gi;
                        let cm: RegExpExecArray | null;
                        while ((cm = codeWordRe.exec(seg.text)) !== null) {
                        const matchIdx = cm.index ?? -1;
                        if (isInString(matchIdx)) continue;
                        const start = seg.start + matchIdx;
                        diags.push(new vscode.Diagnostic(
                                new vscode.Range(new vscode.Position(i, start), new vscode.Position(i, start + cm[0].length)),
                                `<linenumber> CODE must be on a line by itself (e.g. "57 CODE"). CODE found in this context is invalid.`,
                                vscode.DiagnosticSeverity.Error));
                        } // END of while for CODE standalone word check

                        // 3) also flag concatenated/malformed uses like "CODE5" or "CODEPRINT" (CODE followed immediately by word-chars)
                        const codeConcatRe = /\bCODE(?=\w)/gi;
                        while ((cm = codeConcatRe.exec(seg.text)) !== null) {
                        const matchIdx = cm.index ?? -1;
                        if (isInString(matchIdx)) continue;
                        // highlight the whole token starting at matchIdx
                        let j = matchIdx + 4; // position after "CODE"
                        while (j < seg.text.length && /\w/.test(seg.text[j])) j++;
                        const start = seg.start + matchIdx;
                        const end = seg.start + j;
                        diags.push(new vscode.Diagnostic(
                                new vscode.Range(new vscode.Position(i, start), new vscode.Position(i, end)),
                                `Malformed use of CODE: must be alone (e.g. "<lineno> CODE"). Found "${seg.text.slice(matchIdx, j)}"`,
                                vscode.DiagnosticSeverity.Error));
                        } // END of while for CODE concatenated/malformed check
                        } // END OF else block
                } // END of CODE misplaced check

                // Detect standalone NEXT/RETURN for spacing checks
                
                if (/^\s*NEXT(?=\s|[A-Z]|$)/.test(seg.text)) nextFlag = true;

                // After specials block, before generic validators
                const spacedKeywords = [
                { kw: 'LET', flag: letFlag, checkMissing: true },
                { kw: 'IF', flag: ifFlag, checkMissing: true },
                { kw: 'THEN', flag: thenFlag, checkMissing: true },
                { kw: 'ELSE', flag: elseFlag, checkMissing: true },
                { kw: 'FOR', flag: forFlag, checkMissing: true },
                { kw: 'TO', flag: toFlag, checkMissing: true },
                { kw: 'NEXT', flag: nextFlag, checkMissing: false }, //change to false to prevent double checking of spaces leading to errors later
                { kw: 'STEP', flag: stepFlag, checkMissing: true },
                { kw: 'ON', flag: onFlag, checkMissing: true },
                { kw: 'GOTO', flag: gotoFlag, checkMissing: true },
                { kw: 'GOSUB', flag: gosubFlag, checkMissing: true },
                { kw: 'DATA', flag: dataFlag, checkMissing: true },
                { kw: 'DIM', flag: dimFlag, checkMissing: true },
                { kw: 'READ', flag: readFlag, checkMissing: true },
                { kw: 'INPUT', flag: inputFlag, checkMissing: true },       
                { kw: 'PRINT', flag: printFlag, checkMissing: true },
                { kw: 'LPRINT', flag: printFlag, checkMissing: true }
                ];

                for (const { kw, flag, checkMissing } of spacedKeywords) {
                if (!flag) continue;

                //NEXT is the only CmdSpecs that has optional arguments, so needs special handling with regards to space detection
                const re = kw === 'NEXT' 
                ? new RegExp(`\\b${kw}(?=\\s|[A-Z]|$)`, 'gi')  // Only for NEXT
                : new RegExp(`\\b${kw}\\b`, 'gi');              // All other keywords
                let m: RegExpExecArray | null;
                while ((m = re.exec(seg.text)) !== null) {
                        const matchIdx = m.index ?? -1;
                        if (matchIdx < 0) continue;
                        const absStart = seg.start + matchIdx;
                        if (isInString(absStart)) continue;

                        const after = seg.text.slice(matchIdx + kw.length);
                        const spaceMatch = /^(\s*)/.exec(after);
                        const space = spaceMatch ? (spaceMatch[1] ?? '') : '';

                        const { spaceMissingYes, msg0 } = isNoSpaceFound(space);
                        const { multiSpaceYes, msg2 } = isMultiSpaceFound(space);

                        if (checkMissing && spaceMissingYes) {
                        const range = new vscode.Range(
                        new vscode.Position(i, absStart),
                        new vscode.Position(i, absStart + kw.length)
                        );
                        diags.push(new vscode.Diagnostic(range, msg0, vscode.DiagnosticSeverity.Error));
                        } else if (kw === 'NEXT' && spaceMissingYes && after.trim().length > 0) {
                        // Special case: NEXT without space but with following text (e.g., NEXTI)
                        const range = new vscode.Range(
                        new vscode.Position(i, absStart),
                        new vscode.Position(i, absStart + kw.length)
                        );
                        diags.push(new vscode.Diagnostic(range, msg0, vscode.DiagnosticSeverity.Error));
                        } else if (multiSpaceYes) {
                        const range = new vscode.Range(
                        new vscode.Position(i, absStart),
                        new vscode.Position(i, absStart + kw.length + space.length)
                        );
                        diags.push(new vscode.Diagnostic(range, msg2, vscode.DiagnosticSeverity.Error));
                        }

                        // Additional validation: NEXT argument must be numeric (no $)
                        if (kw === 'NEXT' && space.length > 0) {
                        const afterSpace = after.slice(space.length).trim();
                        if (afterSpace.length > 0) {
                                const varMatch = /^([A-Z][A-Z0-9]*\$?)/.exec(afterSpace);
                                if (varMatch && varMatch[1] && varMatch[1].endsWith('$')) {
                                const varStart = absStart + kw.length + after.indexOf(afterSpace);
                                const varEnd = varStart + varMatch[1].length;
                                diags.push(new vscode.Diagnostic(
                                        new vscode.Range(new vscode.Position(i, varStart), new vscode.Position(i, varEnd)),
                                        `NEXT: variable must be numeric (string variable "${varMatch[1]}" not allowed)`,
                                        vscode.DiagnosticSeverity.Error
                                ));
                                }
                        }
                        }
                }
                }

                                      
                // Segments.length is based on multicommands on 1 line. If commands separated by say spaces then doesn't register
                // Does this mean that validator.name will fail?
                // Only run the generic validators when we haven't already handled LET/PRINT/IF
                // and when this segment is not a REM (REM is free-form text and should be skipped)
                if (!letFlag && !printFlag && !ifFlag && !forFlag && !onFlag && !dataFlag && !readFlag && !inputFlag && !dimFlag &&  !codeFlag && !seg.text.trim().toUpperCase().startsWith('REM')) {

                runValidatorsOnSegment(seg.text, validators, (err, rawMatch, absoluteIdx, matchArray) => {
                if (!err || typeof absoluteIdx !== 'number') return;
                if (isInString(absoluteIdx)) return;

                // Mark this segment as handled when a validator reports an issue here
                segHandled = true;

                // Prefer the validator’s capture group, fall back to the whole match.
                let capture = rawMatch;
                if (matchArray && typeof err.groupIndex === 'number') {
                    const idx = err.groupIndex;
                    capture = matchArray[idx] ?? matchArray[idx + 1] ?? matchArray[1] ?? rawMatch;
                }

                // Try to locate the capture inside the full match; fall back to searching the segment.
                let startChar = absoluteIdx;
                if (matchArray && matchArray[0] && capture) {
                    const inner = matchArray[0].indexOf(capture);
                    if (inner >= 0) startChar = absoluteIdx + inner;
                    else {
                        const segIdx = seg.text.indexOf(capture, Math.max(0, absoluteIdx - seg.start));
                        if (segIdx >= 0) startChar = seg.start + segIdx;
                    }
                }
                const endChar = startChar + Math.max(1, capture.length);
                if (isInString(startChar)) return;

                diags.push(new vscode.Diagnostic(
                    new vscode.Range(new vscode.Position(i, startChar), new vscode.Position(i, endChar)),
                    `${rawMatch}: ${err.message}`,
                    vscode.DiagnosticSeverity.Error
                ));
            }, seg.start);
        

        
        // Mark segment handled if any special-case flag was set earlier
        segHandled = segHandled || letFlag || printFlag || ifFlag || thenFlag || elseFlag || forFlag || toFlag || stepFlag || nextFlag || onFlag || gotoFlag || gosubFlag || returnFlag || dataFlag || readFlag || inputFlag || dimFlag || codeFlag;
        
        // FINAL STRAY-TEXT CHECK: flag top-level stray text or forgotten REM tokens
        
        (function finalStrayTextCheck() {
            // Build known commands set
            const knownCmds = new Set(specs.map(s => s.id.toUpperCase()));

            // Skip if this segment was already handled by earlier checks/validators
            if (typeof segHandled !== 'undefined' && segHandled) return;

            // If the segment starts with a known command, skip this check (arguments validated elsewhere)
            const segTrimStart = seg.text.trimStart();
            const firstWordMatch = /^([A-Za-z_][A-Za-z0-9_]*\$?)/.exec(segTrimStart);
            if (firstWordMatch && knownCmds.has(firstWordMatch[1].toUpperCase())) return;

            // Helper to detect if an index is inside any quoted string ranges
            const isIdxInStringRanges = (pos: number) => {
                // string ranges computed earlier as [stringRanges]
                return stringRanges.some(r => pos >= r[0] && pos < r[1]);
            };
            // Walk the segment text at top-level (skip inside quotes and parentheses)
            let inStringLocal = false;
            let parenDepth = 0;
            let cur = '';
            let curStart = 0;
            const push = (tok: string, startIdx: number) => {
                if (!tok) return;
                const up = tok.toUpperCase();
                if (knownCmds.has(up)) return; // known command
                if (/^[A-Z][A-Z0-9]*:$/.test(tok)) return; // label
                // detect bare assignment LHS followed by '=' (e.g. NV=19 but with a leading token like fhien)
                const rest = seg.text.slice(startIdx + tok.length).trimStart();
                if (/^[A-Za-z_][A-Za-z0-9_]*\$?$/.test(tok) && rest.startsWith('=')) {
                        const startCol = seg.start + startIdx;
                        const rng = new vscode.Range(new vscode.Position(i, startCol), new vscode.Position(i, startCol + tok.length));
                        diags.push(new vscode.Diagnostic(rng, `Assignment requires LET command - use 'LET ${tok}='`, vscode.DiagnosticSeverity.Error));
                        return;
                }
                // If token looks like ordinary text (not a command/label/assignment), warn the user
                const startCol = seg.start + startIdx;
                const rng = new vscode.Range(new vscode.Position(i, startCol), new vscode.Position(i, startCol + tok.length));
                diags.push(new vscode.Diagnostic(rng, `Unrecognised or stray text: '${tok}'. Did you mean to add 'REM'?`, vscode.DiagnosticSeverity.Warning));
                };
                for (let si = 0; si < seg.text.length; si++) {
                        const ch = seg.text[si];
                        if (ch === '\"') { inStringLocal = !inStringLocal; if (inStringLocal) { cur = ''; curStart = si; } continue; }
                        if (inStringLocal) continue;
                        if (ch === '(') { parenDepth++; continue; }
                        if (ch === ')') { if (parenDepth > 0) parenDepth--; continue; }
                        if (parenDepth > 0) continue;
                        if (/\s|[,;:]/.test(ch)) {
                                if (cur) { push(cur, curStart); cur = ''; }
                                continue;
                        }
                        if (!cur) curStart = si;
                        cur += ch;
                }
                if (cur) push(cur, seg.text.length - cur.length);
        })();
        }         // END of main validator error checking block

        } // END of for (const seg of segments) loop
        } // for (let i = 0; i < doc.lineCount; i++)

        // Inside refreshDiagnostics function, add after the main BASIC validation loop:

        // ============================================
        // NODDY VALIDATION SECTION
        // ============================================

        // Find NODDY trigger line (e.g., "9999 NODDY")

        // After the BASIC validation loop, add NODDY validation:
        if (noddyStartLine >= 0) {
                //noddyLength = computeNoddyAsciiLength(doc, noddyStartLine);
                // UPDATED: Use byte length
                noddyLength = computeNoddyByteLength(doc, noddyStartLine);
                // Collect all lines from document
                const allLines: string[] = [];
                for (let j = 0; j < doc.lineCount; j++) {
                        allLines.push(doc.lineAt(j).text);
        }
        
        // Parse and validate NODDY content
        const { pages, errors: parseErrors } = parseNoddyContent(allLines, noddyStartLine + 1);
        
        // Add parse errors to diagnostics
        for (const err of parseErrors) {
                const range = new vscode.Range(
                new vscode.Position(err.line, err.start),
                new vscode.Position(err.line, err.end)
                );
                diags.push(new vscode.Diagnostic(
                range,
                `NODDY: ${err.message}`,
                vscode.DiagnosticSeverity.Error
                ));
        }
        
        // Validate each program page
        for (const page of pages) {
                if (page.type === 'program') {
                const progErrors = validateNoddyProgram(page, pages, page.lineStart);
                for (const err of progErrors) {
                        const range = new vscode.Range(
                        new vscode.Position(err.line, err.start),
                        new vscode.Position(err.line, err.end)
                        );
                        diags.push(new vscode.Diagnostic(
                        range,
                        `NODDY: ${err.message}`,
                        vscode.DiagnosticSeverity.Error
                        ));
                }
                }
        }
        
        // Validate PLOD references in BASIC code point to existing program pages
        const programPageNames = new Set(pages.filter(p => p.type === 'program').map(p => p.name));
        const basicLines = allLines.slice(0, noddyStartLine + 1);
        const plodRefs: { line: number; progName: string; start: number }[] = [];
        
        for (let j = 0; j < basicLines.length; j++) {
                const plodPattern = /PLOD\s+"(\w+)"/gi;
                let match;
                while ((match = plodPattern.exec(basicLines[j])) !== null) {
                const progName = match[1];
                plodRefs.push({ line: j, progName, start: match.index });
                if (!programPageNames.has(progName)) {
                        const range = new vscode.Range(
                        new vscode.Position(j, match.index),
                        new vscode.Position(j, match.index + match[0].length)
                        );
                        diags.push(new vscode.Diagnostic(
                        range,
                        `NODDY: PLOD references undefined program "${progName}"`,
                        vscode.DiagnosticSeverity.Warning
                        ));
                }
                }
        }

        // Check for unused text pages
        const usedTextPages = new Set<string>();
        for (const page of pages) {
                if (page.type === 'program') {
                for (const line of page.content) {
                        const displayMatch = /^\*(?:D|DISPLAY)\s+([^\s*^.]+)\./i.exec(line.trim());
                        if (displayMatch) {
                        usedTextPages.add(displayMatch[1]);
                        }
                }
                }
        }
        
        for (const page of pages) {
                if (page.type === 'text' && !usedTextPages.has(page.name)) {
                const range = new vscode.Range(
                        new vscode.Position(page.lineStart, 0),
                        new vscode.Position(page.lineStart, 50)
                );
                diags.push(new vscode.Diagnostic(
                        range,
                        `NODDY: Text page "${page.name}" is never displayed`,
                        vscode.DiagnosticSeverity.Hint
                ));
                }
        }
        
        // Check for unused program pages (not called by PLOD)
        const usedPrograms = new Set(plodRefs.map(r => r.progName));
        for (const page of pages) {
                if (page.type === 'program' && !usedPrograms.has(page.name)) {
                const range = new vscode.Range(
                        new vscode.Position(page.lineStart, 0),
                        new vscode.Position(page.lineStart, 50)
                );
                diags.push(new vscode.Diagnostic(
                        range,
                        `NODDY: Program "${page.name}" is never called by PLOD`,
                        vscode.DiagnosticSeverity.Hint
                ));
                }
        }
        } // END of NODDY validation section

        // ============================================
        // Z80 CODE BLOCK VALIDATION SECTION - PART 2
        // ============================================

/**
        Need to convert the text prior to the code block into hexadecimal bytes as per MTX BASIC inline assembler rules
        to determine the correct addresses for the Z80 instructions in the code block
        using the validateCodeBlocks function from z80Validator module.
 */

        if (codeBlockRanges.length > 0) {
                // Collect all lines for Z80 validation
                const allDocLines: string[] = [];
                for (let j = 0; j < doc.lineCount; j++) {
                        allDocLines.push(doc.lineAt(j).text);
                }
                
                // validateCodeBlocks takes the document lines array, not CodeBlock[]
                const z80Errors = validateCodeBlocks(allDocLines, hexBaseAddress);

                // duplicate‑label check
                for (const block of codeBlockRanges) {
                        const seen = new Map<string, vscode.Position>();
                        for (let i = block.start; i <= block.end; i++) {
                                const line = doc.lineAt(i).text;
                                // either drop the address part…
                                const trimmed = line.replace(/^\s*[0-9A-Fa-f]{1,4}\s+/, '');
                                const m = /^([A-Z][A-Z0-9]*):/.exec(trimmed);

                                // …or use a single regex that allows for the prefix:
                                // const m = /^\s*(?:[0-9A-Fa-f]{1,4}\s+)?([A-Z][A-Z0-9]*):/.exec(line);
                                if (!m) { continue; }
                                const label = m[1];
                                // compute column in original text so the underlining is correct
                                const col = line.indexOf(label);
                                const pos = new vscode.Position(i, col);
                                if (seen.has(label)) {
                                        const range = new vscode.Range(pos, pos.translate(0, label.length));
                                        diags.push(new vscode.Diagnostic(range,
                                        `Duplicate label in z80 code block '${label}'`,
                                        vscode.DiagnosticSeverity.Error));
                                } else {
                                        seen.set(label, pos);
                                }
                        }
                }

                for (const err of z80Errors) {
                        const range = new vscode.Range(
                                new vscode.Position(err.line, err.start),
                                new vscode.Position(err.line, err.end)
                        );
                        
                        const severity = err.severity === 'error' 
                                ? vscode.DiagnosticSeverity.Error
                                : err.severity === 'warning'
                                        ? vscode.DiagnosticSeverity.Warning
                                        : vscode.DiagnosticSeverity.Information;
                        
                        diags.push(new vscode.Diagnostic(
                                range,
                                `Z80: ${err.message}`,
                                severity
                        ));
                }
        } // END of Z80 CODE BLOCK VALIDATION SECTION


        // Finally, set the diagnostics for the document
        diagCollection.set(doc.uri, diags);
                
        } // END of function refreshDiagnostics
  
  ctx.subscriptions.push(vscode.workspace.onDidOpenTextDocument(refreshDiagnostics));
  ctx.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document)));
  vscode.workspace.textDocuments.forEach(refreshDiagnostics);



ctx.subscriptions.push(vscode.languages.registerHoverProvider('mtxbasic', {
  provideHover(document: vscode.TextDocument,position: vscode.Position) {
            //const wordRange = document.getWordRangeAtPosition(position);
           // include optional trailing $ in the word (string functions / string variables)
            const wordRange = document.getWordRangeAtPosition(position, /[A-Z][A-Z0-9]*\$?/);      //might need to get rid of the underscore as this can cause MTX error symbol?          
            if (!wordRange) {
                return;
            }
            var word = document.getText(wordRange);
            //gettext doesn't pick up chars like $ or _ as tried with if (word.endwith('$') === true)
            if (!word) {
                return;
            }
            // UPDATED: see change to wordrange
            // Additional logic to handle $ at the end of a word. Currently need to hover over the $ sign to get the command description
            // if (position.character > 0) {
                // const charAfter = document.getText(new vscode.Range(position.line, position.character, position.line, position.character + 1 ));
                // if (charAfter === '$') {
                    //var word = word + '$'   
                    //code below also works. In both cases, Hover only kicks in if over the $ sign though
                    //const start = wordRange.start.character; // Start of the word
                    //const end = wordRange.end.character + 1; // Include the $ character
                    //const extendedRange = new vscode.Range(wordRange.start.line, start, wordRange.end.line, end);
                    //var word = document.getText(extendedRange);

                //}  }

            // Determine whether this position is inside a Z80 CODE block
            // prefer Z80 hover info when appropriate where there is similar commands in MTX BASIC (AND, OR, OUT and IN). 
            // Reuse validateLineNumbers to compute `codeBlockRanges` (same logic used by diagnostics).
            const { codeBlockRanges } = validateLineNumbers(document);
            let inCodeBlockAtPos = false;
            for (const block of codeBlockRanges) {
                if (position.line >= block.start && position.line <= block.end) {
                    inCodeBlockAtPos = true;
                    break;
                }
            }

            // REM hover adjustment: allow hover on REM (and NODDY in a final REM NODDY line),
           // but suppress hover for other keywords inside REM comments and inside the NODDY section.
           let isNoddyWord: boolean = false;
           let isRemNoddyLine: boolean = false;

           const lineRemText = document.lineAt(position.line).text;

           const isFinalBasicLine = (() => {
           let lastBasicLine = -1;
           for (let i = 0; i < document.lineCount; i++) {
                const t = document.lineAt(i).text.trim();
                if (!t) continue;
                if (/^\d+\s+/.test(t)) lastBasicLine = i;
           }
           return lastBasicLine === position.line;
           })();

           // Check if we're in the NODDY section (after the last BASIC line ending with REM NODDY)
           const isInNoddySection = (() => {
           let lastBasicLine = -1;
           let lastBasicLineEndsWithRemNoddy = false;
        
           for (let i = 0; i < document.lineCount; i++) {
                const t = document.lineAt(i).text.trim();
                if (!t) continue;
                if (/^\d+\s+/.test(t)) {
                lastBasicLine = i;
                // Check if this line ends with REM NODDY (case-insensitive, allowing for multi-statement lines)
                lastBasicLineEndsWithRemNoddy = /\bREM\s+NODDY\s*$/.test(t);
                }
           }
        
           // We're in NODDY section if:
           // 1. There is a last BASIC line that ends with REM NODDY
           // 2. Current position is after that line
           return lastBasicLineEndsWithRemNoddy && position.line > lastBasicLine;
           })();

           // Suppress all hovers in NODDY section
           if (isInNoddySection) {
              return;
           }

           const isWordChar = (ch: string) => /[A-Z0-9$]/.test(ch);
           const findRemIndex = (text: string): number => {
           let inString = false;
           for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                if (ch === '\"') inString = !inString;
                if (inString) continue;
                if ((text[i] || '').toUpperCase() === 'R' &&
                (text[i + 1] || '').toUpperCase() === 'E' &&
                (text[i + 2] || '').toUpperCase() === 'M') {
                const before = text[i - 1] || '';
                const after = text[i + 3] || '';
                const beforeOk = i === 0 || !isWordChar(before);
                const afterOk = !isWordChar(after);
                if (beforeOk && afterOk) return i;
                }
           }
           return -1;
           };

           const remIdx = findRemIndex(lineRemText);
           if (remIdx >= 0 && position.character >= remIdx) {
              const isRemWord = wordRange && wordRange.start.character === remIdx;

              const isRemNoddyLine = /\bREM\s+NODDY\s*$/.test(lineRemText.trim());
              const isNoddyWord = word.toUpperCase() === 'NODDY';

           if (!isRemWord) {
                if (!(isNoddyWord && isRemNoddyLine && isFinalBasicLine)) {
                   return;
                }
           }
           }

            // Handle specific BASIC commands            
            // MTX BASIC command match must be in capitals to comply with MTX BASIC language convention.
            // If we're inside a Z80 CODE block at this position, skip MTX BASIC hovers
            // so the Z80 hover provider (below) can take precedence for overlapping tokens like AND/OR/IN/OUT
            if (!inCodeBlockAtPos ) {
            if (word === 'ABS') {
		return new vscode.Hover(`**ABS**: Gives the absolute value of the specified number.\n\n` +
                    `Usage: ABS(number) \n\n` +
                    `The result has the same magnitude but the sign will always be positive.\n\n` +
                    `EXAMPLE: \n\n` + 
                    `10 LET A=ABS(59): PRINT "A= ";A\n\n` + 
                    `20 LET B=ABS(-59): PRINT "B= ";B\n\n` + 
                    `When RUN, this gives the following A= 59 B= 59`);
            }
            if (word === 'ADJSPR') {
		return new vscode.Hover(`**ADJSPR**: Adjust a sprites value with the specified parameters.\n\n` +
                    `Usage: ADJSPR P,N,V \n\n` +
                    `This command adjusts a value which has been assigned to a sprite either by the SPRITE command or subsequently by ADJSPR or MVSPR.\n\n` + 
                    `The advantage of ADJSPR is that unlike SPRITE, only 1 parameter is altered at a time thereby increasing the speed of updating single values.\n\n` + 
                    `N: Sprite number\n\n` +
                    `P = 0 : Sprite pattern. V = 0 to 31 (size 1) or 0 to 127 (size 0).\n\n` +
                    `P = 1 : Sprite colour. V = 0 to 15 (see colour table in appendix 7).\n\n` +
                    `P = 2 : Sprite x-position. V = 0 to 255.\n\n` +
                    `P = 3 : Sprite y-position. V = 0 to 255.\n\n` +
                    `P = 4 : Sprite x-speed. V = 0 to 255 (128 to 255 = negative).\n\n` +
                    `P = 5 : Sprite y-speed. V = 0 to 255 (128 to 255 = negative).`);
            }
            if (word === 'AND') {
		return new vscode.Hover(`**AND**: Boolean expression. compares two values to see if the condition is either True or False.\n\n` +
                    `Usage: AND \n\n` +
                    `Example: \n\n` + 
                    `10 IF X=1 AND Y=2 THEN STOP\n\n` + 
                    `True (-1) if X=1 and Y=2 otherwise its False (0).`);
            } 
            if (word === 'ANGLE') { // doesn't generate a MTX BASIC SE.C error if VS 4 not specified beforehand
		return new vscode.Hover(`**ANGLE**: Initialises the direction to the specified angle.\n\n` +
                    `Usage: ANGLE angle_rad \n\n` +
                    `The angle_rad is in radians measured in an anticlockwise direction from the horizontal.\n\n` + 
                    `The computer holds a 'direction' which is used in commands such as ARC, DRAW and MVSPR.\n\n` + 
                    `The direction is made up of two components: ANGLE and PHI (see later)\n\n` +
                    `For conversion to degrees: degrees = radians*360/2/PI\n\n` + 
                    `For conversion to radians: radians = degrees*PI*2/360, except 0 degrees = 0 radians`);
            }
            if (word === 'ARC') {// generates a MTX BASIC SE.C error if VS 4 not specified beforehand
		return new vscode.Hover(`**ARC**:  Draws an arc of a circle with the specified parameters.\n\n` +
                    `Usage: ARC length,angle_rads \n\n` +
                    `draws an arc of a circle. The starting position is the current PLOT position and the initial direction\n\n` + 
                    `is the direction currently held by the computer. Both the PLOT position and the direction are updated.\n\n` + 
                    `If the ARC length + PLOT x or y coordinates are outwith 0..255 or 0..191 respectively will result in an error.\n\n` + 
                    `The angle parameter, theta in radians determines the curvature of the arc by specifying what angle is subtended.\n\n` +
                    `In other words the larger the angle, the tighter the curve.\n\n` + 
                    `If the angle is greater than 360º or 2*pi radians, the arc will retrace its path.\n\n` +
                    `Must be in graphics mode (VS 4) for command to exexute without an error` );
            }
            if (word === 'ASC') {
		return new vscode.Hover(`**ASC**:  Returns the ASCII code of the first character of the string.\n\n` +
                    `Usage: ASC(string) \n\n` +
                    `Printable (screen displayable) ASCII codes are from 32 to 126.\n\n` +
                    `Example: \n\n` + 
                    `10 LET A=ASC("TEST")\n\n` +
                    `20 PRINT "A= ";A\n\n` + 
                    `When RUN, this gives the ASCII code for T which is 84 in decimal, A= 84`);
            }
            if (word === 'ASSEM') {
		return new vscode.Hover(`**ASSEM**:  Invokes the built-in Z80 assembler to assemble at the specified BASIC line. (See CODE).\n\n` +
                    `Usage: ASSEM \\<line number\\> \n\n` +
                    `The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like ASSEM, AUTO, or EDIT.`);
            } 
            if (word === 'ATN') {
		return new vscode.Hover(`**ATN**:  Returns the angle whose tangent is the specified number..\n\n` +
                    `Usage: ATN(number) \n\n` +
                    `The arc tangent. The number and the result are in radians\n\n` + 
                    `The arc tangent result is typically in the range -pi/2 to pi/2. The number and the result are in radians\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `10 PRINT TAN(0.785): REM TAN of 0.785 rads (45 degrees) = 1\n\n` + 
                    `20 PRINT ATN(1): REM ATN of 1 rads is 0.785 rads = 45 degress`);
            }
            if (word === 'ATTR') {
		return new vscode.Hover(`**ATTR**:  Defines effects on the grahphics screen with the specified parameters.\n\n` +
                    `Usage: ATTR P,state\n\n` +
                    `ATTR determines the effect on the graphics screen of using one of the plotting commands such as PLOT, DRAW or ARC\n\n` + 
                    `The attributes are not exclusive but may be used in any combination.\n\n` + 
                    `The state of the attribute is either on or off where\n\n` + 
                    `state: 0 = OFF and 1 = ON\n\n` + 
                    `P takes the value 0,1,2 or 3.\n\n` + 
                    `P=0  Inverse print. Characters are printed in the paper colour on the ink colour.\n\n` +  
                    `P=1  Over print. Characters are merged with those already present.\n\n` + 
                    `P=2  Unplot. Plots the paper colour\n\n` +  
                    `P=3  Over-plot. Plots Plots the ink colour if paper was there before and the paper colour if ink was there before.\n\n` + 
                    `     During CLS, and other functions, text is not over written but colours may change.\n\n` +  
                    `The effect during plotting is to do nothing. This can be used to move the PLOT=SPRITE around the screen whilst leaving the screen unchanged.`);
            } 
            if (word === 'AUTO') {
		return new vscode.Hover(`**AUTO**:  Switches on the automatic line numbering.\n\n` +
                    `Usage: AUTO \\<line number\\>,\\>increment\\> \n\n` +
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like ASSEM, AUTO, or EDIT.`);
            } 
            if (word === 'BAUD') {
		return new vscode.Hover(`**BAUD**:  Sets the RS232 channel 1 or 0 to the selected baud rate with the specified parameters.\n\n` +
                    `Usage: BAUD channel,baud rate \n\n` +
                    `Sets the RS232 channel 1 or 0 to the selected baud rate. The following rates are allowed:-\n\n` + 
                    `75, 110, 150, 300, 600, 1200, 2400, 4800, 9600, 19200\n\n` + 
                    `Example: \n\n` + 
                    `10 BAUD 0,1200\n\n` + 
                    `This sets channel 0 to 1200 baud rate`);
            } 
            if (word === 'CHR$') {
		return new vscode.Hover(`**CHR$**:  Returns  the character whose code is the specified number.\n\n` +
                    `Usage: CHR$(number) \n\n` +
                    `Example: \n\n` + 
                    `10 PRINT CHR$(65): REM prints A on the screen\n\n` + 
                    `Screen displayable ASCII characters are 32 to 126\n\n` + 
                    `ASCII codes 0 to 31 have special meaning and can be used to send special codes for printing to a printer.\n\n` + 
                    `These printable special codes can set printer to bold or underline for example, See LPRINT`);
            }            
            if (word === 'CIRCLE') { // generates a MTX BASIC SE.C error if VS 4 not specified beforehand
		return new vscode.Hover(`**CIRCLE**: Draws a circle with the specified parameters.\n\n` +
                    `Usage: CIRCLE X,Y,R\n\n` +
                    `X: X coordinate of the centre of a circle.\n\n` + 
                    `Y: Y coordinate of the centre of a circle.\n\n` + 
                    `R: radius of a circle.\n\n` +
                    `Must be in graphics mode (VS 4) for command to exexute without an error` );
            }
            if (word === 'CLEAR') {
		return new vscode.Hover(`**CLEAR**:  CLEAR removes all of the variables.\n\n` +
                    `Usage: CLEAR \n\n`);
            }
            if (word === 'CLOCK') {
		return new vscode.Hover(`**CLOCK**:  The clock is initialised to the value of the string.\n\n` +
                    `Usage: CLOCK string \n\n` +
                    `The clock is a 100 hour clock which counts accurately in seconds minutes and hours up to 100 hours when it resets to 0.\n\n` + 
                    `To print the time see TIME$. For example: To print the time in the top left corner:\n\n` + 
                    `10 CLOCK “120000”: CLS\n\n` + 
                    `20 PRINT TIME$;CHR$(26);\n\n` + 
                    `30 GOTO 20: REM CHR$(26) Homes the cursor\n\n` +
                    `see TIME$`);
            } 
            if (word === 'CLS') {
		return new vscode.Hover(`**CLS**:  Clear the screen.\n\n` +
                    `Usage: CLS \n\n` +
                    `In TEXT mode CLS will clear the screen (or Virtual screen).\n\n` + 
                    `in GRAPHICS mode CLS will clear the screen unless one of the screen attributes has been set using the ATTR function,\n\n` + 
                    `in which case it may be necessary to switch off the attribute before CLS will operate.`);
            } 
            if (word === 'CODE') {
		return new vscode.Hover(`**CODE**: CODE is an anchor word to indicate that the following lines are assembly language.\n\n` +
                    `Usage: CODE \n\n` +
                    `In the normal MTX editor mode, use ASSEM line number to create assembly CODE, note the word cannot be typed and is inserted by the assembler into the BASIC line.\n\n` + 
                    `NOTE: In this free form VS code extension, ASSEM line number is not used. Instead use \\<space or TAB\\> \\<line number\\>  CODE (no space after it).\n\n` + 
                    `CODE command must be on a separate line and NOT be part of a multi line, e.g. 20 CLS: CODE: PRINT "test"  \n\n` +
                    `Example: \n\n` +
                    `10 REM START OF PROGRAM\n\n` +
                    `20 CODE\n\n` + 
                    ` 401E LABEL: LD A,(HL)\n\n` +
                    ` 401F RET\n\n` +   
                    `The hexadecimal line numbers (401E and 401F) when using VS Code are required, when saving the code (.mtx file), a check of hex address will update if incorrect\n\n` +  
                    `Note to differentiate a BASIC line number from a hexadecimal line number, the hexadecimal line number must be on a separate line and indented by either a space or a TAB.\n\n` + 
                    `Refer to the MTX Series Owners Manual for details on assembler and Z80 assembly language`);
            }            
            if (word === 'COLOUR') {// generates a MTX BASIC SE.C error if VS 4 not specified beforehand
		return new vscode.Hover(`**COLOUR**: Sets the colours for the graphics screen with the specified parameters.\n\n` +
                    `Usage: COLOUR P,N\n\n` +
                    `P: The value of p selects which areas of the screen the colour refers to.\n\n` + 
                    `Two sets of colours are defined. The print colours refer to Colours that will be used when colours are printed.\n\n` +  
                    `The non-print or PLOT colours refer to colours that will be used when colours are plotted or when screen functions are used.\n\n` + 
                    `P=0, print paper.\n\n` +  
		    `P=1, print ink.\n\n` + 
		    `P=2, non-print (plot) paper.\n\n` + 
		    `P=3, non-print ink.\n\n` +  
		    `P=4, border colour.\n\n` + 
		    `N: Selects the colour (see colour table in the appendix 7). (0 to 15)\n\n` +
                    `Must be in graphics mode (VS 4) for command to exexute without an error` );                
	   }
            if (word === 'CONT') {
		return new vscode.Hover(`**CONT**:  Used to restart a program after a STOP instruction or BRK kety pressed.\n\n` +
                    `Usage: CONT \n\n` +
                    `CONT can be used directly after a STOP command or after pressing the break key to restart the program.\n\n` +                   
                    `Any editing or alteration of the program will prevent CONT from operating.`);
            }
            if (word === 'COS') {
		return new vscode.Hover(`**COS**:  Returns the cosine of the angle.\n\n` +
                    `Usage: COS(angle) \n\n` +
                    `Returns the cosine of the angle specified in radians`);
            }            
            if (word === 'CRVS') {              
                return new vscode.Hover(`**CRVS**: Creates a virtual screen with the specified parameters.\n\n` +
                    `Usage: CRVS N,T,X,Y,W,H,S\n\n` +
                    `N: Virtual screen reference number. (0 to 7)\n\n` +
                    `T: Type of screen. 0=text, 1=graphics.\n\n` +
                    `X: X coordinate of top left corner.\n\n` +
                    `Y: Y coordinate of top left corner.\n\n` +
                    `W: Width of virtual screen in characters.\n\n` +
                    `H: Height of screen in lines.\n\n` +
                    `S: Width of screen. (40 for text, 32 for graphics)\n\n` +
                    `The virtual screen can be used for off-screen drawing and later copied to the main screen using the VS command.`);
            }
            if (word === 'CSR') {
		return new vscode.Hover(`**CSR**:  Moves the cursor to position with the specified parameters.\n\n` +
                    `Usage: CSR X,Y \n\n` +
                    `X: X-coordinate (0 to 39 for text mode, 0 to 31 for graphics text mode).\n\n` + 
                    `Y: Y-coordinate (0 to 23).\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `10 CSR 12,10\n\n` +
                    `Moves the cursor to position 12,10\n\n` + 
                    `Any subsequent Printing or Input will occur at the new cursor position.`);
            }
            if (word === 'CTLSPR') {
		return new vscode.Hover(`**CTLSPR**:  Sprite control with the specified parameters.\n\n` +
                    `Usage: CTLSPR P,X \n\n` +
                    `P: parameter and can be any of the six below:\n\n` + 
                    `P=0  Speed (1 to 255 to 0 (1 is fastest)\n\n` + 
                    `P=1  Distance. Tells the computer to move the sprite by 'X' pixels when requested.\n\n` + 
                    `P=2  Number of sprites, 0 to 32 (The number of sprites must be at least 1)\n\n` +   
                    `P=3  Number of circling sprites. Sprites that will orbit when they go off the edge of the screen (must not exceed number of sprites)\n\n` +   
                    `P=4  Plot Sprite.A PLOT SPRITE can be chosen which will subsequently appear whenever a point is plotted. This sprite will move around the screen following any points or lines drawn by the BASIC GRAPHICS commands. This sprite can be any of the 32 defined in the normal way.\n\n` +
                    `P=5  number of moving sprites 0 to 32. This is the number of sprites that will move by themselves according to the x-speed and y-speed set in the SPRITE and ADJSPR commands\n\n` + 
                    `P=6  magnitude (mag 1 or 2) and size (8x8 or 16x16)\n\n` + 
                    `X=0 mag 1, 8x8 ; X=1 mag 2, 8x8 ; X=2 mag 1, 16x16 and X=3 mag 2, 16x16`);
            }  
            if (word === 'DATA') {
		return new vscode.Hover(`**DATA**:  A data list construct accessible using a READ statement.\n\n` +
                    `Usage: DATA \\<list of values\\> \n\n` +
                    `DATA list can be a list of numbers or alphanumeric words or strings, e.g. 10 DATA 1,2,1CODE,"test"  20 READ A,B,C$,D$\n\n` + 
                    `DATA statements aren't themselves executed and will be ignored other than when required by a READ statement.\n\n` + 
                    `If all of the data on a line has been read by a READ statement, the computer will search for the next DATA statement and update the DATA POINTER accordingly.\n\n` + 
                    `If no more DATA is available, a No Data error will occur. DATA can be numbers of strings.\n\n` + 
                    `Example: \n\n` + 
                    `10 FOR I = 1 to 10: READ X: PRINT X: NEXT I\n\n` + 
                    `20 DATA 1,1,2,2,3,3,\n\n` + 
                    `30 DATA 4,4,5,5\n\n` + 
                    `See READ and RESTORE`);
            }
            if (word === 'DIM') {
		return new vscode.Hover(`**DIM**:  Reserves space in the computer memeory for the specified an array(s).\n\n` +
                    `Usage: DIM \\<array list\\> \n\n` +
                    `Before an array can be used, space must be made in the computer memory using a DIM statement\n\n` + 
                    `Example: \n\n` + 
                    `10 DIM A(10,10),A$(1000)\n\n` + 
                    `Each element of a numeric array takes 5 bytes and each element of a character array takes 1 byte.\n\n` + 
                    `All strings are treated as character arrays rather than variable length strings. The amount of space allocated to the character array will depend on whether or not a DIM statement is used.\n\n` +
                    `An array cannot be redimensioned unless all of the variables are cleared. See manual for more detail and examples`);
            }
            if (word === 'DRAW') { // generates a MTX BASIC SE.C error if VS 4 not specified beforehand
		return new vscode.Hover(`**DRAW**:  Draws a simple line with the specified parameter.\n\n` +
                    `Usage: DRAW x \n\n` +                   
                    `Draws a line of length X from the current plot position in the current direction The plot position is updated to the end of the line.\n\n` +
                    `Must be in graphics mode (VS 4) for command to exexute without an error, see LINE`);
            }  
            if (word === 'DSI') {
		return new vscode.Hover(`**AA**:  Direct Screen Input.\n\n` +
                    `Usage: DSI \n\n` +
                    `This command allows you to roam about freely within a screen only ending when carriage return is pressed\n\n` + 
                    `Within this instruction, the break key is not operational but will generate CTL C.\n\n` + 
                    `Special CTL and ESC functions help navigate around the screenm area.\n\n` + 
                    `CTL W (TAB back) ; CTL ] (PMODE) ; CTL \\ (SMODE) ; CTL ^ (Cursor ON) ; CTL _ (Cursor off) \n\n` +  
                    `CTL D (letter A to 0 = paper A to 0 (1 to 15) ; CTL F (letter A to 0 = ink A to 0 (1 to 15)\n\n` + 
                    `ESC I (Insert Line) ; ESC J (delete line) ; ESC K (duplicate line)`);
            } 
            if (word === 'EDIT') {
		return new vscode.Hover(`**EDIT**: The specified line is to be copied into the EDIT screen for editing..\n\n` +
                    `Usage: EDIT \\<line number\\> \n\n` +
                    `This only works for BASIC lines. Use ASSEM line number to edit CODE.\n\n` +                  
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like ASSEM, AUTO, or EDIT.`);
            } 
             if (word === 'EDITOR') {
		return new vscode.Hover(`**EDITOR**:  Provides the programmer the facility to accept input from a defined area of the screen.\n\n` +
                    `Usage: EDITOR \\<string or string variable list\\> \n\n` +
                    `The area is defined by virtual screen 0 which may be set using the CRVS command\n\n` + 
                    `Example: \n\n` + 
                    `10 CRVS 0 ,0,20 , 10, 10,1,40 \n\n` + 
                    `20 EDITOR A$\n\n` +  
                    `30 VS 5: PRINT A$: GOTO 20\n\n` +               
                    `After EDITOR input, to display the value on the main screen, need to set the screen to VS 5`);
            }
            if (word === 'ELSE') {
		return new vscode.Hover(`**ELSE**:  Part of the IF .. THEN .. ELSE .. control construct.\n\n` +
                    `Usage: ELSE \n\n` +                   
                    `see IF`);
            }          
            if (word === 'EXP') {
		return new vscode.Hover(`**EXP**:  Exponential function.\n\n` +
                    `Usage: EXP(number) \n\n` +
                    `EXP is the exponential function whose value is e raised to the power of the specified number\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `10 PRINT EXP(1)\n\n` +
                    `Returns 2.71828183`);
            }  
            if (word === 'FOR') {
		return new vscode.Hover(`**FOR**:  FOR .. TO .. STEP .. : NEXT control construct.\n\n` +
                    `Usage: FOR \\<control variable\\>=\\<start\\> TO \\<limit\\> STEP \\<increment\\> : NEXT \\<control variable\\>\n\n` +
                    `control variable is a simple numeric variable but in this instance is called the control variable.\n\n` + 
                    `Start, limit and increment are numeric expressions.\n\n` + 
                    `STEP increment is optional, default is STEP 1\n\n` + 
                    `NEXT control variable, sometimes the control variable is dropped\n\n` +                   
                    `see NEXT and the manula for examples.`);
            }
            if (word === 'GENPAT') {
		return new vscode.Hover(`**GENPAT**:  Defines a character or sprite pattern with the specified parameters.\n\n` +
                    `Usage: GENPAT P,N,d1,d2,d3,d4,d5.d6,d7,d8 \n\n` +
                    `The command is used to generate all types of patterns (d1 to d8) required by BASIC for characters and SPRITES.There are 5 modes:-\n\n` + 
                    `Mode 1: P=0, To redefine an ASCII character, N=32 TO 127\n\n` + 
                    `Mode 2: P=1, To define a non ASCII character (User Definable Characters, UDC),N=129 TO 154\n\n` + 
                    `Mode 3: P=2 To define ink and paper colour for each line of a character. This only applies to UDC with codes, N=147 TO 154\n\n` +
                    `Mode 4: P=3, To define an 8 by 8 sprite pattern, N=0 TO 31\n\n` + 
                    `Mode 5. P=4 to 7. To define each quadrant of a 16 by 16 sprite (NW, SW, NE, SE respectively),N=0 TO 31\n\n` +
                    `Pattern Byte Data: d1 to d8 in range 0 to 255\n\n` +  
                    `Refer to the manual for details`);
            } 
            if (word === 'GOSUB') {
		return new vscode.Hover(`**GOSUB**:  Jumps to BASIC code at line number, executes a subroutine and returns (see RETURN).\n\n` +
                    `Usage: GOSUB \\<line number\\> \n\n` +
                    `Executes a subroutine. Similar to a calling a procedure with no parameters\n\n` + 
                    `Continue execution from the specified line until a RETURN statement is encountered at which point return control to the statement following the GOSUB\n\n` + 
                    `GOSUBs may be nested up to 34 deep at which point an error will occur.\n\n` + 
                    `EXAMPLE: \n\n` +  
                    `10 FOR I= 1 to 10: GOSUB 100: NEXT\n\n` + 
                    `20 STOP\n\n` + 
                    `100 PRINT I, SIN(I): RETURN\n\n` + 
                    `see RETURN and ON`);
            } 
            if (word === 'GOTO') {
		return new vscode.Hover(`**GOTO**:  Control is passed to the BASIC line specified\n\n` +
                    `Usage: GOTO \\<line number\\> \n\n` +
                    `EXAMPLE: \n\n` + 
                    `10 GOTO 30\n\n` + 
                    `20: PRINT "LINE 20": STOP\n\n` + 
                    `30 PRINT "LINE 40"\n\n` + 
                    `If the line doesn't exist an error will occur. See also ON`);
            }   
            if (word === 'GR$') {
		return new vscode.Hover(`**GR$**:  Reads a bit pattern from a graphics screen, returning the value as a character with the specified parameters.\n\n` +
                    `Usage: GR$(X,Y,B) \n\n` +
                    `This function should be used if you wish to print the graphics screen to a high resolution printer.\n\n` + 
                    `X and Y: locations on the virtual screen.\n\n` + 
                    `B: the number of bits to be read, if b=1, equivalent to a POINT function.\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `The bits are read in a vertical direction, ie. GR$(20,190,4) gives a character made up as follows:\n\n` + 
                    `bit 7=0 ; bit 6=0 ; bit 5=0 ; bit 4=0 ; bit 3=pixel at 20,190 ; bit 2=pixel 20,189 ; bit 1=pixel 20,188 ; bit 0=pixel 20,187`);
            } 
            if (word === 'IF') {
		return new vscode.Hover(`**IF**: IF .. THEN .. ELSE control construct.\n\n` +
                    `Usage: IF \\<boolean expression\\> THEN \\<statement\\> ELSE \\<statement\\> \n\n` +
                    `The IF statement allows the program to branch depending on whether a condition is true or false.\n\n` + 
                    `boolean expression is any expression which yields a truth value,e.g. Y=2 AND X=3.\n\n` + 
                    `statement is any legal BASIC statement (which may include an IF statement).\n\n` + 
                    `If the boolean expression is true, the statement after the THEN is executed.\n\n` + 
                    `If the boolean expression is false and ELSE is not present, the program continues at the next line.\n\n` + 
                    `If the boolean expression is false and ELSE is present, the program continues after the ELSE.\n\n` +
                    `EXAMPLE: 20 IF A$="Y" OR A$="y" THEN GOTO 40 ELSE GOTO 100`);
            }  
            if (word === 'INK') {
		return new vscode.Hover(`**INK**:  Specifies the INK colour on the screen.\n\n` +
                    `Usage: INK colour\n\n` +
                    `Selects the INK colour. colour is a number in the range 0 to 15 .\n\n` + 
                    `0 = Transparent ; 1 = Black ; 2 = Medium Green ; 3 = Light Green ; 4 = Dark Blue\n\n` + 
                    `5 = Light Blue ; 6 = Dark Red ; 7 = Cyan ; 8 = Medium Red ; 9 = Light Red\n\n` + 
                    `10 = Dark Yellow ; 11 = Light Yellow ; 12 = Dark Green ; 13 = Magenta ; 14 = Grey ; 15 = White\n\n` + 
                    `Seee colour table in the appendix 7`);
            }
            if (word === 'INKEY$') {
		return new vscode.Hover(`**INKEY$**:  Reads the keyboard for a keypress.\n\n` +
                    `Usage: INKEY$ \n\n` +
                    `The keyboard can be read by the use of the function INKEY$\n\n` + 
                    `This is in practice a very useful function since it enables you to write programs where the computer interacts with the person operating the keyboard.\n\n` + 
                    `10 PRINT "PRESS Y TO CONTINUE”\n\n` + 
                    `20 LET A$=INKEY$\n\n` +       
                    `30 IF A$<>"Y" THEN GOTO 20\n\n` + 
                    `40 PRINT "YOU PRESSED Y"`);
            }            
            if (word === 'INP') {
		return new vscode.Hover(`**INP**:  Read a byte from the specified port.\n\n` +
                    `Usage: INP(port) \n\n` + 
                    `port: 0 to 255 \n\n` + 
                    `Reads a byte from the specified port.`);
            } 
            if (word === 'INPUT') {
		return new vscode.Hover(`**INPUT**:  The INPUT command is used to input information into the computer with the specified parameters.\n\n` +
                    `Usage: INPUT string;\\<variable list\\> \n\n` +
                    `string is optional. INPUT "Enter your name";A$\n\n` + 
                    `variable list can be variable or string variable, e.g. INPUT A, B, ABC$\n\n` + 
                    `If the {string} is not present, a question mark will appear as a Prompt whenever the INPUT statement is used.\n\n` + 
                    `If the (string) is present, it replaces the question mark as a Prompt. The string must be followed by a semicolon.\n\n` +   
                    `If non-numeric information is entered into a numeric variable, or the too few items are input,\n\n` +
                    `a question mark will appear after information which means that it should all be typed in again.`);
            }  
            if (word === 'INT') {
		return new vscode.Hover(`**INT**:  Returns the integer part of the number.\n\n` +
                    `Usage: INT(number) \n\n` +
                    `PRINT INT(-2.5)\n\n` +  
                    `Returns -2`);
            }  
            if (word === 'LEFT$') {
		return new vscode.Hover(`**LEFT$**:  Truncates a string from the left with the specified parameters.\n\n` +
                    `Usage: LEFT$(string,number) \n\n` +
                    `The string is truncated after the specified number of characters from the left. \n\n` + 
                    `EXAMPLE:\n\n` + 
                    `10 PRINT LEFT$("abcdef",3)\n\n` +                   
                    `Returns "abc"`);
            } 
            if (word === 'LEN') {
		return new vscode.Hover(`**LEN**:  Returns the length of a string.\n\n` +
                    `Usage: LEN (string) \n\n` +
                    `Gives the length of a string.\n\n` + 
                    `Note that a space must be left between LEN and (string) otherwise LEN will be considered as a numeric array.\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `10 PRINT LEN ("ABC"+"DEF")\n\n` + 
                    `Returns 6`);
            }
            if (word === 'LET') {
		return new vscode.Hover(`**LET**:  Used for variable assignment.\n\n` +
                    `Usage: LET	variable=value\n\n` +
                    `The LET statement assigns a value to a variable. \n\n` + 
                    `The value and variable must be of the same type.\n\n` + 
                    `i.e. numbers cannot be assigned to string variables and strings cannot be assigned to numeric variables.\n\n` +
                    `EXAMPLE: \n\n` + 
                    `10 LET X=2\n\n` + 
                    `20 LET A$=”abc"\n\n` +
                    `This assigns the value 2 to the variable X and the value "abc" to the variable A$.`);
            }  
            if (word === 'LINE') { // generates a MTX BASIC SE.C error if VS 4 not specified beforehand
		return new vscode.Hover(`**LINE**:  Draws a line between 2 sets of coordinates. See also DRAW\n\n` +
                    `Usage: LINE X1,Y1,X2,Y2 \n\n` + 
                    `Draws a line from coordinates (X1,Y1) to (X2,Y2)\n\n` +
                    `Must be in graphics mode (VS 4) for command to exexute without an error, see LINE`);
            } 
            if (word === 'LIST') {
		return new vscode.Hover(`**LIST**:  List a program to the screen.\n\n` +
                    `Usage: LIST \\<start line number\\>,\\<end line number\\>\n\n` +
                    `LIST lists a program to the screen.\n\n` + 
                    `3 variations: \n\n` + 
                    `LIST, LIST start line number or LIST start line number,end line number\n\n` +
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like LIST.`);
            } 
            if (word === 'LLIST') {
		return new vscode.Hover(`**LLIST**: List a program to the printer.\n\n` +
                    `Usage: LLIST \\<start line number\\>,\\<end line number\\> \n\n` +
                    `LLIST lists a program to the printer.\n\n` + 
                    `3 variations: \n\n` +                  
                    `LLIST, LLIST start line number or LLIST start line number,end line number`);
            } 
            if (word === 'LN') {
		return new vscode.Hover(`**LN**:  Returns the natural log of the specified number.\n\n` +  
		    `Usage: LN(number) \n\n` +
                    `Returns the natural log of the specified number`);
            } 
            if (word === 'LOAD') {
		return new vscode.Hover(`**LOAD**:  Loads a file from cassette tape into memory. (see also USER DISC for disc loading options)\n\n` +  
		    `Usage: LOAD "tapename.extension" \n\n` +
                    `The tapename and extension is limited to 14 alphanumeric characters, including extension (see later for MEMU variation). e.g. LOAD "FILENAME90.BAS"\n\n` + 
                    `LOAD "" is used to reload the last save program, assuming the reset keys have not been pressed or command NEW executed. \n\n` + 
                    `The extension is optional and is typically either be "BAS" or "mtx" for MTX BASIC programs with or without built-in Z80 assembly code.\n\n` +  
                    `If using the MEMU emualator, the emulator automatically adds .mtx at the end of the filename and not part of the standard 14 character limit.\n\n` +
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like LOAD.`);
            }             
            if (word === 'LPRINT') {
		return new vscode.Hover(`**LPRINT**:  Prints information to the printer.\n\n` +
                    `Usage: LPRINT \\<expression list\\> \n\n` +
                    `The LPRINT command is used to print information to the printer\n\n` + 
                    `LPRINT is followed by a list of expressions separated by commas or semicolons.\n\n` + 
                    `The expressions can be string expressions or mathematical expressions and any number of commas can be used to tabulate the information.\n\n` + 
                    `A comma moves the cursor to the next TAB position. A Semicolon leaves the cursor immediately after the printed information.\n\n` +  
                    `EXAMPLE: \n\n` + 
                    `10 LPRINT “SIN of 8 = “;SIN(8)\n\n` +
                    `Sends SIN of 8 = 0.989358247 to the printer`);
            } 
            if (word === 'MID$') {
		return new vscode.Hover(`**MID$**:  Returns Y characters starting at position X in the string with the specified parameters.\n\n` +
                    `Usage: MID$(string,X,Y) \n\n` +
                    `Returns Y characters starting at position X in the string \n\n` + 
                    `EXAMPLE:\n\n` + 
                    `10 PRINT MID$(“ABCD”+”EFGH”,3,4)\n\n` +                   
                    `Returns "CDEF"`);
            }   
             if (word === 'MOD') {
		return new vscode.Hover(`**MOD**:  Returns the remainder on dividing X by Y.\n\n` +
                    `Usage: MOD(X,Y) \n\n` +
                    `Returns the remainder on dividing X by Y\n\n` + 
                    `MOD (X,Y) is equivalent to X-INT(X/Y)*Y\n\n` +
                    `Gives an error if division by 0\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `PRINT MOD(10,7)\n\n` + 
                    `Returns a remainder of 3`);
            } 
            if (word === 'MVSPR ') {
		return new vscode.Hover(`**MVSPR**:  General purpose sprite command with the specified parameters.\n\n` +
                    `Usage: MVSPR P,N,D \n\n` +
                    `The functions are combined to allow complicated movements to occur whilst using only a single instruction. Add the P values together to get the movement combination required.\n\n` + 
                    `D is slightly more complicated as it must be able to reflect a value for several activities. If D is not in the range of any one of the chosen activities an error will occur.\n\n` + 
                    `P=1 , MOVEMENT of Sprite in the direction specified by D (0 to 8). The step size is set in CTLSPR 1\n\n` + 
                    `P=2 , Pattern Selection, changes the sprite pattern to pattern number D, defined by a GENPAT statement\n\n` +  
                    `P=4 , Redirect picks up the current velocity vector and switches it to the new direction.\n\n` + 
                    `P=8 , Plot at centre causes a point to be plotted at the centre of the sprite specified by N. This is not directly affected by the value of D at all.\n\n` +
                    `N selects the sprite number (0 to 32)`);
            } 
            if (word === 'NEW') {
		return new vscode.Hover(`**NEW**:  Clears any program in memory\n\n` +
                    `Usage: NEW \n\n` +
                    `This command resets the computers system variables thereby preparing it to accept a new program.\n\n` + 
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like NEW.`);
            }   
            if (word === 'NEXT') {
		return new vscode.Hover(`**NEXT**: Next specifies the end of a FOR control loop.\n\n` +
                    `Usage: NEXT \\<control variable\\> \n\n` +
                    `If the control variable is specified, the NEXT is matched with FOR and all nested FOR blocks which are either complete or incomplete are terminated.\n\n` +  
                    `If the variable is not specified it is assumed that this NEXT belongs to the last active FOR statement. See FOR`);
            } 
            if (word === 'NODDY') {
		return new vscode.Hover(`**NODDY**:  Text language editor.\n\n` +
                    `Usage: NODDY \n\n` +
                    `Passes control to the Noddy editor. Noddy should appear at the base of the screen, See Notes below for VS Code usage.\n\n` + 
                    `Commands: *A or *ADVANCE ; *B or *BRANCH ; *D or *DISPLAY ; *E or *ENTER ; *G or *GOTO \n\n` + 
                    `*I or *IF ; *L or *LIST ; *O or *OFF ; *P or *PAUSE ; *R or *RETURN ; *S or *STACK \n\n` + 
                    `NODDY coding language also uses "^" symbol followed by a label which is required for branching.\n\n` +
                    `IF R,r\n\n` +
                    `^r *R    (or ^r *RETURN)\n\n` +
                    `In the above example, R and *R are different.\n\n` +
                    `Refer to the MTX Series Owners Manual, PART 2 for details on the Noddy language.\n\n` +  
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like NODDY but a modification thereof.\n\n` +                  
                    `NOTE: Add a newline at the very end of the program, e.g., 65535 REM NODDY\n\n` +
                    `NOTE: Anything after the special REM NODDY statement will be treated as NODDY code/text (as above).`);
            } 
            if (word === 'NOT') {
		return new vscode.Hover(`**NOT**: Boolean expression. compares two values to see if the condition is either True or False.\n\n` +
                    `Usage: NOT \n\n` +
                    `Example: \n\n` + 
                    `10 LET X=1:PRINT (NOT X=2)\n\n` + 
                    `Returns -1 as X is NOT equal to 2 (TRUE). If X=2 then X is equal to 2 Returns 0 (False).`);
            } 
            if (word === 'ON') {
		return new vscode.Hover(`**ON**:  Branch condition for GOTO and GOSUB.\n\n` +
                    `Usage: ON X GOTO \\<line number list\\> or  ON X GOSUB \\<line number list\\> \n\n` +
                    `The ON command is used when you want to GOTO or GOSUB to a part of the program depending on the value of a variable\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `10 LET X=2\n\n` + 
                    `20 ON X GOTO 100,200,300,400,500\n\n` + 
                    `If X=0 it would branch to 100, X=1 would branch to 200, etc\n\n` +
                    `If line 20 was GOSUB rather than GOTO, it would jump to the subroutine and execute until it encounters a RETURN statement`);
            }              
            if (word === 'OR') {
		return new vscode.Hover(`**OR**: Boolean expression. compares two values to see if the condition is either True or False.\n\n` +
                    `Usage: OR \n\n` +
                    `Example: \n\n` + 
                    `10 LET X=1\n\n` + 
                    `20 IF X=1 OR X=2 THEN PRINT "True" ELSE PRINT "False"\n\n` +
                    `30 PRINT (X=1 OR X=2)\n\n` +
                    `In this case, returns True at line 20 and -1 at line 30.`);
            }             
            if (word === 'OUT') {
		return new vscode.Hover(`**OUT**:  Outputs the specified value to the specified port.\n\n` +
                    `Usage: OUT port,value\n\n` +                 
                    `Refer to MTX series Owners Manual, Technical Section, System Block Diagram`);
            }            
            if (word === 'PANEL') {
		return new vscode.Hover(`**PANEL**:  Z80 debugger and hex/ascii dump of memory .\n\n` +
                    `Usage: PANEL \n\n` +
                    `Passes control to the PANEL editor.\n\n` + 
                    `List programs, displays ROM, RAM, and z80 registers and allows users to step through code 1 line at a time.\n\n` +
                    `Refer to the MTX Series Owners Manual for details ON PANEL.\n\n` +
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like PANEL.\n\n`+
                    `NOTE: Use utility tools mtxdisassembly.py & mtxhexdump.py to provide some of the functionality of PANEL outwith a MTX or MEMU emulator.`);
            }  
            if (word === 'PAPER') {
		return new vscode.Hover(`**PAPER**:  Specifies the PAPER colour on the screen.\n\n` +
                    `Usage: PAPER colour \n\n` +
                    `Selects the PAPER colour. colour is a number in the range 0 to 15 .\n\n` + 
                    `0 = Transparent ; 1 = Black ; 2 = Medium Green ; 3 = Light Green ; 4 = Dark Blue\n\n` + 
                    `5 = Light Blue ; 6 = Dark Red ; 7 = Cyan ; 8 = Medium Red ; 9 = Light Red\n\n` + 
                    `10 = Dark Yellow ; 11 = Light Yellow ; 12 = Dark Green ; 13 = Magenta ; 14 = Grey ; 15 = White\n\n` +
                    `Seee colour table in the appendix 7`);
            }  
            if (word === 'PAUSE') {
		return new vscode.Hover(`**PAUSE**:  with the specified parameters.\n\n` +
                    `Usage: PAUSE number \n\n` +
                    `The program will pause for a length of time dependent on number. \n\n` + 
                    `The time cannot be specified accurately but will vary according to how many incidental functions\n\n` +
                    `the computer is performing at the same time such as flashing the cursor or updating the clock.`);
            }   
            if (word === 'PEEK') {
		return new vscode.Hover(`**PEEK**:  Returns the contents of the specified address in the current memory page.\n\n` +
                    `Usage: PEEK memory address\n\n` +
                    `Notice that the MTX pages its memory in 32K blocks and so care must be taken to ensure that when PEEK\n\n` +
                    `is used you are peeking the correct page. The top 16K of memory is available to all pages`);
            }            
            if (word === 'PHI') { // doesn't generate a MTX BASIC SE.C error if VS 4 not specified beforehand
		return new vscode.Hover(`**PHI**: Adjusts the angle by a specified angle in radians.\n\n` +
                    `Usage: PHI angle \n\n` +
                    `Each time a PHI command is executed, the 'direction' is adjusted by the specified angle, see ANGLE.\n\n` + 
                    `EXAMPLE:\n\n` + 
                    `10 VS 4: CLS: ANGLE 0\n\n` + 
                    `20 FOR I=1 to 20\n\n` + 
                    `30 PLOT 100,100\n\n` + 
                    `40 PHI .1\n\n` + 
                    `50 DRAW 50\n\n` + 
                    `60 NEXT\n\n` + 
                    `70 GOTO 70`);
            }
            if (word === 'PI') {
		return new vscode.Hover(`**PI**:  Constant ratio of the circumference of a circle to its diameter.\n\n` +
                    `Usage: PI \n\n` +
                    `The MTX stores an accurate value of PI so that it doesn't have to be calculated each time that it is needed.\n\n` + 
                    `PI can be considered as a number and used whenever a number would be used\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `PRINT PI\n\n` + 
                    `PRINT COS(PI/2)`);
            }  
            if (word === 'PLOD') {
		return new vscode.Hover(`**PLOD**:  Runs a NODDY program.\n\n` +
                    `Usage: PLOD "string" \n\n` +
                    `PLOD is used to run a Noddy program where string is the name of the Noddy page at which execution starts.\n\n` + 
                    `PLOD may be used within a BASIC program and control may be switched backwards and forwards.\n\n` + 
                    `When a Noddy program returns, execution continues at the next basic line.\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `10 PLOD "PROG1"`);
            }
            if (word === 'PLOT') { // generates a MTX BASIC SE.C error if VS 4 not specified beforehand
		return new vscode.Hover(`**PLOT**:  Plots a point on the graphics screen.\n\n` +
                    `Usage: PLOT X,Y \n\n` +
                    `Plots a point in the graphics screen at the graphics coordinates (X,Y)\n\n` + 
                    `Must be in graphics mode (VS 4) for command to exexute without an error, see LINE, see COLOUR and ATTR`);
            }   
            if (word === 'POKE') {
		return new vscode.Hover(`**POKE**:  Stores a specified value in the computer memory.\n\n` +
                    `Usage: POKE memory address,value \n\n` +
                    `The POKE command loads a the specified memory location with the specified value\n\n` + 
                    `If more than 32K of memory is present, the basic program may spread over several pages (see ROM BASED MEMORY MAP).\n\n` + 
                    `The top 16K will always be present but POKE-ing into any other area may be dangerous unless other precautions are taken.\n\n` + 
                    `EXAMPLE: load 100 into memory address 50000\n\n` + 
                    `POKE 50000,100`);
            }            
            if (word === 'PRINT') {
		return new vscode.Hover(`**PRINT**:  Prints information to the television screen or monitor.\n\n` +
                    `Usage: PRINT \\<expression list\\> \n\n` +
                    `The PRINT command is used to print information to the screen\n\n` + 
                    `PRINT is followed by a list of expressions separated by commas or semicolons.\n\n` + 
                    `The expressions can be string expressions or mathematical expressions and any number of commas can be used to tabulate the information.\n\n` + 
                    `A comma moves the cursor to the next TAB position. A Semicolon leaves the cursor immediately after the printed information.\n\n` +  
                    `EXAMPLE: \n\n` + 
                    `10 PRINT “SIN of 8 = “;SIN(8)\n\n` +
                    `Displays on the screen SIN of 8 = 0.989358247`);
            } 
            if (word === 'RAND') {
		return new vscode.Hover(`**RAND**:  Seeds the random number generator. (see also RND)\n\n` +
                    `Usage: RAND number \n\n` +
                    `This command sets the seed for the random number generator. If no number is specified the seed will be set to a random number.\n\n` + 
                    `10 RAND 1000\n\n` + 
                    `20 FOR I=1 to 100: PRINT INT(RND*50): NEXT I`);
            } 
            if (word === 'READ') {
		return new vscode.Hover(`**READ**:  Reads infdormation stored in DATA statements (see also DATA and RESTORE).\n\n` +
                    `Usage: READ \\<variable list\\> \n\n` +
                    `Values are read from the DATA statements (See DATA) sequentially into the variables specified in the READ statement.\n\n` + 
                    `If an invalid assignment is made to a numeric variable an error will occur.\n\n` + 
                    `Data statements may occur anywhere within a program and are accessed sequentially in order either from the start of the program or from the value specified in a RESTORE statement.\n\n` + 
                    `EXAMPLE: \n\n` +  
                    `10 READ A, B, A$,B $(8) \n\n` + 
                    `20 PRINT A, B, A$, B$ \n\n` + 
                    `30 DATA 1, 2, AA, BB`);
            }  
            if (word === 'REM') {
		return new vscode.Hover(`**REM**:  Used for comments and documenting the code to improve legibility.\n\n` +
                    `Usage: REM \\<anything\\> \n\n` +
                    `The REM command allows comments to be inserted into a program.\n\n` +    
                    `The REM command and any text associated with it doesn't need to be in double quotes but this can lead to spurious errors, like if a colon (:) which splits up statements.\n\n` +   
                    `To avoid spurious errors, .\n\n` +
                    `The REM statement is ignored by the computer and is used only for documentation.`);
            } 
            if (word === 'RESTORE') {
		return new vscode.Hover(`**RESTORE**:  Where data is stored. (see also DATA and READ)\n\n` +
                    `Usage: RESTORE line number \n\n` +
                    `Restore tells the computer from which line the next READ statement should start reading the next DATA item\n\n` + 
                    `This is particularly useful if the same DATA has to be read in two or more parts of a program\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `10 DIM A(20)\n\n` +  
                    `20 FOR I= 1 TO 10: READ A: PRINT A: NEXT I\n\n` + 
                    `60 RESTORE 100\n\n` + 
                    `70 FOR I= 1 TO 10: READ A(I): NEXT I\n\n` + 
                    `100 DATA 1,2,3,4,5,6,7,8,9,0`);
            } 
            if (word === 'RETURN') {
		return new vscode.Hover(`**RETURN**:  When encountered, returns to the line following the calling GOSUB.\n\n` +
                    `Usage: RETURN \n\n` +                   
                    `Returns control to the line following the last GOSUB executed If no GOSUB has been executed, an error will occur.`);
            }  
            if (word === 'RIGHT$') {
		return new vscode.Hover(`**RIGHT$**:  Truncates a string from the right with the specified parameters.\n\n` +
                    `Usage: RIGHT$(string,number) \n\n` +
                    `The string is truncated after the specified number of characters from the right. \n\n` + 
                    `EXAMPLE:\n\n` + 
                    `10 PRINT RIGHT$("abcdef",3)\n\n` +                   
                    `Returns "def"`);
            } 
            if (word === 'RND') {
		return new vscode.Hover(`**RND**:  pseudo random number seeded by RAND.\n\n` +
                    `Usage: RND \n\n` +                   
                    `RND returns a pseudo random number.\n\n` + 
                    `see example at RAND`);
            }
            if (word === 'ROM') {
		return new vscode.Hover(`**ROM**:  with the specified parameters.\n\n` +
                    `Usage: ROM number \n\n` +
                    `Passes control to an additional ROM pack for example PASCAL FORTH. Details will be supplied with the ROM.\n\n` + 
                    `It is dangerous to use this command unless the appropriate ROM actually present.\n\n` +                
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like ROM.`);
            }
            if (word === 'RUN') {
		return new vscode.Hover(`**RUN**:  Tells the computer to execute (run) the program in memory.\n\n` +
                    `Usage: RUN \n\n` +
                    `RUN tells the computer to start running the program from beginning.\n\n` + 
                    `All variables will be cleared.\n\n` + 
                    `A program can also be run by using a GOTO statement as a direct command. In this case the variables will be unaltered.\n\n` +
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like ROM.`);
            } 
            if (word === 'SAVE') {
		return new vscode.Hover(`**SAVE**:  Saves a program from memory to cassete tape. (see USER DISC for disc save options).\n\n` +  
		    `Usage: SAVE "tapename.extension" \n\n` +
                    `The tapename is limited to 15 alphanumeric characters including extension (see later for MEMU variation). e.g. SAVE "FILENAME90.BAS" \n\n` +   
                    `The extension is optional and is typically either be ".BAS" or ".mtx" for MTX BASIC programs with or without built-in Z80 assembly code.\n\n` +
                    `If using the MEMU emulator, the emulator automatically strips off any characters beyond 15 characters, typically this removes the MEMU added .mtx extension, unless within the 15 chars.\n\n` +  
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like SAVE.`);
            }              
            if (word === 'SBUF') {
		return new vscode.Hover(`**SBUF**:  Reserves a sound buffer in memory.\n\n` +
                    `Usage: SBUF number \n\n` +
                    `This command makes space in a sound buffer for use by the SOUND command.\n\n` + 
                    `The Buffer is made at the top of memory below the system variables\n\n` + 
                    `EXAMPLE:\n\n` + 
                    `SBUF 8\n\n` +
                    `This will make space for 8 blocks of sound data for each of the 3 channels and the noise channel.\n\n` + 
                    `Each block takes 10 bytes. The above statement therefore takes a total of 320 bytes. i.e. 8 * 4 * 10.(8*channels*block length).`);
            }  
            if (word === 'SGN') {
		return new vscode.Hover(`**SGN**:  with the specified parameters.\n\n` +
                    `Usage: SGN(number) \n\n` +
                    `Returns a result depending on the sign if the specified number.\n\n` + 
                    `If the number is positive the result is +1 If the number is negative the result is —1 If the number is zero the result is 0.\n\n` + 
                    `10 PRINT SGN(-2.5): PRINT SGN(5): PRINT SGN(0)` + 
                    `Returns -1, 5 and 0 respectively`);
            } 
            if (word === 'SIN') {
		return new vscode.Hover(`**SIN**:  calculates the sin of the angle.\n\n` +
                    `Usage: SIN(angle) \n\n` +
                    `Returns the sine of the angle specified in radians.\n\n` +            
                    `EXAMPLE: \n\n` + 
                    `10 PRINT “SIN of 8 = “;SIN(8)\n\n` +
                    `Displays on the screen SIN of 8 = 0.989358247`);  
	    }
            if (word === 'SOUND') {
		return new vscode.Hover(`**SOUND**:  Generating Sound on a MTX computer.\n\n` +
                    `Usage: SOUND \\<expression list\\> \n\n` +
                    `The effect of the sound command depends on the number of expressions in the expression list, either 3 parameter or 7 parameter list.\n\n` + 
                    `DIRECT SOUND (This mode plays a single note until stopped): SOUND channel,frequency,volume \n\n` + 
                    `CONTINUOUS SOUND (Sequences of notes can be played by loading them into a sound buffer): SOUND channel,frequency,volume ,freq inc,vol inc,duration,mode\n\n` + 
                    `channel: 0,1 and 2 are pure sound and 3 is for noise.\n\n` + 
                    `frequency: frequency of the sound (DIRECT: 0 to 1023, CONTINUOUS: 0 to 8192).  See Part 4, Ref. Section for SOUND & Appendix 8 of manual\n\n` + 
                    `volume: loudness (DIRECT: 0 to 15, CONTINUOUS: 0 to 1023)  See Part 4, Ref. Section for SOUND & Appendix 8 of manual \n\n` + 
                    `freq_inc (+/- 1023) and vol_inc (+/- 1023, even though +/-32767 allowed). Every 1/64th of a second the PC adds the increment to both frequency & volume increment. \n\n` + 
                    `duration: This continues for a length of time equal to the duration which is measured in 1/64ths of a second\n\n` + 
                    `mode=0, freq and vol parameters will be ignored which means that the increments will increment whatever values of frequency and volume were current when the command was encountered.\n\n` + 
                    `mode=1, the freq and vol will be loaded into the sound buffer to initialise the frequency and volume of the relevant channel`);
            }
            if (word === 'SPK$') {
		return new vscode.Hover(`**SPK$**:  Determines what the character is at the cursor.\n\n` +
                    `Usage: SPK$(screen peek) \n\n` +
                    `Peeks the character at the cursor location and auto increments the cursor location. The character is returned as ASCII.\n\n` + 
                    `Example: To read characters from the screen into an array, and reprint them.\n\n` + 
                    `10 CLS: FOR I=32 TO 64:PRINT CHR$(I);:NEXT I\n\n` + 
                    `20 CSR 0,0\n\n` +  
                    `30 FOR I=32 TO 64: LET A$(I)=SPK$: NEXT\n\n` + 
                    `40 PRINT\n\n` + 
                    `50 PRINT A$`);
            } 
            if (word === 'SPRITE') {
		return new vscode.Hover(`**SPRITE**:  Creating a sprite with the specified parameters.\n\n` +
                    `Usage: SPRITE N,P,XP,YP,XS,YS,C \n\n` +
                    `N: sprite number (1 to 32)\n\n` + 
                    `P: sprite pattern number (size 0: 0 to 127 and size 1: 0 to 31)\n\n` + 
                    `XP: position x off centre (range -4095 to 4095)\n\n` + 
                    `YP: position y off centre (range -4095 to 4095)\n\n` + 
                    `XS: speed in the x direction (-128 to 127) where 1 unit of speed moves the sprite 1/8 pixel every master speed cycle as set by CTLSPR 0\n\n` + 
                    `YS:  speed in the y direction (plus upwards) range -128 to 127\n\n` + 
                    `C: colour (0 to 15)\n\n` + 
                    `Sprite screen 0,0 is defined as bottom left hand corner of screen i.e same as for plot.\n\n` + 
                    `Sprite coordinates are absolute and do not look at virtual screen origins (i.e assume a 32	by 24 graphic screen)`);                    
            }
            if (word === 'SQR') {
		return new vscode.Hover(`**SQR**:  Calculates the square root of a number.\n\n` +
                    `Usage: SQR(number) \n\n` +
                    `EXAMPLE: \n\n` + 
                    `10 PRINT SQR(2)\n\n` + 
                    `Returns 1.41421356`);
            }            
            if (word === 'STEP') {
		return new vscode.Hover(`**STEP**:  Increm,ents the FOR loop. (SEE FOR-NEXT)\n\n` +
                    `Usage: STEP \\<increment\\> \n\n` +
                    `STEP increments can be integer or decimal.\n\n` + 
                    `If STEP is not specified in a FOR-NEXT loop, the default STEP of 1 is applied.`);
            } 
            if (word === 'STOP') {
		return new vscode.Hover(`**STOP**:  When encountered, STOPs executing the BASIC program. (see also CONT)\n\n` +
                    `Usage: STOP \n\n` +                   
                    `STOPS the BASIC program at the line number where STOP is encountered.`);
            }             
            if (word === 'STR$') {
		return new vscode.Hover(`**STR$**:  Returns the string of the specified number.\n\n` +
                    `Usage: STR$(number) \n\n` +
                    `Gives the string which represents the specified number.\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `10 PRINT STR$(2+2)\n\n` + 
                    `Returns 4 as a string not a numerical value.\n\n` + 
                    `Note that STR$ has a string value and can therefore not be used in numeric expressions.`);
            }   
            if (word === 'TAN') {
		return new vscode.Hover(`**TAN**:  Returns the tangent of the angle specified in radians.\n\n` +
                    `Usage: TAN(angle) \n\n` +
                    `EXAMPLE: \n\n` + 
                    `10 PRINT TAN(0.785): REM TAN of 0.785 rads (45 degrees) = 1`);
            } 
            if (word === 'THEN') {
		return new vscode.Hover(`**THEN**:  execute the statement after the word THEN if the IF condition is met.\n\n` +
                    `Usage: THEN \\<statements\\> \n\n` + 
                    `See IF-THEN-ELSE`);
            } 
            if (word === 'TIME$') {
		return new vscode.Hover(`**TIME$**: Returns  the time on the real time clock in the format. (See CLOCK)\n\n` +
                    `Usage: TIME$ \n\n` +
                    `Returns the time as H H M M S S\n\n` + 
                    `H H is the number of hours elapsed since the clock was started with the CLOCK command. The hours will count up to 99 before resetting.\n\n` + 
                    `M M  is the number of minutes.\n\n` + 
                    `S S is the number of seconds\n\n` +    
                    `EXAMPLE: \n\n` +
                    `10 CLOCK "000000"\n\n` + 
                    `20 CSR 10,10:PRINT TIME$ \n\n` +  
                    `30 GOTO 20`);
            }
            if (word === 'TO') {
		return new vscode.Hover(`**TO**: See FOR-NEXT loop.\n\n` +
                    `Usage: TO \n\n` + 
                    ``);
            } 
            if (word === 'USER') {
		return new vscode.Hover(`**USER**:  Used for Disc operations.\n\n` +
                    `Usage: USER command \n\n` +
                    `or BASIC Disc Operating System (BDOS) usage and utility programs.\n\n` +
                    `see MTX Series Owners manual, technical appendices, appendix 13.`);
            }  
            if (word === 'USR') {
		return new vscode.Hover(`**USR**:  with the specified parameters.\n\n` +
                    `Usage: USR (memory address) \n\n` +
                    `USR causes control of the program to be transferred to the specified memory address. \n\n` + 
                    `This is the usual way of interfacing machine code to BASIC programs although the MTX assembler makes this function redundant in most cases.\n\n` + 
                    `On return to BASIC, USR has the value in the register pair BC. EXAMPLE: \n\n` + 
                    `10 CODE\n\n` + 
                    `8007 LD BC,100\n\n` + 
                    `800A RET\n\n` +  
                    `20 PRINT USR(32775):REM 32775 decimal = 8007 hexadecimal\n\n` + 
                    `100 is displayed on the screen.\n\n` +
                    `see examples in the MTX Series Owners manual, reference section, page 171 `);
            } 
            if (word === 'VAL') {
		return new vscode.Hover(`**VAL**: Returns the numeric value of the specified string..\n\n` +
                    `Usage: VAL(string) \n\n` +
                    `If the string is not a valid number, VAL will try to evaluate the string from the left hand side as a number until it can go no further.\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `PRINT VAL("100"): REM returns 100\n\n` + 
                    `PRINT VAL("100000000000"): REM returns 1E+12\n\n` + 
                    `PRINT VAL("1000ABCDEF00"): REM returns 1000\n\n` + 
                    `PRINT VAL("abc12"): REM returns 0 (no number at start)\n\n` + 
                    `PRINT VAL("12"+"12"): REM returns 1212\n\n` + 
                    `PRINT VAL("23")+10: REM returns 33`);
            } 
            if (word === 'VERIFY') {
		return new vscode.Hover(`**VERIFY**:  Verifies a program in tape against the program currently in the computer.\n\n` +
                    `Usage: VERIFY \n\n` +
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like VERIFY`);
            }  
            if (word === 'VIEW') {
		return new vscode.Hover(`**VIEW**:  The view command moves the window relative to the sprite planes whilst leaving the position of the sprites unchanged.\n\n` +
                    `Usage: VIEW direction, distance \n\n` +
                    `direction	0 to 7\n\n` + 
                    `distance	0 to 255\n\n` +  
                    `The Sprite Screen is -4095 to +4095 in both the x and y directions`);
            } 
            if (word === 'VS') {
		return new vscode.Hover(`**VS**:  Selects which virtual screen to view.\n\n` +
                    `Usage: VS N \n\n` +
                    `This command selects a virtual screen from those already defined or created using the CRVS command. \n\n` + 
                    `The computer will automatically switch to the type of screen selected whether graphics or text.\n\n` +
                    `See CRVS`);
            }
        } // skip MTX BASIC hover support if not a BASIC file
        
            // ============================================
            // Z80 ASSEMBLY HOVER SUPPORT
            // ============================================
            
            // Check if we're inside a CODE block and provide Z80 hover info
            const lineText = document.lineAt(position.line).text;

            // Check if this looks like a Z80 assembly line (starts with hex address after whitespace)
            if (/^\s+[0-9A-Fa-f]{4}\s/.test(lineText)) {
                // Check if cursor is positioned within the hex address itself (skip register hover for hex addresses)
                const hexMatch = /^\s+([0-9A-Fa-f]{4})\s/.exec(lineText);
                const isInHexAddress = hexMatch && 
                    position.character >= lineText.indexOf(hexMatch[1]) && 
                    position.character < lineText.indexOf(hexMatch[1]) + 4;
                
                if (!isInHexAddress) {
                    // Try to get Z80 instruction info
                    const z80Info = getZ80InstructionInfo(word);
                    if (z80Info) {
                        return new vscode.Hover(z80Info);
                    }
                }
                
                // Provide info for Z80 registers (but not if cursor is in hex address)
                if (!isInHexAddress) {
                // Provide info for Z80 registers
                const z80Registers: { [key: string]: string } = {
                    'A': '**A** - Accumulator (8-bit primary register)',
                    'B': '**B** - General purpose register (8-bit), part of BC pair',
                    'C': '**C** - General purpose register (8-bit), part of BC pair',
                    'D': '**D** - General purpose register (8-bit), part of DE pair',
                    'E': '**E** - General purpose register (8-bit), part of DE pair',
                    'H': '**H** - High byte of HL register pair',
                    'L': '**L** - Low byte of HL register pair',
                    'BC': '**BC** - 16-bit register pair (B=high, C=low)',
                    'DE': '**DE** - 16-bit register pair (D=high, E=low)',
                    'HL': '**HL** - 16-bit register pair, often used for memory addressing',
                    'SP': '**SP** - Stack Pointer (16-bit)',
                    'IX': '**IX** - Index Register X (16-bit)',
                    'IY': '**IY** - Index Register Y (16-bit)',
                    'AF': '**AF** - Accumulator and Flags register pair',
                    'PC': '**PC** - Program Counter (16-bit)',
                    'I': '**I** - Interrupt Vector register',
                    'R': '**R** - Memory Refresh register'
                };
        
        
                const upperWord = word.toUpperCase();
                if (z80Registers[upperWord]) {
                    return new vscode.Hover(z80Registers[upperWord]);
                } 
                
                
                // Provide info for assembler directives
                const directives: { [key: string]: string } = {
                    'DB': '**DB** - Define Byte\n\nDefines one or more bytes of data.\n\nUsage: `DB value1, value2, ...` or `DB "string"`',
                    'DW': '**DW** - Define Word\n\nDefines one or more 16-bit words (little-endian).\n\nUsage: `DW value1, value2, ...`',
                    'DS': '**DS** - Define Space\n\nReserves a block of memory.\n\nUsage: `DS count` (reserves count bytes)'
                };
                
                if (directives[upperWord]) {
                    return new vscode.Hover(directives[upperWord]);
                }
                } // Close the !isInHexAddress block
            }       
        // No hover info found - return undefined implicitly by not returning anything                   
        } // This closes provideHover
        
    })); // This closes registerHoverProvider

// Register completion provider for Z80 assembly addresses after CODE
ctx.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
        'mtxbasic',
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                const lineText = document.lineAt(position.line).text;
                const linePrefix = lineText.substring(0, position.character);
                
                // Only provide completion if we're on an indented line (inside CODE block)
                //if (!/^\s+/.test(lineText)) {
                // Only provide completion if we're on an indented line with just whitespace before cursor
                if (!/^\s+$/.test(linePrefix)) {
                    return undefined;
                }
                
                // Check if we're inside a CODE block
                let inCodeBlock = false;
                let lastAddress = hexBaseAddress;
                
                // Scan backwards to find CODE declaration and calculate current address
                for (let i = position.line - 1; i >= 0; i--) {
                    const line = document.lineAt(i).text;
                    
                    // Check if we hit a CODE statement
                    if (/^\d{1,5}\s+CODE\s*$/.test(line.trim())) {
                        inCodeBlock = true;

                                                // Derive CODE start from fully converted program bytes so directives/blocks
                                                // in earlier CODE lines are accounted for exactly.
                                                const codeMatch = /^\s*(\d{1,5})\s+CODE\s*$/.exec(line);
                                                const codeLineNumber = codeMatch ? parseInt(codeMatch[1], 10) : NaN;
                                                if (!Number.isNaN(codeLineNumber)) {
                                                        try {
                                                                const docBytes = convertTextToHex(document.getText(), hexBaseAddress);
                                                                const codeLineAddress = findAddressForLineNumber(codeLineNumber, docBytes, hexBaseAddress);
                                                                if (codeLineAddress !== null) {
                                                                        // Z80 starts 7 bytes into the CODE line record.
                                                                        lastAddress = codeLineAddress + 7;
                                                                }
                                                        } catch (e) {
                                                                // Keep existing fallback address if conversion fails.
                                                        }
                                                }
                        
                        // Now calculate bytes in current CODE block from scratch
                        for (let j = i + 1; j < position.line; j++) {
                            const z80Line = document.lineAt(j).text;
                            const match = /^\s+[0-9A-F]{4}\s+(.*)$/.exec(z80Line);
                            if (match) {
                                const instruction = match[1].trim();
                                try {
                                    //const parsed = parseZ80Line(instruction, j);
                                    const parsed = parseZ80Line(z80Line, j);
                                    if (parsed) {
                                        let instrLength = 1;
                                        if (parsed.isDirective) {
                                            instrLength = getDirectiveLength(parsed);
                                        } else if (parsed.mnemonic) {
                                            instrLength = getInstructionLength(parsed.mnemonic, parsed.operands);
                                        }
                                        lastAddress += instrLength;
                                    } else { 
                                        // Estimate 1 byte if parsing returns null
                                        lastAddress += 1;
                                    }
                                } catch (e) {
                                    // Estimate 1 byte if we can't parse
                                    lastAddress += 1;
                                }
                            }
                        }
                        
                        break;
                    }
                    
                    // If we hit another BASIC line number, we're not in CODE block
                    if (/^\d{1,5}\s/.test(line) && !/^\s/.test(line)) {
                        break;
                    }
                }
                
                if (!inCodeBlock) {
                    return undefined;
                }
                
                // Create completion item with the calculated address
                const completionItem = new vscode.CompletionItem(
                    lastAddress.toString(16).toUpperCase().padStart(4, '0'),
                    vscode.CompletionItemKind.Value
                );
                completionItem.detail = 'Next Z80 address';
                completionItem.insertText = lastAddress.toString(16).toUpperCase().padStart(4, '0') + ' ';
                completionItem.preselect = true;
                completionItem.sortText = '0'; // Sorts first
                
                return [completionItem];
            }
        },
        ' ' // Trigger on pressing space VS code doesn't allow '/t' as a trigger

    )
); // This closes registerCompletionItemProvider


// Command: Renumber Z80 addresses in CODE block at cursor
const renumberZ80Cmd = vscode.commands.registerCommand('mtxbasic.renumberZ80', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
                vscode.window.showErrorMessage('No active MTX BASIC editor');
                return;
        }
        
        const doc = editor.document;
        const position = editor.selection.active;
        
        // Find which CODE block we're in
        let codeStartLine = -1;
        let codeEndLine = -1;
        
        // Scan backwards to find CODE declaration
        for (let i = position.line; i >= 0; i--) {
                const line = doc.lineAt(i).text;
                if (/^\d{1,5}\s+CODE\s*$/.test(line.trim())) {
                        codeStartLine = i;
                        break;
                }
                // Stop if we hit another BASIC line number (not in CODE block)
                if (i < position.line && /^\d{1,5}\s/.test(line) && !/^\s/.test(line)) {
                        vscode.window.showErrorMessage('Cursor is not inside a CODE block');
                        return;
                }
        }
        
        if (codeStartLine === -1) {
                vscode.window.showErrorMessage('No CODE block found');
                return;
        }
        
        // Scan forward to find end of CODE block
        for (let i = codeStartLine + 1; i < doc.lineCount; i++) {
                const line = doc.lineAt(i).text;
                // End of CODE block: hit another BASIC line number or end of file
                if (/^\d{1,5}\s/.test(line) && !/^\s/.test(line)) {
                        codeEndLine = i - 1;
                        break;
                }
                if (i === doc.lineCount - 1) {
                        codeEndLine = i;
                        break;
                }
        }
        
        // Calculate starting address for this CODE block from the full converted byte stream.
        const codeStartText = doc.lineAt(codeStartLine).text;
        const codeLineMatch = /^\s*(\d{1,5})\s+CODE\s*$/.exec(codeStartText);
        const codeLineNumber = codeLineMatch ? parseInt(codeLineMatch[1], 10) : NaN;

        let currentAddress = hexBaseAddress;
        if (!Number.isNaN(codeLineNumber)) {
                try {
                        const docBytes = convertTextToHex(doc.getText(), hexBaseAddress);
                        const codeLineAddress = findAddressForLineNumber(codeLineNumber, docBytes, hexBaseAddress);
                        if (codeLineAddress !== null) {
                                // Z80 bytes begin 7 bytes into the CODE line record.
                                currentAddress = codeLineAddress + 7;
                        }
                } catch (e) {
                        // Keep fallback base if conversion fails.
                }
        }
        
        // Build new lines with updated addresses
        const edits: { line: number; newText: string }[] = [];
        
        for (let i = codeStartLine + 1; i <= codeEndLine; i++) {
                const line = doc.lineAt(i).text;
                const match = /^(\s+)([0-9A-Fa-f]{4}\s+)(.*)$/.exec(line);
                
                if (match) {
                        const indent = match[1];
                        const instruction = match[3].trim();
                        
                        // Calculate new address
                        const newAddr = currentAddress.toString(16).toUpperCase().padStart(4, '0');
                        const newLine = `${indent}${newAddr} ${instruction}`;
                        
                        // Only add edit if address changed
                        if (newLine !== line) {
                                edits.push({ line: i, newText: newLine });
                        }
                        
                        // Calculate instruction length for next address
                        try {
                                const parsed = parseZ80Line(`${newAddr} ${instruction}`, i);
                                if (parsed) {
                                        let instrLength = 1;
                                        if (parsed.isDirective) {
                                                instrLength = getDirectiveLength(parsed);
                                        } else if (parsed.mnemonic) {
                                                instrLength = getInstructionLength(parsed.mnemonic, parsed.operands);
                                        }
                                        currentAddress += instrLength;
                                } else {
                                        currentAddress += 1; // Default estimate
                                }
                        } catch (e) {
                                currentAddress += 1; // Default estimate on error
                        }
                }
        }
        
        if (edits.length === 0) {
                vscode.window.showInformationMessage('Z80 addresses are already correct');
                return;
        }
        
        // Apply all edits in a single transaction
        await editor.edit(editBuilder => {
                for (const edit of edits) {
                        const line = doc.lineAt(edit.line);
                        const range = new vscode.Range(
                                new vscode.Position(edit.line, 0),
                                new vscode.Position(edit.line, line.text.length)
                        );
                        editBuilder.replace(range, edit.newText);
                }
        });
        
        vscode.window.showInformationMessage(`Renumbered ${edits.length} Z80 address${edits.length !== 1 ? 'es' : ''}`);
});

ctx.subscriptions.push(renumberZ80Cmd);



// Clean up resources if needed
function deactivate() {}
}
