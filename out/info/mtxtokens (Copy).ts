/** ASCII and MTX BASIC tokens
AFWilson
31-Oct-2022
v0.1

12-Dec-2025 converted to typescript and added hex values of the tokens.
*/

import { isHexNumber,
        parseSignedHex,
        parseHex,
        stripAllCharacters,
        stripOuterParentheses,
        convertToNumber
}
from './stdFns.js';

import {
    z80Cmds,
    Z80Error,
    Z80ParsedLine,
    CodeBlock,
    LabelInfo,
    parseZ80Line,
    splitOperands,
    detectCodeBlocks,
    collectLabels,
    normalizeInstruction,
    findZ80Command,
    validateZ80Instruction,
    validateZ80InstructionWithLabels,
    validateCodeBlock,
    validateCodeBlocks,
    getZ80InstructionInfo
} from './z80codes.js';

//ascii (non-printable 0 to 31 and printable from 32 to 127) + MTX BASIC tokens (from 128 to 255)
const mtxTokens: {tokenDec: number, tokenHex: number, token: string}[] = [
    {tokenDec:0,tokenHex: 0x00,token:"NUL"},
    {tokenDec:1,tokenHex: 0x01,token:"SCH"},
    {tokenDec:2,tokenHex: 0x02,token:"STX"},
    {tokenDec:3,tokenHex: 0x03,token:"ETX"},
    {tokenDec:4,tokenHex: 0x04,token:"EOT"},
    {tokenDec:5,tokenHex: 0x05,token:"ENQ"},
    {tokenDec:6,tokenHex: 0x06,token:"ACK"},
    {tokenDec:7,tokenHex: 0x07,token:"BEL"},
    {tokenDec:8,tokenHex: 0x08,token:"BS"},
    {tokenDec:9,tokenHex: 0x09,token:"HT"},
    {tokenDec:10,tokenHex: 0x0A,token:"LF"},
    {tokenDec:11,tokenHex: 0x0B,token:"VT"},
    {tokenDec:12,tokenHex: 0x0C,token:"FF"},
    {tokenDec:13,tokenHex: 0x0D,token:"CR"},
    {tokenDec:14,tokenHex: 0x0E,token:"SO"},
    {tokenDec:15,tokenHex: 0x0F,token:"SI"},
    {tokenDec:16,tokenHex: 0x10,token:"DLE"},
    {tokenDec:17,tokenHex: 0x11,token:"DC1"},
    {tokenDec:18,tokenHex: 0x12,token:"DC2"},
    {tokenDec:19,tokenHex: 0x13,token:"DC3"},
    {tokenDec:20,tokenHex: 0x14,token:"DC4"},
    {tokenDec:21,tokenHex: 0x15,token:"NAK"},
    {tokenDec:22,tokenHex: 0x16,token:"SYN"},
    {tokenDec:23,tokenHex: 0x17,token:"ETB"},
    {tokenDec:24,tokenHex: 0x18,token:"CAN"},
    {tokenDec:25,tokenHex: 0x19,token:"EM"},
    {tokenDec:26,tokenHex: 0x1A,token:"SUB"},
    {tokenDec:27,tokenHex: 0x1B,token:"ESC"},
    {tokenDec:28,tokenHex: 0x1C,token:"FS"},
    {tokenDec:29,tokenHex: 0x1D,token:"GS"},
    {tokenDec:30,tokenHex: 0x1E,token:"RS"},
    {tokenDec:31,tokenHex: 0x1F,token:"US"},
    {tokenDec:32,tokenHex: 0x20,token:" "},
    {tokenDec:33,tokenHex: 0x21,token:"!"},
    {tokenDec:34,tokenHex: 0x22,token:"“"},
    {tokenDec:35,tokenHex: 0x23,token:"#"},
    {tokenDec:36,tokenHex: 0x24,token:"$"},
    {tokenDec:37,tokenHex: 0x25,token:"%"},
    {tokenDec:38,tokenHex: 0x26,token:"&"},
    {tokenDec:39,tokenHex: 0x27,token:"'"},
    {tokenDec:40,tokenHex: 0x28,token:"("},
    {tokenDec:41,tokenHex: 0x29,token:")"},
    {tokenDec:42,tokenHex: 0x2A,token:"*"},
    {tokenDec:43,tokenHex: 0x2B,token:"+"},
    {tokenDec:44,tokenHex: 0x2C,token:","},
    {tokenDec:45,tokenHex: 0x2D,token:"-"},
    {tokenDec:46,tokenHex: 0x2E,token:"."},
    {tokenDec:47,tokenHex: 0x2F,token:"/"},
    {tokenDec:48,tokenHex: 0x30,token:"0"},
    {tokenDec:49,tokenHex: 0x31,token:"1"},
    {tokenDec:50,tokenHex: 0x32,token:"2"},
    {tokenDec:51,tokenHex: 0x33,token:"3"},
    {tokenDec:52,tokenHex: 0x34,token:"4"},
    {tokenDec:53,tokenHex: 0x35,token:"5"},
    {tokenDec:54,tokenHex: 0x36,token:"6"},
    {tokenDec:55,tokenHex: 0x37,token:"7"},
    {tokenDec:56,tokenHex: 0x38,token:"8"},
    {tokenDec:57,tokenHex: 0x39,token:"9"},
    {tokenDec:58,tokenHex: 0x3A,token:":"},
    {tokenDec:59,tokenHex: 0x3B,token:";"},
    {tokenDec:60,tokenHex: 0x3C,token:"<"},
    {tokenDec:61,tokenHex: 0x3D,token:"="},
    {tokenDec:62,tokenHex: 0x3E,token:">"},
    {tokenDec:63,tokenHex: 0x3F,token:"?"},
    {tokenDec:64,tokenHex: 0x40,token:"@"},
    {tokenDec:65,tokenHex: 0x41,token:"A"},
    {tokenDec:66,tokenHex: 0x42,token:"B"},
    {tokenDec:67,tokenHex: 0x43,token:"C"},
    {tokenDec:68,tokenHex: 0x44,token:"D"},
    {tokenDec:69,tokenHex: 0x45,token:"E"},
    {tokenDec:70,tokenHex: 0x46,token:"F"},
    {tokenDec:71,tokenHex: 0x47,token:"G"},
    {tokenDec:72,tokenHex: 0x48,token:"H"},
    {tokenDec:73,tokenHex: 0x49,token:"I"},
    {tokenDec:74,tokenHex: 0x4A,token:"J"},
    {tokenDec:75,tokenHex: 0x4B,token:"K"},
    {tokenDec:76,tokenHex: 0x4C,token:"L"},
    {tokenDec:77,tokenHex: 0x4D,token:"M"},
    {tokenDec:78,tokenHex: 0x4E,token:"N"},
    {tokenDec:79,tokenHex: 0x4F,token:"O"},
    {tokenDec:80,tokenHex: 0x50,token:"P"},
    {tokenDec:81,tokenHex: 0x51,token:"Q"},
    {tokenDec:82,tokenHex: 0x52,token:"R"},
    {tokenDec:83,tokenHex: 0x53,token:"S"},
    {tokenDec:84,tokenHex: 0x54,token:"T"},
    {tokenDec:85,tokenHex: 0x55,token:"U"},
    {tokenDec:86,tokenHex: 0x56,token:"V"},
    {tokenDec:87,tokenHex: 0x57,token:"W"},
    {tokenDec:88,tokenHex: 0x58,token:"X"},
    {tokenDec:89,tokenHex: 0x59,token:"Y"},
    {tokenDec:90,tokenHex: 0x5A,token:"Z"},
    {tokenDec:91,tokenHex: 0x5B,token:"["},
    {tokenDec:92,tokenHex: 0x5C,token:"/"},
    {tokenDec:93,tokenHex: 0x5D,token:"]"},
    {tokenDec:94,tokenHex: 0x5E,token:"^"},
    {tokenDec:95,tokenHex: 0x5F,token:"_"},
    {tokenDec:96,tokenHex: 0x60,token:"`"},
    {tokenDec:97,tokenHex: 0x61,token:"a"},
    {tokenDec:98,tokenHex: 0x62,token:"b"},
    {tokenDec:99,tokenHex: 0x63,token:"c"},
    {tokenDec:100,tokenHex: 0x64,token:"d"},
    {tokenDec:101,tokenHex: 0x65,token:"e"},
    {tokenDec:102,tokenHex: 0x66,token:"f"},
    {tokenDec:103,tokenHex: 0x67,token:"g"},
    {tokenDec:104,tokenHex: 0x68,token:"h"},
    {tokenDec:105,tokenHex: 0x69,token:"i"},
    {tokenDec:106,tokenHex: 0x6A,token:"j"},
    {tokenDec:107,tokenHex: 0x6B,token:"k"},
    {tokenDec:108,tokenHex: 0x6C,token:"l"},
    {tokenDec:109,tokenHex: 0x6D,token:"m"},
    {tokenDec:110,tokenHex: 0x6E,token:"n"},
    {tokenDec:111,tokenHex: 0x6F,token:"o"},
    {tokenDec:112,tokenHex: 0x70,token:"p"},
    {tokenDec:113,tokenHex: 0x71,token:"q"},
    {tokenDec:114,tokenHex: 0x72,token:"r"},
    {tokenDec:115,tokenHex: 0x73,token:"s"},
    {tokenDec:116,tokenHex: 0x74,token:"t"},
    {tokenDec:117,tokenHex: 0x75,token:"u"},
    {tokenDec:118,tokenHex: 0x76,token:"v"},
    {tokenDec:119,tokenHex: 0x77,token:"w"},
    {tokenDec:120,tokenHex: 0x78,token:"x"},
    {tokenDec:121,tokenHex: 0x79,token:"y"},
    {tokenDec:122,tokenHex: 0x7A,token:"z"},
    {tokenDec:123,tokenHex: 0x7B,token:"{"},
    {tokenDec:124,tokenHex: 0x7C,token:"|"},
    {tokenDec:125,tokenHex: 0x7D,token:"}"},
    {tokenDec:126,tokenHex: 0x7E,token:"~"},
    {tokenDec:127,tokenHex: 0x7F,token:"DEL"},
    {tokenDec:128,tokenHex: 0x80,token:"REM"},
    {tokenDec:129,tokenHex: 0x81,token:"CLS"},
    {tokenDec:130,tokenHex: 0x82,token:"ASSEM"},
    {tokenDec:131,tokenHex: 0x83,token:"AUTO"},
    {tokenDec:132,tokenHex: 0x84,token:"BAUD"},
    {tokenDec:133,tokenHex: 0x85,token:"VS"},
    {tokenDec:134,tokenHex: 0x86,token:"CONT"},
    {tokenDec:135,tokenHex: 0x87,token:"USER"},
    {tokenDec:136,tokenHex: 0x88,token:"CRVS"},
    {tokenDec:137,tokenHex: 0x89,token:"CLEAR"},
    {tokenDec:138,tokenHex: 0x8A,token:"CLOCK"},
    {tokenDec:139,tokenHex: 0x8B,token:"ATTR"},
    {tokenDec:140,tokenHex: 0x8C,token:"COLOUR"},
    {tokenDec:141,tokenHex: 0x8D,token:"INK"},
    {tokenDec:142,tokenHex: 0x8E,token:"CSR"},
    {tokenDec:143,tokenHex: 0x8F,token:"DATA"},
    {tokenDec:144,tokenHex: 0x90,token:"PRINT"},
    {tokenDec:145,tokenHex: 0x91,token:"DIM"},
    {tokenDec:146,tokenHex: 0x92,token:"ADJSPR"},
    {tokenDec:147,tokenHex: 0x93,token:"EDIT"},
    {tokenDec:148,tokenHex: 0x94,token:"NEXT"},
    {tokenDec:149,tokenHex: 0x95,token:"FOR"},
    {tokenDec:150,tokenHex: 0x96,token:"GOTO"},
    {tokenDec:151,tokenHex: 0x97,token:"GOSUB"},
    {tokenDec:152,tokenHex: 0x98,token:"INPUT"},
    {tokenDec:153,tokenHex: 0x99,token:"IF"},
    {tokenDec:154,tokenHex: 0x9A,token:"MVSPR"},
    {tokenDec:155,tokenHex: 0x9B,token:"LIST"},
    {tokenDec:156,tokenHex: 0x9C,token:"LET"},
    {tokenDec:157,tokenHex: 0x9D,token:"LLIST"},
    {tokenDec:158,tokenHex: 0x9E,token:"LOAD"},
    {tokenDec:159,tokenHex: 0x9F,token:"LPRINT"},
    {tokenDec:160,tokenHex: 0xA0,token:"SPRITE"},
    {tokenDec:161,tokenHex: 0xA1,token:"CTLSPR"},
    {tokenDec:162,tokenHex: 0xA2,token:"NODE"},
    {tokenDec:163,tokenHex: 0xA3,token:"NEW"},
    {tokenDec:164,tokenHex: 0xA4,token:"PAPER"},
    {tokenDec:165,tokenHex: 0xA5,token:"NODDY"},
    {tokenDec:166,tokenHex: 0xA6,token:"ON"},
    {tokenDec:167,tokenHex: 0xA7,token:"OUT"},
    {tokenDec:168,tokenHex: 0xA8,token:"PLOD"},
    {tokenDec:169,tokenHex: 0xA9,token:"PANEL"},
    {tokenDec:170,tokenHex: 0xAA,token:"GENPAT"},
    {tokenDec:171,tokenHex: 0xAB,token:"PAUSE"},
    {tokenDec:172,tokenHex: 0xAC,token:"PHI"},
    {tokenDec:173,tokenHex: 0xAD,token:"POKE"},
    {tokenDec:174,tokenHex: 0xAE,token:"RAND"},
    {tokenDec:175,tokenHex: 0xAF,token:"RETURN"},
    {tokenDec:176,tokenHex: 0xB0,token:"READ"},
    {tokenDec:177,tokenHex: 0xB1,token:"VIEW"},
    {tokenDec:178,tokenHex: 0xB2,token:"RESTORE"},
    {tokenDec:179,tokenHex: 0xB3,token:"ROM"},
    {tokenDec:180,tokenHex: 0xB4,token:"RUN"},
    {tokenDec:181,tokenHex: 0xB5,token:"SAVE"},
    {tokenDec:182,tokenHex: 0xB6,token:"SOUND"},
    {tokenDec:183,tokenHex: 0xB7,token:"EDITOR"},
    {tokenDec:184,tokenHex: 0xB8,token:"DSI"},
    {tokenDec:185,tokenHex: 0xB9,token:"PLOT"},
    {tokenDec:186,tokenHex: 0xBA,token:"STOP"},
    {tokenDec:187,tokenHex: 0xBB,token:"ANGLE"},
    {tokenDec:188,tokenHex: 0xBC,token:"SBUF"},
    {tokenDec:189,tokenHex: 0xBD,token:"VERIFY"},
    {tokenDec:190,tokenHex: 0xBE,token:"DRAW"},
    {tokenDec:191,tokenHex: 0xBF,token:"ARC"},
    {tokenDec:192,tokenHex: 0xC0,token:"CIRCLE"},
    {tokenDec:193,tokenHex: 0xC1,token:"LINE"},
    {tokenDec:194,tokenHex: 0xC2,token:"CODE"},
    {tokenDec:195,tokenHex: 0xC3,token:"ELSE"},
    {tokenDec:196,tokenHex: 0xC4,token:"FK"},
    {tokenDec:197,tokenHex: 0xC5,token:"OFF"},
    {tokenDec:198,tokenHex: 0xC6,token:"STEP"},
    {tokenDec:199,tokenHex: 0xC7,token:"THEN"},
    {tokenDec:200,tokenHex: 0xC8,token:"TO"},
    {tokenDec:201,tokenHex: 0xC9,token:"I"},
    {tokenDec:202,tokenHex: 0xCA,token:"J"},
    {tokenDec:203,tokenHex: 0xCB,token:"K"},
    {tokenDec:204,tokenHex: 0xCC,token:"L"},
    {tokenDec:205,tokenHex: 0xCD,token:"M"},
    {tokenDec:206,tokenHex: 0xCE,token:"N"},
    {tokenDec:207,tokenHex: 0xCF,token:"+"},
    {tokenDec:208,tokenHex: 0xD0,token:"-"},
    {tokenDec:209,tokenHex: 0xD1,token:"*"},
    {tokenDec:210,tokenHex: 0xD2,token:"/"},
    {tokenDec:211,tokenHex: 0xD3,token:"^"},
    {tokenDec:212,tokenHex: 0xD4,token:"="},
    {tokenDec:213,tokenHex: 0xD5,token:">"},
    {tokenDec:214,tokenHex: 0xD6,token:"<"},
    {tokenDec:215,tokenHex: 0xD7,token:">="},
    {tokenDec:216,tokenHex: 0xD8,token:"<="},
    {tokenDec:217,tokenHex: 0xD9,token:"<>"},
    {tokenDec:218,tokenHex: 0xDA,token:"AND"},
    {tokenDec:219,tokenHex: 0xDB,token:"OR"},
    {tokenDec:220,tokenHex: 0xDC,token:"NOT"},
    {tokenDec:221,tokenHex: 0xDD,token:"ABS"},
    {tokenDec:222,tokenHex: 0xDE,token:"ATN"},
    {tokenDec:223,tokenHex: 0xDF,token:"COS"},
    {tokenDec:224,tokenHex: 0xE0,token:"EXP"},
    {tokenDec:225,tokenHex: 0xE1,token:"FRE"},
    {tokenDec:226,tokenHex: 0xE2,token:"INT"},
    {tokenDec:227,tokenHex: 0xE3,token:"INT"},
    {tokenDec:228,tokenHex: 0xE4,token:"LN"},
    {tokenDec:229,tokenHex: 0xE5,token:"PEEK"},
    {tokenDec:230,tokenHex: 0xE6,token:"SGN"},
    {tokenDec:231,tokenHex: 0xE7,token:"SIN"},
    {tokenDec:232,tokenHex: 0xE8,token:"SQR"},
    {tokenDec:233,tokenHex: 0xE9,token:"TAN"},
    {tokenDec:234,tokenHex: 0xEA,token:"INP"},
    {tokenDec:235,tokenHex: 0xEB,token:"USR"},
    {tokenDec:236,tokenHex: 0xEC,token:"LN"},
    {tokenDec:237,tokenHex: 0xED,token:"ASC"},
    {tokenDec:238,tokenHex: 0xEE,token:"LEN"},
    {tokenDec:239,tokenHex: 0xEF,token:"VAL"},
    {tokenDec:240,tokenHex: 0xF0,token:"LN"},
    {tokenDec:241,tokenHex: 0xF1,token:"MOD"},
    {tokenDec:242,tokenHex: 0xF2,token:"PI"},
    {tokenDec:243,tokenHex: 0xF3,token:"RND"},
    {tokenDec:244,tokenHex: 0xF4,token:"PI"},
    {tokenDec:245,tokenHex: 0xF5,token:"CHR$"},
    {tokenDec:246,tokenHex: 0xF6,token:"SPK$"},
    {tokenDec:247,tokenHex: 0xF7,token:"INKEY$"},
    {tokenDec:248,tokenHex: 0xF8,token:"LEFT$"},
    {tokenDec:249,tokenHex: 0xF9,token:"MID$"},
    {tokenDec:250,tokenHex: 0xFA,token:"RIGHT$"},
    {tokenDec:251,tokenHex: 0xFB,token:"GR$"},
    {tokenDec:252,tokenHex: 0xFC,token:"STR$"},
    {tokenDec:253,tokenHex: 0xFD,token:"TIME$"},
    {tokenDec:254,tokenHex: 0xFE,token:"*"},
    {tokenDec:255,tokenHex: 0xFF,token:"EOL"}
];

        // =====================================================
        // CONVERSION FROM TEXT FILE TO HEXADECIMAL FILE SECTION
        // =====================================================

/**     CONVERT FROM text file (.BAS or .txt) to its Hexadecimal equivalent (.BAS or .mtx) file type.
        If no errors found, diags will be empty array
        Convert the MTX BASIC text file .BAS (if not text already) into the hexadecimal .mtx file format.
        ASK USER IF THEY WANT THIS TO HAPPEN?
        Save the .mtx file in the same folder as the original text/BAS file.
        File name to be same as text file but with .BAS extension.
        e.g. myprogram.txt or myprogram.bas  -> myprogram.mtx
        Only do this if diags is empty (no errors found).
        This functionality could be triggered by a command rather than automatic on save? YES
        Converting text to hexadecimal bytes is a separate function called by a function keybinding or command palette entry.
        This function would read the text file, convert to .mtx format and save as .mtx file.
        The user can then load the .mtx file into an MTX emulator or transfer to real MTX.
        CONVERSION PROCESS OUTLINED BELOW:
        1. Read the text file line by line.
        2. For each line, extract the line number and the BASIC code unless its part of a code block or noddy block as these do not have decimal line numbers.
        3. Convert the line number to a 2-byte little-endian hexadecimal representation (LSB/MSB).
        4. Tokenize the BASIC code according to MTX BASIC token specifications, none MTX BASIC commands are stored as ASCII characters 
        NOET: UPPER CASE except for text after REM command or within double quotes or part of a comment in a code block or Noddy page text which can be insensitive case.
        5. END of a MTX BASIC LINE (EOL) - add a 0xff byte, likewise for the end of a NODDY row. This doesn't apply for z80 assembly conversion in a codeblock, except at the end of the code block where MTX dorectives are designated, see rules at item 9).
        6. Convert each token and characters in the BASIC code line to its corresponding hexadecimal byte(s).
        7. Determine the number of bytes in the line (including line number and code bytes) and insert this length as a 2-byte hexadecimal value (LSB/MSB) before the line number.
        8. CODE blocks are handled by inserting the appropriate bytes for Z80 instructions as per MTX BASIC inline assembler rules, ie LD A,#0D becomes 3E 0D in the code block.
        9. Additional rules for processing MTX Assembler directives handling which are added at the end of each code block: 
        9a) Number definition
        <0x00>
        <decimal or hexadecimal number represented as ASCII characters> The hexadecimal number in MTX BASIC is prefixed with a # (hash) symbol
        Example, LD A,#0D would be represented in the main code block as 3E 0D and at the end of the by code block by 00 23 30 C4, where 00 is the token for number definition, 23 is ASCII for #, 30 is ASCII for 0 and C4 is ASCII for D with bit 7 set to indicate end of number
                after the number definition, there will be either 3 or 5 or 7 or etc bytes depending on how many times the numberis referenced in the code block. If only 3 bytes (see below) then the number has been discarded/not referenced.
        <type> & <number of bytes afterwards to track number of times the number is referenced> 
                3 types:
                a) byte (0x01) Note: pad bytes = 0x00 and 0x00 when type is byte
                b) word (0x00) &  n where n = 0x01 if one instance, 0x02 if two etc. Note: pad bytes = 0x00 when type is word
                c) relative jump, JR or DJ (0x00 0x00)  &  n = 0x01 if one instance, 0x02 if two etc. Note: no pad bytes when type is relative jump or for discards
        followed by:
        <ref offset, 2 bytes LSB/MSB> for each reference to the label in the code block, if only 0x00 and therefore three 0x00 bytes after the label ascii chars then label not referenced and can be discarded.
        {optional, pad 0x00 or 0x00 0x00 byte(s)  as types a) and c) use odd number of bytes for references}

        9b) NOT USED <0x01>
        9c)Label definition (ends with a colon :, however, to save a byte the colon is not stored but the last ASCII character has bit 7 set to indicate end of label)
        <0x02>
        <offset from code block starting hex address (2 bytes LSB/MSB)>
        <Label characters in ASCII, ends with the last character with bit 7 set to indicate end of label (variable length, 1 byte per character)>
        after the label definition, there will be either 3 or 5 or 7 or etc bytes depending on how many times the label is referenced in the code block. If only 3 bytes (see below) then the label has been discarded/not referenced.
        <type> & <number of bytes afterwards to track number of times the label is referenced> 
                3 types:
                a) byte (0x01) Note: pad bytes = 0x00 and 0x00 when type is byte
                b) word (0x00) &  n where n = 0x01 if one instance, 0x02 if two etc. Note: pad bytes = 0x00 when type is word
                c) relative jump, JR or DJ (0x00 0x00)  &  n = 0x01 if one instance, 0x02 if two etc. Note: no pad bytes when type is relative jump or for discards
        followed by:
        <ref offset, 2 bytes LSB/MSB> for each reference to the label in the code block, if only 0x00 and therefore three 0x00 bytes after the label ascii chars then label not referenced and can be discarded.
        {optional, pad 0x00 or 0x00 0x00 byte(s)  as types a) and c) use odd number of bytes for references}
                
        9d) Define Byte (DB) syntax <label:>DB <hex/dec> and/or "<ASCII characters>" and/or <label> separated by commas
        <0x03>
        <offset (2bytes)>
        <byte count>
        <length>
        <number (decimal or hexadecimal) represented as ASCII characters>
        9e) Define Word (DW) syntax <label:>DW <hex/dec> an/or <label>
        <0x04>
        <offset (2bytes)>
        <word count>
        <length>
        <number (decimal or hexadecimal) represented as ASCII characters>
        9f) Define Space (DS) syntax <label:>DW <hex/dec>
        <0x05>
        <offset (2bytes)>
        <byte count>
        <length>
        <number of bytes to reserve represented as ASCII characters> 
        Note DS is limited to 254 bytes maximum as 0xff is reserved for EOL
        9g) NOT USED <0x06>
        9h) NOT USED <0x07>
        9i) COMMENT syntax <;text>
        <0x08>
        <offset (2bytes)>
        <length>
        <comment text in ASCII characters> (see item 10 for space character handling)
        <0xff>
        9j) NOT USED <0x09>
        10. As space character is commonly used in text, it is represeented by a single byte 0x80 rather than the standard ASCII 0x20 to save space. so 1 space is represented as 0x81 and 4 consecutive spaces as 0x84. This is used in in REM, NODDY text pages and comments within code block COMMENTS.
        11. NODDY Block is handled by converting NODDY cammands and page text from ASCII to bytes, except for the space-compression
        13. The end of the program is marked by a special end-of-program marker consisting of typically two bytes: 0xff 0x08.
        14. Save the resulting byte sequence as a .BAS file in the same directory as the original text file.
  */      

/**
1) For simple opcodes, match the text with z80Cmds in column 1 (z80), read off the row and then read the opcode in column 0 and convert string to hex. 
   So LD E,A would find {opCode: "5F", z80: "LD E,A", length: 1}. The byte output will be 0x5F.
2) for complex opcodes which include numbers,  addresses, e.g.,  say   LD (#FA9E),A  Lookup the z80 column to find LD (XXXX),A ---> {opCode: "32 XXXX", z80: "LD (XXXX),A", length: 3}. 
   and then read off the opcode for this row, convert to hex and substitute XXXX with in this example #FA9E but as it byte value 0xFA9E. 
   The byte output will be 0x32 0x9E 0xFA where 16-bit values are stored in LSB/MSB format. 
3) Labels are handled similarly to item 2, except LABEL will be converted to an address, for example LD A,(COUNT) is same as LD A,(XXXX) ---> {opCode: "3A XXXX", z80: "LD A,(XXXX)", length: 3}. 
   Label count is found at #40B5 COUNT: DS 1 . LD A,(#4085) which gives a byte output of 0x33 0x85 0x40.
4) FIally, relative jumps JR and DJNZ re relative jumps in the decimal range  -128 to 127. For example, JR START  points to address 4052 START:  which means JR #4052 but as a relative jump,
   so if #402E JR START and START at #4052 then the relative jump forward in the case of 24 + 2 bytes for the JR command = 26. The output bytes are 0x18 0x1A (0x1A = 26 decimal).
*/

/**
the mtxtokens is also not converting BASIC commands like 10 CODE which would translate as
0x23 0x08 0x0a 0x00 0xc2 0xba 0x00
where 0x23 x08 refers to the length of the code block plus the BASIC statement 10 CODE and any MTX directives information, like numbers, labels, comments, etc
where 0x0a 0x00 refers to BASIC line number 10
where 0xc2 refers to the token number assigned to the BASIC command CODE (see const mtxToken, token)
where 0xba 0x00 refers to the actual byte length for the first code block (i.e. from 0x4007 to 0x40C1)

10 PRINT "TEST"
0x0C 0x00 = total line length in bytes
0x0A 0x00 = linenumber 
0x90 = token for PRINT
0x22 0x54 0x45 0x53 0x54 0x22 = ascii for "TEST"
0xff = end of line marker
for a codeblock its a lot more complex.
first 5 bytes are the same, except the token for CODE is 0xC2
the next 2 bytes are the length of the z80 opcodes.
if you subtract the total length - length of z80 opcodes + 7 gives the length of the MTX directives 
which is made up of directives like DB, DS and DW and ascii representation of labels, comments and numbers.
 */

/**
Unmatched will be due to labels, numbers or address which are specific in the code but in the z80 list, will be associated with XXXX, XX, YY or ZZ. The matching criteria needs to find all potential matches and then select the correct one from the list of matches.
for example LD A,(#FA9E). We know that its length will be >2 bytes as it has an address plus the z80 opcode. Searching for LD A,( results in 6 possible matches
1)  {opCode: "0A", z80: "LD A,(BC)", length: 1},
2) {opCode: "1A", z80: "LD A,(DE)", length: 1},
3) {opCode: "3A XXXX", z80: "LD A,(XXXX)", length: 3},
4) {opCode: "7E", z80: "LD A,(HL)", length: 1},
5) {opCode: "DD7E ZZ", z80: "LD A,(IX+ZZ)", length: 3},
6) {opCode: "FD7E ZZ", z80: "LD A,(IY+ZZ)", length: 3},

from the list items 3), 5) and 6) satisfies the length >2 criteria. Analysing #FA9E against the 3 potential matches confirms item 3) as a match
 */
 
        // =====================================================
        // CONVERSION FROM HEXADECIMAL FILE TO TEXT FILE SECTION
        // =====================================================

/**     CONVERT FROM hex file (.BAS or .mtx) to its text equivalent (.BAS or .txt) file type.
        currently this is carried out using a python tool. mtxTokens is called mtx_tokens_db in the python tool and doesn't include the tokenHex column and z80Cmds is called z80_mnemonics_db in the python tool
        /home/afw2/AFW_code/MTX/memu/afw/MTX_BASIC_to_text/MTX_BASIC_to_text/afw_read_mtx_file_v0.4d_WIP.py
*/


// for detailed processing of a code block - code line formats like labels, numbers, comments, db, dw, ds
type codeType = { // or setup as a interface?
  hexAddr:number; // hex address of start of code block (no #prefix required)
  labels?: string; // label definitions found in code block, ends with a colon (:). Labels are ascii characters (32 to 126).
  mnenomics: string; // convert (translate) z80 assembly mnenomics into z80 opcodes (hexadecimal bytes) found in code block
  numbers?: string; // number definitions found in code block, can be decimal or hexadecimal (must be prefixed with #) and converted to ascii characters (32 to 126)
  comments?: string; // comments found in code block, start with a semicolon (;). Comments are ascii characters (32 to 126).
  dbs?: string; // DB directives found in code block, e.g DB #0A, "HELLO", LABEL1
  dws?: string; // DW directives found in code block e.g. DW #1234, LABEL2
  dss?: string; // DS directives found in code block  e.g. DS 10 (reserve 10 bytes), range 0 to 254 only as 255 is reserved for EOL
}

// --- token helpers (keep existing mtxTokens above) ---
// tokens sorted by length (longest-first) + uppercase cache
const tokensSorted = mtxTokens
  .map(t => ({ token: t.token, tokenUpper: t.token.toUpperCase(), dec: t.tokenDec }))
  .sort((a,b) => b.token.length - a.token.length);
const maxTokenLen = tokensSorted.length ? Math.max(...tokensSorted.map(t=>t.token.length)) : 0;

// compress runs of spaces into 0x80 + runLength and otherwise emit ASCII bytes
function compressSpacesAndAscii(str: string): number[] {
  const bytes: number[] = [];
  let i = 0;
  while (i < str.length) {
    if (str[i] === ' ') {
      let j = i;
      while (j < str.length && str[j] === ' ') j++;
      let run = j - i;
      while (run > 0) {
        const chunk = Math.min(run, 127);
        bytes.push(0x80 + chunk);
        run -= chunk;
      }
      i = j;
    } else {
      bytes.push(str.charCodeAt(i));
      i++;
    }
  }
  return bytes;
}

// 1) BASIC tokenisation (returns code bytes including EOL 0xFF)
// - token matching: case-insensitive, longest-first
// - outside quotes and outside REM, letters are uppercased
// - inside quotes or after REM, original case preserved; space-compression applied

/**
 WIthin basicTokeniseLine function there will be 3 sub-sections
i) when REM NODDY is encountered --> CALL function convertNoddyBlock
ii) when CODE is encountered - setup the 3 length trackers (see 1-3 below) and CALL function processCodeBlock (see text below for a fuller explanation of this )
iii) BASIC line conversion (this part of the function appears to be functioning properly, so no additional changes required at this time)

when const line='10 CODE', basicTokeniseLine CORRECTLY returns [ 6, 0, 10, 0, 194, 255 ]. However, CODE is a special case because it is the placeholder for a code block. So whenever <linenumber> CODE is encountered, for example 100 CODE, it shoud return [ 8, 0, 100, 0, 194, 0 , 0, 255 ] in the first instance until the code block is processed.
a) the 2 extra bytes after 194 are placeholders for the actual assembly code which will be updated during the code block processing.
b) Also, the 1st 2 bytes are also placeholders as these will be updated with the assembly code bytes and any MTX directive bytes.
c) The assembly code and mtx directive bytes will be inserted before the 255 end of line/block marker.
So in the context of the basicTokeniseLine, make the changes so that it is 7 bytes in length + 1 for the EOL marker
create 3 length trackers

totalCodeLength (bytes 1 and 2 in LSB/MSB format) = 7 + totalOpcodeLength + totalMtxDirectiverLength + 1 (EOL)
totalOpcodeLength (bytes 6 and 7)
totalMtxDirectiverLength
Note: ensure the EOL marker is not duplicated at the end of the mtx directive processing.
*/ 

function basicTokeniseLine(line: string): number[] {
  // detect and strip leading line number (capture rest including newlines)
  const lnMatch = /^\s*(\d+)\s*([\s\S]*)$/.exec(line);
  let hasLineNumber = false;
  let lineNumber = 0;
  if (lnMatch) {
    hasLineNumber = true;
    lineNumber = parseInt(lnMatch[1], 10) || 0;
    line = lnMatch[2] || '';
  }

  const restFull = line.replace(/\r?\n$/, '');
  const restTrim = restFull.trim();

  const wrapWithLineHeader = (payloadBytes: number[]) => {
    const totalLength = 2 + 2 + payloadBytes.length;
    return [
      totalLength & 0xff, (totalLength >> 8) & 0xff,
      lineNumber & 0xff, (lineNumber >> 8) & 0xff,
      ...payloadBytes
    ];
  };

  // REM NODDY -> convertNoddyBlock
  if (/^\s*REM\b/i.test(restTrim) && /\bNODDY\b/i.test(restTrim)) {
    const remTok = tokensSorted.find(t => t.tokenUpper === 'REM')?.dec ?? 0x80;
    const afterRem = restFull.replace(/^\s*REM\s*/i, '');
    const idx = afterRem.toUpperCase().indexOf('NODDY');
    const noddyText = idx >= 0 ? afterRem.slice(idx + 5).trim() : '';
    const noddyBytes = convertNoddyBlock(noddyText ? [noddyText] : []);
    const payload = [remTok, ...noddyBytes, 0xFF];
    if (hasLineNumber) return wrapWithLineHeader(payload);
    return payload;
  }

  // CODE handling: accept CODE line followed by assembly lines (process only mnemonic part)
  if (/^\s*CODE(?:\b|$)/i.test(restTrim)) {
    const codeTok = tokensSorted.find(t => t.tokenUpper === 'CODE')?.dec ?? 0xC2;

    // split the rest into physical lines and find the line that contains CODE
    const linesArr = restFull.split(/\r?\n/);
    let codeLineIndex = -1;
    for (let idx = 0; idx < linesArr.length; idx++) {
      if (/^\s*CODE(?:\b|$)/i.test(linesArr[idx])) { codeLineIndex = idx; break; }
    }
    if (codeLineIndex < 0) codeLineIndex = 0;

    // get lines after the CODE line
    const rawCodeLines = linesArr.slice(codeLineIndex + 1);

    // Simplify each code line: remove leading addr, optional label:
    // If a trailing ';' comment exists, preserve it as a separate comment-only
    // line (prefixed with ';') so processCodeBlock will treat it as ASCII
    // comment bytes instead of allowing tokenisation.
    const codeLines = rawCodeLines.flatMap(l => {
      let s = l.replace(/\t/g, ' ').trim();
      if (!s) return [];
      s = s.replace(/^[0-9A-Fa-f]{1,4}\b\s*/,'');        // leading hex address (1-4 digits)
      s = s.replace(/^[A-Za-z][A-Za-z0-9]*:\s*/,'');    // leading LABEL:
      const semi = s.indexOf(';');
      if (semi >= 0) {
        const codePart = s.slice(0, semi).trim();
        const commentPart = s.slice(semi).trim(); // includes leading ';'
        const out: string[] = [];
        if (codePart) out.push(codePart);
        // ensure comment-only line starts with ';' so processCodeBlock detects it
        if (commentPart) out.push(commentPart.startsWith(';') ? commentPart : (';' + commentPart));
        return out;
      }
      return [s.trim()];
    }).filter(l => l.length > 0);

    // DEBUG: inspect what we will pass to processCodeBlock
    console.log('DEBUG basicTokeniseLine: restFull=', JSON.stringify(restFull));
    console.log('DEBUG basicTokeniseLine: linesArr=', linesArr);
    console.log('DEBUG basicTokeniseLine: rawCodeLines=', rawCodeLines);
    console.log('DEBUG basicTokeniseLine: codeLines=', codeLines);

    if (codeLines.length === 0) {
      const payloadPlaceholder = [codeTok, 0x00, 0x00, 0xFF];
      if (hasLineNumber) return wrapWithLineHeader(payloadPlaceholder);
      return payloadPlaceholder;
    }

    // ensure each code line has an explicit 1-4 hex address; if not, prefix with "0000 "
    const codeLinesForProcess = codeLines.map(l =>
      /^\s*[0-9A-Fa-f]{1,4}\b/.test(l) ? l : `0000 ${l}`
    );
    const codeBlockStr = codeLinesForProcess.join('\n');

    console.log('DEBUG basicTokeniseLine: codeBlockStr=', JSON.stringify(codeBlockStr));

    const { totalLength: opcodeLength, processedBytes } = processCodeBlock(codeBlockStr);

    const payload: number[] = [codeTok, opcodeLength & 0xff, (opcodeLength >> 8) & 0xff, ...processedBytes, 0xFF];
    if (hasLineNumber) return wrapWithLineHeader(payload);
    return payload;
  }

  // Standard BASIC tokenisation (unchanged behaviour)
  const bytes: number[] = [];
  let i = 0;
  let inQuote = false;
  const L = restFull.length;

  while (i < L) {
    if (inQuote) {
      let j = i;
      while (j < L && restFull[j] !== '"') j++;
      const chunk = restFull.substring(i, j);
      bytes.push(...compressSpacesAndAscii(chunk));
      if (j < L && restFull[j] === '"') {
        bytes.push(0x22);
        inQuote = false;
        i = j + 1;
      } else {
        i = j;
      }
      continue;
    }

    let matched = false;
    const remaining = L - i;
    for (const tk of tokensSorted) {
      const tlen = tk.token.length;
      if (tlen > remaining) continue;
      const substr = restFull.substring(i, i + tlen);
      if (substr === tk.token || substr.toUpperCase() === tk.tokenUpper) {
        bytes.push(tk.dec);
        i += tlen;
        matched = true;

        if (tk.tokenUpper === 'REM') {
          if (i < L) {
            const restText = restFull.substring(i);
            bytes.push(...compressSpacesAndAscii(restText));
          }
          i = L;
        } else {
          if (i < L && restFull[i] === ' ') {
            if (/^[A-Z]+\$?$/.test(tk.tokenUpper)) i++;
          }
        }
        break;
      }
    }
    if (matched) continue;

    const ch = restFull[i];
    if (ch === '"') {
      bytes.push(0x22);
      inQuote = true;
      i++;
      continue;
    }
    const code = restFull.charCodeAt(i);
    if (code >= 97 && code <= 122) bytes.push(code - 32);
    else bytes.push(code);
    i++;
  }

  bytes.push(0xFF);
  if (hasLineNumber) return wrapWithLineHeader(bytes);
  return bytes;
}

/**
 * 2) CODE-block assembly conversion to opcode bytes (improved)
 * - Uses parseZ80Line and z80 command table to generate real opcode bytes.
 * - Supports DB/DW/DS directives, comments starting with ';', and common immediate formats.
 */

function processCodeBlock(codeBlock: string, baseAddr = 0x0000): { totalLength: number; processedBytes: number[] } {
  const processedBytes: number[] = [];
  const parsedLines: any[] = [];
  const labelMap: Record<string, number> = {};

  const lines = codeBlock.split(/\r?\n/).map(l => l.replace(/\t/g, ' ').replace(/\r?\n$/, ''));

  // First pass: parse lines, discover labels and compute offsets
  let offset = 0;
  for (const rawLine of lines) {
    const raw = (rawLine || '').trim();
    if (!raw) continue;
    if (raw.startsWith(';')) {
      parsedLines.push({ raw, isComment: true });
      continue;
    }

    let parsed: any = null;
    if (typeof parseZ80Line === 'function') parsed = parseZ80Line(raw, 0) || null;

    // tolerant fallbacks: explicit address, or label:directive, or mnemonic-only
    if (!parsed) {
      // case: "0000 LD A,(#FA9E)"
      const mAddr = /^\s*([0-9A-Fa-f]{1,4})\b\s*(.*)$/.exec(raw);
      if (mAddr) {
        const addrRaw = mAddr[1].toUpperCase().padStart(4, '0');
        parsed = { address: addrRaw, raw };
        let working = mAddr[2].trim();

        const colonIdx = working.indexOf(':');
        if (colonIdx >= 0) {
          const cand = working.slice(0, colonIdx).trim();
          if (/^[A-Za-z][A-Za-z0-9]*$/.test(cand)) parsed.label = cand.toUpperCase();
          working = working.slice(colonIdx + 1).trim();
        }

        const dirMatch = /^(DB|DW|DS)\s+(.*)$/i.exec(working);
        if (dirMatch) {
          parsed.isDirective = true;
          parsed.directiveType = dirMatch[1].toUpperCase();
          parsed.directiveValue = dirMatch[2].trim();
        } else {
          const spaceIdx = working.search(/\s/);
          if (spaceIdx === -1) parsed.mnemonic = working.toUpperCase();
          else {
            parsed.mnemonic = working.slice(0, spaceIdx).toUpperCase();
            const ops = working.slice(spaceIdx).trim();
            if (ops) parsed.operands = splitOperands(ops);
          }
        }
      } else {
        // case: "LABEL: LD A,(#FA9E)"  OR  "LD A,(#FA9E)" (mnemonic-only)
        let working = raw;
        const lblMatch = /^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(working);
        if (lblMatch) {
          parsed = { raw };
          parsed.label = lblMatch[1].toUpperCase();
          working = (lblMatch[2] || '').trim();
        }

        const dirMatch2 = /^(DB|DW|DS)\s+(.*)$/i.exec(working);
        if (dirMatch2) {
          parsed = parsed || { raw };
          parsed.isDirective = true;
          parsed.directiveType = dirMatch2[1].toUpperCase();
          parsed.directiveValue = dirMatch2[2].trim();
        } else {
          const instMatch = /^\s*([A-Za-z]+)(?:\s+(.*))?$/.exec(working);
          if (instMatch) {
            parsed = parsed || { raw };
            parsed.mnemonic = instMatch[1].toUpperCase();
            if (instMatch[2]) parsed.operands = splitOperands(instMatch[2].trim());
          } else {
            parsedLines.push({ raw, isUnparsed: true });
            continue;
          }
        }
      }
    }

    // compute offset from explicit address if provided
    if (parsed && parsed.address) {
      const addrNum = parseInt(parsed.address, 16);
      if (!Number.isNaN(addrNum)) offset = Math.max(0, addrNum - baseAddr);
    }
    parsed._offset = offset;
    if (parsed.label) labelMap[parsed.label.toUpperCase()] = offset;

    // estimate instruction/directive length
    let instrLen = 0;
    if (parsed.isDirective) {
      if (parsed.directiveType === 'DB') instrLen = (parsed.directiveValue || '').length;
      else if (parsed.directiveType === 'DW') instrLen = 2;
      else if (parsed.directiveType === 'DS') instrLen = parseInt(parsed.directiveValue || '0', 10) || 0;
    } else if (parsed.mnemonic) {
      const instr = parsed.mnemonic;
      const ops = parsed.operands || [];
      const best = findBestZ80Match(instr, ops);
      if (best && best.opCode) {
        const parts = best.opCode.split(/\s+/).filter(Boolean);
        instrLen = parts.reduce((acc: number, p: string) => acc + (/\bXXXX\b/i.test(p) ? 2 : 1), 0);
      } else if (best && typeof best.length === 'number') instrLen = best.length;
      else instrLen = 1;
    }

    parsedLines.push(parsed);
    offset += instrLen;
  }

  // Second pass: emit opcode bytes
  let totalOpcodeLength = 0;
  for (const p of parsedLines) {
    if (p.isComment || p.isUnparsed) continue;
    if (p.isDirective) continue;
    if (!p.mnemonic) continue;

    const instr = p.mnemonic;
    const operands = p.operands || [];
    const best = findBestZ80Match(instr, operands);
    if (!best) {
      console.warn('No Z80 opcode match for line:', p.raw || instr);
      continue;
    }

    const bytesForInstr = opCodePatternToBytes(best.opCode, p, labelMap);
    processedBytes.push(...bytesForInstr);
    totalOpcodeLength += bytesForInstr.length;
  }

  return { totalLength: totalOpcodeLength, processedBytes };
}

function assembleCodeBlock(lines: string[], baseAddr = 0x4000): number[] {
  // Two-pass: 1) parse lines and collect labels/addresses; 2) emit bytes with labels resolved
  const bytes: number[] = [];
  const parsedLines: Array<any> = [];
  const labelMap: Record<string, number> = {};

  // First pass: parse and determine addresses
  let currentAddress = baseAddr;
  for (const rawLine of lines) {
    const line = rawLine.replace(/\r?\n$/, '');
    const trimmed = line.trim();
    if (!trimmed) continue;

    // comment-only lines
    if (trimmed.startsWith(';')) {
      parsedLines.push({ raw: line, isComment: true });
      continue;
    }

    const parsed: any = parseZ80Line(line, 0) || { raw: line };
    // if parse found an explicit address, use it
    if (parsed.address) {
      currentAddress = parseInt(parsed.address, 16);
    }
    parsed._address = currentAddress;
    // record label definition
    if (parsed.label) labelMap[parsed.label.toUpperCase()] = currentAddress;

    // determine length
    let instrLen = 0;
    if (parsed.isDirective) {
      const d = parsed.directiveType;
      const val = parsed.directiveValue || '';
      if (d === 'DB') {
        const v = val.trim();
        if (v.startsWith('\"') && v.endsWith('\"')) {
          instrLen = v.slice(1, -1).length;
        } else {
          instrLen = 1;
        }
      } else if (d === 'DW') {
        instrLen = 2;
      } else if (d === 'DS') {
        instrLen = parseInt(parsed.directiveValue || '0', 10) || 0;
      }
    } else if (parsed.mnemonic) {
      const bestMatch = findBestZ80Match(parsed.mnemonic, parsed.operands || []);
      instrLen = bestMatch ? bestMatch.length : 1;
    }

    parsedLines.push(parsed);
    currentAddress += instrLen;
  }

  // Second pass: emit bytes
  for (const p of parsedLines) {
    if (p.isComment) {
      bytes.push(...compressSpacesAndAscii(p.raw.substring(p.raw.indexOf(';') + 1)));
      bytes.push(0xFF);
      continue;
    }
    const parsed: any = p;
    if (!parsed.mnemonic && !parsed.isDirective) continue;

    if (parsed.isDirective) {
      const d = parsed.directiveType;
      const val = parsed.directiveValue || '';
      if (d === 'DB') {
        const v = val.trim();
        if (v.startsWith('\"') && v.endsWith('\"')) {
          const s = v.slice(1, -1);
          for (let k = 0; k < s.length; k++) bytes.push(s.charCodeAt(k));
        } else {
          bytes.push(parseImmediateOperand(v) & 0xff);
        }
      } else if (d === 'DW') {
        const vv = parseImmediateOperand(val) || 0;
        bytes.push(vv & 0xff, (vv >> 8) & 0xff);
      } else if (d === 'DS') {
        const count = parseInt(parsed.directiveValue || '0', 10) || 0;
        for (let n = 0; n < count; n++) bytes.push(0x00);
      }
      continue;
    }

    // instructions
    const instr = typeof normalizeInstruction === 'function'
      ? normalizeInstruction(parsed.mnemonic || '', parsed.operands || [])
      : null;
    let cmd: any = null;
    if (instr && Array.isArray(z80Cmds)) {
      for (const c of z80Cmds) {
        const norm = c.z80.toUpperCase().replace(/\s+/g, ' ').replace(/,\s*/g, ',').trim();
        if (norm === (instr || '').toUpperCase()) { cmd = c; break; }
      }
    }
    if (!cmd) {
      const placeholder = typeof normalizeInstruction === 'function'
        ? normalizeInstruction(parsed.mnemonic || '', parsed.operands || [])
        : null;
      if (placeholder && Array.isArray(z80Cmds)) {
        for (const c of z80Cmds) {
          const norm2 = c.z80.toUpperCase().replace(/\s+/g, ' ').replace(/,\s*/g, ',').trim();
          if (norm2 === placeholder.toUpperCase()) { cmd = c; break; }
        }
      }
    }

    if (cmd) {
      console.log('Normalized instruction:', instr);
      console.log('Matching against:', cmd.z80, 'Normalized:', instr);
      bytes.push(...opCodePatternToBytes(cmd.opCode, parsed, labelMap));
    }
  }

  return bytes;
}

/**
 * Enhanced matching logic for Z80 instructions in CODE blocks.
 * This update ensures that all potential matches are considered and the correct one is selected based on criteria like length and address patterns.
 */
function findBestZ80Match(instruction: string, operands: string[]): any {
  const potentialMatches = z80Cmds.filter(cmd => {
    const normalizedCmd = cmd.z80.toUpperCase().replace(/\s+/g, ' ').replace(/,\s*/g, ',').trim();
    const normalizedInstr = normalizeInstruction(instruction, operands).toUpperCase();
    return normalizedCmd.startsWith(normalizedInstr);
  });

  if (potentialMatches.length === 0) {
    console.warn(`No matches found for instruction: ${instruction} ${operands.join(', ')}`);
    return null;
  }

  // Select the best match based on length and operand patterns
  const bestMatch = potentialMatches.find(cmd => {
    if (cmd.length > 2 && operands.some(op => /#?[0-9A-F]+/i.test(op))) {
      return true;
    }
    return false;
  });

  return bestMatch || potentialMatches[0]; // Default to the first match if no specific criteria are met
}

// 3) NODDY block conversion (lines are plain text at end of listing, terminated with 0x0A per line)
function convertNoddyBlock(lines: string[]): number[] {
  const bytes: number[] = [];
  for (const rawLine of lines) {
    const content = rawLine.replace(/\r?\n$/, '');
    bytes.push(...compressSpacesAndAscii(content));
    bytes.push(0x0A); // NODDY line ending
  }
  return bytes;
}

// Updated orchestrator: convertTextToHex uses the three functions above
function convertTextToHex(docText: string): number[] {
  const lines = docText.split(/\r?\n/);
  let output: number[] = [];

  for (const line of lines) {
    const match = /^\s*(\d+)\s*(.*)$/.exec(line);
    if (!match) continue;

    const lineNum = parseInt(match[1], 10);
    const codeText = match[2].trim();

    if (codeText.toUpperCase() === 'CODE') {
      // Handle CODE block
      const codeToken = 0xC2;
      const codeLines = lines.slice(lines.indexOf(line) + 1);
      const blockBytes = assembleCodeBlock(codeLines);
      const blockLength = blockBytes.length;

      // Calculate MTX directives length
      const totalLength = 7 + blockLength; // 7 bytes header + block length
      const mtxDirectivesLength = totalLength - blockLength - 7;

      // Emit bytes
      output.push(totalLength & 0xff, (totalLength >> 8) & 0xff); // Total length
      output.push(lineNum & 0xff, (lineNum >> 8) & 0xff); // Line number
      output.push(codeToken); // CODE token
      output.push(blockLength & 0xff, (blockLength >> 8) & 0xff); // Block length
      output = output.concat(blockBytes); // Z80 opcodes
      output.push(mtxDirectivesLength & 0xff, (mtxDirectivesLength >> 8) & 0xff); // MTX directives length
    } else {
      // Handle simple MTX BASIC line
      const codeBytes = basicTokeniseLine(codeText);

      // Special case: USER SAVE or USER LOAD
      if (/^USER\s+(SAVE|LOAD)/i.test(codeText)) {
        const tokens = codeText.split(/\s+/);
        const userToken = basicTokeniseLine(tokens[0]); // USER
        const secondToken = basicTokeniseLine(tokens[1]); // SAVE or LOAD
        const remainingText = tokens.slice(2).join(' ');
        const remainingBytes = basicTokeniseLine(remainingText);

        const totalLength = 2 + userToken.length + secondToken.length + remainingBytes.length + 1;

        // Emit bytes
        output.push(totalLength & 0xff, (totalLength >> 8) & 0xff); // Total length
        output.push(lineNum & 0xff, (lineNum >> 8) & 0xff); // Line number
        output = output.concat(userToken, secondToken); // USER and SAVE/LOAD tokens
        output = output.concat(remainingBytes); // Remaining text
        output.push(0xff); // End of line marker
        continue;
      }

      const totalLength = 2 + codeBytes.length + 1; // 2 bytes for line number, code bytes, and end marker

      // Emit bytes
      output.push(totalLength & 0xff, (totalLength >> 8) & 0xff); // Total length
      output.push(lineNum & 0xff, (lineNum >> 8) & 0xff); // Line number
      output = output.concat(codeBytes); // Tokenized code
      output.push(0xff); // End of line marker
    }
  }

  output.push(0xff, 0xff); // Program terminator
  return output;
}

// helper: parse numeric operand (#hex or decimal)
function parseImmediateOperand(op: string | undefined): number {
  if (!op) return 0;
  op = op.trim();
  if (/^[#£]/.test(op)) return parseInt(op.slice(1), 16) || 0;
  if (/^0x/i.test(op)) return parseInt(op, 16) || 0;
  if (/^[0-9]+$/.test(op)) return parseInt(op, 10) || 0;
  return 0; // label/unknown -> 0 (labels would need two-pass)
}

function opCodePatternToBytes(opCodePattern: string, parsed: any, labelMap?: Record<string, number>): number[] {
  const parts = opCodePattern.split(/\s+/).filter(Boolean);
  const out: number[] = [];
  const operands: string[] = parsed.operands || [];
  let opIdx = 0;

  const isRegisterLike = (s: string) => {
    if (!s) return false;
    const u = s.toUpperCase().trim();
    const regs = new Set([
      'A','B','C','D','E','H','L','I','R',
      "AF","BC","DE","HL","SP","IX","IY","AF'",
      'NZ','Z','NC','C','PO','PE','P','M'
    ]);
    if (/^\(.+\)$/.test(u)) return false;
    return regs.has(u);
  };

  const findNextValueOperandIndex = (start: number) => {
    let idx = start;
    while (idx < operands.length && isRegisterLike(operands[idx])) idx++;
    return idx;
  };

  const stripParens = (s: string) => (s || '').trim().replace(/^\(|\)$/g, '').trim();

  for (const p of parts) {
    if (p === 'XX' || p === 'N' || p === 'ZZ') {
      opIdx = findNextValueOperandIndex(opIdx);
      const rawOp = operands[opIdx++] || '';
      const opStr = stripParens(rawOp);
      let v = parseImmediateOperand(opStr);
      if ((/^[A-Za-z][A-Za-z0-9]*$/).test(opStr.trim())) {
        const lab = opStr.toUpperCase();
        if (labelMap && typeof labelMap[lab] === 'number') v = labelMap[lab];
      }
      out.push(v & 0xff);
    } else if (p === 'XXXX') {
      opIdx = findNextValueOperandIndex(opIdx);
      const rawOp2 = operands[opIdx++] || '';
      const opStr2 = stripParens(rawOp2);
      let v2 = parseImmediateOperand(opStr2);
      if ((/^[A-Za-z][A-Za-z0-9]*$/).test(opStr2.trim())) {
        const lab2 = opStr2.toUpperCase();
        if (labelMap && typeof labelMap[lab2] === 'number') v2 = labelMap[lab2];
      }
      out.push(v2 & 0xff, (v2 >> 8) & 0xff);
    } else if (/^[0-9A-Fa-f]{2}$/.test(p)) {
      out.push(parseInt(p, 16));
    } else {
      const maybe = parseInt(p, 16);
      if (!Number.isNaN(maybe)) out.push(maybe & 0xff);
    }
  }
  return out;
}

function processMTXDirectives(directives: string[]): number {
    let totalDirectiveLength = 0;

    directives.forEach((directive) => {
        if (directive.startsWith("<0x00>")) {
            // Number definition
            totalDirectiveLength += 3; // Example: Adjust based on actual directive length
        } else if (directive.startsWith("<0x02>")) {
            // Label definition
            totalDirectiveLength += 5; // Example: Adjust based on actual directive length
        } else if (directive.startsWith("<0x03>")) {
            // Define Byte (DB)
            totalDirectiveLength += 4; // Example: Adjust based on actual directive length
        } else if (directive.startsWith("<0x04>")) {
            // Define Word (DW)
            totalDirectiveLength += 6; // Example: Adjust based on actual directive length
        } else if (directive.startsWith("<0x05>")) {
            // Define Space (DS)
            totalDirectiveLength += 2; // Example: Adjust based on actual directive length
        } else if (directive.startsWith("<0x08>")) {
            // Comment
            totalDirectiveLength += directive.length; // Example: Adjust based on actual directive length
        }
    });

    return totalDirectiveLength;
}



function updateCodeBlockLength(codeBlock: string, directives: string[]): { totalLength: number; processedBytes: number[] } {
    const { totalLength: opcodeLength, processedBytes } = processCodeBlock(codeBlock);
    const directiveLength = processMTXDirectives(directives);

    const totalLength = opcodeLength + directiveLength;

    return { totalLength, processedBytes };
}


function refineConvertTextToHex(line: string): number[] {
    const lineNumber = parseInt(line.split(' ')[0], 10);
    const command = line.split(' ')[1];

    if (command === 'CODE') {
        // Extract the code block (everything after the command)
        const codeBlock = line.split('CODE')[1].trim();

        // Dynamically calculate the length of the Z80 opcodes in the code block
        const { totalLength: codeBlockLength, processedBytes } = processCodeBlock(codeBlock);

        // Extract and calculate the length of the MTX directives
        const directives = extractMTXDirectives(codeBlock); // Implement directive extraction
        const directiveLength = processMTXDirectives(directives);

        // Calculate the total length dynamically
        const totalLength = 7 + codeBlockLength + directiveLength;

        return [
            totalLength & 0xFF, (totalLength >> 8) & 0xFF, // Total length
            lineNumber & 0xFF, (lineNumber >> 8) & 0xFF, // Line number
            0xC2, // Token for CODE
            codeBlockLength & 0xFF, (codeBlockLength >> 8) & 0xFF, // Code block length
            ...processedBytes, // Z80 opcodes
            0xFF // End of line marker
        ];
    }

    return []; // Default case
}

function extractMTXDirectives(codeBlock: string): string[] {
    // Placeholder: Implement logic to extract MTX directives from the code block
    return [];
}

export { mtxTokens,
    convertTextToHex,
    assembleCodeBlock,
    basicTokeniseLine,
    refineConvertTextToHex,
    compressSpacesAndAscii,
    findBestZ80Match,
    convertNoddyBlock,
    parseImmediateOperand,
    opCodePatternToBytes,
    processMTXDirectives,
    processCodeBlock,
    updateCodeBlockLength,
    extractMTXDirectives
 };