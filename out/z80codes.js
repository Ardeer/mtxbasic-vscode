"use strict";
/** z80 hex to mnemomic conversion table
AFWilson
31-Oct-2022
v0.1
updated 31-May-2023, "00A" to "00F" should be "0A" to "0F"
updated 07-Jun-2023 extra spaces between some instructions like CALL PO,..
updated 27-Jun-2023 added missing ["ED5B XXXX","LD DE,(XXXX)"],
converted to typescript 8-Dec-2025
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.z80Cmds = void 0;
exports.parseZ80Line = parseZ80Line;
exports.splitOperands = splitOperands;
exports.detectCodeBlocks = detectCodeBlocks;
exports.collectLabels = collectLabels;
exports.normalizeInstruction = normalizeInstruction;
exports.findZ80Command = findZ80Command;
exports.validateZ80Instruction = validateZ80Instruction;
exports.validateZ80InstructionWithLabels = validateZ80InstructionWithLabels;
exports.validateCodeBlock = validateCodeBlock;
exports.validateCodeBlocks = validateCodeBlocks;
exports.getZ80InstructionInfo = getZ80InstructionInfo;
exports.getInstructionLength = getInstructionLength;
exports.getDirectiveLength = getDirectiveLength;
// Import basicTokeniseLine for calculating expected CODE starting addresses
var mtxtokens_js_1 = require("./mtxtokens.js");
/** z80 hex to mnemomic conversion table notes
no CB30 to CB37
no DDCB ZZ 36
no FDCB ZZ 36
MTX assembler includes the following directives:
DB n ; define byte, e.g.  n=10 or #0A or "A"
DW XXXX ; define 16-bit word
DS n254 ; define space, where n254 = 0 to 254 as 255 (#FF) is reserved for end of program marker
*/
/** z80 format within the CODE structure
<TABspace> <hex_addr><space> {<label>:} <z80 assembly command> {;<comment>}
1) no line number (same exception as used for NODDY)
2) TAB space indent
3) 16-bit hexadecimal address (0000) - no prefix or postfix to indicate a number
4) space
5) optional label followed by a colon
6) z80 assembly command
7) optional semicolon followed by text comment (no quotes or double quotes required, same as for REM in MTX BASIC
8) end of line

Notes:
a) Initially, whenever CODE is encountered, it should automatically generate the following default line as per the MTX assembler.
<linenumber> CODE
    0000 RET
The user can overwrite this default line with their own z80 assembly code lines.
b) The 16-bit hexadecimal address initially to always start at 0000 but internally be coded as hexAddr = baseAddr+offsetAddr
baseAddr = 0000 (default) until machine type determined then either 4000 (MTX512, 64KB machine) or 8000 (MTX500, 32KB machine)
offsetAddr = 0000 (default). A separate function to be created to scan the MTX BASIC listing prior to CODE and convert text into hexadecimal and use this to generate a new offset
c) where XXXX or n or e or d is used in the z80Cmds below, these are only placeholders to ensure the correct format is used by the user, e.g. XXXX = 16-bit hexadecimal value, n = 8-bit hexadecimal value, e = 8-bit signed value, d = 8-bit offset value
d) where XXXX or n or e or d placeholders are to be replaced by the appropriate hexadecimal values (prefixed by #) or integer values (no # prefix) or labels
*/
/** z80 assembly specifications
column 0 = hexadecimal code (string) plus additional information
    XXXX = 16-bit hexadecimal address
    XX = 8-bit unsigned (1-byte)
    YY = 8-bit signed (1-byte)
    ZZ = offset (1-byte)
    
column 1 = z80 assembly command (string) plus additional information
    XXXX = XXXX (2-byte)
    n = XX (1-byte)
    e = YY signed (1-byte)
    d = offset (1-byte)
column 2 = total number of bytes for complete z80 command including additional information

Note: initially only column 1 is used within the MTX BASIC CODE command. Columns 0 and 2 will be used later for a different purpose.
*/
/**

1)From the list of z80Cmds, create a sub-set that contains the z80 commands that contain XXXX, (XXXX), n, (n), e and d. These will be the outliers which can be confused with labels.
2) Check the command entry against an exact match in the z80Cmds list (excluding the sub-set), only z80 commands like PUSH AF or LD A,D will be correct. Else generate an error,
so PUSH AFA would be an error.
3) then compare against the sub-set that could be a number or a label
3a) if # prefix present then following digits are hexadecimal. Compare against XXXX or n to see if 16 or 8-bit
3b) if [0-9] then its a decimal number.
3c) if [A-Z] then assume its a label (store, the line number where labels are used, so that these can be checked at 4)
4) at the end of the codeblock, cross-check commands that use labels against actual labels. If a label is used in a command and label not found, then report error "label not found".
5) final check, where relative jumps (Jr & DJNZ) are used, these limit the forward and backward jumps to -128 to 127 + 2 to account for the command byte and the displacement byte.
Using z80Cmds length bytes to dtermine if the jumps are within the correct range (-126 to 129, accounting for the 2 bytes for the command+displacement),
if not, the report error, relative jump too big.
 */
var z80Cmds = [
    { opCode: "00", z80: "NOP", length: 1 },
    { opCode: "01 XXXX", z80: "LD BC,XXXX", length: 3 },
    { opCode: "02", z80: "LD (BC),A", length: 1 },
    { opCode: "03", z80: "INC BC", length: 1 },
    { opCode: "04", z80: "INC B", length: 1 },
    { opCode: "05", z80: "DEC B", length: 1 },
    { opCode: "06 XX", z80: "LD B,XX", length: 2 },
    { opCode: "07", z80: "RLCA", length: 1 },
    { opCode: "08", z80: "EX AF,AF'", length: 1 },
    { opCode: "09", z80: "ADD HL,BC", length: 1 },
    { opCode: "0A", z80: "LD A,(BC)", length: 1 },
    { opCode: "0B", z80: "DEC BC", length: 1 },
    { opCode: "0C", z80: "INC C", length: 1 },
    { opCode: "0D", z80: "DEC C", length: 1 },
    { opCode: "0E XX", z80: "LD C,XX", length: 2 },
    { opCode: "0F", z80: "RRCA", length: 1 },
    { opCode: "10 YY", z80: "DJNZ YY", length: 2 },
    { opCode: "11 XXXX", z80: "LD DE,XXXX", length: 3 },
    { opCode: "12", z80: "LD (DE),A", length: 1 },
    { opCode: "13", z80: "INC DE", length: 1 },
    { opCode: "14", z80: "INC D", length: 1 },
    { opCode: "15", z80: "DEC D", length: 1 },
    { opCode: "16 XX", z80: "LD D,XX", length: 2 },
    { opCode: "17", z80: "RLA", length: 1 },
    { opCode: "18 YY", z80: "JR YY", length: 2 },
    { opCode: "19", z80: "ADD HL,DE", length: 1 },
    { opCode: "1A", z80: "LD A,(DE)", length: 1 },
    { opCode: "1B", z80: "DEC DE", length: 1 },
    { opCode: "1C", z80: "INC E", length: 1 },
    { opCode: "1D", z80: "DEC E", length: 1 },
    { opCode: "1E XX", z80: "LD E,XX", length: 2 },
    { opCode: "1F", z80: "RRA", length: 1 },
    { opCode: "20 YY", z80: "JR NZ,YY", length: 2 },
    { opCode: "21 XXXX", z80: "LD HL,XXXX", length: 3 },
    { opCode: "22 XXXX", z80: "LD (XXXX),HL", length: 3 },
    { opCode: "23", z80: "INC HL", length: 1 },
    { opCode: "24", z80: "INC H", length: 1 },
    { opCode: "25", z80: "DEC H", length: 1 },
    { opCode: "26 XX", z80: "LD H,XX", length: 2 },
    { opCode: "27", z80: "DAA", length: 1 },
    { opCode: "28 YY", z80: "JR Z,YY", length: 2 },
    { opCode: "29", z80: "ADD HL,HL", length: 1 },
    { opCode: "2A XXXX", z80: "LD HL,(XXXX)", length: 3 },
    { opCode: "2B", z80: "DEC HL", length: 1 },
    { opCode: "2C", z80: "INC L", length: 1 },
    { opCode: "2D", z80: "DEC L", length: 1 },
    { opCode: "2E XX", z80: "LD L,XX", length: 2 },
    { opCode: "2F", z80: "CPL", length: 1 },
    { opCode: "30 YY", z80: "JR NC,YY", length: 2 },
    { opCode: "31 XXXX", z80: "LD SP,XXXX", length: 3 },
    { opCode: "32 XXXX", z80: "LD (XXXX),A", length: 3 },
    { opCode: "33", z80: "INC SP", length: 1 },
    { opCode: "34", z80: "INC (HL)", length: 1 },
    { opCode: "35", z80: "DEC (HL)", length: 1 },
    { opCode: "36 XX", z80: "LD (HL),XX", length: 2 },
    { opCode: "37", z80: "SCF", length: 1 },
    { opCode: "38 YY", z80: "JR C,YY", length: 2 },
    { opCode: "39", z80: "ADD HL,SP", length: 1 },
    { opCode: "3A XXXX", z80: "LD A,(XXXX)", length: 3 },
    { opCode: "3B", z80: "DEC SP", length: 1 },
    { opCode: "3C", z80: "INC A", length: 1 },
    { opCode: "3D", z80: "DEC A", length: 1 },
    { opCode: "3E XX", z80: "LD A,XX", length: 2 },
    { opCode: "3F", z80: "CCF", length: 1 },
    { opCode: "40", z80: "LD B,B", length: 1 },
    { opCode: "41", z80: "LD B,C", length: 1 },
    { opCode: "42", z80: "LD B,D", length: 1 },
    { opCode: "43", z80: "LD B,E", length: 1 },
    { opCode: "44", z80: "LD B,H", length: 1 },
    { opCode: "45", z80: "LD B,L", length: 1 },
    { opCode: "46", z80: "LD B,(HL)", length: 1 },
    { opCode: "47", z80: "LD B,A", length: 1 },
    { opCode: "48", z80: "LD C,B", length: 1 },
    { opCode: "49", z80: "LD C,C", length: 1 },
    { opCode: "4A", z80: "LD C,D", length: 1 },
    { opCode: "4B", z80: "LD C,E", length: 1 },
    { opCode: "4C", z80: "LD C,H", length: 1 },
    { opCode: "4D", z80: "LD C,L", length: 1 },
    { opCode: "4E", z80: "LD C,(HL)", length: 1 },
    { opCode: "4F", z80: "LD C,A", length: 1 },
    { opCode: "50", z80: "LD D,B", length: 1 },
    { opCode: "51", z80: "LD D,C", length: 1 },
    { opCode: "52", z80: "LD D,D", length: 1 },
    { opCode: "53", z80: "LD D,E", length: 1 },
    { opCode: "54", z80: "LD D,H", length: 1 },
    { opCode: "55", z80: "LD D,L", length: 1 },
    { opCode: "56", z80: "LD D,(HL)", length: 1 },
    { opCode: "57", z80: "LD D,A", length: 1 },
    { opCode: "58", z80: "LD E,B", length: 1 },
    { opCode: "59", z80: "LD E,C", length: 1 },
    { opCode: "5A", z80: "LD E,D", length: 1 },
    { opCode: "5B", z80: "LD E,E", length: 1 },
    { opCode: "5C", z80: "LD E,H", length: 1 },
    { opCode: "5D", z80: "LD E,L", length: 1 },
    { opCode: "5E", z80: "LD E,(HL)", length: 1 },
    { opCode: "5F", z80: "LD E,A", length: 1 },
    { opCode: "60", z80: "LD H,B", length: 1 },
    { opCode: "61", z80: "LD H,C", length: 1 },
    { opCode: "62", z80: "LD H,D", length: 1 },
    { opCode: "63", z80: "LD H,E", length: 1 },
    { opCode: "64", z80: "LD H,H", length: 1 },
    { opCode: "65", z80: "LD H,L", length: 1 },
    { opCode: "66", z80: "LD H,(HL)", length: 1 },
    { opCode: "67", z80: "LD H,A", length: 1 },
    { opCode: "68", z80: "LD L,B", length: 1 },
    { opCode: "69", z80: "LD L,C", length: 1 },
    { opCode: "6A", z80: "LD L,D", length: 1 },
    { opCode: "6B", z80: "LD L,E", length: 1 },
    { opCode: "6C", z80: "LD L,H", length: 1 },
    { opCode: "6D", z80: "LD L,L", length: 1 },
    { opCode: "6E", z80: "LD L,(HL)", length: 1 },
    { opCode: "6F", z80: "LD L,A", length: 1 },
    { opCode: "70", z80: "LD (HL),B", length: 1 },
    { opCode: "71", z80: "LD (HL),C", length: 1 },
    { opCode: "72", z80: "LD (HL),D", length: 1 },
    { opCode: "73", z80: "LD (HL),E", length: 1 },
    { opCode: "74", z80: "LD (HL),H", length: 1 },
    { opCode: "75", z80: "LD (HL),L", length: 1 },
    { opCode: "76", z80: "HALT", length: 1 },
    { opCode: "77", z80: "LD (HL),A", length: 1 },
    { opCode: "78", z80: "LD A,B", length: 1 },
    { opCode: "79", z80: "LD A,C", length: 1 },
    { opCode: "7A", z80: "LD A,D", length: 1 },
    { opCode: "7B", z80: "LD A,E", length: 1 },
    { opCode: "7C", z80: "LD A,H", length: 1 },
    { opCode: "7D", z80: "LD A,L", length: 1 },
    { opCode: "7E", z80: "LD A,(HL)", length: 1 },
    { opCode: "7F", z80: "LD A,A", length: 1 },
    { opCode: "80", z80: "ADD A,B", length: 1 },
    { opCode: "81", z80: "ADD A,C", length: 1 },
    { opCode: "82", z80: "ADD A,D", length: 1 },
    { opCode: "83", z80: "ADD A,E", length: 1 },
    { opCode: "84", z80: "ADD A,H", length: 1 },
    { opCode: "85", z80: "ADD A,L", length: 1 },
    { opCode: "86", z80: "ADD A,(HL)", length: 1 },
    { opCode: "87", z80: "ADD A,A", length: 1 },
    { opCode: "88", z80: "ADC A,B", length: 1 },
    { opCode: "89", z80: "ADC A,C", length: 1 },
    { opCode: "8A", z80: "ADC A,D", length: 1 },
    { opCode: "8B", z80: "ADC A,E", length: 1 },
    { opCode: "8C", z80: "ADC A,H", length: 1 },
    { opCode: "8D", z80: "ADC A,L", length: 1 },
    { opCode: "8E", z80: "ADC A,(HL)", length: 1 },
    { opCode: "8F", z80: "ADC A,A", length: 1 },
    { opCode: "90", z80: "SUB B", length: 1 },
    { opCode: "91", z80: "SUB C", length: 1 },
    { opCode: "92", z80: "SUB D", length: 1 },
    { opCode: "93", z80: "SUB E", length: 1 },
    { opCode: "94", z80: "SUB H", length: 1 },
    { opCode: "95", z80: "SUB L", length: 1 },
    { opCode: "96", z80: "SUB (HL)", length: 1 },
    { opCode: "97", z80: "SUB A", length: 1 },
    { opCode: "98", z80: "SBC A,B", length: 1 },
    { opCode: "99", z80: "SBC A,C", length: 1 },
    { opCode: "9A", z80: "SBC A,D", length: 1 },
    { opCode: "9B", z80: "SBC A,E", length: 1 },
    { opCode: "9C", z80: "SBC A,H", length: 1 },
    { opCode: "9D", z80: "SBC A,L", length: 1 },
    { opCode: "9E", z80: "SBC A,(HL)", length: 1 },
    { opCode: "9F", z80: "SBC A,A", length: 1 },
    { opCode: "A0", z80: "AND B", length: 1 },
    { opCode: "A1", z80: "AND C", length: 1 },
    { opCode: "A2", z80: "AND D", length: 1 },
    { opCode: "A3", z80: "AND E", length: 1 },
    { opCode: "A4", z80: "AND H", length: 1 },
    { opCode: "A5", z80: "AND L", length: 1 },
    { opCode: "A6", z80: "AND (HL)", length: 1 },
    { opCode: "A7", z80: "AND A", length: 1 },
    { opCode: "A8", z80: "XOR B", length: 1 },
    { opCode: "A9", z80: "XOR C", length: 1 },
    { opCode: "AA", z80: "XOR D", length: 1 },
    { opCode: "AB", z80: "XOR E", length: 1 },
    { opCode: "AC", z80: "XOR H", length: 1 },
    { opCode: "AD", z80: "XOR L", length: 1 },
    { opCode: "AE", z80: "XOR (HL)", length: 1 },
    { opCode: "AF", z80: "XOR A", length: 1 },
    { opCode: "B0", z80: "OR B", length: 1 },
    { opCode: "B1", z80: "OR C", length: 1 },
    { opCode: "B2", z80: "OR D", length: 1 },
    { opCode: "B3", z80: "OR E", length: 1 },
    { opCode: "B4", z80: "OR H", length: 1 },
    { opCode: "B5", z80: "OR L", length: 1 },
    { opCode: "B6", z80: "OR (HL)", length: 1 },
    { opCode: "B7", z80: "OR A", length: 1 },
    { opCode: "B8", z80: "CP B", length: 1 },
    { opCode: "B9", z80: "CP C", length: 1 },
    { opCode: "BA", z80: "CP D", length: 1 },
    { opCode: "BB", z80: "CP E", length: 1 },
    { opCode: "BC", z80: "CP H", length: 1 },
    { opCode: "BD", z80: "CP L", length: 1 },
    { opCode: "BE", z80: "CP (HL)", length: 1 },
    { opCode: "BF", z80: "CP A", length: 1 },
    { opCode: "C0", z80: "RET NZ", length: 1 },
    { opCode: "C1", z80: "POP BC", length: 1 },
    { opCode: "C2 XXXX", z80: "JP NZ,XXXX", length: 3 },
    { opCode: "C3 XXXX", z80: "JP XXXX", length: 3 },
    { opCode: "C4 XXXX", z80: "CALL NZ,XXXX", length: 3 },
    { opCode: "C5", z80: "PUSH BC", length: 1 },
    { opCode: "C6 XX", z80: "ADD A,XX", length: 2 },
    { opCode: "C7", z80: "RST 00", length: 1 },
    { opCode: "C8", z80: "RET Z", length: 1 },
    { opCode: "C9", z80: "RET", length: 1 },
    { opCode: "CA XXXX", z80: "JP Z,XXXX", length: 3 },
    { opCode: "CB00", z80: "RLC B", length: 2 },
    { opCode: "CB01", z80: "RLC C", length: 2 },
    { opCode: "CB02", z80: "RLC D", length: 2 },
    { opCode: "CB03", z80: "RLC E", length: 2 },
    { opCode: "CB04", z80: "RLC H", length: 2 },
    { opCode: "CB05", z80: "RLC L", length: 2 },
    { opCode: "CB06", z80: "RLC (HL)", length: 2 },
    { opCode: "CB07", z80: "RLC A", length: 2 },
    { opCode: "CB08", z80: "RRC B", length: 2 },
    { opCode: "CB09", z80: "RRC C", length: 2 },
    { opCode: "CB0A", z80: "RRC D", length: 2 },
    { opCode: "CB0B", z80: "RRC E", length: 2 },
    { opCode: "CB0C", z80: "RRC H", length: 2 },
    { opCode: "CB0D", z80: "RRC L", length: 2 },
    { opCode: "CB0E", z80: "RRC (HL)", length: 2 },
    { opCode: "CB0F", z80: "RRC A", length: 2 },
    { opCode: "CB10", z80: "RL B", length: 2 },
    { opCode: "CB11", z80: "RL C", length: 2 },
    { opCode: "CB12", z80: "RL D", length: 2 },
    { opCode: "CB13", z80: "RL E", length: 2 },
    { opCode: "CB14", z80: "RL H", length: 2 },
    { opCode: "CB15", z80: "RL L", length: 2 },
    { opCode: "CB16", z80: "RL (HL)", length: 2 },
    { opCode: "CB17", z80: "RL A", length: 2 },
    { opCode: "CB18", z80: "RR B", length: 2 },
    { opCode: "CB19", z80: "RR C", length: 2 },
    { opCode: "CB1A", z80: "RR D", length: 2 },
    { opCode: "CB1B", z80: "RR E", length: 2 },
    { opCode: "CB1C", z80: "RR H", length: 2 },
    { opCode: "CB1D", z80: "RR L", length: 2 },
    { opCode: "CB1E", z80: "RR (HL)", length: 2 },
    { opCode: "CB1F", z80: "RR A", length: 2 },
    { opCode: "CB20", z80: "SLA B", length: 2 },
    { opCode: "CB21", z80: "SLA C", length: 2 },
    { opCode: "CB22", z80: "SLA D", length: 2 },
    { opCode: "CB23", z80: "SLA E", length: 2 },
    { opCode: "CB24", z80: "SLA H", length: 2 },
    { opCode: "CB25", z80: "SLA L", length: 2 },
    { opCode: "CB26", z80: "SLA (HL)", length: 2 },
    { opCode: "CB27", z80: "SLA A", length: 2 },
    { opCode: "CB28", z80: "SRA B", length: 2 },
    { opCode: "CB29", z80: "SRA C", length: 2 },
    { opCode: "CB2A", z80: "SRA D", length: 2 },
    { opCode: "CB2B", z80: "SRA E", length: 2 },
    { opCode: "CB2C", z80: "SRA H", length: 2 },
    { opCode: "CB2D", z80: "SRA L", length: 2 },
    { opCode: "CB2E", z80: "SRA (HL)", length: 2 },
    { opCode: "CB2F", z80: "SRA A", length: 2 },
    { opCode: "CB38", z80: "SRL B", length: 2 },
    { opCode: "CB39", z80: "SRL C", length: 2 },
    { opCode: "CB3A", z80: "SRL D", length: 2 },
    { opCode: "CB3B", z80: "SRL E", length: 2 },
    { opCode: "CB3C", z80: "SRL H", length: 2 },
    { opCode: "CB3D", z80: "SRL L", length: 2 },
    { opCode: "CB3E", z80: "SRL (HL)", length: 2 },
    { opCode: "CB3F", z80: "SRL A", length: 2 },
    { opCode: "CB40", z80: "BIT 0,B", length: 2 },
    { opCode: "CB41", z80: "BIT 0,C", length: 2 },
    { opCode: "CB42", z80: "BIT 0,D", length: 2 },
    { opCode: "CB43", z80: "BIT 0,E", length: 2 },
    { opCode: "CB44", z80: "BIT 0,H", length: 2 },
    { opCode: "CB45", z80: "BIT 0,L", length: 2 },
    { opCode: "CB46", z80: "BIT 0,(HL)", length: 2 },
    { opCode: "CB47", z80: "BIT 0,A", length: 2 },
    { opCode: "CB48", z80: "BIT 1,B", length: 2 },
    { opCode: "CB49", z80: "BIT 1,C", length: 2 },
    { opCode: "CB4A", z80: "BIT 1,D", length: 2 },
    { opCode: "CB4B", z80: "BIT 1,E", length: 2 },
    { opCode: "CB4C", z80: "BIT 1,H", length: 2 },
    { opCode: "CB4D", z80: "BIT 1,L", length: 2 },
    { opCode: "CB4E", z80: "BIT 1,(HL)", length: 2 },
    { opCode: "CB4F", z80: "BIT 1,A", length: 2 },
    { opCode: "CB50", z80: "BIT 2,B", length: 2 },
    { opCode: "CB51", z80: "BIT 2,C", length: 2 },
    { opCode: "CB52", z80: "BIT 2,D", length: 2 },
    { opCode: "CB53", z80: "BIT 2,E", length: 2 },
    { opCode: "CB54", z80: "BIT 2,H", length: 2 },
    { opCode: "CB55", z80: "BIT 2,L", length: 2 },
    { opCode: "CB56", z80: "BIT 2,(HL)", length: 2 },
    { opCode: "CB57", z80: "BIT 2,A", length: 2 },
    { opCode: "CB58", z80: "BIT 3,B", length: 2 },
    { opCode: "CB59", z80: "BIT 3,C", length: 2 },
    { opCode: "CB5A", z80: "BIT 3,D", length: 2 },
    { opCode: "CB5B", z80: "BIT 3,E", length: 2 },
    { opCode: "CB5C", z80: "BIT 3,H", length: 2 },
    { opCode: "CB5D", z80: "BIT 3,L", length: 2 },
    { opCode: "CB5E", z80: "BIT 3,(HL)", length: 2 },
    { opCode: "CB5F", z80: "BIT 3,A", length: 2 },
    { opCode: "CB60", z80: "BIT 4,B", length: 2 },
    { opCode: "CB61", z80: "BIT 4,C", length: 2 },
    { opCode: "CB62", z80: "BIT 4,D", length: 2 },
    { opCode: "CB63", z80: "BIT 4,E", length: 2 },
    { opCode: "CB64", z80: "BIT 4,H", length: 2 },
    { opCode: "CB65", z80: "BIT 4,L", length: 2 },
    { opCode: "CB66", z80: "BIT 4,(HL)", length: 2 },
    { opCode: "CB67", z80: "BIT 4,A", length: 2 },
    { opCode: "CB68", z80: "BIT 5,B", length: 2 },
    { opCode: "CB69", z80: "BIT 5,C", length: 2 },
    { opCode: "CB6A", z80: "BIT 5,D", length: 2 },
    { opCode: "CB6B", z80: "BIT 5,E", length: 2 },
    { opCode: "CB6C", z80: "BIT 5,H", length: 2 },
    { opCode: "CB6D", z80: "BIT 5,L", length: 2 },
    { opCode: "CB6E", z80: "BIT 5,(HL)", length: 2 },
    { opCode: "CB6F", z80: "BIT 5,A", length: 2 },
    { opCode: "CB70", z80: "BIT 6,B", length: 2 },
    { opCode: "CB71", z80: "BIT 6,C", length: 2 },
    { opCode: "CB72", z80: "BIT 6,D", length: 2 },
    { opCode: "CB73", z80: "BIT 6,E", length: 2 },
    { opCode: "CB74", z80: "BIT 6,H", length: 2 },
    { opCode: "CB75", z80: "BIT 6,L", length: 2 },
    { opCode: "CB76", z80: "BIT 6,(HL)", length: 2 },
    { opCode: "CB77", z80: "BIT 6,A", length: 2 },
    { opCode: "CB78", z80: "BIT 7,B", length: 2 },
    { opCode: "CB79", z80: "BIT 7,C", length: 2 },
    { opCode: "CB7A", z80: "BIT 7,D", length: 2 },
    { opCode: "CB7B", z80: "BIT 7,E", length: 2 },
    { opCode: "CB7C", z80: "BIT 7,H", length: 2 },
    { opCode: "CB7D", z80: "BIT 7,L", length: 2 },
    { opCode: "CB7E", z80: "BIT 7,(HL)", length: 2 },
    { opCode: "CB7F", z80: "BIT 7,A", length: 2 },
    { opCode: "CB80", z80: "RES 0,B", length: 2 },
    { opCode: "CB81", z80: "RES 0,C", length: 2 },
    { opCode: "CB82", z80: "RES 0,D", length: 2 },
    { opCode: "CB83", z80: "RES 0,E", length: 2 },
    { opCode: "CB84", z80: "RES 0,H", length: 2 },
    { opCode: "CB85", z80: "RES 0,L", length: 2 },
    { opCode: "CB86", z80: "RES 0,(HL)", length: 2 },
    { opCode: "CB87", z80: "RES 0,A", length: 2 },
    { opCode: "CB88", z80: "RES 1,B", length: 2 },
    { opCode: "CB89", z80: "RES 1,C", length: 2 },
    { opCode: "CB8A", z80: "RES 1,D", length: 2 },
    { opCode: "CB8B", z80: "RES 1,E", length: 2 },
    { opCode: "CB8C", z80: "RES 1,H", length: 2 },
    { opCode: "CB8D", z80: "RES 1,L", length: 2 },
    { opCode: "CB8E", z80: "RES 1,(HL)", length: 2 },
    { opCode: "CB8F", z80: "RES 1,A", length: 2 },
    { opCode: "CB90", z80: "RES 2,B", length: 2 },
    { opCode: "CB91", z80: "RES 2,C", length: 2 },
    { opCode: "CB92", z80: "RES 2,D", length: 2 },
    { opCode: "CB93", z80: "RES 2,E", length: 2 },
    { opCode: "CB94", z80: "RES 2,H", length: 2 },
    { opCode: "CB95", z80: "RES 2,L", length: 2 },
    { opCode: "CB96", z80: "RES 2,(HL)", length: 2 },
    { opCode: "CB97", z80: "RES 2,A", length: 2 },
    { opCode: "CB98", z80: "RES 3,B", length: 2 },
    { opCode: "CB99", z80: "RES 3,C", length: 2 },
    { opCode: "CB9A", z80: "RES 3,D", length: 2 },
    { opCode: "CB9B", z80: "RES 3,E", length: 2 },
    { opCode: "CB9C", z80: "RES 3,H", length: 2 },
    { opCode: "CB9D", z80: "RES 3,L", length: 2 },
    { opCode: "CB9E", z80: "RES 3,(HL)", length: 2 },
    { opCode: "CB9F", z80: "RES 3,A", length: 2 },
    { opCode: "CBA0", z80: "RES 4,B", length: 2 },
    { opCode: "CBA1", z80: "RES 4,C", length: 2 },
    { opCode: "CBA2", z80: "RES 4,D", length: 2 },
    { opCode: "CBA3", z80: "RES 4,E", length: 2 },
    { opCode: "CBA4", z80: "RES 4,H", length: 2 },
    { opCode: "CBA5", z80: "RES 4,L", length: 2 },
    { opCode: "CBA6", z80: "RES 4,(HL)", length: 2 },
    { opCode: "CBA7", z80: "RES 4,A", length: 2 },
    { opCode: "CBA8", z80: "RES 5,B", length: 2 },
    { opCode: "CBA9", z80: "RES 5,C", length: 2 },
    { opCode: "CBAA", z80: "RES 5,D", length: 2 },
    { opCode: "CBAB", z80: "RES 5,E", length: 2 },
    { opCode: "CBAC", z80: "RES 5,H", length: 2 },
    { opCode: "CBAD", z80: "RES 5,L", length: 2 },
    { opCode: "CBAE", z80: "RES 5,(HL)", length: 2 },
    { opCode: "CBAF", z80: "RES 5,A", length: 2 },
    { opCode: "CBB0", z80: "RES 6,B", length: 2 },
    { opCode: "CBB1", z80: "RES 6,C", length: 2 },
    { opCode: "CBB2", z80: "RES 6,D", length: 2 },
    { opCode: "CBB3", z80: "RES 6,E", length: 2 },
    { opCode: "CBB4", z80: "RES 6,H", length: 2 },
    { opCode: "CBB5", z80: "RES 6,L", length: 2 },
    { opCode: "CBB6", z80: "RES 6,(HL)", length: 2 },
    { opCode: "CBB7", z80: "RES 6,A", length: 2 },
    { opCode: "CBB8", z80: "RES 7,B", length: 2 },
    { opCode: "CBB9", z80: "RES 7,C", length: 2 },
    { opCode: "CBBA", z80: "RES 7,D", length: 2 },
    { opCode: "CBBB", z80: "RES 7,E", length: 2 },
    { opCode: "CBBC", z80: "RES 7,H", length: 2 },
    { opCode: "CBBD", z80: "RES 7,L", length: 2 },
    { opCode: "CBBE", z80: "RES 7,(HL)", length: 2 },
    { opCode: "CBBF", z80: "RES 7,A", length: 2 },
    { opCode: "CBC0", z80: "SET 0,B", length: 2 },
    { opCode: "CBC1", z80: "SET 0,C", length: 2 },
    { opCode: "CBC2", z80: "SET 0,D", length: 2 },
    { opCode: "CBC3", z80: "SET 0,E", length: 2 },
    { opCode: "CBC4", z80: "SET 0,H", length: 2 },
    { opCode: "CBC5", z80: "SET 0,L", length: 2 },
    { opCode: "CBC6", z80: "SET 0,(HL)", length: 2 },
    { opCode: "CBC7", z80: "SET 0,A", length: 2 },
    { opCode: "CBC8", z80: "SET 1,B", length: 2 },
    { opCode: "CBC9", z80: "SET 1,C", length: 2 },
    { opCode: "CBCA", z80: "SET 1,D", length: 2 },
    { opCode: "CBCB", z80: "SET 1,E", length: 2 },
    { opCode: "CBCC", z80: "SET 1,H", length: 2 },
    { opCode: "CBCD", z80: "SET 1,L", length: 2 },
    { opCode: "CBCE", z80: "SET 1,(HL)", length: 2 },
    { opCode: "CBCF", z80: "SET 1,A", length: 2 },
    { opCode: "CBD0", z80: "SET 2,B", length: 2 },
    { opCode: "CBD1", z80: "SET 2,C", length: 2 },
    { opCode: "CBD2", z80: "SET 2,D", length: 2 },
    { opCode: "CBD3", z80: "SET 2,E", length: 2 },
    { opCode: "CBD4", z80: "SET 2,H", length: 2 },
    { opCode: "CBD5", z80: "SET 2,L", length: 2 },
    { opCode: "CBD6", z80: "SET 2,(HL)", length: 2 },
    { opCode: "CBD7", z80: "SET 2,A", length: 2 },
    { opCode: "CBD8", z80: "SET 3,B", length: 2 },
    { opCode: "CBD9", z80: "SET 3,C", length: 2 },
    { opCode: "CBDA", z80: "SET 3,D", length: 2 },
    { opCode: "CBDB", z80: "SET 3,E", length: 2 },
    { opCode: "CBDC", z80: "SET 3,H", length: 2 },
    { opCode: "CBDD", z80: "SET 3,L", length: 2 },
    { opCode: "CBDE", z80: "SET 3,(HL)", length: 2 },
    { opCode: "CBDF", z80: "SET 3,A", length: 2 },
    { opCode: "CBE0", z80: "SET 4,B", length: 2 },
    { opCode: "CBE1", z80: "SET 4,C", length: 2 },
    { opCode: "CBE2", z80: "SET 4,D", length: 2 },
    { opCode: "CBE3", z80: "SET 4,E", length: 2 },
    { opCode: "CBE4", z80: "SET 4,H", length: 2 },
    { opCode: "CBE5", z80: "SET 4,L", length: 2 },
    { opCode: "CBE6", z80: "SET 4,(HL)", length: 2 },
    { opCode: "CBE7", z80: "SET 4,A", length: 2 },
    { opCode: "CBE8", z80: "SET 5,B", length: 2 },
    { opCode: "CBE9", z80: "SET 5,C", length: 2 },
    { opCode: "CBEA", z80: "SET 5,D", length: 2 },
    { opCode: "CBEB", z80: "SET 5,E", length: 2 },
    { opCode: "CBEC", z80: "SET 5,H", length: 2 },
    { opCode: "CBED", z80: "SET 5,L", length: 2 },
    { opCode: "CBEE", z80: "SET 5,(HL)", length: 2 },
    { opCode: "CBEF", z80: "SET 5,A", length: 2 },
    { opCode: "CBF0", z80: "SET 6,B", length: 2 },
    { opCode: "CBF1", z80: "SET 6,C", length: 2 },
    { opCode: "CBF2", z80: "SET 6,D", length: 2 },
    { opCode: "CBF3", z80: "SET 6,E", length: 2 },
    { opCode: "CBF4", z80: "SET 6,H", length: 2 },
    { opCode: "CBF5", z80: "SET 6,L", length: 2 },
    { opCode: "CBF6", z80: "SET 6,(HL)", length: 2 },
    { opCode: "CBF7", z80: "SET 6,A", length: 2 },
    { opCode: "CBF8", z80: "SET 7,B", length: 2 },
    { opCode: "CBF9", z80: "SET 7,C", length: 2 },
    { opCode: "CBFA", z80: "SET 7,D", length: 2 },
    { opCode: "CBFB", z80: "SET 7,E", length: 2 },
    { opCode: "CBFC", z80: "SET 7,H", length: 2 },
    { opCode: "CBFD", z80: "SET 7,L", length: 2 },
    { opCode: "CBFE", z80: "SET 7,(HL)", length: 2 },
    { opCode: "CBFF", z80: "SET 7,A", length: 2 },
    { opCode: "CC XXXX", z80: "CALL Z,XXXX", length: 3 },
    { opCode: "CD XXXX", z80: "CALL XXXX", length: 3 },
    { opCode: "CE XX", z80: "ADC A,XX", length: 2 },
    { opCode: "CF", z80: "RST 8", length: 1 },
    { opCode: "D0", z80: "RET NC", length: 1 },
    { opCode: "D1", z80: "POP DE", length: 1 },
    { opCode: "D2 XXXX", z80: "JP NC,XXXX", length: 3 },
    { opCode: "D3 XX", z80: "OUT (XX),A", length: 2 },
    { opCode: "D4 XXXX", z80: "CALL NC,XXXX", length: 3 },
    { opCode: "D5", z80: "PUSH DE", length: 1 },
    { opCode: "D6 XX", z80: "SUB XX", length: 2 },
    { opCode: "D7", z80: "RST 10", length: 1 },
    { opCode: "D8", z80: "RET C", length: 1 },
    { opCode: "D9", z80: "EXX", length: 1 },
    { opCode: "DA XXXX", z80: "JP C,XXXX", length: 3 },
    { opCode: "DB XX", z80: "IN A,(XX)", length: 2 },
    { opCode: "DC XXXX", z80: "CALL C,XXXX", length: 3 },
    { opCode: "DD09", z80: "ADD IX,BC", length: 2 },
    { opCode: "DD19", z80: "ADD IX,DE", length: 2 },
    { opCode: "DD21 XXXX", z80: "LD IX,XXXX", length: 4 },
    { opCode: "DD22 XXXX", z80: "LD (XXXX),IX", length: 4 },
    { opCode: "DD23", z80: "INC IX", length: 2 },
    { opCode: "DD29", z80: "ADD IX,IX", length: 2 },
    { opCode: "DD2A XXXX", z80: "LD IX,(XXXX)", length: 4 },
    { opCode: "DD2B", z80: "DEC IX", length: 2 },
    { opCode: "DD34 ZZ", z80: "INC (IX+ZZ)", length: 3 },
    { opCode: "DD35 ZZ", z80: "DEC (IX+ZZ)", length: 3 },
    { opCode: "DD36 ZZ XX", z80: "LD (IX+ZZ),XX", length: 4 },
    { opCode: "DD39", z80: "ADD IX,SP", length: 2 },
    { opCode: "DD46 ZZ", z80: "LD B,(IX+ZZ)", length: 3 },
    { opCode: "DD4E ZZ", z80: "LD C,(IX+ZZ)", length: 3 },
    { opCode: "DD56 ZZ", z80: "LD D,(IX+ZZ)", length: 3 },
    { opCode: "DD5E ZZ", z80: "LD E,(IX+ZZ)", length: 3 },
    { opCode: "DD66 ZZ", z80: "LD H,(IX+ZZ)", length: 3 },
    { opCode: "DD6E ZZ", z80: "LD L,(IX+ZZ)", length: 3 },
    { opCode: "DD70 ZZ", z80: "LD (IX+ZZ),B", length: 3 },
    { opCode: "DD71 ZZ", z80: "LD (IX+ZZ),C", length: 3 },
    { opCode: "DD72 ZZ", z80: "LD (IX+ZZ),D", length: 3 },
    { opCode: "DD73 ZZ", z80: "LD (IX+ZZ),E", length: 3 },
    { opCode: "DD74 ZZ", z80: "LD (IX+ZZ),H", length: 3 },
    { opCode: "DD75 ZZ", z80: "LD (IX+ZZ),L", length: 3 },
    { opCode: "DD77 ZZ", z80: "LD (IX+ZZ),A", length: 3 },
    { opCode: "DD7E ZZ", z80: "LD A,(IX+ZZ)", length: 3 },
    { opCode: "DD86 ZZ", z80: "ADD A,(IX+ZZ)", length: 3 },
    { opCode: "DD8E ZZ", z80: "ADC A,(IX+ZZ)", length: 3 },
    { opCode: "DD96 ZZ", z80: "SUB (IX+ZZ)", length: 3 },
    { opCode: "DD9E ZZ", z80: "SBC A,(IX+ZZ)", length: 3 },
    { opCode: "DDA6 ZZ", z80: "AND (IX+ZZ)", length: 3 },
    { opCode: "DDAE ZZ", z80: "XOR (IX+ZZ)", length: 3 },
    { opCode: "DDB6 ZZ", z80: "OR (IX+ZZ)", length: 3 },
    { opCode: "DDBE ZZ", z80: "CP (IX+ZZ)", length: 3 },
    { opCode: "DDCB ZZ 06", z80: "RLC (IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 0E", z80: "RRC (IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 16", z80: "RL (IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 1E", z80: "RR (IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 26", z80: "SLA (IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 2E", z80: "SRA (IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 3E", z80: "SRL (IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 46", z80: "BIT 0,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 4E", z80: "BIT 1,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 56", z80: "BIT 2,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 5E", z80: "BIT 3,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 66", z80: "BIT 4,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 6E", z80: "BIT 5,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 76", z80: "BIT 6,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 7E", z80: "BIT 7,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 86", z80: "RES 0,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 8E", z80: "RES 1,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 96", z80: "RES 2,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ 9E", z80: "RES 3,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ A6", z80: "RES 4,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ AE", z80: "RES 5,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ B6", z80: "RES 6,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ BE", z80: "RES 7,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ C6", z80: "SET 0,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ CE", z80: "SET 1,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ D6", z80: "SET 2,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ DE", z80: "SET 3,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ E6", z80: "SET 4,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ EE", z80: "SET 5,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ F6", z80: "SET 6,(IX+ZZ)", length: 4 },
    { opCode: "DDCB ZZ FE", z80: "SET 7,(IX+ZZ)", length: 4 },
    { opCode: "DDE1", z80: "POP IX", length: 2 },
    { opCode: "DDE3", z80: "EX (SP),IX", length: 2 },
    { opCode: "DDE5", z80: "PUSH IX", length: 2 },
    { opCode: "DDE9", z80: "JP (IX)", length: 2 },
    { opCode: "DDF9", z80: "LD SP,IX", length: 2 },
    { opCode: "DE XX", z80: "SBC A,XX", length: 2 },
    { opCode: "DF", z80: "RST 18", length: 1 },
    { opCode: "E0", z80: "RET PO", length: 1 },
    { opCode: "E1", z80: "POP HL", length: 1 },
    { opCode: "E2 XXXX", z80: "JP PO,XXXX", length: 3 },
    { opCode: "E3", z80: "EX (SP),HL", length: 1 },
    { opCode: "E4 XXXX", z80: "CALL PO,XXXX", length: 3 },
    { opCode: "E5", z80: "PUSH HL", length: 1 },
    { opCode: "E6 XX", z80: "AND XX", length: 2 },
    { opCode: "E7", z80: "RST 20", length: 1 },
    { opCode: "E8", z80: "RET PE", length: 1 },
    { opCode: "E9", z80: "JP (HL)", length: 1 },
    { opCode: "EA XXXX", z80: "JP PE,XXXX", length: 3 },
    { opCode: "EB", z80: "EX DE,HL", length: 1 },
    { opCode: "EC XXXX", z80: "CALL PE,XXXX", length: 3 },
    { opCode: "ED40", z80: "IN B,(C)", length: 2 },
    { opCode: "ED41", z80: "OUT (C),B", length: 2 },
    { opCode: "ED42", z80: "SBC HL,BC", length: 2 },
    { opCode: "ED43 XXXX", z80: "LD (XXXX),BC", length: 4 },
    { opCode: "ED44", z80: "NEG", length: 2 },
    { opCode: "ED45", z80: "RETN", length: 2 },
    { opCode: "ED46", z80: "IM 0", length: 2 },
    { opCode: "ED47", z80: "LD I,A", length: 2 },
    { opCode: "ED48", z80: "IN C,(C)", length: 2 },
    { opCode: "ED49", z80: "OUT (C),C", length: 2 },
    { opCode: "ED4A", z80: "ADC HL,BC", length: 2 },
    { opCode: "ED4B XXXX", z80: "LD BC,(XXXX)", length: 4 },
    { opCode: "ED4D", z80: "RETI", length: 2 },
    { opCode: "ED4F", z80: "LD R,A", length: 2 },
    { opCode: "ED50", z80: "IN D,(C)", length: 2 },
    { opCode: "ED51", z80: "OUT (C),D", length: 2 },
    { opCode: "ED52", z80: "SBC HL,DE", length: 2 },
    { opCode: "ED53 XXXX", z80: "LD (XXXX),DE", length: 4 },
    { opCode: "ED56", z80: "IM 1", length: 2 },
    { opCode: "ED57", z80: "LD A,I", length: 2 },
    { opCode: "ED58", z80: "IN E,(C)", length: 2 },
    { opCode: "ED59", z80: "OUT (C),E", length: 2 },
    { opCode: "ED5A", z80: "ADC HL,DE", length: 2 },
    { opCode: "ED5B XXXX", z80: "LD DE,(XXXX)", length: 4 },
    { opCode: "ED5E", z80: "IM 2", length: 2 },
    { opCode: "ED5F", z80: "LD A,R", length: 2 },
    { opCode: "ED60", z80: "IN H,(C)", length: 2 },
    { opCode: "ED61", z80: "OUT (C),H", length: 2 },
    { opCode: "ED62", z80: "SBC HL,HL", length: 2 },
    { opCode: "ED67", z80: "RRD", length: 2 },
    { opCode: "ED68", z80: "IN L,(C)", length: 2 },
    { opCode: "ED69", z80: "OUT (C),L", length: 2 },
    { opCode: "ED6A", z80: "ADC HL,HL", length: 2 },
    { opCode: "ED6F", z80: "RLD", length: 2 },
    { opCode: "ED72", z80: "SBC HL,SP", length: 2 },
    { opCode: "ED73 XXXX", z80: "LD (XXXX),SP", length: 4 },
    { opCode: "ED78", z80: "IN A,(C)", length: 2 },
    { opCode: "ED79", z80: "OUT (C),A", length: 2 },
    { opCode: "ED7A", z80: "ADC HL,SP", length: 2 },
    { opCode: "ED7B XXXX", z80: "LD SP,(XXXX)", length: 4 },
    { opCode: "EDA0", z80: "LDI", length: 2 },
    { opCode: "EDA1", z80: "CPI", length: 2 },
    { opCode: "EDA2", z80: "INI", length: 2 },
    { opCode: "EDA3", z80: "OUTI", length: 2 },
    { opCode: "EDA8", z80: "LDD", length: 2 },
    { opCode: "EDA9", z80: "CPD", length: 2 },
    { opCode: "EDAA", z80: "IND", length: 2 },
    { opCode: "EDAB", z80: "OUTD", length: 2 },
    { opCode: "EDB0", z80: "LDIR", length: 2 },
    { opCode: "EDB1", z80: "CPIR", length: 2 },
    { opCode: "EDB2", z80: "INIR", length: 2 },
    { opCode: "EDB3", z80: "OTIR", length: 2 },
    { opCode: "EDB8", z80: "LDDR", length: 2 },
    { opCode: "EDB9", z80: "CPDR", length: 2 },
    { opCode: "EDBA", z80: "INDR", length: 2 },
    { opCode: "EDBB", z80: "OTDR", length: 2 },
    { opCode: "EE XX", z80: "XOR XX", length: 2 },
    { opCode: "EF", z80: "RST 28", length: 1 },
    { opCode: "F0", z80: "RET P", length: 1 },
    { opCode: "F1", z80: "POP AF", length: 1 },
    { opCode: "F2 XXXX", z80: "JP P,XXXX", length: 3 },
    { opCode: "F3", z80: "DI", length: 1 },
    { opCode: "F4 XXXX", z80: "CALL P,XXXX", length: 3 },
    { opCode: "F5", z80: "PUSH AF", length: 1 },
    { opCode: "F6 XX", z80: "OR XX", length: 2 },
    { opCode: "F7", z80: "RST 30", length: 1 },
    { opCode: "F8", z80: "RET M", length: 1 },
    { opCode: "F9", z80: "LD SP,HL", length: 1 },
    { opCode: "FA XXXX", z80: "JP M,XXXX", length: 3 },
    { opCode: "FB", z80: "EI", length: 1 },
    { opCode: "FC XXXX", z80: "CALL M,XXXX", length: 3 },
    { opCode: "FD09", z80: "ADD IY,BC", length: 2 },
    { opCode: "FD19", z80: "ADD IY,DE", length: 2 },
    { opCode: "FD21 XXXX", z80: "LD IY,XXXX", length: 4 },
    { opCode: "FD22 XXXX", z80: "LD (XXXX),IY", length: 4 },
    { opCode: "FD23", z80: "INC IY", length: 2 },
    { opCode: "FD29", z80: "ADD IY,IY", length: 2 },
    { opCode: "FD2A XXXX", z80: "LD IY,(XXXX)", length: 4 },
    { opCode: "FD2B", z80: "DEC IY", length: 2 },
    { opCode: "FD34 ZZ", z80: "INC (IY+ZZ)", length: 3 },
    { opCode: "FD35 ZZ", z80: "DEC (IY+ZZ)", length: 3 },
    { opCode: "FD36 ZZ XX", z80: "LD (IY+ZZ),XX", length: 4 },
    { opCode: "FD39", z80: "ADD IY,SP", length: 2 },
    { opCode: "FD46 ZZ", z80: "LD B,(IY+ZZ)", length: 3 },
    { opCode: "FD4E ZZ", z80: "LD C,(IY+ZZ)", length: 3 },
    { opCode: "FD56 ZZ", z80: "LD D,(IY+ZZ)", length: 3 },
    { opCode: "FD5E ZZ", z80: "LD E,(IY+ZZ)", length: 3 },
    { opCode: "FD66 ZZ", z80: "LD H,(IY+ZZ)", length: 3 },
    { opCode: "FD6E ZZ", z80: "LD L,(IY+ZZ)", length: 3 },
    { opCode: "FD70 ZZ", z80: "LD (IY+ZZ),B", length: 3 },
    { opCode: "FD71 ZZ", z80: "LD (IY+ZZ),C", length: 3 },
    { opCode: "FD72 ZZ", z80: "LD (IY+ZZ),D", length: 3 },
    { opCode: "FD73 ZZ", z80: "LD (IY+ZZ),E", length: 3 },
    { opCode: "FD74 ZZ", z80: "LD (IY+ZZ),H", length: 3 },
    { opCode: "FD75 ZZ", z80: "LD (IY+ZZ),L", length: 3 },
    { opCode: "FD77 ZZ", z80: "LD (IY+ZZ),A", length: 3 },
    { opCode: "FD7E ZZ", z80: "LD A,(IY+ZZ)", length: 3 },
    { opCode: "FD86 ZZ", z80: "ADD A,(IY+ZZ)", length: 3 },
    { opCode: "FD8E ZZ", z80: "ADC A,(IY+ZZ)", length: 3 },
    { opCode: "FD96 ZZ", z80: "SUB (IY+ZZ)", length: 3 },
    { opCode: "FD9E ZZ", z80: "SBC A,(IY+ZZ)", length: 3 },
    { opCode: "FDA6 ZZ", z80: "AND (IY+ZZ)", length: 3 },
    { opCode: "FDAE ZZ", z80: "XOR (IY+ZZ)", length: 3 },
    { opCode: "FDB6 ZZ", z80: "OR (IY+ZZ)", length: 3 },
    { opCode: "FDBE ZZ", z80: "CP (IY+ZZ)", length: 3 },
    { opCode: "FDCB ZZ 06", z80: "RLC (IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 0E", z80: "RRC (IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 16", z80: "RL (IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 1E", z80: "RR (IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 26", z80: "SLA (IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 2E", z80: "SRA (IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 3E", z80: "SRL (IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 46", z80: "BIT 0,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 4E", z80: "BIT 1,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 56", z80: "BIT 2,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 5E", z80: "BIT 3,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 66", z80: "BIT 4,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 6E", z80: "BIT 5,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 76", z80: "BIT 6,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 7E", z80: "BIT 7,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 86", z80: "RES 0,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 8E", z80: "RES 1,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 96", z80: "RES 2,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ 9E", z80: "RES 3,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ A6", z80: "RES 4,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ AE", z80: "RES 5,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ B6", z80: "RES 6,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ BE", z80: "RES 7,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ C6", z80: "SET 0,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ CE", z80: "SET 1,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ D6", z80: "SET 2,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ DE", z80: "SET 3,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ E6", z80: "SET 4,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ EE", z80: "SET 5,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ F6", z80: "SET 6,(IY+ZZ)", length: 4 },
    { opCode: "FDCB ZZ FE", z80: "SET 7,(IY+ZZ)", length: 4 },
    { opCode: "FDE1", z80: "POP IY", length: 2 },
    { opCode: "FDE3", z80: "EX (SP),IY", length: 2 },
    { opCode: "FDE5", z80: "PUSH IY", length: 2 },
    { opCode: "FDE9", z80: "JP (IY)", length: 2 },
    { opCode: "FDF9", z80: "LD SP,IY", length: 2 },
    { opCode: "FE XX", z80: "CP XX", length: 2 },
    { opCode: "FF", z80: "RST 38", length: 1 }
];
exports.z80Cmds = z80Cmds;
// ============================================
// STEP 2: Build exact commands and pattern commands
// ============================================
/**
 * Exact commands: No placeholders (XXXX, n, e, d)
 * Pattern commands: Have placeholders that could be numbers or labels
 */
var exactCmds = new Set();
// Map mnemonic -> set of allowed operand-signatures for exact (non-placeholder) commands
var exactOperandsMap = new Map();
var patternCmds = new Map();
// Build the lookup tables at module load
(function buildLookupTables() {
    for (var _i = 0, z80Cmds_1 = z80Cmds; _i < z80Cmds_1.length; _i++) {
        var cmd = z80Cmds_1[_i];
        var z80Upper = cmd.z80.toUpperCase();
        var normalized = z80Upper.replace(/\s+/g, ' ').replace(/,\s*/g, ',').trim();
        // Check if command has placeholders (now all uppercase, easy to detect)
        var hasXXXX = /\bXXXX\b/.test(cmd.z80); // 16-bit value
        var hasIndirectXXXX = /\(XXXX\)/.test(cmd.z80); // indirect 16-bit
        var hasXX = /\bXX\b/.test(cmd.z80); // 8-bit value
        var hasIndirectXX = /\(XX\)/.test(cmd.z80); // indirect 8-bit (port)
        var hasYY = /\bYY\b/.test(cmd.z80); // relative offset
        var hasZZ = /\+ZZ\)/.test(cmd.z80); // indexed displacement
        if (hasXXXX || hasIndirectXXXX || hasXX || hasIndirectXX || hasYY || hasZZ) {
            // Pattern command - extract mnemonic
            var mnemonic = normalized.split(/\s+/)[0];
            if (!patternCmds.has(mnemonic)) {
                patternCmds.set(mnemonic, []);
            }
            patternCmds.get(mnemonic).push({
                pattern: normalized,
                is16bit: hasXXXX || hasIndirectXXXX,
                isRelative: hasYY
            });
        }
        else {
            // Exact command - no placeholders
            exactCmds.add(normalized);
            // record operand signature: normalized without mnemonic
            var parts = normalized.split(/\s+/);
            var mnemonic = parts[0];
            var ops = parts.slice(1).join(' ');
            if (!exactOperandsMap.has(mnemonic))
                exactOperandsMap.set(mnemonic, new Set());
            exactOperandsMap.get(mnemonic).add(ops);
        }
    }
})();
// ============================================
// PARSING FUNCTIONS
// ============================================
/**
 * Split operands by comma, respecting parentheses
 */
function splitOperands(operandStr) {
    var operands = [];
    var current = '';
    var parenDepth = 0;
    for (var _i = 0, operandStr_1 = operandStr; _i < operandStr_1.length; _i++) {
        var char = operandStr_1[_i];
        if (char === '(') {
            parenDepth++;
            current += char;
        }
        else if (char === ')') {
            parenDepth--;
            current += char;
        }
        else if (char === ',' && parenDepth === 0) {
            operands.push(current.trim());
            current = '';
        }
        else {
            current += char;
        }
    }
    if (current.trim()) {
        operands.push(current.trim());
    }
    return operands;
}
/**
 * Parse a Z80 assembly line
 */
function parseZ80Line(lineText, lineNumber) {
    var trimmed = lineText.trim();
    if (!trimmed) {
        return null;
    }
    // If it's a CODE marker like "10 CODE", treat as non-assembly
    if (/^\d+\s+CODE\s*$/.test(trimmed)) {
        return null;
    }
    // We will try to extract a 4-hex address below. If no address is present
    // and the line looks like a BASIC numbered line (decimal line number
    // followed by a BASIC keyword), then skip it. Doing the address check
    // first avoids mis-classifying assembly lines that start with a hex
    // address (e.g. "4007 JPANEL:...") as BASIC lines.
    var result = {
        address: '',
        raw: lineText,
        lineNumber: lineNumber
    };
    // Strip comment first
    var workingText = trimmed;
    var commentIdx = workingText.indexOf(';');
    if (commentIdx !== -1) {
        result.comment = workingText.slice(commentIdx + 1).trim();
        workingText = workingText.slice(0, commentIdx).trim();
    }
    if (!workingText) {
        return result;
    }
    // Extract 4-digit hex address (may be preceded by optional whitespace or line number)
    // Strict pattern: optional leading whitespace, then 4 hex digits, then at least
    // one space, then the rest of the line. If no address is present, return a
    // parsed result flagged with `missingAddress` so the validator can report
    // a clear error.
    // Extract address - try to match anything that looks address-like first
    var addrMatch = /^([0-9A-Za-z_]+)(?:\s+(.*))?$/.exec(workingText);
    if (addrMatch) {
        var addr = addrMatch[1];
        // Check if it's valid format (exactly 4 hex digits, no underscore)
        if (/^[0-9A-F]{4}$/.test(addr) && !/_/.test(addr)) {
            result.address = addr.toUpperCase();
            // Store original if it contained lowercase (for validation)
            if (addr !== result.address) {
                result.originalAddress = addr;
            }
            workingText = (addrMatch[2] || '').trim();
        }
        else {
            // Malformed address
            result.raw = lineText;
            result.malformedAddress = addr;
            return result;
        }
    }
    else {
        // No address-like pattern found at all
        result.missingAddress = true;
        result.raw = lineText;
        return result;
    }
    // Detect a label: any colon in the (non-comment) remainder indicates a
    // label. The label is the text between the hex address (excluding any
    // whitespace) up to the colon. We've already stripped comments above so
    // a colon here is part of code.
    var colonIdx = workingText.indexOf(':');
    if (colonIdx >= 0) {
        var candidate = workingText.slice(0, colonIdx).trim();
        if (/^[A-Z][A-Z0-9]*$/.test(candidate)) {
            result.label = candidate.toUpperCase();
            // Store original if it wasn't uppercase (for validation)
            if (candidate !== result.label) {
                result.originalLabel = candidate;
            }
        }
        // Remove label and colon from working text (anything after colon is instruction)
        workingText = workingText.slice(colonIdx + 1).trim();
    }
    // Check for directives
    var directiveMatch = /^(DB|DW|DS)\s+(.*)$/.exec(workingText);
    if (directiveMatch) {
        result.isDirective = true;
        result.directiveType = directiveMatch[1].toUpperCase();
        result.directiveValue = directiveMatch[2].trim();
        return result;
    }
    // Parse mnemonic and operands
    if (workingText) {
        var spaceIdx = workingText.search(/\s/);
        if (spaceIdx === -1) {
            var originalMnemonic = workingText;
            result.mnemonic = workingText.toUpperCase();
            // Store original if it wasn't uppercase (for validation)
            if (originalMnemonic !== result.mnemonic) {
                result.originalMnemonic = originalMnemonic;
            }
        }
        else {
            var originalMnemonic = workingText.slice(0, spaceIdx);
            result.mnemonic = originalMnemonic.toUpperCase();
            // Store original if it wasn't uppercase (for validation)
            if (originalMnemonic !== result.mnemonic) {
                result.originalMnemonic = originalMnemonic;
            }
            var operandStr = workingText.slice(spaceIdx).trim();
            if (operandStr) {
                result.operands = splitOperands(operandStr);
            }
        }
    }
    return result;
}
/**
 * Detect CODE blocks in document
 */
function detectCodeBlocks(lines, baseAddr) {
    // Centralized CODE-block detection.
    // Recognises a numbered CODE marker line (e.g. "57 CODE") and treats
    // the subsequent lines as Z80 assembly until a non-assembly line is hit.
    // Assembly line format (strict):
    //   - starts with whitespace (indent)
    //   - then a 4-hex-digit address (e.g. 400C)
    //   - optional label immediately after the address and a space: LABEL:
    //   - assembly instruction (single command) and optional trailing ";comment"
    // Any line that does not match this format terminates the current block.
    if (baseAddr === void 0) { baseAddr = 0x4000; }
    var blocks = [];
    var inCodeBlock = false;
    var currentBlock = null;
    // Regex to capture assembly lines: indent + address-like sequence + rest
    // This will capture any hex-like sequence (even malformed ones like 40_AF, 400Z, 40ab),
    // and then the validation in parseZ80Line and validateCodeBlock will catch the errors later.
    // The block will continue instead of terminating early on malformed addresses.
    // Using [0-9A-Za-z_]+ to match any alphanumeric or underscore sequence that looks like an address
    var asmLineRe = /^\s+([0-9A-Za-z_]+)\s+(.*)$/;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();
        if (!trimmed) {
            // Treat an empty/blank line as the end of an assembly block for strictness
            if (inCodeBlock && currentBlock) {
                currentBlock.endLine = i - 1;
                blocks.push(currentBlock);
                inCodeBlock = false;
                currentBlock = null;
            }
            continue;
        }
        // Detect CODE marker (e.g. "10 CODE"). Start assembly on the next line.
        if (/^\d+\s+CODE\s*$/.test(trimmed)) {
            if (inCodeBlock && currentBlock) {
                currentBlock.endLine = i - 1;
                blocks.push(currentBlock);
            }
            currentBlock = {
                // Keep startLine pointing at the CODE marker (assembly starts at startLine+1)
                startLine: i,
                endLine: -1,
                baseAddress: baseAddr,
                lines: [],
                errors: []
            };
            inCodeBlock = true;
            continue;
        }
        if (inCodeBlock && currentBlock) {
            var m = asmLineRe.exec(line);
            if (!m) {
                // Non-matching line -> end block (assembly must match strict format)
                currentBlock.endLine = i - 1;
                blocks.push(currentBlock);
                inCodeBlock = false;
                currentBlock = null;
                continue;
            }
            // NEW REGEX: m[1] = address (or malformed address), m[2] = everything else (label + instruction)
            // Parse m[2] to extract optional label and instruction
            var restOfLine = (m[2] || '').trim();
            if (!restOfLine) {
                // No instruction after address -> end block
                currentBlock.endLine = i - 1;
                blocks.push(currentBlock);
                inCodeBlock = false;
                currentBlock = null;
                continue;
            }
            // Check if there's a label (ends with ':')
            // Allow one colon for the optional label, but disallow additional colons in the instruction.
            // Ignore colons that appear inside trailing comments.
            var codeOnly = restOfLine.split(';')[0].trim();
            var colonCount = (codeOnly.match(/:/g) || []).length;
            if (colonCount > 1) {
                // Multiple colons -> invalid assembly line -> end block
                currentBlock.endLine = i - 1;
                blocks.push(currentBlock);
                inCodeBlock = false;
                currentBlock = null;
                continue;
            }
            // Line is valid assembly: collect parsed line for later validation
            var parsed = parseZ80Line(line, i);
            if (parsed) {
                currentBlock.lines.push(parsed);
            }
        }
    }
    if (inCodeBlock && currentBlock) {
        currentBlock.endLine = lines.length - 1;
        blocks.push(currentBlock);
    }
    return blocks;
}
// ============================================
// STEP 3, 4, 5, 6: VALIDATION
// ============================================
/**
 * Check if operand is a hex number (#prefix)
 */
function isHexOperand(op) {
    return /^[#][0-9A-F]+$/.test(op.trim());
}
/**
 * Check if operand is a decimal number
 */
function isDecimalOperand(op) {
    return /^[0-9]+$/.test(op.trim());
}
/**
 * Check if operand is a label (starts with A-Z)
 */
function isLabelOperand(op) {
    var trimmed = op.trim().toUpperCase();
    // Must start with letter, be alphanumeric, and NOT be a register/condition
    if (!/^[A-Z][A-Z0-9]*$/.test(trimmed)) {
        return false;
    }
    var reserved = new Set([
        'A', 'B', 'C', 'D', 'E', 'H', 'L', 'I', 'R',
        'AF', 'BC', 'DE', 'HL', 'SP', 'IX', 'IY',
        'NZ', 'Z', 'NC', 'PO', 'PE', 'P', 'M'
    ]);
    return !reserved.has(trimmed);
}
/**
 * Parse hex value from operand
 */
function parseHexValue(op) {
    var match = /^[#]([0-9A-F]+)$/.exec(op.trim());
    if (match) {
        return parseInt(match[1], 16);
    }
    return 0;
}
/**
 * Get hex digit count
 */
function getHexDigitCount(op) {
    var match = /^[#]([0-9A-F]+)$/.exec(op.trim());
    return match ? match[1].length : 0;
}
/**
 * Validate operand size based on placeholder type
 * Returns error message if invalid, null if valid
 * Handles: XX (8-bit), YY (8-bit signed), ZZ (8-bit), XXXX (16-bit)
 */
function validateOperandSize(op, placeholder) {
    var trimmed = op.trim().toUpperCase();
    // Labels are assumed valid (validated in label cross-check phase)
    if (/^[A-Z][A-Z0-9]*$/.test(trimmed)) {
        return null;
    }
    // Extract hex value
    var hexMatch = /^[#]([0-9A-F]+)$/.exec(trimmed);
    if (hexMatch) {
        var hexValue = parseInt(hexMatch[1], 16);
        var hexStr = hexMatch[1].toUpperCase();
        if (placeholder === 'XX' || placeholder === 'ZZ') {
            // 8-bit unsigned: 0x00 to 0xFF
            if (hexValue < 0 || hexValue > 0xFF) {
                return "".concat(placeholder, " must be 8-bit (#00 to #FF), got #").concat(hexStr);
            }
            return null;
        }
        else if (placeholder === 'YY') {
            // 8-bit signed: -128 to +127 (0x00 to 0xFF in unsigned, but interpreted as -128..+127)
            if (hexValue < 0 || hexValue > 0xFF) {
                return "".concat(placeholder, " must be 8-bit signed (#00 to #FF), got #").concat(hexStr);
            }
            return null;
        }
        else if (placeholder === 'XXXX') {
            // 16-bit unsigned: 0x0000 to 0xFFFF
            if (hexValue < 0 || hexValue > 0xFFFF) {
                return "".concat(placeholder, " must be 16-bit (#0000 to #FFFF), got #").concat(hexStr);
            }
            return null;
        }
    }
    // Extract decimal value
    var decMatch = /^-?[0-9]+$/.exec(trimmed);
    if (decMatch) {
        var decValue = parseInt(decMatch[0], 10);
        if (placeholder === 'XX' || placeholder === 'ZZ') {
            // 8-bit unsigned: 0 to 255
            if (decValue < 0 || decValue > 255) {
                return "".concat(placeholder, " must be 0-255 in decimal, got ").concat(decValue);
            }
            return null;
        }
        else if (placeholder === 'YY') {
            // 8-bit signed: -128 to +127
            if (decValue < -128 || decValue > 127) {
                return "".concat(placeholder, " must be -128 to +127 in decimal, got ").concat(decValue);
            }
            return null;
        }
        else if (placeholder === 'XXXX') {
            // 16-bit unsigned: 0 to 65535
            if (decValue < 0 || decValue > 65535) {
                return "".concat(placeholder, " must be 0-65535 in decimal, got ").concat(decValue);
            }
            return null;
        }
    }
    // Invalid format for a numeric operand
    if (placeholder === 'XXXX') {
        return "".concat(placeholder, " must be a hex value (#0000-#FFFF), decimal (0-65535), or a label");
    }
    else {
        return "".concat(placeholder, " must be a hex value, decimal, or a label");
    }
}
function splitDirectiveValues(raw) {
    var values = [];
    var inString = false;
    var current = '';
    for (var i = 0; i < raw.length; i++) {
        var ch = raw[i];
        if (ch === '"') {
            inString = !inString;
            current += ch;
        }
        else if (ch === ',' && !inString) {
            if (current.trim())
                values.push(current.trim());
            current = '';
        }
        else {
            current += ch;
        }
    }
    if (current.trim())
        values.push(current.trim());
    return values;
}
function validateDirectiveOperands(parsed) {
    var issues = [];
    if (!parsed.isDirective || !parsed.directiveType || !parsed.directiveValue)
        return issues;
    var values = splitDirectiveValues(parsed.directiveValue);
    if (values.length === 0) {
        issues.push({ token: parsed.directiveType, message: "".concat(parsed.directiveType, " requires at least one value") });
        return issues;
    }
    var parseNumeric = function (token) {
        var t = token.trim();
        if (/^#[0-9A-Fa-f]+$/.test(t))
            return parseInt(t.slice(1), 16);
        if (/^\d+$/.test(t))
            return parseInt(t, 10);
        return null;
    };
    if (parsed.directiveType === 'DB') {
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var value = values_1[_i];
            if (/^".*"$/.test(value))
                continue;
            if (value.trim().startsWith('#') && !/^#[0-9A-Fa-f]+$/.test(value.trim())) {
                issues.push({ token: value, message: "Invalid hex byte \"".concat(value, "\" in DB (expected #00 to #FF)") });
                continue;
            }
            var num = parseNumeric(value);
            if (num === null) {
                issues.push({ token: value, message: "Invalid DB value \"".concat(value, "\" (expected byte, decimal, or quoted string)") });
                continue;
            }
            if (num < 0 || num > 0xFF) {
                issues.push({ token: value, message: "DB value out of range: \"".concat(value, "\" (expected 0-255 or #00-#FF)") });
            }
        }
    }
    else if (parsed.directiveType === 'DW') {
        for (var _a = 0, values_2 = values; _a < values_2.length; _a++) {
            var value = values_2[_a];
            if (value.trim().startsWith('#') && !/^#[0-9A-Fa-f]+$/.test(value.trim())) {
                issues.push({ token: value, message: "Invalid hex word \"".concat(value, "\" in DW (expected #0000 to #FFFF)") });
                continue;
            }
            var num = parseNumeric(value);
            if (num === null) {
                if (!/^[A-Z][A-Z0-9]*$/.test(value.trim().toUpperCase())) {
                    issues.push({ token: value, message: "Invalid DW value \"".concat(value, "\" (expected 16-bit value or label)") });
                }
                continue;
            }
            if (num < 0 || num > 0xFFFF) {
                issues.push({ token: value, message: "DW value out of range: \"".concat(value, "\" (expected 0-65535 or #0000-#FFFF)") });
            }
        }
    }
    else if (parsed.directiveType === 'DS') {
        if (values.length !== 1) {
            issues.push({ token: parsed.directiveValue, message: 'DS requires a single size value' });
            return issues;
        }
        var value = values[0];
        if (value.trim().startsWith('#') && !/^#[0-9A-Fa-f]+$/.test(value.trim())) {
            issues.push({ token: value, message: "Invalid hex size \"".concat(value, "\" in DS (expected #00 to #FE)") });
            return issues;
        }
        var num = parseNumeric(value);
        if (num === null) {
            issues.push({ token: value, message: "Invalid DS size \"".concat(value, "\" (expected 0-254 or #00-#FE)") });
            return issues;
        }
        if (num < 0 || num > 0xFE) {
            issues.push({ token: value, message: "DS size out of range: \"".concat(value, "\" (expected 0-254 or #00-#FE)") });
        }
    }
    return issues;
}
/**
 * Build normalized instruction for exact matching
 */
function buildNormalizedInstruction(mnemonic, operands) {
    if (!operands || operands.length === 0) {
        return mnemonic.toUpperCase();
    }
    var normalizedOps = operands.map(function (op) { return op.toUpperCase().trim(); });
    return "".concat(mnemonic.toUpperCase(), " ").concat(normalizedOps.join(','));
}
/**
 * Replace value operands with placeholders for pattern matching
 * Uses: XXXX (16-bit), XX (8-bit), YY (relative), ZZ (displacement)
 */
function replaceWithPlaceholders(mnemonic, operands) {
    var upperMnemonic = mnemonic.toUpperCase();
    var replacedOps = operands.map(function (op, idx) {
        var _a;
        var upper = op.toUpperCase().trim();
        // Keep registers, conditions, indirect registers as-is
        if (/^(A|B|C|D|E|H|L|I|R)$/.test(upper))
            return upper;
        if (/^(AF|BC|DE|HL|SP|IX|IY|AF')$/.test(upper))
            return upper;
        if (/^(NZ|Z|NC|C|PO|PE|P|M)$/.test(upper))
            return upper;
        if (/^\((HL|BC|DE|SP|C|IX|IY)\)$/.test(upper))
            return upper;
        // Indexed addressing: (IX+nn) -> (IX+ZZ)
        if (/^\(IX[+-]/.test(upper)) {
            return '(IX+ZZ)';
        }
        if (/^\(IY[+-]/.test(upper)) {
            return '(IY+ZZ)';
        }
        // Indirect port number for IN/OUT: (xx) -> (XX)
        if (upperMnemonic === 'OUT' || upperMnemonic === 'IN') {
            if (/^\([#]?[0-9A-F]+\)$/.test(upper) || /^\([0-9]+\)$/.test(upper)) {
                return '(XX)';
            }
        }
        // Indirect address: (#XXXX) or (decimal) or (label) -> (XXXX)
        if (/^\([#][0-9A-F]+\)$/.test(upper)) {
            return '(XXXX)';
        }
        if (/^\([0-9]+\)$/.test(upper)) {
            return '(XXXX)';
        }
        if (/^\([A-Z][A-Z0-9]*\)$/.test(upper)) {
            return '(XXXX)';
        }
        // Bit numbers 0-7 - keep as-is
        if (/^[0-7]$/.test(upper) && ['BIT', 'SET', 'RES'].includes(upperMnemonic)) {
            return upper;
        }
        // IM mode - keep as-is
        if (upperMnemonic === 'IM' && /^[0-2]$/.test(upper))
            return upper;
        // RST addresses - keep as-is
        if (upperMnemonic === 'RST')
            return upper;
        // For JR/DJNZ - relative offset -> YY
        if (upperMnemonic === 'JR' || upperMnemonic === 'DJNZ') {
            if (/^(NZ|Z|NC|C)$/.test(upper))
                return upper;
            return 'YY';
        }
        // For JP/CALL - 16-bit address -> XXXX
        if (upperMnemonic === 'JP' || upperMnemonic === 'CALL') {
            if (/^(NZ|Z|NC|C|PO|PE|P|M)$/.test(upper))
                return upper;
            if (/^\((HL|IX|IY)\)$/.test(upper))
                return upper;
            return 'XXXX';
        }
        // For LD - determine 8-bit or 16-bit based on first operand
        if (upperMnemonic === 'LD' && idx === 1) {
            var firstOp = ((_a = operands[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase().trim()) || '';
            // 16-bit register pairs use XXXX
            if (/^(BC|DE|HL|SP|IX|IY)$/.test(firstOp))
                return 'XXXX';
            // 8-bit contexts use XX
            if (/^(A|B|C|D|E|H|L)$/.test(firstOp))
                return 'XX';
            if (/^\(HL\)$/.test(firstOp))
                return 'XX';
            if (/^\(IX[+-]/.test(firstOp))
                return 'XX';
            if (/^\(IY[+-]/.test(firstOp))
                return 'XX';
        }
        // For other 8-bit operations (ADD A,n; SUB n; AND n; etc.)
        if (['ADD', 'ADC', 'SUB', 'SBC', 'AND', 'XOR', 'OR', 'CP'].includes(upperMnemonic)) {
            // If it's a value, it's 8-bit
            if (isHexOperand(upper) || isDecimalOperand(upper)) {
                return 'XX';
            }
        }
        // Hex value - determine size
        if (isHexOperand(upper)) {
            var val = parseHexValue(upper);
            return val > 255 ? 'XXXX' : 'XX';
        }
        // Decimal value - determine size
        if (isDecimalOperand(upper)) {
            var val = parseInt(upper, 10);
            return val > 255 ? 'XXXX' : 'XX';
        }
        // Label -> XXXX (labels are 16-bit addresses)
        if (isLabelOperand(upper)) {
            return 'XXXX';
        }
        return upper;
    });
    return "".concat(upperMnemonic, " ").concat(replacedOps.join(','));
}
/**
 * Determine whether a given operand position for a mnemonic may accept a label/hex/decimal
 * by checking existing pattern commands for that mnemonic. Returns true if at least one
 * pattern could accept a value placeholder (XXXX/XX/YY/ZZ) at the given operand index
 * when the other operands are compatible with the pattern.
 * Also recognizes literal numeric patterns (e.g., 0-7 for BIT/RES/SET instructions).
 */
function operandPositionAllowsValue(mnemonic, operands, opIdx, allowXX) {
    var placeholderKind = function (token) {
        var t = token.toUpperCase().trim();
        if (['XXXX', 'XX', 'YY', 'ZZ'].includes(t))
            return t;
        if (t === '(XXXX)')
            return 'XXXX';
        if (t === '(XX)')
            return 'XX';
        if (/^\((IX|IY)[+-]ZZ\)$/.test(t))
            return 'ZZ';
        return null;
    };
    var patterns = patternCmds.get(mnemonic);
    if (!patterns || patterns.length === 0)
        return false;
    var upperOperands = operands.map(function (o) { return o.toUpperCase().trim(); });
    for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
        var p = patterns_1[_i];
        var parts = p.pattern.split(/[,\s]+/).filter(Boolean); // parts[0]=MNEMONIC, parts[1]=op1, ...
        // If operands count doesn't match pattern operands, skip
        if (parts.length - 1 !== operands.length)
            continue;
        var ok = true;
        for (var j = 0; j < operands.length; j++) {
            var part = parts[j + 1];
            var op = upperOperands[j];
            // Placeholder tokens always match, including parenthesized/indexed forms.
            if (placeholderKind(part) !== null)
                continue;
            // allow common register/indirect tokens to match literally
            if (part === op)
                continue;
            // parenthesised forms in pattern like (HL) should match exact op
            if (/^\(.+\)$/.test(part) && part === op)
                continue;
            // Literal numeric patterns (e.g., 0-7 for BIT/RES/SET) match decimal operands
            // If pattern has a literal number and operand is also a literal number, they must match
            if (/^[0-9]+$/.test(part)) {
                if (/^[0-9]+$/.test(op) && part === op) {
                    continue; // Literal match (e.g., pattern "0" matches operand "0")
                }
                // Pattern is literal number but operand is not matching literal
                ok = false;
                break;
            }
            // indexed addressing patterns: (IX+ZZ), (IX-ZZ), (IY+ZZ), (IY-ZZ)
            // Match operand like (IX+#2F) against pattern part (IX+ZZ)
            var indexedPattern = /^\((IX|IY)([+-])ZZ\)$/;
            var indexedOperand = /^\((IX|IY)([+-])(#[0-9A-F]+|[0-9]+|[A-Z]\w*)\)$/;
            if (indexedPattern.test(part)) {
                var patternMatch = part.match(indexedPattern);
                var opMatch = op.match(indexedOperand);
                if (patternMatch && opMatch) {
                    // Validate that the index register and operator match
                    if (patternMatch[1].toUpperCase() === opMatch[1].toUpperCase() && patternMatch[2] === opMatch[2]) {
                        // For now, accept any offset format (will validate separately)
                        continue;
                    }
                }
            }
            ok = false;
            break;
        }
        if (!ok)
            continue;
        var wanted = parts[opIdx + 1];
        var wantedKind = placeholderKind(wanted);
        if (allowXX) {
            // Numeric values are valid for XX/XXXX/YY/ZZ slots.
            if (wantedKind !== null)
                return true;
        }
        else {
            // Labels are valid only for address-like slots.
            // XX is 8-bit immediate, so label references like XOR AB are invalid.
            if (wantedKind === 'XXXX' || wantedKind === 'YY' || wantedKind === 'ZZ')
                return true;
        }
        // Also accept if wanted is a literal number (like 0-7 for BIT/RES/SET)
        if (/^[0-9]+$/.test(wanted))
            return true;
    }
    return false;
}
function operandPositionAllowsLabel(mnemonic, operands, opIdx) {
    return operandPositionAllowsValue(mnemonic, operands, opIdx, false);
}
function operandPositionAllowsNumeric(mnemonic, operands, opIdx) {
    return operandPositionAllowsValue(mnemonic, operands, opIdx, true);
}
function extractLabelReferenceOperand(op) {
    var t = op.trim().toUpperCase();
    if (isLabelOperand(t))
        return t;
    // (LABEL)
    var indirect = /^\(([A-Z][A-Z0-9]*)\)$/.exec(t);
    if (indirect && isLabelOperand(indirect[1]))
        return indirect[1];
    // (IX+LABEL), (IX-LABEL), (IY+LABEL), (IY-LABEL)
    var indexed = /^\((IX|IY)[+-]([A-Z][A-Z0-9]*)\)$/.exec(t);
    if (indexed && isLabelOperand(indexed[2]))
        return indexed[2];
    return null;
}
/**
 * Validate a single CODE block
 */
function validateCodeBlock(lines, startLine, baseAddr, expectedStartAddress) {
    var _a, _b, _c, _d, _e;
    if (baseAddr === void 0) { baseAddr = 0x4000; }
    var errors = [];
    // `lines` here are expected to be the assembly lines for a single CODE block.
    // The wrapper `validateCodeBlocks` is responsible for finding blocks and
    // calling this function per-block. Do not re-run `detectCodeBlocks` here —
    // that caused nested recursion and premature termination when large blocks
    // contained tokens that looked like BASIC line starts.
    var labelDefs = new Map();
    var labelUsages = [];
    // Current address tracking
    var currentAddress = expectedStartAddress !== undefined ? expectedStartAddress : baseAddr;
    // ============================================
    // FIRST PASS: Collect labels and their addresses
    // ============================================
    for (var i = 0; i < lines.length; i++) {
        var parsed = parseZ80Line(lines[i], startLine + i);
        if (!parsed)
            continue;
        // Check for malformed address
        if (parsed.malformedAddress) {
            var addr = parsed.malformedAddress;
            errors.push({
                line: startLine + i,
                start: 0,
                end: ((_a = lines[i]) === null || _a === void 0 ? void 0 : _a.length) || 0,
                message: "Invalid hex address: \"".concat(addr, "\". Address must be exactly 4 hex digits [0-9A-F], no underscores allowed"),
                severity: 'error'
            });
            continue;
        }
        // Check for lowercase in address
        if (parsed.originalAddress) {
            var original = parsed.originalAddress;
            errors.push({
                line: startLine + i,
                start: 0,
                end: Math.max(0, lines[i].indexOf(original) + original.length),
                message: "Z80 address must be uppercase: \"".concat(original, "\" should be \"").concat(parsed.address, "\""),
                severity: 'error'
            });
        }
        // If parse flagged a missing address, report it and skip further processing
        if (parsed.missingAddress) {
            errors.push({
                line: startLine + i,
                start: 0,
                end: ((_b = lines[i]) === null || _b === void 0 ? void 0 : _b.length) || 0,
                message: 'Missing hex address in CODE line',
                severity: 'error'
            });
            continue;
        }
        // Check address sequence
        if (parsed.address) {
            var actualAddress = parseInt(parsed.address, 16);
            var expectedAddress = currentAddress;
            if (actualAddress !== expectedAddress) {
                var expectedHex = expectedAddress.toString(16).toUpperCase().padStart(4, '0');
                var actualHex = parsed.address.toUpperCase();
                errors.push({
                    line: startLine + i,
                    start: 0,
                    end: Math.max(0, lines[i].indexOf(parsed.address) + parsed.address.length),
                    message: "Address out of sequence: expected ".concat(expectedHex, ", found ").concat(actualHex, ", press CTRL (CMD) SHIFT r to renumber"),
                    severity: 'error'
                });
            }
        }
        // Use address from line if present
        if (parsed.address) {
            currentAddress = parseInt(parsed.address, 16);
        }
        // Record label definition
        if (parsed.label) {
            // Check if label was originally mixed-case
            if (parsed.originalLabel) {
                var original = parsed.originalLabel;
                errors.push({
                    line: startLine + i,
                    start: Math.max(0, lines[i].indexOf(original)),
                    end: Math.max(0, lines[i].indexOf(original) + original.length),
                    message: "Z80 label must be uppercase: \"".concat(original, "\" should be \"").concat(parsed.label, "\""),
                    severity: 'error'
                });
            }
            labelDefs.set(parsed.label, {
                name: parsed.label,
                lineNumber: startLine + i,
                address: currentAddress
            });
        }
        if (parsed.isDirective) {
            var directiveIssues = validateDirectiveOperands(parsed);
            for (var _i = 0, directiveIssues_1 = directiveIssues; _i < directiveIssues_1.length; _i++) {
                var issue = directiveIssues_1[_i];
                var token = issue.token || parsed.directiveValue || parsed.directiveType || '';
                var idx = token ? lines[i].toUpperCase().indexOf(token.toUpperCase()) : -1;
                var start = idx >= 0 ? idx : 0;
                var end = idx >= 0 ? idx + token.length : (((_c = lines[i]) === null || _c === void 0 ? void 0 : _c.length) || 0);
                errors.push({
                    line: startLine + i,
                    start: start,
                    end: end,
                    message: issue.message,
                    severity: 'error'
                });
            }
        }
        // Calculate next address based on instruction length
        if (parsed.mnemonic && !parsed.isDirective) {
            var instrLength = getInstructionLength(parsed.mnemonic, parsed.operands);
            currentAddress += instrLength;
        }
        else if (parsed.isDirective) {
            currentAddress += getDirectiveLength(parsed);
        }
    }
    // DEBUG: Show labels found
    /**     errors.push({
            line: startLine,
            start: 0,
            end: 50,
            message: `DEBUG LABELS: Found ${labelDefs.size} labels: ${Array.from(labelDefs.keys()).slice(0, 10).join(', ')}...`,
            severity: 'info'
        });
    */
    // ============================================
    // SECOND PASS: Validate instructions
    // ============================================
    currentAddress = baseAddr;
    for (var i = 0; i < lines.length; i++) {
        var parsed = parseZ80Line(lines[i], startLine + i);
        // DEBUG: Show specific problem lines (47=PUSH AFA, 59=LD A,DZ)
        /**         const docLine = startLine + i;
                if (docLine === 47 || docLine === 59 || docLine === 69 || docLine === 80) {
                    errors.push({
                        line: docLine,
                        start: 0,
                        end: lines[i]?.length || 50,
                        message: `DEBUG LINE ${docLine}: parsed=${parsed !== null}, mnemonic="${parsed?.mnemonic || 'null'}", operands=${JSON.stringify(parsed?.operands || [])}`,
                        severity: 'info'
                    });
                }
        */
        if (!parsed || !parsed.mnemonic || parsed.isDirective)
            continue;
        // Check for lowercase/mixed-case mnemonic
        if (parsed.originalMnemonic) {
            var original = parsed.originalMnemonic;
            errors.push({
                line: startLine + i,
                start: Math.max(0, lines[i].indexOf(original)),
                end: Math.max(0, lines[i].indexOf(original) + original.length),
                message: "Z80 mnemonic must be uppercase: \"".concat(original, "\" should be \"").concat(parsed.mnemonic, "\""),
                severity: 'error'
            });
            continue;
        }
        // Update current address
        if (parsed.address) {
            currentAddress = parseInt(parsed.address, 16);
        }
        var mnemonic = parsed.mnemonic.toUpperCase();
        var operands = parsed.operands || [];
        // Collect label references used by this instruction for later cross-checking.
        // Examples: LD A,(COL), JR LOOP, LD HL,COL
        for (var opIdx = 0; opIdx < operands.length; opIdx++) {
            var op = operands[opIdx];
            var labelRef = extractLabelReferenceOperand(op);
            if (!labelRef)
                continue;
            // Only count as a label reference where this operand position supports labels.
            if (!operandPositionAllowsLabel(mnemonic, operands, opIdx))
                continue;
            var isRelative = (mnemonic === 'JR' || mnemonic === 'DJNZ');
            labelUsages.push({
                name: labelRef,
                lineNumber: startLine + i,
                instructionAddress: currentAddress,
                isRelativeJump: isRelative
            });
        }
        // Build instruction string for matching
        var instruction = buildNormalizedInstruction(mnemonic, operands);
        // DEBUG: Show problem lines validation
        /**        if (docLine === 47 || docLine === 59 || docLine === 69 || docLine === 80) {
                    errors.push({
                        line: docLine,
                        start: 0,
                        end: lines[i]?.length || 50,
                        message: `DEBUG VALIDATE ${docLine}: instruction="${instruction}", exactMatch=${exactCmds.has(instruction)}`,
                        severity: 'info'
                    });
                }
        */
        // ============================================
        // STEP 3: Check exact match (no placeholders)
        // ============================================
        if (exactCmds.has(instruction)) {
            // Exact match - valid instruction
            currentAddress += getInstructionLength(mnemonic, operands);
            continue;
        }
        // ============================================
        // STEP 4: Check pattern match (with placeholders)
        // ============================================
        var patterns = patternCmds.get(mnemonic);
        // Early validation: if an operand looks like a label/number but the mnemonic
        // does not allow a value at that operand position (no pattern accepts XXXX/XX/YY/ZZ
        // for that slot), report an error immediately. This handles cases like
        // `PUSH AFA` where PUSH only accepts register pairs (AF/BC/DE/HL/IX/IY/etc).
        var earlyError = false;
        for (var opIdx = 0; opIdx < operands.length; opIdx++) {
            var op = operands[opIdx].trim();
            var upper = op.toUpperCase();
            // If operand is a hex/decimal or looks like a label, check if allowed
            if (isHexOperand(op) || isDecimalOperand(op) || isLabelOperand(upper)) {
                var isLabelLike = isLabelOperand(upper);
                // Labels cannot occupy XX slots; numeric values can.
                var patternAllows = isLabelLike
                    ? operandPositionAllowsLabel(mnemonic, operands, opIdx)
                    : operandPositionAllowsNumeric(mnemonic, operands, opIdx);
                // Build canonical operand signature for exact-forms lookup
                var operandSignature = operands.map(function (o) { return o.toUpperCase().trim(); }).join(',');
                var exactSet = exactOperandsMap.get(mnemonic);
                if (!patternAllows) {
                    if (exactSet) {
                        // If the exact set does not contain this exact operand signature, it's invalid
                        if (!exactSet.has(operandSignature)) {
                            errors.push({
                                line: startLine + i,
                                start: Math.max(0, lines[i].indexOf(op)),
                                end: Math.max(0, lines[i].indexOf(op)) + op.length,
                                message: "Invalid operand for ".concat(mnemonic, ": ").concat(op),
                                severity: 'error'
                            });
                            earlyError = true;
                        }
                    }
                    else {
                        // No pattern and no exact operand info -> invalid
                        errors.push({
                            line: startLine + i,
                            start: Math.max(0, lines[i].indexOf(op)),
                            end: Math.max(0, lines[i].indexOf(op)) + op.length,
                            message: "Invalid operand for ".concat(mnemonic, ": ").concat(op),
                            severity: 'error'
                        });
                        earlyError = true;
                    }
                }
            }
        }
        if (earlyError)
            continue;
        if (!patterns) {
            // No patterns for this mnemonic - check if mnemonic is valid at all
            var allMnemonics = new Set();
            for (var _f = 0, z80Cmds_2 = z80Cmds; _f < z80Cmds_2.length; _f++) {
                var cmd = z80Cmds_2[_f];
                allMnemonics.add(cmd.z80.split(/\s+/)[0].toUpperCase());
            }
            if (!allMnemonics.has(mnemonic)) {
                errors.push({
                    line: startLine + i,
                    start: 0,
                    end: lines[i].length,
                    message: "Unknown Z80 mnemonic: ".concat(mnemonic),
                    severity: 'error'
                });
            }
            else {
                errors.push({
                    line: startLine + i,
                    start: 0,
                    end: lines[i].length,
                    message: "Invalid operands for ".concat(mnemonic, ": ").concat(operands.join(',')),
                    severity: 'error'
                });
            }
            continue;
        }
        // Replace values with placeholders and try to match
        var withPlaceholders = replaceWithPlaceholders(mnemonic, operands);
        // DEBUG: Show pattern matching attempt
        /**         errors.push({
                    line: startLine + i,
                    start: 0,
                    end: lines[i].length,
                    message: `DEBUG: withPlaceholders="${withPlaceholders}" patterns=${JSON.stringify(patterns?.map(p => p.pattern))}`,
                    severity: 'info'
                });
        */
        var matched = false;
        var matchedPattern = null;
        for (var _g = 0, patterns_2 = patterns; _g < patterns_2.length; _g++) {
            var p = patterns_2[_g];
            if (p.pattern === withPlaceholders) {
                matched = true;
                matchedPattern = p;
                break;
            }
        }
        if (!matched) {
            // Try to provide helpful error message
            errors.push({
                line: startLine + i,
                start: 0,
                end: lines[i].length,
                message: "Invalid Z80 instruction: ".concat(instruction),
                severity: 'error'
            });
            continue;
        }
        // ============================================
        // STEP 4: Validate operand sizes match pattern
        // ============================================
        if (matchedPattern) {
            // Extract placeholders from matched pattern
            var patternParts = matchedPattern.pattern.split(/[\s,]+/).filter(Boolean);
            for (var opIdx = 0; opIdx < operands.length; opIdx++) {
                var op = operands[opIdx].trim();
                var placeholder = patternParts[opIdx + 1]; // +1 to skip mnemonic
                // Only validate numeric operands against their expected size
                if (placeholder && ['XX', 'YY', 'ZZ', 'XXXX'].includes(placeholder)) {
                    // Skip if operand is indexed addressing like (IX+#2F)
                    if (!/^\(.*\)$/.test(op)) {
                        var sizeError = validateOperandSize(op, placeholder);
                        if (sizeError) {
                            errors.push({
                                line: startLine + i,
                                start: lines[i].indexOf(op),
                                end: lines[i].indexOf(op) + op.length,
                                message: sizeError,
                                severity: 'error'
                            });
                        }
                    }
                    else {
                        // For indexed addressing like (IX+#2F), validate the offset part
                        var indexedMatch = /^\((IX|IY)([+-])(#[0-9A-F]+|[0-9]+|[A-Z]\w*)\)$/.exec(op.toUpperCase());
                        if (indexedMatch && placeholder === 'ZZ') {
                            var offsetOp = indexedMatch[3];
                            var sizeError = validateOperandSize(offsetOp, 'ZZ');
                            if (sizeError) {
                                errors.push({
                                    line: startLine + i,
                                    start: lines[i].indexOf(op),
                                    end: lines[i].indexOf(op) + op.length,
                                    message: sizeError,
                                    severity: 'error'
                                });
                            }
                        }
                    }
                }
            }
        }
        currentAddress += getInstructionLength(mnemonic, operands);
    }
    // ============================================
    // STEP 5: Cross-check label usages
    // ============================================
    for (var _h = 0, labelUsages_1 = labelUsages; _h < labelUsages_1.length; _h++) {
        var usage = labelUsages_1[_h];
        if (!labelDefs.has(usage.name)) {
            errors.push({
                line: usage.lineNumber,
                start: 0,
                end: ((_d = lines[usage.lineNumber - startLine]) === null || _d === void 0 ? void 0 : _d.length) || 0,
                message: "Label not defined in code block: ".concat(usage.name),
                severity: 'error'
            });
        }
    }
    // ============================================
    // STEP 6: Check relative jump ranges
    // ============================================
    for (var _j = 0, labelUsages_2 = labelUsages; _j < labelUsages_2.length; _j++) {
        var usage = labelUsages_2[_j];
        if (!usage.isRelativeJump)
            continue;
        var labelDef = labelDefs.get(usage.name);
        if (!labelDef)
            continue; // Already reported as not found
        // Calculate relative offset
        // JR/DJNZ are 2 bytes, offset is calculated from end of instruction
        var instrEndAddr = usage.instructionAddress + 2;
        var targetAddr = labelDef.address;
        var offset = targetAddr - instrEndAddr;
        // Valid range: -128 to +127
        if (offset < -128 || offset > 127) {
            errors.push({
                line: usage.lineNumber,
                start: 0,
                end: ((_e = lines[usage.lineNumber - startLine]) === null || _e === void 0 ? void 0 : _e.length) || 0,
                message: "Relative jump to ".concat(usage.name, " is out of range (offset: ").concat(offset, ", valid: -128 to +127)"),
                severity: 'error'
            });
        }
    }
    return errors;
}
/**
 * Get instruction length from z80Cmds table
 */
function getInstructionLength(mnemonic, operands) {
    var instruction = buildNormalizedInstruction(mnemonic, operands);
    // Try exact match first
    for (var _i = 0, z80Cmds_3 = z80Cmds; _i < z80Cmds_3.length; _i++) {
        var cmd = z80Cmds_3[_i];
        var cmdNorm = cmd.z80.toUpperCase().replace(/\s+/g, ' ').replace(/,\s*/g, ',').trim();
        if (cmdNorm === instruction) {
            return cmd.length;
        }
    }
    // Try with placeholders
    if (operands && operands.length > 0) {
        var withPlaceholders = replaceWithPlaceholders(mnemonic, operands);
        for (var _a = 0, z80Cmds_4 = z80Cmds; _a < z80Cmds_4.length; _a++) {
            var cmd = z80Cmds_4[_a];
            var cmdNorm = cmd.z80.toUpperCase().replace(/\s+/g, ' ').replace(/,\s*/g, ',').trim();
            if (cmdNorm === withPlaceholders) {
                return cmd.length;
            }
        }
    }
    // Default to 1 if not found
    return 1;
}
/**
 * Get directive length (DB, DW, DS)
 */
function getDirectiveLength(parsed) {
    if (!parsed.isDirective || !parsed.directiveValue)
        return 0;
    switch (parsed.directiveType) {
        case 'DB':
            // Count bytes: parse comma-separated values
            // Strings count characters, numbers count 1 each
            var totalBytes = 0;
            var values = splitDirectiveValues(parsed.directiveValue);
            // Count bytes for each value
            for (var _i = 0, values_3 = values; _i < values_3.length; _i++) {
                var val = values_3[_i];
                if (val.startsWith('"') && val.endsWith('"')) {
                    // String: count characters inside quotes
                    totalBytes += val.length - 2;
                }
                else {
                    // Number or hex: 1 byte
                    totalBytes += 1;
                }
            }
            return totalBytes || 1;
        case 'DW':
            return 2;
        case 'DS':
            return parseInt(parsed.directiveValue, 10) || 1;
        default:
            return 0;
    }
}
/**
 * Validate all CODE blocks in document
 */
function validateCodeBlocks(documentLines, baseAddr) {
    var _a;
    if (baseAddr === void 0) { baseAddr = 0x4000; }
    var allErrors = [];
    var codeBlocks = detectCodeBlocks(documentLines, baseAddr);
    var codeBlockByStart = new Map();
    for (var _i = 0, codeBlocks_1 = codeBlocks; _i < codeBlocks_1.length; _i++) {
        var b = codeBlocks_1[_i];
        codeBlockByStart.set(b.startLine, b);
    }
    // Pre-calculate the expected start address for each CODE block by walking
    // BASIC lines in source order and tokenising full CODE blocks (not placeholders).
    var expectedStartByCodeLine = new Map();
    try {
        var totalBytes = 0;
        for (var i = 0; i < documentLines.length; i++) {
            var line = documentLines[i] || '';
            if (!/^\d{1,5}\s/.test(line))
                continue;
            var isCodeLine = /^\d{1,5}\s+CODE\s*$/i.test(line.trim());
            if (!isCodeLine) {
                var lineBytes = (0, mtxtokens_js_1.basicTokeniseLine)(line, baseAddr + totalBytes);
                totalBytes += lineBytes.length;
                continue;
            }
            // Z80 opcode stream starts at byte offset 7 from the start of the CODE line.
            expectedStartByCodeLine.set(i, baseAddr + totalBytes + 7);
            var block = codeBlockByStart.get(i);
            var codeLines = [];
            if (block) {
                for (var k = block.startLine + 1; k <= block.endLine; k++) {
                    if (k < documentLines.length)
                        codeLines.push(documentLines[k]);
                }
            }
            var blockText = "".concat(line, "\n").concat(codeLines.join('\n'));
            var codeBytes = (0, mtxtokens_js_1.basicTokeniseLine)(blockText, baseAddr + totalBytes);
            totalBytes += codeBytes.length;
        }
    }
    catch (_b) {
        // Leave map sparse; block-level fallback below will use baseAddr.
    }
    for (var _c = 0, codeBlocks_2 = codeBlocks; _c < codeBlocks_2.length; _c++) {
        var block = codeBlocks_2[_c];
        var expectedStartAddress = (_a = expectedStartByCodeLine.get(block.startLine)) !== null && _a !== void 0 ? _a : baseAddr;
        // Collect assembly lines from the CODE block
        var assemblyLines = [];
        for (var i = block.startLine + 1; i <= block.endLine; i++) {
            if (i < documentLines.length) {
                assemblyLines.push(documentLines[i]);
            }
        }
        var blockErrors = validateCodeBlock(assemblyLines, block.startLine + 1, baseAddr, expectedStartAddress);
        allErrors.push.apply(allErrors, blockErrors);
    }
    return allErrors;
}
/**
 * Wrapper for single instruction validation
 */
function validateZ80Instruction(parsed, baseAddr) {
    if (baseAddr === void 0) { baseAddr = 0x4000; }
    return validateCodeBlock([parsed.raw], parsed.lineNumber, baseAddr);
}
/**
 * Stub functions for compatibility
 */
function collectLabels(lines, startLine, baseAddr) {
    if (baseAddr === void 0) { baseAddr = 0x4000; }
    var labels = new Map();
    var addr = baseAddr;
    for (var i = 0; i < lines.length; i++) {
        var parsed = parseZ80Line(lines[i], startLine + i);
        if (!parsed)
            continue;
        if (parsed.address) {
            addr = parseInt(parsed.address, 16);
        }
        if (parsed.label) {
            labels.set(parsed.label, {
                name: parsed.label,
                lineNumber: startLine + i,
                address: addr
            });
        }
    }
    return labels;
}
function normalizeInstruction(mnemonic, operands) {
    return replaceWithPlaceholders(mnemonic, operands || []);
}
function findZ80Command(normalizedInstruction) {
    for (var _i = 0, z80Cmds_5 = z80Cmds; _i < z80Cmds_5.length; _i++) {
        var cmd = z80Cmds_5[_i];
        if (cmd.z80.toUpperCase() === normalizedInstruction.toUpperCase()) {
            return cmd;
        }
    }
    return null;
}
function getZ80InstructionInfo(word) {
    var upperWord = word.toUpperCase();
    var matches = z80Cmds.filter(function (cmd) {
        return cmd.z80.toUpperCase().startsWith(upperWord + ' ') ||
            cmd.z80.toUpperCase() === upperWord;
    });
    if (matches.length === 0)
        return null;
    var doc = "**".concat(upperWord, "** - Z80 Instruction\n\n");
    doc += "| Opcode | Instruction | Bytes |\n";
    doc += "|--------|-------------|-------|\n";
    for (var _i = 0, _a = matches.slice(0, 15); _i < _a.length; _i++) {
        var match = _a[_i];
        doc += "| `".concat(match.opCode, "` | ").concat(match.z80, " | ").concat(match.length, " |\n");
    }
    if (matches.length > 15) {
        doc += "\n*...and ".concat(matches.length - 15, " more variants*");
    }
    return doc;
}
function validateZ80InstructionWithLabels(parsed, knownLabels) {
    return validateCodeBlock([parsed.raw], parsed.lineNumber);
}
