"use strict";
/** ASCII and MTX BASIC tokens
AFWilson
31-Oct-2022
v0.1

12-Dec-2025 converted to typescript and added hex values of the tokens.
*/
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mtxTokens = void 0;
exports.convertTextToHex = convertTextToHex;
exports.assembleCodeBlock = assembleCodeBlock;
exports.basicTokeniseLine = basicTokeniseLine;
exports.refineConvertTextToHex = refineConvertTextToHex;
exports.compressSpacesAndAscii = compressSpacesAndAscii;
exports.findBestZ80Match = findBestZ80Match;
exports.convertNoddyBlock = convertNoddyBlock;
exports.parseImmediateOperand = parseImmediateOperand;
exports.opCodePatternToBytes = opCodePatternToBytes;
exports.processMTXDirectives = processMTXDirectives;
exports.processCodeBlock = processCodeBlock;
exports.updateCodeBlockLength = updateCodeBlockLength;
exports.extractMTXDirectives = extractMTXDirectives;
exports.isAtWordBoundary = isAtWordBoundary;
var z80codes_js_1 = require("./z80codes.js");
//Not imported     Z80Error, Z80ParsedLine, CodeBlock, LabelInfo, splitOperands, detectCodeBlocks, collectLabels, findZ80Command,
//                 validateZ80Instruction, validateZ80InstructionWithLabels, validateCodeBlock, validateCodeBlocks,  getZ80InstructionInfo
//ascii (non-printable 0 to 31 and printable from 32 to 127) + MTX BASIC tokens (from 128 to 255)
var mtxTokens = [
    { tokenDec: 0, tokenHex: 0x00, token: "NUL" },
    { tokenDec: 1, tokenHex: 0x01, token: "SCH" },
    { tokenDec: 2, tokenHex: 0x02, token: "STX" },
    { tokenDec: 3, tokenHex: 0x03, token: "ETX" },
    { tokenDec: 4, tokenHex: 0x04, token: "EOT" },
    { tokenDec: 5, tokenHex: 0x05, token: "ENQ" },
    { tokenDec: 6, tokenHex: 0x06, token: "ACK" },
    { tokenDec: 7, tokenHex: 0x07, token: "BEL" },
    { tokenDec: 8, tokenHex: 0x08, token: "BS" },
    { tokenDec: 9, tokenHex: 0x09, token: "HT" },
    { tokenDec: 10, tokenHex: 0x0A, token: "LF" },
    { tokenDec: 11, tokenHex: 0x0B, token: "VT" },
    { tokenDec: 12, tokenHex: 0x0C, token: "FF" },
    { tokenDec: 13, tokenHex: 0x0D, token: "CR" },
    { tokenDec: 14, tokenHex: 0x0E, token: "SO" },
    { tokenDec: 15, tokenHex: 0x0F, token: "SI" },
    { tokenDec: 16, tokenHex: 0x10, token: "DLE" },
    { tokenDec: 17, tokenHex: 0x11, token: "DC1" },
    { tokenDec: 18, tokenHex: 0x12, token: "DC2" },
    { tokenDec: 19, tokenHex: 0x13, token: "DC3" },
    { tokenDec: 20, tokenHex: 0x14, token: "DC4" },
    { tokenDec: 21, tokenHex: 0x15, token: "NAK" },
    { tokenDec: 22, tokenHex: 0x16, token: "SYN" },
    { tokenDec: 23, tokenHex: 0x17, token: "ETB" },
    { tokenDec: 24, tokenHex: 0x18, token: "CAN" },
    { tokenDec: 25, tokenHex: 0x19, token: "EM" },
    { tokenDec: 26, tokenHex: 0x1A, token: "SUB" },
    { tokenDec: 27, tokenHex: 0x1B, token: "ESC" },
    { tokenDec: 28, tokenHex: 0x1C, token: "FS" },
    { tokenDec: 29, tokenHex: 0x1D, token: "GS" },
    { tokenDec: 30, tokenHex: 0x1E, token: "RS" },
    { tokenDec: 31, tokenHex: 0x1F, token: "US" },
    { tokenDec: 32, tokenHex: 0x20, token: " " },
    { tokenDec: 33, tokenHex: 0x21, token: "!" },
    { tokenDec: 34, tokenHex: 0x22, token: "“" },
    { tokenDec: 35, tokenHex: 0x23, token: "#" },
    { tokenDec: 36, tokenHex: 0x24, token: "$" },
    { tokenDec: 37, tokenHex: 0x25, token: "%" },
    { tokenDec: 38, tokenHex: 0x26, token: "&" },
    { tokenDec: 39, tokenHex: 0x27, token: "'" },
    { tokenDec: 40, tokenHex: 0x28, token: "(" },
    { tokenDec: 41, tokenHex: 0x29, token: ")" },
    { tokenDec: 42, tokenHex: 0x2A, token: "*" },
    { tokenDec: 43, tokenHex: 0x2B, token: "+" },
    { tokenDec: 44, tokenHex: 0x2C, token: "," },
    { tokenDec: 45, tokenHex: 0x2D, token: "-" },
    { tokenDec: 46, tokenHex: 0x2E, token: "." },
    { tokenDec: 47, tokenHex: 0x2F, token: "/" },
    { tokenDec: 48, tokenHex: 0x30, token: "0" },
    { tokenDec: 49, tokenHex: 0x31, token: "1" },
    { tokenDec: 50, tokenHex: 0x32, token: "2" },
    { tokenDec: 51, tokenHex: 0x33, token: "3" },
    { tokenDec: 52, tokenHex: 0x34, token: "4" },
    { tokenDec: 53, tokenHex: 0x35, token: "5" },
    { tokenDec: 54, tokenHex: 0x36, token: "6" },
    { tokenDec: 55, tokenHex: 0x37, token: "7" },
    { tokenDec: 56, tokenHex: 0x38, token: "8" },
    { tokenDec: 57, tokenHex: 0x39, token: "9" },
    { tokenDec: 58, tokenHex: 0x3A, token: ":" },
    { tokenDec: 59, tokenHex: 0x3B, token: ";" },
    { tokenDec: 60, tokenHex: 0x3C, token: "<" },
    { tokenDec: 61, tokenHex: 0x3D, token: "=" },
    { tokenDec: 62, tokenHex: 0x3E, token: ">" },
    { tokenDec: 63, tokenHex: 0x3F, token: "?" },
    { tokenDec: 64, tokenHex: 0x40, token: "@" },
    { tokenDec: 65, tokenHex: 0x41, token: "A" },
    { tokenDec: 66, tokenHex: 0x42, token: "B" },
    { tokenDec: 67, tokenHex: 0x43, token: "C" },
    { tokenDec: 68, tokenHex: 0x44, token: "D" },
    { tokenDec: 69, tokenHex: 0x45, token: "E" },
    { tokenDec: 70, tokenHex: 0x46, token: "F" },
    { tokenDec: 71, tokenHex: 0x47, token: "G" },
    { tokenDec: 72, tokenHex: 0x48, token: "H" },
    { tokenDec: 73, tokenHex: 0x49, token: "I" },
    { tokenDec: 74, tokenHex: 0x4A, token: "J" },
    { tokenDec: 75, tokenHex: 0x4B, token: "K" },
    { tokenDec: 76, tokenHex: 0x4C, token: "L" },
    { tokenDec: 77, tokenHex: 0x4D, token: "M" },
    { tokenDec: 78, tokenHex: 0x4E, token: "N" },
    { tokenDec: 79, tokenHex: 0x4F, token: "O" },
    { tokenDec: 80, tokenHex: 0x50, token: "P" },
    { tokenDec: 81, tokenHex: 0x51, token: "Q" },
    { tokenDec: 82, tokenHex: 0x52, token: "R" },
    { tokenDec: 83, tokenHex: 0x53, token: "S" },
    { tokenDec: 84, tokenHex: 0x54, token: "T" },
    { tokenDec: 85, tokenHex: 0x55, token: "U" },
    { tokenDec: 86, tokenHex: 0x56, token: "V" },
    { tokenDec: 87, tokenHex: 0x57, token: "W" },
    { tokenDec: 88, tokenHex: 0x58, token: "X" },
    { tokenDec: 89, tokenHex: 0x59, token: "Y" },
    { tokenDec: 90, tokenHex: 0x5A, token: "Z" },
    { tokenDec: 91, tokenHex: 0x5B, token: "[" },
    { tokenDec: 92, tokenHex: 0x5C, token: "/" },
    { tokenDec: 93, tokenHex: 0x5D, token: "]" },
    { tokenDec: 94, tokenHex: 0x5E, token: "^" },
    { tokenDec: 95, tokenHex: 0x5F, token: "_" },
    { tokenDec: 96, tokenHex: 0x60, token: "`" },
    { tokenDec: 97, tokenHex: 0x61, token: "a" },
    { tokenDec: 98, tokenHex: 0x62, token: "b" },
    { tokenDec: 99, tokenHex: 0x63, token: "c" },
    { tokenDec: 100, tokenHex: 0x64, token: "d" },
    { tokenDec: 101, tokenHex: 0x65, token: "e" },
    { tokenDec: 102, tokenHex: 0x66, token: "f" },
    { tokenDec: 103, tokenHex: 0x67, token: "g" },
    { tokenDec: 104, tokenHex: 0x68, token: "h" },
    { tokenDec: 105, tokenHex: 0x69, token: "i" },
    { tokenDec: 106, tokenHex: 0x6A, token: "j" },
    { tokenDec: 107, tokenHex: 0x6B, token: "k" },
    { tokenDec: 108, tokenHex: 0x6C, token: "l" },
    { tokenDec: 109, tokenHex: 0x6D, token: "m" },
    { tokenDec: 110, tokenHex: 0x6E, token: "n" },
    { tokenDec: 111, tokenHex: 0x6F, token: "o" },
    { tokenDec: 112, tokenHex: 0x70, token: "p" },
    { tokenDec: 113, tokenHex: 0x71, token: "q" },
    { tokenDec: 114, tokenHex: 0x72, token: "r" },
    { tokenDec: 115, tokenHex: 0x73, token: "s" },
    { tokenDec: 116, tokenHex: 0x74, token: "t" },
    { tokenDec: 117, tokenHex: 0x75, token: "u" },
    { tokenDec: 118, tokenHex: 0x76, token: "v" },
    { tokenDec: 119, tokenHex: 0x77, token: "w" },
    { tokenDec: 120, tokenHex: 0x78, token: "x" },
    { tokenDec: 121, tokenHex: 0x79, token: "y" },
    { tokenDec: 122, tokenHex: 0x7A, token: "z" },
    { tokenDec: 123, tokenHex: 0x7B, token: "{" },
    { tokenDec: 124, tokenHex: 0x7C, token: "|" },
    { tokenDec: 125, tokenHex: 0x7D, token: "}" },
    { tokenDec: 126, tokenHex: 0x7E, token: "~" },
    { tokenDec: 127, tokenHex: 0x7F, token: "DEL" },
    { tokenDec: 128, tokenHex: 0x80, token: "REM" },
    { tokenDec: 129, tokenHex: 0x81, token: "CLS" },
    { tokenDec: 130, tokenHex: 0x82, token: "ASSEM" },
    { tokenDec: 131, tokenHex: 0x83, token: "AUTO" },
    { tokenDec: 132, tokenHex: 0x84, token: "BAUD" },
    { tokenDec: 133, tokenHex: 0x85, token: "VS" },
    { tokenDec: 134, tokenHex: 0x86, token: "CONT" },
    { tokenDec: 135, tokenHex: 0x87, token: "USER" },
    { tokenDec: 136, tokenHex: 0x88, token: "CRVS" },
    { tokenDec: 137, tokenHex: 0x89, token: "CLEAR" },
    { tokenDec: 138, tokenHex: 0x8A, token: "CLOCK" },
    { tokenDec: 139, tokenHex: 0x8B, token: "ATTR" },
    { tokenDec: 140, tokenHex: 0x8C, token: "COLOUR" },
    { tokenDec: 141, tokenHex: 0x8D, token: "INK" },
    { tokenDec: 142, tokenHex: 0x8E, token: "CSR" },
    { tokenDec: 143, tokenHex: 0x8F, token: "DATA" },
    { tokenDec: 144, tokenHex: 0x90, token: "PRINT" },
    { tokenDec: 145, tokenHex: 0x91, token: "DIM" },
    { tokenDec: 146, tokenHex: 0x92, token: "ADJSPR" },
    { tokenDec: 147, tokenHex: 0x93, token: "EDIT" },
    { tokenDec: 148, tokenHex: 0x94, token: "NEXT" },
    { tokenDec: 149, tokenHex: 0x95, token: "FOR" },
    { tokenDec: 150, tokenHex: 0x96, token: "GOTO" },
    { tokenDec: 151, tokenHex: 0x97, token: "GOSUB" },
    { tokenDec: 152, tokenHex: 0x98, token: "INPUT" },
    { tokenDec: 153, tokenHex: 0x99, token: "IF" },
    { tokenDec: 154, tokenHex: 0x9A, token: "MVSPR" },
    { tokenDec: 155, tokenHex: 0x9B, token: "LIST" },
    { tokenDec: 156, tokenHex: 0x9C, token: "LET" },
    { tokenDec: 157, tokenHex: 0x9D, token: "LLIST" },
    { tokenDec: 158, tokenHex: 0x9E, token: "LOAD" },
    { tokenDec: 159, tokenHex: 0x9F, token: "LPRINT" },
    { tokenDec: 160, tokenHex: 0xA0, token: "SPRITE" },
    { tokenDec: 161, tokenHex: 0xA1, token: "CTLSPR" },
    { tokenDec: 162, tokenHex: 0xA2, token: "NODE" },
    { tokenDec: 163, tokenHex: 0xA3, token: "NEW" },
    { tokenDec: 164, tokenHex: 0xA4, token: "PAPER" },
    { tokenDec: 165, tokenHex: 0xA5, token: "NODDY" },
    { tokenDec: 166, tokenHex: 0xA6, token: "ON" },
    { tokenDec: 167, tokenHex: 0xA7, token: "OUT" },
    { tokenDec: 168, tokenHex: 0xA8, token: "PLOD" },
    { tokenDec: 169, tokenHex: 0xA9, token: "PANEL" },
    { tokenDec: 170, tokenHex: 0xAA, token: "GENPAT" },
    { tokenDec: 171, tokenHex: 0xAB, token: "PAUSE" },
    { tokenDec: 172, tokenHex: 0xAC, token: "PHI" },
    { tokenDec: 173, tokenHex: 0xAD, token: "POKE" },
    { tokenDec: 174, tokenHex: 0xAE, token: "RAND" },
    { tokenDec: 175, tokenHex: 0xAF, token: "RETURN" },
    { tokenDec: 176, tokenHex: 0xB0, token: "READ" },
    { tokenDec: 177, tokenHex: 0xB1, token: "VIEW" },
    { tokenDec: 178, tokenHex: 0xB2, token: "RESTORE" },
    { tokenDec: 179, tokenHex: 0xB3, token: "ROM" },
    { tokenDec: 180, tokenHex: 0xB4, token: "RUN" },
    { tokenDec: 181, tokenHex: 0xB5, token: "SAVE" },
    { tokenDec: 182, tokenHex: 0xB6, token: "SOUND" },
    { tokenDec: 183, tokenHex: 0xB7, token: "EDITOR" },
    { tokenDec: 184, tokenHex: 0xB8, token: "DSI" },
    { tokenDec: 185, tokenHex: 0xB9, token: "PLOT" },
    { tokenDec: 186, tokenHex: 0xBA, token: "STOP" },
    { tokenDec: 187, tokenHex: 0xBB, token: "ANGLE" },
    { tokenDec: 188, tokenHex: 0xBC, token: "SBUF" },
    { tokenDec: 189, tokenHex: 0xBD, token: "VERIFY" },
    { tokenDec: 190, tokenHex: 0xBE, token: "DRAW" },
    { tokenDec: 191, tokenHex: 0xBF, token: "ARC" },
    { tokenDec: 192, tokenHex: 0xC0, token: "CIRCLE" },
    { tokenDec: 193, tokenHex: 0xC1, token: "LINE" },
    { tokenDec: 194, tokenHex: 0xC2, token: "CODE" },
    { tokenDec: 195, tokenHex: 0xC3, token: "ELSE" },
    { tokenDec: 196, tokenHex: 0xC4, token: "FK" },
    { tokenDec: 197, tokenHex: 0xC5, token: "OFF" },
    { tokenDec: 198, tokenHex: 0xC6, token: "STEP" },
    { tokenDec: 199, tokenHex: 0xC7, token: "THEN" },
    { tokenDec: 200, tokenHex: 0xC8, token: "TO" },
    { tokenDec: 201, tokenHex: 0xC9, token: "I" },
    { tokenDec: 202, tokenHex: 0xCA, token: "J" },
    { tokenDec: 203, tokenHex: 0xCB, token: "K" },
    { tokenDec: 204, tokenHex: 0xCC, token: "L" },
    { tokenDec: 205, tokenHex: 0xCD, token: "M" },
    { tokenDec: 206, tokenHex: 0xCE, token: "N" },
    { tokenDec: 207, tokenHex: 0xCF, token: "+" },
    { tokenDec: 208, tokenHex: 0xD0, token: "-" },
    { tokenDec: 209, tokenHex: 0xD1, token: "*" },
    { tokenDec: 210, tokenHex: 0xD2, token: "/" },
    { tokenDec: 211, tokenHex: 0xD3, token: "^" },
    { tokenDec: 212, tokenHex: 0xD4, token: "=" },
    { tokenDec: 213, tokenHex: 0xD5, token: ">" },
    { tokenDec: 214, tokenHex: 0xD6, token: "<" },
    { tokenDec: 215, tokenHex: 0xD7, token: ">=" },
    { tokenDec: 216, tokenHex: 0xD8, token: "<=" },
    { tokenDec: 217, tokenHex: 0xD9, token: "<>" },
    { tokenDec: 218, tokenHex: 0xDA, token: "AND" },
    { tokenDec: 219, tokenHex: 0xDB, token: "OR" },
    { tokenDec: 220, tokenHex: 0xDC, token: "NOT" },
    { tokenDec: 221, tokenHex: 0xDD, token: "ABS" },
    { tokenDec: 222, tokenHex: 0xDE, token: "ATN" },
    { tokenDec: 223, tokenHex: 0xDF, token: "COS" },
    { tokenDec: 224, tokenHex: 0xE0, token: "EXP" },
    { tokenDec: 225, tokenHex: 0xE1, token: "FRE" },
    { tokenDec: 226, tokenHex: 0xE2, token: "INT" },
    { tokenDec: 227, tokenHex: 0xE3, token: "INT" },
    { tokenDec: 228, tokenHex: 0xE4, token: "LN" },
    { tokenDec: 229, tokenHex: 0xE5, token: "PEEK" },
    { tokenDec: 230, tokenHex: 0xE6, token: "SGN" },
    { tokenDec: 231, tokenHex: 0xE7, token: "SIN" },
    { tokenDec: 232, tokenHex: 0xE8, token: "SQR" },
    { tokenDec: 233, tokenHex: 0xE9, token: "TAN" },
    { tokenDec: 234, tokenHex: 0xEA, token: "INP" },
    { tokenDec: 235, tokenHex: 0xEB, token: "USR" },
    { tokenDec: 236, tokenHex: 0xEC, token: "LN" },
    { tokenDec: 237, tokenHex: 0xED, token: "ASC" },
    { tokenDec: 238, tokenHex: 0xEE, token: "LEN" },
    { tokenDec: 239, tokenHex: 0xEF, token: "VAL" },
    { tokenDec: 240, tokenHex: 0xF0, token: "LN" },
    { tokenDec: 241, tokenHex: 0xF1, token: "MOD" },
    { tokenDec: 242, tokenHex: 0xF2, token: "PI" },
    { tokenDec: 243, tokenHex: 0xF3, token: "RND" },
    { tokenDec: 244, tokenHex: 0xF4, token: "PI" },
    { tokenDec: 245, tokenHex: 0xF5, token: "CHR$" },
    { tokenDec: 246, tokenHex: 0xF6, token: "SPK$" },
    { tokenDec: 247, tokenHex: 0xF7, token: "INKEY$" },
    { tokenDec: 248, tokenHex: 0xF8, token: "LEFT$" },
    { tokenDec: 249, tokenHex: 0xF9, token: "MID$" },
    { tokenDec: 250, tokenHex: 0xFA, token: "RIGHT$" },
    { tokenDec: 251, tokenHex: 0xFB, token: "GR$" },
    { tokenDec: 252, tokenHex: 0xFC, token: "STR$" },
    { tokenDec: 253, tokenHex: 0xFD, token: "TIME$" },
    { tokenDec: 254, tokenHex: 0xFE, token: "*" },
    { tokenDec: 255, tokenHex: 0xFF, token: "EOL" }
];
exports.mtxTokens = mtxTokens;
function createRefBuckets() {
    return { byteOffsets: [], wordOffsets: [], relativeOffsets: [] };
}
function ensureRefBuckets(map, key) {
    var k = key.toUpperCase();
    var b = map.get(k);
    if (!b) {
        b = createRefBuckets();
        map.set(k, b);
    }
    return b;
}
function addRefOffset(map, key, kind, offset) {
    var buckets = ensureRefBuckets(map, key);
    if (kind === 'byte')
        buckets.byteOffsets.push(offset);
    else if (kind === 'word')
        buckets.wordOffsets.push(offset);
    else
        buckets.relativeOffsets.push(offset);
}
// --- token helpers (keep existing mtxTokens above) ---
// tokens sorted by length (longest-first) + uppercase cache
var tokensSorted = mtxTokens
    .map(function (t) { return ({ token: t.token, tokenUpper: t.token.toUpperCase(), dec: t.tokenDec }); })
    .sort(function (a, b) { return b.token.length - a.token.length; });
var maxTokenLen = tokensSorted.length ? Math.max.apply(Math, tokensSorted.map(function (t) { return t.token.length; })) : 0;
var stringKeywordTokens = new Set(tokensSorted.filter(function (t) { return t.tokenUpper.endsWith('$'); }).map(function (t) { return t.tokenUpper; }));
// Helper: check if position is at a word boundary
function isAtWordBoundary(text, pos, len) {
    // MTX BASIC identifiers: [A-Z][A-Z0-9]*\$?
    // Before: must not be a letter or $ 
    // (digits and spaces are OK: "1TO" or " TO" means TO is separate. Likewise for Numbers before THEN and ELSE)
    var before = pos === 0 || !/[A-Z$]/.test(text[pos - 1]);
    // After: must not be alphanumeric or $
    var after = pos + len >= text.length || !/[A-Z0-9$]/.test(text[pos + len]);
    return before && after;
}
// compress runs of spaces into 0x80 + runLength and otherwise emit ASCII bytes
function compressSpacesAndAscii(str) {
    var bytes = [];
    var i = 0;
    while (i < str.length) {
        if (str[i] === ' ') {
            var j = i;
            while (j < str.length && str[j] === ' ')
                j++;
            var run = j - i;
            while (run > 0) {
                var chunk = Math.min(run, 127);
                bytes.push(0x80 + chunk);
                run -= chunk;
            }
            i = j;
        }
        else {
            bytes.push(str.charCodeAt(i));
            i++;
        }
    }
    return bytes;
}
// 1) BASIC tokenisation (returns code bytes including EOL 0xFF)
// - token matching: case-sensitive, longest-first
// - outside quotes and outside REM, letters are uppercased
// - inside quotes case unchanged 
// - spaces remain as 0x20 (not compressed or would result in spurious BASIC tokens)
/**
 Within basicTokeniseLine function there will be 3 sub-sections
i) when REM NODDY is encountered --> CALL function convertNoddyBlock
ii) when CODE is encountered - setup the 3 length trackers (see 1-3 below) and CALL function processCodeBlock (see text below for a fuller explanation of this )
iii) BASIC line conversion (this part of the function appears to be functioning properly, so no additional changes required at this time)

when const line='10 CODE', basicTokeniseLine CORRECTLY returns [ 6, 0, 10, 0, 194, 255 ]. However, CODE is a special case because it is the placeholder for a code block.
So whenever <linenumber> CODE is encountered, for example 100 CODE, it shoud return [ 8, 0, 100, 0, 194, 0 , 0, 255 ] in the first instance until the code block is processed.
a) the 2 extra bytes after 194 are placeholders for the actual assembly code which will be updated during the code block processing.
b) Also, the 1st 2 bytes are also placeholders as these will be updated with the assembly code bytes and any MTX directive bytes.
c) The assembly code and mtx directive bytes will be inserted before the 255 end of line/block marker.
So in the context of the basicTokeniseLine, make the changes so that it is 7 bytes in length The extra + 1 for the EOL marker is added at the end of the code block
create 3 length trackers

totalCodeLength (bytes 1 and 2 in LSB/MSB format) = 7 + totalOpcodeLength + totalMtxDirectiverLength
totalOpcodeLength (bytes 6 and 7)
totalMtxDirectiverLength
add +1 for EOL
Note: ensure the EOL marker (0xFF) is not duplicated at the end of the mtx directive processing.
*/
function basicTokeniseLine(line, baseAddr) {
    var _a, _b;
    if (baseAddr === void 0) { baseAddr = 0x4000; }
    // detect and strip leading line number (capture rest including newlines)
    var lnMatch = /^\s*(\d+)\s*([\s\S]*)$/.exec(line);
    var hasLineNumber = false;
    var lineNumber = 0;
    if (lnMatch) {
        hasLineNumber = true;
        lineNumber = parseInt(lnMatch[1], 10) || 0;
        line = lnMatch[2] || '';
    }
    var restFull = line.replace(/\r?\n$/, '');
    var restTrim = restFull.trim();
    var wrapWithLineHeader = function (payloadBytes) {
        var totalLength = 2 + 2 + payloadBytes.length;
        return __spreadArray([
            totalLength & 0xff, (totalLength >> 8) & 0xff,
            lineNumber & 0xff, (lineNumber >> 8) & 0xff
        ], payloadBytes, true);
    };
    // CODE handling: accept CODE line followed by assembly lines (process only mnemonic part)
    if (/^\s*CODE(?:\b|$)/.test(restTrim)) {
        var codeTok = (_b = (_a = tokensSorted.find(function (t) { return t.tokenUpper === 'CODE'; })) === null || _a === void 0 ? void 0 : _a.dec) !== null && _b !== void 0 ? _b : 0xC2;
        // split the rest into physical lines and find the line that contains CODE
        var linesArr = restFull.split(/\r?\n/);
        var codeLineIndex = -1;
        for (var idx = 0; idx < linesArr.length; idx++) {
            if (/^\s*CODE(?:\b|$)/.test(linesArr[idx])) {
                codeLineIndex = idx;
                break;
            }
        }
        if (codeLineIndex < 0)
            codeLineIndex = 0;
        // get lines after the CODE line, stopping at either:
        // 1. a new BASIC line (no leading whitespace, starts with digits)
        // 2. a line without a hex address (leading whitespace but no hex address)
        var rawCodeLines = [];
        for (var idx = codeLineIndex + 1; idx < linesArr.length; idx++) {
            var l = linesArr[idx];
            // Stop if this is a new BASIC line (starts with digits, no leading whitespace)
            if (/^\d+\s/.test(l))
                break;
            // Stop if line has leading whitespace but no hex address following it
            if (/^\s+/.test(l) && !/^\s+[0-9A-F]{1,4}\b/.test(l))
                break;
            // This is a code block line, add it
            rawCodeLines.push(l);
        }
        // Process code lines: preserve hex addresses and handle comments
        // If a trailing ';' comment exists, preserve it as a separate comment-only
        // UPDATE: We do NOT split comments here anymore. We pass the full line to processCodeBlock
        // which handles inline comments correctly by preserving the same offset.
        // Alternative simpler approach: just filter out empty lines
        var codeLines = rawCodeLines.filter(function (l) { return l.trim().length > 0; });
        if (codeLines.length === 0) {
            var payloadPlaceholder = [codeTok, 0x00, 0x00, 0xFF];
            if (hasLineNumber)
                return wrapWithLineHeader(payloadPlaceholder);
            return payloadPlaceholder;
        }
        var codeBlockStr = codeLines.join('\n');
        var codeBlockResult = processCodeBlock(codeBlockStr, baseAddr);
        // Build final payload with separated opcode and directive bytes
        var payload = __spreadArray(__spreadArray(__spreadArray([
            codeTok,
            codeBlockResult.totalOpcodeLength & 0xff,
            (codeBlockResult.totalOpcodeLength >> 8) & 0xff
        ], codeBlockResult.opcodeBytes, true), codeBlockResult.mtxDirectiveBytes, true), [
            0xFF
        ], false);
        // Update total line length to include: line-header(2) + line-number(2) + payload
        // payload = token(1) + opcode-length(2) + opcodes + directives + EOL(1)
        var totalLineLength = 2 + 2 + payload.length; // 2(length bytes) + 2(line number) + payload
        var finalPayload = __spreadArray([
            totalLineLength & 0xff,
            (totalLineLength >> 8) & 0xff,
            lineNumber & 0xff,
            (lineNumber >> 8) & 0xff
        ], payload, true);
        if (hasLineNumber)
            return finalPayload;
        return payload;
    }
    // Standard BASIC tokenisation (remove spaces after ':' and before TO/THEN outside quotes)
    var stripSpacesAfterColonOutsideQuotes = function (input) {
        var out = '';
        var inQ = false;
        var inRem = false;
        var isIdentChar = function (c) { return /[A-Z0-9\$]/.test(c); };
        for (var idx = 0; idx < input.length; idx++) {
            var ch = input[idx];
            if (ch === '"') {
                inQ = !inQ;
                out += ch;
                continue;
            }
            // If we're in REM text, preserve everything until a ':' outside quotes
            if (!inQ && inRem) {
                if (ch === ':') {
                    inRem = false;
                    out += ch;
                    // strip spaces immediately after ':' (normal behavior resumes)
                    var j = idx + 1;
                    while (j < input.length && input[j] === ' ')
                        j++;
                    idx = j - 1;
                    continue;
                }
                out += ch;
                continue;
            }
            // Detect REM token outside quotes (word boundary)
            if (!inQ && !inRem) {
                if ((ch === 'R' || ch === 'r') && input.substring(idx, idx + 3).toUpperCase() === 'REM') {
                    var prev = idx > 0 ? input[idx - 1] : '';
                    var next = idx + 3 < input.length ? input[idx + 3] : '';
                    if (!isIdentChar(prev) && !isIdentChar(next)) {
                        out += input.substr(idx, 3);
                        idx += 2;
                        inRem = true;
                        continue;
                    }
                }
            }
            if (!inQ && ch === ':') {
                out += ch;
                var j = idx + 1;
                while (j < input.length && input[j] === ' ')
                    j++;
                idx = j - 1;
                continue;
            }
            /** removed causing a conflict with identifiers like TOBY, THENNAH, etc
                  if (!inQ && ch === ' ') {
                    let j = idx;
                    while (j < input.length && input[j] === ' ') j++;
                    const rest = input.substring(j).toUpperCase();
                    const isTo = rest.startsWith('TO') && !/^[A-Z0-9\$]/.test(rest.substring(2, 3));
                    const isThen = rest.startsWith('THEN') && !/^[A-Z0-9\$]/.test(rest.substring(4, 5));
                    if (isTo || isThen) {
                      idx = j - 1; // skip spaces before TO/THEN
                      continue;
                    }
                  }
            */
            out += ch;
        }
        return out;
    };
    var restStandard = stripSpacesAfterColonOutsideQuotes(restFull);
    var bytes = [];
    var i = 0;
    var inQuote = false;
    var L = restStandard.length;
    var opTokenMap = {
        '>=': 0xD7,
        '<=': 0xD8,
        '<>': 0xD9,
        '+': 0xCF,
        '-': 0xD0,
        '*': 0xD1,
        '/': 0xD2,
        '^': 0xD3,
        '=': 0xD4,
        '>': 0xD5,
        '<': 0xD6
    };
    var tryEmitOperatorToken = function (s, idx) {
        var two = s.substring(idx, idx + 2);
        if (opTokenMap[two] !== undefined) {
            bytes.push(opTokenMap[two]);
            return 2;
        }
        var one = s[idx];
        if (opTokenMap[one] !== undefined) {
            bytes.push(opTokenMap[one]);
            return 1;
        }
        return 0;
    };
    var tryEmitStringVar = function (s, idx) {
        // String variable name encoding: debase first letter by 0x40 (A->0x01..Z->0x1A)
        // Applies to identifiers ending with $ (e.g., A$, A1$, ABZ$), excluding keyword tokens like INKEY$, CHR$
        // Ensure previous/next char are not A-Z0-9$ to avoid mid-identifier matches
        var prevCh = idx > 0 ? s[idx - 1] : '';
        if (/[A-Z0-9\$]/.test(prevCh))
            return 0;
        if (!/[A-Z]/.test(s[idx]))
            return 0;
        var j = idx + 1;
        while (j < L && /[A-Z0-9]/.test(s[j]))
            j++;
        if (j >= L || s[j] !== '$')
            return 0;
        var end = j + 1;
        var nextCh = end < L ? s[end] : '';
        if (/[A-Z0-9\$]/.test(nextCh))
            return 0;
        var ident = s.substring(idx, end).toUpperCase();
        if (stringKeywordTokens.has(ident))
            return 0;
        var firstUpper = s[idx].toUpperCase();
        bytes.push(firstUpper.charCodeAt(0) - 0x40);
        for (var k = idx + 1; k < end; k++) {
            var c = s.charCodeAt(k);
            if (c >= 97 && c <= 122)
                bytes.push(c - 32);
            else
                bytes.push(c);
        }
        return end - idx;
    };
    while (i < L) {
        if (inQuote) {
            var j = i;
            while (j < L && restStandard[j] !== '"')
                j++;
            var chunk = restStandard.substring(i, j);
            // Inside quotes: emit raw ASCII (do NOT compress spaces)
            for (var k = 0; k < chunk.length; k++) {
                bytes.push(chunk.charCodeAt(k));
            }
            if (j < L && restStandard[j] === '"') {
                bytes.push(0x22);
                inQuote = false;
                i = j + 1;
            }
            else {
                i = j;
            }
            continue;
        }
        // NEW: drop spaces outside quotes and outside REM
        // The extra 0x20 bytes come from the tokenizer preserving spaces outside quotes/REM. In basicTokeniseLine, only spaces after : 
        // and before TO/THEN are stripped; all other spaces are emitted as ASCII, so any space around AND/OR/NOT/ELSE becomes 0x20.
        // Optional hardening: require word boundaries when matching keyword tokens (e.g., AND/OR/NOT/ELSE) to avoid accidental matches 
        // inside identifiers, then still drop spaces outside quotes so they don’t leak into output - ON HOLD.
        if (restStandard[i] === ' ') {
            i++;
            continue;
        }
        // String variables must be handled before token matching, otherwise single-letter
        // ASCII tokens like 'A' consume the prefix and block debasing.
        var svConsumed = tryEmitStringVar(restStandard, i);
        if (svConsumed > 0) {
            i += svConsumed;
            continue;
        }
        var matched = false;
        // Operator tokens (use tokenised operators instead of ASCII)
        var opConsumed = tryEmitOperatorToken(restStandard, i);
        if (opConsumed > 0) {
            i += opConsumed;
            continue;
        }
        var remaining = L - i;
        for (var _i = 0, tokensSorted_1 = tokensSorted; _i < tokensSorted_1.length; _i++) {
            var tk = tokensSorted_1[_i];
            var tlen = tk.token.length;
            if (tlen > remaining)
                continue;
            var substr = restStandard.substring(i, i + tlen);
            if (substr === tk.token || substr.toUpperCase() === tk.tokenUpper) {
                // ADD WORD BOUNDARY CHECK HERE:
                if (!isAtWordBoundary(restStandard, i, tlen))
                    continue;
                bytes.push(tk.dec);
                i += tlen;
                matched = true;
                if (tk.tokenUpper === 'REM') {
                    if (i < L) {
                        var j = i;
                        var inRemQuote = false;
                        // Treat REM text like quoted until ':' outside quotes or end-of-line
                        while (j < L) {
                            var ch_1 = restStandard[j];
                            if (ch_1 === '"') {
                                inRemQuote = !inRemQuote;
                                bytes.push(0x22);
                                j++;
                                continue;
                            }
                            if (!inRemQuote && ch_1 === ':') {
                                // Stop REM at ':' and resume normal tokenization
                                break;
                            }
                            bytes.push(restStandard.charCodeAt(j));
                            j++;
                        }
                        i = j; // either ':' or end-of-line
                        if (i >= L) {
                            // consume rest of line
                            // leave i at L, main loop will terminate
                        }
                    }
                }
                else if (tk.tokenUpper === 'DATA') {
                    // DATA requires a mandatory space byte after the token
                    bytes.push(0x20);
                    if (i < L && restStandard[i] === ' ')
                        i++; // consume explicit space if present
                }
                else {
                    if (i < L && restStandard[i] === ' ') {
                        if (/^[A-Z]+\$?$/.test(tk.tokenUpper))
                            i++;
                    }
                }
                break;
            }
        }
        if (matched)
            continue;
        var ch = restStandard[i];
        if (ch === '"') {
            bytes.push(0x22);
            inQuote = true;
            i++;
            continue;
        }
        var code = restStandard.charCodeAt(i);
        if (code >= 97 && code <= 122)
            bytes.push(code - 32);
        else
            bytes.push(code);
        i++;
    }
    bytes.push(0xFF);
    if (hasLineNumber)
        return wrapWithLineHeader(bytes);
    return bytes;
}
function splitDirectiveList(raw) {
    var parts = [];
    var buf = '';
    var inQuote = false;
    for (var i = 0; i < raw.length; i++) {
        var ch = raw[i];
        if (ch === '"') {
            inQuote = !inQuote;
            buf += ch;
            continue;
        }
        if (ch === ',' && !inQuote) {
            var t = buf.trim();
            if (t)
                parts.push(t);
            buf = '';
            continue;
        }
        buf += ch;
    }
    var tail = buf.trim();
    if (tail)
        parts.push(tail);
    return parts;
}
// Build DB directive payload: item count, ascii bytes with last char of each item having bit 7 set
function buildDbDirectivePayload(raw) {
    var items = splitDirectiveList(raw);
    var ascii = [];
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var tok = items_1[_i];
        var chars = [];
        for (var _a = 0, tok_1 = tok; _a < tok_1.length; _a++) {
            var ch = tok_1[_a];
            chars.push(ch.charCodeAt(0));
        }
        if (chars.length > 0)
            chars[chars.length - 1] |= 0x80; // mark end of item
        ascii.push.apply(// mark end of item
        ascii, chars);
    }
    return { itemCount: items.length, ascii: ascii };
}
function parseDbValues(raw) {
    var out = [];
    for (var _i = 0, _a = splitDirectiveList(raw); _i < _a.length; _i++) {
        var tok = _a[_i];
        if (/^".*"$/.test(tok)) {
            var s = tok.slice(1, -1);
            for (var _b = 0, s_1 = s; _b < s_1.length; _b++) {
                var ch = s_1[_b];
                out.push(ch.charCodeAt(0));
            }
        }
        else {
            out.push(parseImmediateOperand(tok) & 0xff);
        }
    }
    return out;
}
function parseDwValues(raw) {
    var out = [];
    for (var _i = 0, _a = splitDirectiveList(raw); _i < _a.length; _i++) {
        var tok = _a[_i];
        var v = parseImmediateOperand(tok);
        out.push(v & 0xff, (v >> 8) & 0xff);
    }
    return out;
}
/**
 * 2) CODE-block assembly conversion to opcode bytes (improved)
 * - Uses parseZ80Line and z80 command table to generate real opcode bytes.
 * - Supports DB/DW/DS directives, comments starting with ';', and common immediate formats.
 */
// =================== PHASE 1: PARSE & DISCOVER ===================
function parseCodeBlockPhase1(codeBlock, baseAddr) {
    if (baseAddr === void 0) { baseAddr = 0x4000; }
    var parsedLines = [];
    var labelMap = {};
    var labelReferences = new Map();
    var numberReferences = new Map();
    var directiveLines = [];
    var commentLines = [];
    var lines = codeBlock.split(/\r?\n/).map(function (l) { return l.replace(/\t/g, ' ').replace(/\r?\n$/, ''); });
    var offset = 0;
    var firstLine = true;
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var rawLine = lines_1[_i];
        var raw = (rawLine || '').trim();
        if (!raw)
            continue;
        // [Step 1]: Extract comment text immediately but process it last.
        // This ensures we parse the instruction first to get the correct offset.
        var commentPart = null;
        var semiIdx = raw.indexOf(';');
        if (semiIdx >= 0) {
            commentPart = raw.substring(semiIdx);
            raw = raw.substring(0, semiIdx).trim(); // Remove comment from raw for parsing
        }
        // [Step 2]: If line was ONLY a comment, record it immediately
        if (!raw && commentPart) {
            commentLines.push({ raw: commentPart, offset: offset, _absoluteAddress: baseAddr + offset });
            parsedLines.push({ raw: commentPart, isComment: true });
            continue;
        }
        // [Step 3]: Logic to reconstruct the 'parsed' object
        // Initialize parsed object
        var parsed = {
            raw: rawLine, // Store full original line
            _offset: offset,
            address: undefined,
            label: undefined,
            isDirective: false,
            directiveType: undefined,
            directiveValue: undefined,
            mnemonic: undefined,
            operands: undefined,
            isComment: false,
            isUnparsed: false
        };
        var workingStr = raw;
        // A. Parse Explicit Address (e.g., 8000 LD A,B)
        var addrMatch = /^(?:([0-9A-F]{4})\s+)?(.*)$/.exec(workingStr);
        if (addrMatch && addrMatch[1]) {
            parsed.address = parseInt(addrMatch[1], 16);
            // Only update offset from explicit address on the very first line
            // to avoid jumping around in the middle of blocks unnecessarily
            if (firstLine) {
                offset = parsed.address - baseAddr;
                parsed._offset = offset;
            }
            workingStr = addrMatch[2].trim();
        }
        // B. Parse Label (e.g., LABEL:)
        var labelMatch = /^([A-Z][A-Z0-9]*):\s*(.*)$/.exec(workingStr);
        if (labelMatch) {
            parsed.label = labelMatch[1];
            labelMap[parsed.label] = baseAddr + offset; // Map label to absolute code address
            workingStr = labelMatch[2].trim();
        }
        // C. Parse Directive or Instruction
        if (!workingStr) {
            // Line was just a label or address
            parsedLines.push(parsed);
        }
        else {
            var dirMatch = /^(DB|DW|DS)\s+(.*)$/.exec(workingStr);
            if (dirMatch) {
                parsed.isDirective = true;
                parsed.directiveType = dirMatch[1].toUpperCase();
                parsed.directiveValue = dirMatch[2].trim();
                // Store directive for later processing in Phase 3
                directiveLines.push({
                    directiveType: parsed.directiveType,
                    directiveValue: parsed.directiveValue,
                    _offset: offset
                });
            }
            else {
                // Assume Mnemonic
                var spaceIdx = workingStr.indexOf(' ');
                if (spaceIdx > 0) {
                    parsed.mnemonic = workingStr.substring(0, spaceIdx).trim().toUpperCase();
                    parsed.operands = splitDirectiveList(workingStr.substring(spaceIdx).trim());
                }
                else {
                    parsed.mnemonic = workingStr.toUpperCase();
                    parsed.operands = [];
                }
            }
            parsedLines.push(parsed);
        }
        // [Step 4]: Calculate Instruction Length to advance offset
        var instrLen = 0;
        if (parsed.isDirective) {
            if (parsed.directiveType === 'DB')
                instrLen = parseDbValues(parsed.directiveValue || '').length;
            else if (parsed.directiveType === 'DW')
                instrLen = parseDwValues(parsed.directiveValue || '').length;
            else if (parsed.directiveType === 'DS')
                instrLen = parseInt(parsed.directiveValue || '0', 10) || 0;
        }
        else if (parsed.mnemonic) {
            var instr = parsed.mnemonic;
            var ops = parsed.operands || [];
            var best = findBestZ80Match(instr, ops);
            instrLen = best ? best.length : 1;
        }
        // [Step 5]: Now that instruction len is calculated, record the inline comment.
        // The previous bug was here: comments were split into new lines, so they got offset 
        // AFTER the instruction. Now we attach them to the current instruction's start 
        // but the original logic wanted them to be "emitted" at this point.
        // Actually, for documentation/display, comments usually associate with the instruction offset.
        if (commentPart) {
            commentLines.push({ raw: commentPart, offset: offset, _absoluteAddress: baseAddr + offset });
        }
        // Increment offset for the next line
        offset += instrLen;
        firstLine = false;
    }
    return { parsedLines: parsedLines, labelMap: labelMap, labelReferences: labelReferences, numberReferences: numberReferences, directiveLines: directiveLines, commentLines: commentLines };
}
// =================== PHASE 2: GENERATE OPCODES ===================
function parseCodeBlockPhase2(parsedLines, labelMap, labelReferences, numberReferences, baseAddr, offsetBase) {
    var opcodeBytes = [];
    var cumulativeOffset = 0;
    var _loop_1 = function (p) {
        if (p.isComment || p.isUnparsed) {
            return "continue";
        }
        var baseOffset = typeof p._offset === 'number' ? p._offset : cumulativeOffset;
        var baseOffsetAbs = baseAddr + baseOffset;
        // Handle directives in opcode section (DB, DW, DS)
        if (p.isDirective) {
            if (p.directiveType === 'DB') {
                var bytesToAdd = parseDbValues(p.directiveValue || '');
                opcodeBytes.push.apply(opcodeBytes, bytesToAdd);
                cumulativeOffset = baseOffset + bytesToAdd.length;
            }
            else if (p.directiveType === 'DW') {
                var bytesToAdd = parseDwValues(p.directiveValue || '');
                opcodeBytes.push.apply(opcodeBytes, bytesToAdd);
                cumulativeOffset = baseOffset + bytesToAdd.length;
            }
            else if (p.directiveType === 'DS') {
                // DS directive: reserve N bytes using 0xC9 (RET) as placeholder
                // DS 1 -> 0xC9
                // DS 2 -> 0xC9 0x00
                // DS 3 -> 0xC9 0x00 0x00
                var count = parseInt(p.directiveValue || '0', 10) || 0;
                if (count > 0) {
                    opcodeBytes.push(0xC9); // RET opcode as placeholder
                    for (var i = 1; i < count; i++) {
                        opcodeBytes.push(0x00); // Padding bytes
                    }
                    cumulativeOffset = baseOffset + count;
                }
            }
            return "continue";
        }
        if (!p.mnemonic)
            return "continue";
        var instr = p.mnemonic;
        var operands = p.operands || [];
        var best = findBestZ80Match(instr, operands);
        if (!best) {
            // Try emergency fallback: direct lookup in z80Cmds by z80 field
            if (Array.isArray(z80codes_js_1.z80Cmds)) {
                var fallback = z80codes_js_1.z80Cmds.find(function (cmd) { return cmd.z80.toUpperCase().trim() === instr.toUpperCase().trim(); });
                if (fallback) {
                    var bytesForInstr_1 = opCodePatternToBytes(fallback.opCode, p, labelMap, numberReferences, baseOffsetAbs);
                    opcodeBytes.push.apply(opcodeBytes, bytesForInstr_1);
                    cumulativeOffset = baseOffset + bytesForInstr_1.length;
                    return "continue";
                }
            }
            return "continue";
        }
        var bytesForInstr = opCodePatternToBytes(best.opCode, p, labelMap, numberReferences, baseOffsetAbs, labelReferences);
        opcodeBytes.push.apply(opcodeBytes, bytesForInstr);
        cumulativeOffset = baseOffset + bytesForInstr.length;
    };
    for (var _i = 0, parsedLines_1 = parsedLines; _i < parsedLines_1.length; _i++) {
        var p = parsedLines_1[_i];
        _loop_1(p);
    }
    return { totalOpcodeLength: cumulativeOffset, opcodeBytes: opcodeBytes };
}
// =================== PHASE 3: BUILD MTX DIRECTIVES ===================
function parseCodeBlockPhase3(labelMap, labelReferences, numberReferences, directiveLines, commentLines, offsetBase, codeStartAbsolute) {
    var _a, _b, _c;
    var mtxDirectiveBytes = [];
    // Undefined label references are encoded as Number-definition records (historic MTX behaviour).
    var mergedNumberRefs = new Map();
    for (var _i = 0, _d = Array.from(numberReferences.entries()); _i < _d.length; _i++) {
        var _e = _d[_i], name_1 = _e[0], refs = _e[1];
        mergedNumberRefs.set(name_1, {
            byteOffsets: __spreadArray([], refs.byteOffsets, true),
            wordOffsets: __spreadArray([], refs.wordOffsets, true),
            relativeOffsets: __spreadArray([], refs.relativeOffsets, true)
        });
    }
    for (var _f = 0, _g = Array.from(labelReferences.entries()); _f < _g.length; _f++) {
        var _h = _g[_f], labelName = _h[0], refs = _h[1];
        if (typeof labelMap[labelName] === 'number')
            continue;
        var dst = ensureRefBuckets(mergedNumberRefs, labelName);
        (_a = dst.byteOffsets).push.apply(_a, refs.byteOffsets);
        (_b = dst.wordOffsets).push.apply(_b, refs.wordOffsets);
        (_c = dst.relativeOffsets).push.apply(_c, refs.relativeOffsets);
    }
    // 9a) Number definition blocks (0x00)
    for (var _j = 0, _k = Array.from(mergedNumberRefs.entries()); _j < _k.length; _j++) {
        var _l = _k[_j], numberStr = _l[0], info = _l[1];
        mtxDirectiveBytes.push(0x00); // Number definition marker
        var numAscii = compressSpacesAndAscii(numberStr);
        mtxDirectiveBytes.push.apply(mtxDirectiveBytes, numAscii);
        // Set bit 7 on last character
        if (mtxDirectiveBytes.length > 0) {
            mtxDirectiveBytes[mtxDirectiveBytes.length - 1] |= 0x80;
        }
        // Build reference section
        mtxDirectiveBytes.push.apply(mtxDirectiveBytes, buildReferenceSections(info, codeStartAbsolute));
    }
    // 9c) Label definition blocks (0x02)
    for (var _m = 0, _o = Object.entries(labelMap); _m < _o.length; _m++) {
        var _p = _o[_m], labelName = _p[0], offset = _p[1];
        mtxDirectiveBytes.push(0x02); // Label definition marker
        var relOffset = offset - codeStartAbsolute;
        mtxDirectiveBytes.push(relOffset & 0xff, (relOffset >> 8) & 0xff);
        var labelAscii = compressSpacesAndAscii(labelName);
        mtxDirectiveBytes.push.apply(mtxDirectiveBytes, labelAscii);
        // Set bit 7 on last character
        if (mtxDirectiveBytes.length > 0) {
            mtxDirectiveBytes[mtxDirectiveBytes.length - 1] |= 0x80;
        }
        // Append label reference section (relative/word/byte) using newest-first order
        var refs = labelReferences.get(labelName.toUpperCase());
        if (refs) {
            mtxDirectiveBytes.push.apply(mtxDirectiveBytes, buildReferenceSections(refs, codeStartAbsolute));
        }
        else {
            mtxDirectiveBytes.push(0x00, 0x00, 0x00);
        }
    }
    // 9d-9f) Directives (DB/DW/DS)
    for (var _q = 0, directiveLines_1 = directiveLines; _q < directiveLines_1.length; _q++) {
        var dir = directiveLines_1[_q];
        if (dir.directiveType === 'DB') {
            // <0x03> <offset LSB/MSB> <byte count> <ascii length> <ascii chars w/ commas handling,bit7 set on last char of each item separated by commas> >
            mtxDirectiveBytes.push(0x03); // DB marker
            var relOffset = (dir._offset || 0) - offsetBase;
            mtxDirectiveBytes.push(relOffset & 0xff, (relOffset >> 8) & 0xff);
            var val = dir.directiveValue || '';
            var dbPayload = buildDbDirectivePayload(val);
            mtxDirectiveBytes.push(dbPayload.itemCount & 0xff); // byte count (comma-separated items)
            mtxDirectiveBytes.push(dbPayload.ascii.length & 0xff); // ascii length excluding commas
            mtxDirectiveBytes.push.apply(// ascii length excluding commas
            mtxDirectiveBytes, dbPayload.ascii); // ascii bytes with bit7 set on last char of each item
        }
        else if (dir.directiveType === 'DW') {
            // <0x04> <offset> <word byte-count> <ascii length> <ascii chars>
            // Spec: <number ... as ASCII characters, last character has bit 7 set>
            mtxDirectiveBytes.push(0x04); // DW marker
            var relOffset = (dir._offset || 0) - offsetBase;
            mtxDirectiveBytes.push(relOffset & 0xff, (relOffset >> 8) & 0xff);
            var val = dir.directiveValue || '';
            var dwPayload = buildDbDirectivePayload(val);
            //mtxDirectiveBytes.push(dwPayload.itemCount & 0xff);
            var dwByteCount = dwPayload.itemCount * 2;
            mtxDirectiveBytes.push(dwByteCount & 0xff);
            mtxDirectiveBytes.push(dwPayload.ascii.length & 0xff);
            mtxDirectiveBytes.push.apply(mtxDirectiveBytes, dwPayload.ascii);
        }
        else if (dir.directiveType === 'DS') {
            // <0x05> <offset> <byte count> <ascii length>  <ascii chars>
            // Spec: "number of bytes to reserve represented as ASCII characters, last character has bit 7 set"
            mtxDirectiveBytes.push(0x05); // DS marker
            var relOffset = (dir._offset || 0) - offsetBase;
            mtxDirectiveBytes.push(relOffset & 0xff, (relOffset >> 8) & 0xff);
            var val = dir.directiveValue || '';
            var dsPayload = buildDbDirectivePayload(val);
            var count = parseInt(val || '0', 10) || 0;
            mtxDirectiveBytes.push(count & 0xff);
            mtxDirectiveBytes.push(dsPayload.ascii.length & 0xff);
            mtxDirectiveBytes.push.apply(mtxDirectiveBytes, dsPayload.ascii);
        }
    }
    // 9i) Comments (0x08)
    for (var _r = 0, commentLines_1 = commentLines; _r < commentLines_1.length; _r++) {
        var comment = commentLines_1[_r];
        //<0x08><offset><length><comment string in ascii characters (excludes the semicolon marker at the start of the comment)><end of comment marker, 0xff>
        mtxDirectiveBytes.push(0x08); // Comment marker
        var relOffset = (comment.offset || 0) - offsetBase;
        mtxDirectiveBytes.push(relOffset & 0xff, (relOffset >> 8) & 0xff);
        var text = comment.raw.replace(/^\s*;/, '');
        var textAscii = compressSpacesAndAscii(text);
        // Length includes 0xFF end marker
        mtxDirectiveBytes.push((textAscii.length + 1) & 0xff);
        mtxDirectiveBytes.push.apply(mtxDirectiveBytes, textAscii);
        mtxDirectiveBytes.push(0xff); // End of comment marker
    }
    var totalMtxDirectiveLength = mtxDirectiveBytes.length;
    return { totalMtxDirectiveLength: totalMtxDirectiveLength, mtxDirectiveBytes: mtxDirectiveBytes };
}
// =================== HELPER: BUILD REFERENCE SECTION ===================
function buildReferenceSection(offsets, type) {
    var bytes = [];
    // newest references should come first
    var refs = __spreadArray([], offsets, true).reverse();
    if (refs.length === 0) {
        bytes.push(0x00, 0x00, 0x00); // Discarded (3 zero bytes)
    }
    else if (type === 'byte') {
        // Byte type: marker doubles as count - 0x01 for 1 instance, 0x02 for 2, etc.
        bytes.push(refs.length); // Single byte that represents the count
        for (var _i = 0, refs_1 = refs; _i < refs_1.length; _i++) {
            var offset = refs_1[_i];
            bytes.push(offset & 0xff, (offset >> 8) & 0xff); // LSB/MSB pair for offset
        }
        bytes.push(0x00, 0x00); // Exactly 2 pad bytes for byte type
    }
    else if (type === 'word') {
        // Word type: <0x00> <count> <LSB/MSB offset pair per instance> <1 pad byte>
        bytes.push(0x00, refs.length);
        for (var _a = 0, refs_2 = refs; _a < refs_2.length; _a++) {
            var offset = refs_2[_a];
            bytes.push(offset & 0xff, (offset >> 8) & 0xff); // LSB/MSB pair for word type
        }
        bytes.push(0x00); // Exactly 1 pad byte for word type
    }
    else if (type === 'relative') {
        // Relative jump: <0x00> <0x00> <count> <LSB/MSB offset pair per instance> <0 pad bytes>
        bytes.push(0x00, 0x00, refs.length);
        for (var _b = 0, refs_3 = refs; _b < refs_3.length; _b++) {
            var offset = refs_3[_b];
            bytes.push(offset & 0xff, (offset >> 8) & 0xff); // LSB/MSB pair for relative
        }
        // No pad bytes for relative
    }
    return bytes;
}
// Supports mixed reference kinds for a single symbol (byte + word + relative).
function buildReferenceSections(refs, codeStartAbsolute) {
    var toRelNewestFirst = function (arr) { return arr.map(function (o) { return o - codeStartAbsolute; }).reverse(); };
    var byteRefs = toRelNewestFirst(refs.byteOffsets || []);
    var wordRefs = toRelNewestFirst(refs.wordOffsets || []);
    var relRefs = toRelNewestFirst(refs.relativeOffsets || []);
    if (byteRefs.length === 0 && wordRefs.length === 0 && relRefs.length === 0) {
        return [0x00, 0x00, 0x00];
    }
    var bytes = [];
    if (byteRefs.length > 0) {
        // Hybrid format for byte references: <count><offsets...>
        bytes.push(byteRefs.length & 0xff);
        for (var _i = 0, byteRefs_1 = byteRefs; _i < byteRefs_1.length; _i++) {
            var o = byteRefs_1[_i];
            bytes.push(o & 0xff, (o >> 8) & 0xff);
        }
    }
    if (wordRefs.length > 0) {
        // Word references: <0x00><count><offsets...>
        bytes.push(0x00, wordRefs.length & 0xff);
        for (var _a = 0, wordRefs_1 = wordRefs; _a < wordRefs_1.length; _a++) {
            var o = wordRefs_1[_a];
            bytes.push(o & 0xff, (o >> 8) & 0xff);
        }
        // Keep historical pad byte only when relative section does not follow.
        if (relRefs.length === 0)
            bytes.push(0x00);
    }
    if (relRefs.length > 0) {
        // If mixed with word refs, emit compact relative section: <count><offsets...>
        // Otherwise keep the standalone format: <0x00><0x00><count><offsets...>
        if (wordRefs.length > 0) {
            bytes.push(relRefs.length & 0xff);
        }
        else {
            bytes.push(0x00, 0x00, relRefs.length & 0xff);
        }
        for (var _b = 0, relRefs_1 = relRefs; _b < relRefs_1.length; _b++) {
            var o = relRefs_1[_b];
            bytes.push(o & 0xff, (o >> 8) & 0xff);
        }
    }
    // Legacy-only single-kind padding for byte refs remains via existing helper.
    if (wordRefs.length === 0 && relRefs.length === 0 && byteRefs.length > 0) {
        return buildReferenceSection(byteRefs, 'byte');
    }
    return bytes;
}
// Helper to convert string to ASCII bytes, setting bit 7 on the very last character - use buildDbDirectivePayload function instead where possible
function convertToAsciiWithHiBit(str) {
    if (!str)
        return [];
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        // If it's the last character, set bit 7
        if (i === str.length - 1) {
            code |= 0x80;
        }
        bytes.push(code);
    }
    return bytes;
}
// =================== MAIN PROCESSCODEBOCK FUNCTION ===================
function processCodeBlock(codeBlock, baseAddr) {
    if (baseAddr === void 0) { baseAddr = 0x4000; }
    // Phase 1: Parse and discover labels, directives, comments
    var phase1 = parseCodeBlockPhase1(codeBlock, baseAddr);
    var offsetCandidates = phase1.parsedLines
        .map(function (p) { return (typeof (p === null || p === void 0 ? void 0 : p._offset) === 'number' ? p._offset : null); })
        .filter(function (v) { return v !== null; });
    var offsetBase = offsetCandidates.length ? Math.min.apply(Math, offsetCandidates) : 0;
    var codeStartAbsolute = baseAddr + offsetBase;
    // Phase 2: Generate opcode bytes
    var phase2 = parseCodeBlockPhase2(phase1.parsedLines, phase1.labelMap, phase1.labelReferences, phase1.numberReferences, baseAddr, offsetBase);
    // Use opcode bytes directly from Phase 2 (do not auto-append RET)
    var opcodeBytes = __spreadArray([], phase2.opcodeBytes, true);
    var totalOpcodeLength = opcodeBytes.length;
    // Phase 3: Build MTX directive bytes
    var phase3 = parseCodeBlockPhase3(phase1.labelMap, phase1.labelReferences, phase1.numberReferences, phase1.directiveLines, phase1.commentLines, offsetBase, codeStartAbsolute);
    var totalCodeLength = totalOpcodeLength + phase3.totalMtxDirectiveLength;
    return {
        totalOpcodeLength: totalOpcodeLength,
        opcodeBytes: opcodeBytes,
        totalMtxDirectiveLength: phase3.totalMtxDirectiveLength,
        mtxDirectiveBytes: phase3.mtxDirectiveBytes,
        totalCodeLength: totalCodeLength
    };
}
function assembleCodeBlock(lines, baseAddr) {
    if (baseAddr === void 0) { baseAddr = 0x4000; }
    // Two-pass: 1) parse lines and collect labels/addresses; 2) emit bytes with labels resolved
    var bytes = [];
    var parsedLines = [];
    var labelMap = {};
    // First pass: parse and determine addresses
    var currentAddress = baseAddr;
    for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
        var rawLine = lines_2[_i];
        var line = rawLine.replace(/\r?\n$/, '');
        var trimmed = line.trim();
        if (!trimmed)
            continue;
        // comment-only lines
        if (trimmed.startsWith(';')) {
            parsedLines.push({ raw: line, isComment: true });
            continue;
        }
        var parsed = (0, z80codes_js_1.parseZ80Line)(line, 0) || { raw: line };
        // if parse found an explicit address, use it
        if (parsed.address) {
            currentAddress = parseInt(parsed.address, 16);
        }
        parsed._address = currentAddress;
        // record label definition
        if (parsed.label)
            labelMap[parsed.label.toUpperCase()] = currentAddress;
        // determine length
        var instrLen = 0;
        if (parsed.isDirective) {
            var d = parsed.directiveType;
            var val = parsed.directiveValue || '';
            if (d === 'DB') {
                var v = val.trim();
                if (v.startsWith('\"') && v.endsWith('\"')) {
                    instrLen = v.slice(1, -1).length;
                }
                else {
                    instrLen = 1;
                }
            }
            else if (d === 'DW') {
                instrLen = 2;
            }
            else if (d === 'DS') {
                instrLen = parseInt(parsed.directiveValue || '0', 10) || 0;
            }
        }
        else if (parsed.mnemonic) {
            var bestMatch = findBestZ80Match(parsed.mnemonic, parsed.operands || []);
            instrLen = bestMatch ? bestMatch.length : 1;
        }
        parsedLines.push(parsed);
        currentAddress += instrLen;
    }
    // Second pass: emit bytes
    var cumulativeOffset = 0;
    for (var _a = 0, parsedLines_2 = parsedLines; _a < parsedLines_2.length; _a++) {
        var p = parsedLines_2[_a];
        if (p.isComment) {
            bytes.push.apply(bytes, compressSpacesAndAscii(p.raw.substring(p.raw.indexOf(';') + 1)));
            bytes.push(0xFF);
            continue;
        }
        var parsed = p;
        if (!parsed.mnemonic && !parsed.isDirective)
            continue;
        if (parsed.isDirective) {
            var d = parsed.directiveType;
            var val = parsed.directiveValue || '';
            if (d === 'DB') {
                var v = val.trim();
                if (v.startsWith('\"') && v.endsWith('\"')) {
                    var s = v.slice(1, -1);
                    for (var k = 0; k < s.length; k++)
                        bytes.push(s.charCodeAt(k));
                    cumulativeOffset += s.length;
                }
                else {
                    bytes.push(parseImmediateOperand(v) & 0xff);
                    cumulativeOffset += 1;
                }
            }
            else if (d === 'DW') {
                var vv = parseImmediateOperand(val) || 0;
                bytes.push(vv & 0xff, (vv >> 8) & 0xff);
                cumulativeOffset += 2;
            }
            else if (d === 'DS') {
                var count = parseInt(parsed.directiveValue || '0', 10) || 0;
                if (count > 0) {
                    bytes.push(0xC9); // RET opcode as placeholder
                    for (var n = 1; n < count; n++)
                        bytes.push(0x00);
                    cumulativeOffset += count;
                }
            }
            continue;
        }
        // instructions
        var instr = typeof z80codes_js_1.normalizeInstruction === 'function'
            ? (0, z80codes_js_1.normalizeInstruction)(parsed.mnemonic || '', parsed.operands || [])
            : null;
        var cmd = null;
        if (instr && Array.isArray(z80codes_js_1.z80Cmds)) {
            for (var _b = 0, z80Cmds_1 = z80codes_js_1.z80Cmds; _b < z80Cmds_1.length; _b++) {
                var c = z80Cmds_1[_b];
                var norm = c.z80.toUpperCase().replace(/\s+/g, ' ').replace(/,\s*/g, ',').trim();
                if (norm === (instr || '').toUpperCase()) {
                    cmd = c;
                    break;
                }
            }
        }
        if (!cmd) {
            var placeholder = typeof z80codes_js_1.normalizeInstruction === 'function'
                ? (0, z80codes_js_1.normalizeInstruction)(parsed.mnemonic || '', parsed.operands || [])
                : null;
            if (placeholder && Array.isArray(z80codes_js_1.z80Cmds)) {
                for (var _c = 0, z80Cmds_2 = z80codes_js_1.z80Cmds; _c < z80Cmds_2.length; _c++) {
                    var c = z80Cmds_2[_c];
                    var norm2 = c.z80.toUpperCase().replace(/\s+/g, ' ').replace(/,\s*/g, ',').trim();
                    if (norm2 === placeholder.toUpperCase()) {
                        cmd = c;
                        break;
                    }
                }
            }
        }
        if (cmd) {
            // Use the actual instruction address from parsed._address if available, otherwise use cumulativeOffset
            var instrAddr = parsed._address !== undefined ? parsed._address : cumulativeOffset;
            var instrBytes = opCodePatternToBytes(cmd.opCode, parsed, labelMap, new Map(), instrAddr, new Map());
            // Validate that generated bytes match the expected length - KEEP FOR DEVELOPMENT USE ONLY
            if (instrBytes.length !== cmd.length) {
                console.error("OPCODE LENGTH MISMATCH: ".concat(cmd.z80, " at address 0x").concat(instrAddr.toString(16), " - ") +
                    "Expected ".concat(cmd.length, " bytes but generated ").concat(instrBytes.length, " bytes. ") +
                    "OpCode pattern: ".concat(cmd.opCode, ", Generated bytes: ").concat(instrBytes.map(function (b) { return '0x' + b.toString(16).toUpperCase(); }).join(' ')));
            }
            bytes.push.apply(bytes, instrBytes);
            cumulativeOffset += instrBytes.length;
        }
    }
    // Ensure code block ends with RET (0xC9) if not already present
    if (bytes.length === 0 || bytes[bytes.length - 1] !== 0xC9) {
        bytes.push(0xC9);
    }
    return bytes;
}
/**
 * Enhanced matching logic for Z80 instructions in CODE blocks.
 * This update ensures that all potential matches are considered and the correct one is selected based on criteria like length and address patterns.
 */
function findBestZ80Match(instruction, operands) {
    // Try direct match first only when there are no operands (avoids RET matching RET NZ/Z/M/etc.)
    if (Array.isArray(z80codes_js_1.z80Cmds) && operands.length === 0) {
        var directMatch = z80codes_js_1.z80Cmds.find(function (cmd) {
            return cmd.z80.toUpperCase() === instruction.toUpperCase();
        });
        if (directMatch)
            return directMatch;
    }
    // If normalizeInstruction is available, use it
    var normalizedInstr = instruction;
    if (typeof z80codes_js_1.normalizeInstruction === 'function') {
        normalizedInstr = (0, z80codes_js_1.normalizeInstruction)(instruction, operands).toUpperCase().trim();
    }
    else {
        normalizedInstr = instruction.toUpperCase().trim();
    }
    // First, try exact match
    var exactMatch = z80codes_js_1.z80Cmds.find(function (cmd) {
        var normalizedCmd = cmd.z80.toUpperCase().replace(/\s+/g, ' ').replace(/,\s*/g, ',').trim();
        return normalizedCmd === normalizedInstr;
    });
    if (exactMatch)
        return exactMatch;
    // Fall back to prefix matching if no exact match
    var potentialMatches = z80codes_js_1.z80Cmds.filter(function (cmd) {
        var normalizedCmd = cmd.z80.toUpperCase().replace(/\s+/g, ' ').replace(/,\s*/g, ',').trim();
        return normalizedCmd.startsWith(normalizedInstr);
    });
    if (potentialMatches.length === 0) {
        //No matches found for instruction
        return null;
    }
    // If multiple matches, select the best one based on specificity
    if (potentialMatches.length > 1) {
        // Sort by length (longer=more specific) then by opcode bytes (more bytes = more specific)
        var scored = potentialMatches.map(function (cmd) {
            var score = 0;
            // Prefer exact length match
            score += cmd.length * 100;
            // Prefer opcodes with parameters (XXXX, XX, YY, ZZ)
            if (cmd.opCode.includes('XXXX'))
                score += 50;
            if (cmd.opCode.includes('XX'))
                score += 40;
            if (cmd.opCode.includes('YY'))
                score += 40;
            if (cmd.opCode.includes('ZZ'))
                score += 30;
            // Prefer ED prefix commands when instruction contains them
            if (cmd.opCode.startsWith('ED'))
                score += 10;
            return { cmd: cmd, score: score };
        });
        scored.sort(function (a, b) { return b.score - a.score; });
        return scored[0].cmd;
    }
    return potentialMatches[0];
}
// Helper function to compress a NODDY line and pad to 39 characters
// Each NODDY line should be exactly 39 characters when displayed
function compressAndPadNoddyLine(line, addPadding) {
    var bytes = compressSpacesAndAscii(line);
    // Calculate how many spaces needed to reach 39 characters
    // The padding is only added to non-final lines (final line ends with 0xFF)
    if (addPadding) {
        var lineLength = line.length;
        if (lineLength < 39) {
            var spacesNeeded = 39 - lineLength;
            // Add compressed space byte (0x80 + count)
            bytes.push(0x80 + spacesNeeded);
        }
    }
    return bytes;
}
// 3) NODDY block conversion WITH PAGE STRUCTURE
// Format per page: <Length LSB> <Length MSB> <Compressed Content> <0xFF>
// Special rule: The PAGE TITLE is the first part of content. The last char of the title has bit 7 set.
function convertNoddyBlock(lines) {
    var allBytes = [];
    var currentPageLines = [];
    var currentPageIsProgram = false;
    // Helper to process a single accumulated page.
    // isProgramPage: true when the title line started with "Program title="
    var processPage = function (linesToProcess, isProgramPage) {
        var pageContentBytes = [];
        // Process TITLE (first line)
        // "LOSE" -> 'L','O','S', 'E'|0x80
        // Note: CompressSpaces is NOT applied to the title itself based on common MTX logic for labels/names,
        // but just in case, we'll treat it as raw ASCII with the last bit set.
        var title = '';
        if (linesToProcess.length > 0) {
            title = linesToProcess[0];
            for (var i = 0; i < title.length; i++) {
                var code = title.charCodeAt(i);
                if (i === title.length - 1) {
                    code |= 0x80; // Set bit 7 on last char
                }
                pageContentBytes.push(code);
            }
        }
        // isProgramPage is carried in as a parameter (declared by "Program title=" prefix).
        // The optional repeated-name line on the body is still honoured if present.
        var firstBodyLine = linesToProcess.length > 1 ? linesToProcess[1] : '';
        var firstBodyRepeatsTitle = !!title && firstBodyLine.trim() === title;
        var bodyStart = 1;
        if (firstBodyRepeatsTitle) {
            // If this is the only body line, it's the last line of the page.
            var isLastLine = linesToProcess.length === 2;
            pageContentBytes.push.apply(pageContentBytes, compressAndPadNoddyLine(linesToProcess[1], !isLastLine));
            bodyStart = 2;
        }
        // Process remaining body lines for both page types
        var lastLineIndex = linesToProcess.length - 1;
        for (var i = bodyStart; i < linesToProcess.length; i++) {
            var line = linesToProcess[i];
            var isLastLine = (i === lastLineIndex);
            pageContentBytes.push.apply(pageContentBytes, compressAndPadNoddyLine(line, !isLastLine));
        }
        var len = pageContentBytes.length + 3; // +3 to include LSB, MSB and 0xFF
        // Push Page Structure: [Len LSB] [Len MSB] [Content...] [0xFF]
        allBytes.push(len & 0xFF);
        allBytes.push((len >> 8) & 0xFF);
        allBytes.push.apply(allBytes, pageContentBytes);
        allBytes.push(0xFF);
    };
    for (var _i = 0, lines_3 = lines; _i < lines_3.length; _i++) {
        var rawLine = lines_3[_i];
        // Clean line ending
        var line = rawLine.replace(/\r?\n$/, '');
        var trimmedLine = line.trim();
        var isProgTitle = /^Program title=/i.test(trimmedLine);
        var isTextTitle = /^Text title=/i.test(trimmedLine);
        if (isProgTitle || isTextTitle) {
            // Flush the previous page before starting a new one
            if (currentPageLines.length > 0) {
                processPage(currentPageLines, currentPageIsProgram);
            }
            // Strip the prefix to get just the page name
            var pageName = isProgTitle
                ? trimmedLine.replace(/^Program title=/i, '')
                : trimmedLine.replace(/^Text title=/i, '');
            currentPageLines = [pageName];
            currentPageIsProgram = isProgTitle;
        }
        else {
            // Add ordinary line to current page
            if (currentPageLines.length > 0) {
                currentPageLines.push(line);
            }
        }
    }
    // Flush the final page
    if (currentPageLines.length > 0) {
        processPage(currentPageLines, currentPageIsProgram);
    }
    return allBytes;
}
// Updated orchestrator: convertTextToHex uses the three functions above
function convertTextToHex(docText, baseAddr) {
    if (baseAddr === void 0) { baseAddr = 0x4000; }
    var lines = docText.split(/\r?\n/);
    var output = [];
    var foundNoddyTrigger = false;
    var isNoddyMarkerText = function (text) {
        var trimmed = (text || '').trim();
        if (/^REM\s+NODDY\s*$/.test(trimmed))
            return true;
        return /:\s*REM\s+NODDY\s*$/.test(trimmed);
    };
    var hasFollowingBasicLine = function (startIdx) {
        for (var j = startIdx + 1; j < lines.length; j++) {
            if (/^\s*\d+\s+/.test(lines[j]))
                return true;
        }
        return false;
    };
    for (var lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        var line = lines[lineIdx];
        if (foundNoddyTrigger) {
            break;
        }
        var match = /^\s*(\d+)\s*(.*)$/.exec(line);
        if (!match)
            continue;
        var lineNum = parseInt(match[1], 10);
        var codeText = match[2].trim();
        // Noddy handling: Check for "REM NODDY" (must be final BASIC line)
        if (isNoddyMarkerText(codeText) && !hasFollowingBasicLine(lineIdx)) {
            foundNoddyTrigger = true;
            // 1. Process this line as a STANDARD BASIC LINE first (e.g. 13330 REM NODDY)
            var codeBytes = basicTokeniseLine(line, baseAddr);
            output.push.apply(output, codeBytes);
            // 2. Collect lines AFTER the 'REM NODDY' line and convert as Noddy Pages
            var remainingLines = lines.slice(lineIdx + 1);
            var noddyBytes = convertNoddyBlock(remainingLines);
            output.push.apply(output, noddyBytes);
            break;
        }
        if (codeText.toUpperCase() === 'CODE') {
            // Handle CODE block - collect lines until next BASIC line or non-code line
            var codeLines = [];
            // Collect code block lines (with hex addresses)
            var lastIdx = lineIdx;
            for (var idx = lineIdx + 1; idx < lines.length; idx++) {
                var l = lines[idx];
                // Stop if this is a new BASIC line (starts with digits, no leading whitespace)
                if (/^\d+\s/.test(l))
                    break;
                // Stop if line has leading whitespace but no hex address following it
                if (/^\s+/.test(l) && !/^\s+[0-9A-F]{1,4}\b/.test(l))
                    break;
                // This is a code block line, add it
                codeLines.push(l);
                lastIdx = idx;
            }
            // Build full block (include the CODE line with its line number) and tokenise once
            var block = "".concat(lineNum, " CODE\n").concat(codeLines.join('\n'));
            var codeBytes = basicTokeniseLine(block, baseAddr);
            output.push.apply(output, codeBytes);
            // Skip past the code block lines we just consumed
            lineIdx = lastIdx;
            continue;
        }
        else {
            // Handle simple MTX BASIC line
            // Special case: USER SAVE or USER LOAD
            if (/^USER\s+(SAVE|LOAD)/.test(codeText)) {
                var tokens = codeText.split(/\s+/);
                var stripEol = function (arr) { return (arr.length && arr[arr.length - 1] === 0xFF) ? arr.slice(0, -1) : arr; };
                var userToken = stripEol(basicTokeniseLine(tokens[0], baseAddr)); // USER
                var secondToken = stripEol(basicTokeniseLine(tokens[1], baseAddr)); // SAVE or LOAD
                var remainingText = tokens.slice(2).join(' ');
                var remainingBytes = stripEol(basicTokeniseLine(remainingText, baseAddr));
                var payload = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], userToken, true), secondToken, true), remainingBytes, true), [0xFF], false);
                var totalLength_1 = 2 + 2 + payload.length; // length bytes + line number bytes + payload
                output.push(totalLength_1 & 0xff, (totalLength_1 >> 8) & 0xff); // Total length
                output.push(lineNum & 0xff, (lineNum >> 8) & 0xff); // Line number
                output.push.apply(// Line number
                output, payload);
                continue;
            }
            var codeBytes = basicTokeniseLine(codeText, baseAddr);
            var totalLength = 2 + 2 + codeBytes.length; // length bytes + line number bytes + payload (includes EOL)
            // Emit bytes
            output.push(totalLength & 0xff, (totalLength >> 8) & 0xff); // Total length
            output.push(lineNum & 0xff, (lineNum >> 8) & 0xff); // Line number
            output.push.apply(// Line number
            output, codeBytes); // Tokenized code (includes EOL)
        }
    }
    output.push(0xff); // Program terminator - not included in total length of the CODE length bytes as outside the scope of the code block. 
    return output;
}
// helper: parse numeric operand (#hex or decimal), allowing optional leading +/-, used for displacements
function parseImmediateOperand(op) {
    if (!op)
        return 0;
    op = op.trim();
    var sign = op.startsWith('-') ? -1 : 1;
    if (op.startsWith('+') || op.startsWith('-')) {
        op = op.slice(1).trim();
    }
    if (/^[#]/.test(op))
        return sign * (parseInt(op.slice(1), 16) || 0);
    //f (/^0x/i.test(op)) return sign * (parseInt(op, 16) || 0);
    if (/^[0-9]+$/.test(op))
        return sign * (parseInt(op, 10) || 0);
    return 0; // label/unknown -> 0 (labels would need two-pass)
}
function opCodePatternToBytes(opCodePattern, parsed, labelMap, numberReferences, baseOffset, labelReferences) {
    if (baseOffset === void 0) { baseOffset = 0; }
    var parts = opCodePattern.split(/\s+/).filter(Boolean);
    var out = [];
    var operands = parsed.operands || [];
    var opIdx = 0;
    var isRegisterLike = function (s) {
        if (!s)
            return false;
        var u = s.toUpperCase().trim();
        var regs = new Set([
            'A', 'B', 'C', 'D', 'E', 'H', 'L', 'I', 'R',
            "AF", "BC", "DE", "HL", "SP", "IX", "IY", "AF'",
            'NZ', 'Z', 'NC', 'C', 'PO', 'PE', 'P', 'M'
        ]);
        // Treat bare registers/conditions as non-value operands
        if (regs.has(u))
            return true;
        // Treat simple parenthesised register forms as non-value operands
        if (/^\((HL|BC|DE|SP|C|AF|AF')\)$/.test(u))
            return true;
        // Indexed (IX+nn)/(IY+nn) carries a displacement value, so NOT register-like
        return false;
    };
    var findNextValueOperandIndex = function (start) {
        var idx = start;
        while (idx < operands.length && isRegisterLike(operands[idx]))
            idx++;
        return idx;
    };
    var stripParens = function (s) { return (s || '').trim().replace(/^\(|\)$/g, '').trim(); };
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var p = parts_1[_i];
        if (p === 'YY') {
            // YY is for relative jumps (JR, DJNZ).
            // If operand is a label, compute displacement: label_offset - (pc+2).
            // If operand is a numeric literal, use it directly as the signed byte supplied by the programmer.
            opIdx = findNextValueOperandIndex(opIdx);
            var rawOp = operands[opIdx++] || '';
            var opStr = stripParens(rawOp);
            var isLabel = (/^[A-Z][A-Z0-9]*$/).test(opStr.trim());
            if (isLabel) {
                var targetOffset = 0;
                var lab = opStr.toUpperCase();
                if (labelMap && typeof labelMap[lab] === 'number') {
                    targetOffset = labelMap[lab];
                }
                var displacement = targetOffset - (baseOffset + 2);
                out.push(displacement & 0xFF);
                // Track relative label reference
                if (labelReferences) {
                    addRefOffset(labelReferences, lab, 'relative', baseOffset + out.length - 1);
                }
            }
            else {
                // Numeric literal: take the supplied 8-bit value directly
                var literal = parseImmediateOperand(opStr) & 0xFF;
                out.push(literal);
                // Record number reference for YY (byte treated as relative displacement)
                // Check for Hex (#) or Decimal sequences, allowing for +/- prefix
                var cleanOp = opStr.trim();
                var checkOp = cleanOp;
                if (checkOp.startsWith('+') || checkOp.startsWith('-')) {
                    checkOp = checkOp.substring(1).trim();
                }
                // Matches logic in parseImmediateOperand implementation
                var isHex = /^[#]/.test(checkOp);
                var isDec = /^[0-9]+$/.test(checkOp);
                if ((isHex || isDec) && numberReferences) {
                    // Offset points to the displacement byte we just pushed (last element)
                    addRefOffset(numberReferences, cleanOp, 'relative', baseOffset + out.length - 1);
                }
            }
        }
        else if (p === 'XX' || p === 'N' || p === 'ZZ') {
            // Prefer the operand that carries an IX/IY displacement when encoding ZZ
            var selectedIdx = opIdx;
            if (p === 'ZZ') {
                var idxMatch = operands.findIndex(function (o) { return /\((IX|IY)[+-]/.test((o || '').trim()); });
                if (idxMatch >= 0)
                    selectedIdx = idxMatch;
            }
            selectedIdx = findNextValueOperandIndex(selectedIdx);
            var rawOp = operands[selectedIdx] || '';
            opIdx = selectedIdx + 1;
            var opStr = stripParens(rawOp);
            // Indexed displacement (IX+d/IY+d) carries the byte following the opcodes
            var indexedMatch = /^\((IX|IY)[+-](.+)\)$/.exec(rawOp.trim());
            var operandForParse = indexedMatch ? indexedMatch[2] : opStr;
            // Reject bare hex without prefix to surface user error (should be #XX)
            if (/^[+-]?[0-9A-F]+$/.test(operandForParse) && /[A-F]/.test(operandForParse) && !/^([+-]?#)/.test(operandForParse)) {
                throw new Error("Hex operand ".concat(operandForParse, " requires # prefix"));
            }
            var cleanOp = operandForParse.trim();
            var v = parseImmediateOperand(cleanOp);
            // >>> HIGHLIGHT 1: New logic to check for Decimal numbers (isDec) <<<
            var checkOp = cleanOp;
            if (checkOp.startsWith('+') || checkOp.startsWith('-')) {
                checkOp = checkOp.substring(1).trim();
            }
            var isHex = /^[#]/.test(checkOp);
            var isDec = /^[0-9]+$/.test(checkOp); // This line is new
            if ((/^[A-Z][A-Z0-9]*$/).test(cleanOp)) {
                var lab = cleanOp.toUpperCase();
                if (labelMap && typeof labelMap[lab] === 'number')
                    v = labelMap[lab];
                if (labelReferences) {
                    addRefOffset(labelReferences, lab, 'byte', baseOffset + out.length);
                }
            }
            else if (isHex || isDec) { // >>> HIGHLIGHT 2: Added `|| isDec` to this condition <<<
                // Track number reference (byte type)
                // Previous code only had: else if (/^[#]/.test(cleanOp))
                if (numberReferences) {
                    addRefOffset(numberReferences, cleanOp, 'byte', baseOffset + out.length);
                }
            }
            out.push(v & 0xff);
        }
        else if (p === 'XXXX') {
            opIdx = findNextValueOperandIndex(opIdx);
            var rawOp2 = operands[opIdx++] || '';
            var opStr2 = stripParens(rawOp2);
            var v2 = parseImmediateOperand(opStr2);
            // >>> HIGHLIGHT 3: New logic for XXXX operand to check for Decimal (isDec2) <<<
            // Check for Hex (#) or Decimal sequences, allowing for +/- prefix (Logic from YY)
            var checkOp2 = opStr2.trim();
            if (checkOp2.startsWith('+') || checkOp2.startsWith('-')) {
                checkOp2 = checkOp2.substring(1).trim();
            }
            var isHex2 = /^[#]/.test(checkOp2);
            var isDec2 = /^[0-9]+$/.test(checkOp2); // This line is new
            if ((/^[A-Z][A-Z0-9]*$/).test(opStr2.trim())) {
                var lab2 = opStr2.toUpperCase();
                if (labelMap && typeof labelMap[lab2] === 'number')
                    v2 = labelMap[lab2];
                if (labelReferences) {
                    addRefOffset(labelReferences, lab2, 'word', baseOffset + out.length);
                }
            }
            else if (isHex2 || isDec2) { // >>> HIGHLIGHT 4: Added `|| isDec2` to this condition <<<
                // Track number reference (word type)
                // Previous code only had: else if (/^#/.test(opStr2))
                if (numberReferences) {
                    addRefOffset(numberReferences, opStr2, 'word', baseOffset + out.length);
                }
            }
            out.push(v2 & 0xff, (v2 >> 8) & 0xff);
        }
        else if (/^[0-9A-F]{2}$/.test(p)) {
            // Single 2-digit hex byte
            out.push(parseInt(p, 16));
        }
        else if (/^[0-9A-F]+$/.test(p) && p.length % 2 === 0) {
            // Multi-byte hex sequence (e.g., "ED5A" -> ED, 5A or "DDCB" -> DD, CB)
            for (var i = 0; i < p.length; i += 2) {
                var hexByte = p.substring(i, i + 2);
                out.push(parseInt(hexByte, 16));
            }
        }
        else {
            var maybe = parseInt(p, 16);
            if (!Number.isNaN(maybe))
                out.push(maybe & 0xff);
        }
    }
    return out;
}
function processMTXDirectives(directives) {
    var totalDirectiveLength = 0;
    directives.forEach(function (directive) {
        if (directive.startsWith("<0x00>")) {
            // Number definition
            totalDirectiveLength += 3; // Example: Adjust based on actual directive length
        }
        else if (directive.startsWith("<0x02>")) {
            // Label definition
            totalDirectiveLength += 5; // Example: Adjust based on actual directive length
        }
        else if (directive.startsWith("<0x03>")) {
            // Define Byte (DB)
            totalDirectiveLength += 4; // Example: Adjust based on actual directive length
        }
        else if (directive.startsWith("<0x04>")) {
            // Define Word (DW)
            totalDirectiveLength += 6; // Example: Adjust based on actual directive length
        }
        else if (directive.startsWith("<0x05>")) {
            // Define Space (DS)
            totalDirectiveLength += 2; // Example: Adjust based on actual directive length
        }
        else if (directive.startsWith("<0x08>")) {
            // Comment
            totalDirectiveLength += directive.length; // Example: Adjust based on actual directive length
        }
    });
    return totalDirectiveLength;
}
function updateCodeBlockLength(codeBlock, directives) {
    var codeBlockResult = processCodeBlock(codeBlock);
    var directiveLength = processMTXDirectives(directives);
    var totalLength = codeBlockResult.totalCodeLength;
    return { totalLength: totalLength, opcodeBytes: codeBlockResult.opcodeBytes, mtxDirectiveBytes: codeBlockResult.mtxDirectiveBytes };
}
function refineConvertTextToHex(line) {
    var lineNumber = parseInt(line.split(' ')[0], 10);
    var command = line.split(' ')[1];
    if (command === 'CODE') {
        // Extract the code block (everything after the command)
        var codeBlock = line.split('CODE')[1].trim();
        // Dynamically calculate the length of the Z80 opcodes in the code block
        var codeBlockResult = processCodeBlock(codeBlock);
        // Extract and calculate the length of the MTX directives
        var directives = extractMTXDirectives(codeBlock); // Implement directive extraction
        var directiveLength = processMTXDirectives(directives);
        // Calculate the total length dynamically
        var totalLength = 7 + codeBlockResult.totalOpcodeLength + directiveLength;
        return __spreadArray(__spreadArray(__spreadArray([
            totalLength & 0xFF, (totalLength >> 8) & 0xFF, // Total length
            lineNumber & 0xFF, (lineNumber >> 8) & 0xFF, // Line number
            0xC2, // Token for CODE
            codeBlockResult.totalOpcodeLength & 0xFF, (codeBlockResult.totalOpcodeLength >> 8) & 0xFF
        ], codeBlockResult.opcodeBytes, true), codeBlockResult.mtxDirectiveBytes, true), [
            0xFF // End of line marker
        ], false);
    }
    return []; // Default case
}
function extractMTXDirectives(codeBlock) {
    // Placeholder: Implement logic to extract MTX directives from the code block
    return [];
}
