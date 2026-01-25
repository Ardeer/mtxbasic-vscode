/** 
    MTX BASIC system variables that are SAVED to tape or disc
    AF Wilson
    14-Jan-2026
    v0.1
*/

/**
    The MTX header will be inserted before the main BASIC program data when saving to tape or disc. It doesn't change the BASIC starting address used in extension.ts 
    but will update "Command: save converted HEX bytes from active editor" in extension.ts file to add the header before saving the .mtx file.
    MTX tape header is constructed as follows:
    byte 0: 0xFF
    bytes 1-15: tape or file name with pad bytes (0x20) to make up 15 bytes. 
    NOTE: if name is gteater than 16 bytes it is truncated to 16 bytes and typically .mtx is not recorded in the 1st 16 bytes but included in the name (a function of the MEMU emulator)
    bytes 16-17: read marker descriptor (LSB/MSB format), e.g. 0xf2 0xf8
    - essentially search for these two bytes again and this plus the 3 bytes before it (typically 0x00 0x00 0xx00) are the start of the system variables below
    bytes 18 onwards are typically 0x00's until byte 16/17 match pair is found (see above). 
    The number of bytes between the first occurrence of the read marker descriptor and the second occurrence is variable, is typically after a further 353 bytes but sometimes a lot more.
    typical header length is 619 bytes
    16 bytes: tape or file name plus padding (0x20)
    2 bytes: read marker descriptor (e.g. 0xf2 0xf8)
    350 bytes: padding (typically 0x00)
    3 bytes: 0x00 0x00 0x00
    2 bytes: read marker descriptor (e.g. 0xf2 0xf8)
    246 (=251-5) bytes: system variables (see below, note: 3 0x00s and the 2 read markers are already counted as part of the system variables)
    TOTAL 619 bytes
*/

/**
    The header information is required to create a valid file for running on a MTX computer or emulator such as MEMU.
    The filename is uppercase and must start with a letter, can contain ASCII letters and numbers only with a fullstop (.) before the file type extension.
    MTX BASIC programs are normally saved using the .BAS extension but modern convention is to use the lowercase .mtx extension for programs.
    However, historical mTX BASIC programs will often use the .BAS extension. So both are acceptable. System variables are not saved separately but as part of a BASIC program save.
    The MTX BASIC VS Code extension uses the .mtx extension for BASIC programs.
 */

/** 
    mtx system variable saved to tape only, refer Memotech owners manual, appendix 5
    addresses (2 bytes) are stored in reverse order, ie 0x5A (LSB) 0x40 (MSB) is adrress 0x405A
    BETWEEN 0xfb4b (64331) and 0xfa50 (64080) = 251 bytes (see const sysVarSaved below)
    NOTE: when writing assembly language
    on MTX the following hexadecimal prefix was used # or £ (depending on the keymap, use # in VS code extension on MEMU)
    so when converting mtx assembly language typically use shift F3 to get hexadecimal prefix #
*/

/** 
    const sysVarSaved sysVal column contains the default hexadecimal value stored when the MTX512 is first switched on, 
    The default system variables information (sysVal) will be used and most likely system variable changes noted below will be updated when saving to tape.
    the following information will be provided for updating the system variables saving amongs other things (NOTE: displacements from FA50 in decimal):
    LSTPG at 0xFA7A (+42 displacement from start of sys_var)= number of 32K pages (0x00 for MTX500 and 0x01 for MTX512)
	TOP of fresspace, STKLIM/STKLIM_1 found at + 66 & 67 displacement from start of sys_var => 0xFA92 & 0xFA93 (typically same as read marker descriptor bytes, e.g. 0xF2 0xF8)
    TOP (or END) OF NODDY, NBTOP/NBTOP_1 found at + 84 & 85 displacement from start of sys_var => 0xFAA4 & 0xFAA5 (if no NODDY this will be same as the TOP of BASIC)
	TOP OF NODDY PAGE , NBTPG found at + 86 displacement from start of sys_var => 0xFAA6, typically 0x00.
    TOP (or END) of BASIC, BASTOP/BASTOP_1 found at  + 87 & 88 displacement from start of sys_var => 0xFAA7 & 0xFAA8
    Top of BASIC page, BASTPG found at + 89 displacement from start of sys_var => 0xFAA9, typically 0x00.
    Bottom (or START) of BASIC, BASBOT/BASBOT_1 found at + 90 & 91 displacement from start of sys_var => 0xFAAA & 0xFAAB ,typically 0x00 0x40 for MTX512 or 0x00 0x80 for MTX500.
    TOP of each BASIC page, BASTPO/BASTPO_1 etc found at + 92 onwards displacement from start of sys_var => 0xFAAC onwards (up to 31 pages), BASTPO/BASTPO_1 typically same as NBTOP/NBTOP_1)
	TOP of ARRAYS, ARRTOP/ARRTOP_1/ARRTOP_2 found at + 123,124,125 displacement from start of sys_var => 0xFACC, 0xFACD, 0xFACE
    Start of BASIC, BASELIN/BASELIN_1 found at + 126 & 127 displacement from start of sys_var => 0xFAD0 & 0xFAD1 ,typically 0x00 0x40 for MTX512 or 0x00 0x80 for MTX500)
    PGTOP/PGTOP_1 found at + 134 & 135 displacement from start of sys_var => 0xFAD6 & 0xFAD7 ,typically same as BASTOP/BASTOP_1
    GOSUB STACK, GOSTACK/GOSTACK_1 etc found at + 136 onwards displacement from start of sys_var => 0xFAD8 onwards (up to 84 bytes)
    DESAVE/DESAVE_1 found at + 250 & 251 displacement from start of sys_var => 0xFB4A & 0xFB4B
*/

let mtxFilename: string = "              "; //default filename for MTX programs saved to tape. Maxium 16 characters including extension. Will be truncated if longer. If less than 16 characters padded with 0x20 (space) bytes.
const readMarkerDescriptor: number[] = [0xF2, 0xF8]; //read marker descriptor bytes used in MTX tape/file header
const hdrPadByte: number = 0x00; //padding byte used in MTX tape/file header
const hdrPadByteLength: number = 350; //number of padding bytes used in MTX tape/file header (default 350)
const hdrTotalBytes: number = 619; //total number of bytes in MTX tape/file header (default 619)
let createHdr:number[] = []; //array to hold the MTX tape/file header bytes. To be exported for use in extension.ts

// sysVal contains the default hexadecimal value stored when the MTX512 is first switched on, for reference.
const sysVarSaved: {hexVal: number, sysName: string, sysVal:number}[] = [ 
    {hexVal:0xFA50,sysName:"SYS_START",sysVal:0x00}, // FA50 sysVal=0x00
    {hexVal:0xFA51,sysName:"SND_Env_buf",sysVal:0x00}, //top of envelope buffers for sound
    {hexVal:0xFA52,sysName:"CTRBADR",sysVal:0x00}, //control buffers for sound (10 bits/channel)
    {hexVal:0xFA53,sysName:"CTRBADR_1",sysVal:0xF2},
    {hexVal:0xFA54,sysName:"CTRBADR_2",sysVal:0xF8},
    {hexVal:0xFA55,sysName:"CTRBADR_3",sysVal:0x02},
    {hexVal:0xFA56,sysName:"CTRBADR_4",sysVal:0x00},
    {hexVal:0xFA57,sysName:"CTRBADR_5",sysVal:0x00},
    {hexVal:0xFA58,sysName:"CTRBADR_6",sysVal:0x00},
    {hexVal:0xFA59,sysName:"CTRBADR_7",sysVal:0x00},
    {hexVal:0xFA5A,sysName:"CTRBADR_8",sysVal:0x00},
    {hexVal:0xFA5B,sysName:"CTRBADR_9",sysVal:0x00},
    {hexVal:0xFA5C,sysName:"CTRBADR_10",sysVal:0x00},
    {hexVal:0xFA5D,sysName:"CTRBADR_11",sysVal:0x0A},
    {hexVal:0xFA5E,sysName:"CTRBADR_12",sysVal:0xF9},
    {hexVal:0xFA5F,sysName:"CTRBADR_13",sysVal:0x02},
    {hexVal:0xFA60,sysName:"CTRBADR_14",sysVal:0x00},
    {hexVal:0xFA61,sysName:"CTRBADR_15",sysVal:0x00},
    {hexVal:0xFA62,sysName:"CTRBADR_16",sysVal:0x00},
    {hexVal:0xFA63,sysName:"CTRBADR_17",sysVal:0x00},
    {hexVal:0xFA64,sysName:"CTRBADR_18",sysVal:0x00},
    {hexVal:0xFA65,sysName:"CTRBADR_19",sysVal:0x00},
    {hexVal:0xFA66,sysName:"CTRBADR_20",sysVal:0x00},
    {hexVal:0xFA67,sysName:"CTRBADR_21",sysVal:0x22},
    {hexVal:0xFA68,sysName:"CTRBADR_22",sysVal:0xF9},
    {hexVal:0xFA69,sysName:"CTRBADR_23",sysVal:0x02},
    {hexVal:0xFA6A,sysName:"CTRBADR_24",sysVal:0x00},
    {hexVal:0xFA6B,sysName:"CTRBADR_25",sysVal:0x00},
    {hexVal:0xFA6C,sysName:"CTRBADR_26",sysVal:0x00},
    {hexVal:0xFA6D,sysName:"CTRBADR_27",sysVal:0x00},
    {hexVal:0xFA6E,sysName:"CTRBADR_28",sysVal:0x00},
    {hexVal:0xFA6F,sysName:"CTRBADR_29",sysVal:0x00},
    {hexVal:0xFA70,sysName:"CTRBADR_30",sysVal:0x00},
    {hexVal:0xFA71,sysName:"CTRBADR_31",sysVal:0x3A},
    {hexVal:0xFA72,sysName:"CTRBADR_32",sysVal:0xF9},
    {hexVal:0xFA73,sysName:"CTRBADR_33",sysVal:0x02},
    {hexVal:0xFA74,sysName:"CTRBADR_34",sysVal:0x00},
    {hexVal:0xFA75,sysName:"CTRBADR_35",sysVal:0x00},
    {hexVal:0xFA76,sysName:"CTRBADR_36",sysVal:0x00},
    {hexVal:0xFA77,sysName:"CTRBADR_37",sysVal:0x00},
    {hexVal:0xFA78,sysName:"CTRBADR_38",sysVal:0x00},
    {hexVal:0xFA79,sysName:"CTRBADR_39",sysVal:0x00},
    {hexVal:0xFA7A,sysName:"LSTPG",sysVal:0x01}, //number of 32K pages (00 for MTX500 and 01 for MTX512)
    {hexVal:0xFA7B,sysName:"VARNUM",sysVal:0x00}, //bottom of variable names
    {hexVal:0xFA7C,sysName:"VARNUM_1",sysVal:0xC0},
    {hexVal:0xFA7D,sysName:"VALBOT",sysVal:0x01}, //bottom of variable values
    {hexVal:0xFA7E,sysName:"VALBOT_1",sysVal:0xC0},
    {hexVal:0xFA7F,sysName:"CALCBOT",sysVal:0x01}, //bottom of calculator stack
    {hexVal:0xFA80,sysName:"CALCBOT_1",sysVal:0xC0},
    {hexVal:0xFA81,sysName:"CALCST",sysVal:0x01}, //top of calculator stack
    {hexVal:0xFA82,sysName:"CALCST_1",sysVal:0xC0},
    {hexVal:0xFA83,sysName:"KBDBUF",sysVal:0x4B},//address of keyboard buffer
    {hexVal:0xFA84,sysName:"KBDBUF_1",sysVal:0xFB},
    {hexVal:0xFA85,sysName:"syntax_URS_routine",sysVal:0x00}, //syntax for user routine
    {hexVal:0xFA86,sysName:"syntax_URS_routine_1",sysVal:0x00},
    {hexVal:0xFA87,sysName:"syntax_URS_routine_2",sysVal:0x00},
    {hexVal:0xFA88,sysName:"syntax_URS_routine_3",sysVal:0x00},
    {hexVal:0xFA89,sysName:"USER",sysVal:0x00}, //BASIC user jump
    {hexVal:0xFA8A,sysName:"USER_1",sysVal:0xC9},
    {hexVal:0xFA8B,sysName:"USER_2",sysVal:0xC9},
    {hexVal:0xFA8C,sysName:"SETCALL",sysVal:0x00},
    {hexVal:0xFA8D,sysName:"SETCALL_1",sysVal:0x00},
    {hexVal:0xFA8E,sysName:"SETCALL_1",sysVal:0x00},
    {hexVal:0xFA8F,sysName:"IOPL",sysVal:0x01}, //list device
    {hexVal:0xFA90,sysName:"REALBY",sysVal:0xFF}, //PANEL breakpoint
    {hexVal:0xFA91,sysName:"KBFLAG",sysVal:0x80}, //see below
    {hexVal:0xFA92,sysName:"STKLIM",sysVal:0xF2}, //top of free space
    {hexVal:0xFA93,sysName:"STKLIM_1",sysVal:0xF8},
    {hexVal:0xFA94,sysName:"SYSTOP",sysVal:0x4B}, //top of variables to be saved
    {hexVal:0xFA95,sysName:"SYSTOP_1",sysVal:0xFB}, 
    {hexVal:0xFA96,sysName:"SSTACK",sysVal:0x48}, //address of the machine stack
    {hexVal:0xFA97,sysName:"SSTACK_1",sysVal:0xFD},
    {hexVal:0xFA98,sysName:"USERINT",sysVal:0xC9}, //see below
    {hexVal:0xFA99,sysName:"USERINT_1",sysVal:0x00},
    {hexVal:0xFA9A,sysName:"USERINT_2",sysVal:0x00},
    {hexVal:0xFA9B,sysName:"NODLOC",sysVal:0xC9},
    {hexVal:0xFA9C,sysName:"NODLOC_1",sysVal:0x00},
    {hexVal:0xFA9C,sysName:"NODLOC_2",sysVal:0x00},
    {hexVal:0xFA9E,sysName:"FEXPAND",sysVal:0xC9}, //PANEL expansion
    {hexVal:0xFA9F,sysName:"FEXPAND_1",sysVal:0x00},
    {hexVal:0xFAA0,sysName:"FEXPAND_2",sysVal:0x00},
    {hexVal:0xFAA1,sysName:"USERNOD",sysVal:0xC9}, //NODDY expansion
    {hexVal:0xFAA2,sysName:"USERNOD_1",sysVal:0x00},
    {hexVal:0xFAA3,sysName:"USERNOD_2",sysVal:0x00},
    {hexVal:0xFAA4,sysName:"NBTOP",sysVal:0x00}, //top of NODDY (END of Noddy code in memory)
    {hexVal:0xFAA5,sysName:"NBTOP_1",sysVal:0x40}, //80 for MTX500 & 40 for MTX512
    {hexVal:0xFAA6,sysName:"NBTPG",sysVal:0x00}, //top of NODDY page (1 byte)
    {hexVal:0xFAA7,sysName:"BASTOP",sysVal:0x00}, //top of current BASIC page (END of BASIC listing in memory)
    {hexVal:0xFAA8,sysName:"BASTOP_1",sysVal:0x40}, //80 for MTX500 & 40 for MTX512
    {hexVal:0xFAA9,sysName:"BASTPG",sysVal:0x00}, // top of BASIC page (1 byte)
    {hexVal:0xFAAA,sysName:"BASBOT",sysVal:0x00}, //bottom of BASIC (START of BASIC listing in memory)
    {hexVal:0xFAAB,sysName:"BASBOT_1",sysVal:0x40}, // 80 for MTX500 & 40 for MTX512
    {hexVal:0xFAAC,sysName:"BASTPO",sysVal:0x00}, //top of each BASIC page
    {hexVal:0xFAAD,sysName:"BASTPO_1",sysVal:0x40}, // 80 for MTX500 & 40 for MTX512
    {hexVal:0xFAAE,sysName:"BASTPO_2",sysVal:0x00},
    {hexVal:0xFAAF,sysName:"BASTPO_3",sysVal:0x00},
    {hexVal:0xFAB0,sysName:"BASTPO_4",sysVal:0x00},
    {hexVal:0xFAB1,sysName:"BASTPO_5",sysVal:0x00},
    {hexVal:0xFAB2,sysName:"BASTPO_6",sysVal:0x00},
    {hexVal:0xFAB3,sysName:"BASTPO_7",sysVal:0x00},
    {hexVal:0xFAB4,sysName:"BASTPO_8",sysVal:0x00},
    {hexVal:0xFAB5,sysName:"BASTPO_9",sysVal:0x00},
    {hexVal:0xFAB6,sysName:"BASTPO_10",sysVal:0x00},
    {hexVal:0xFAB7,sysName:"BASTPO_11",sysVal:0x00},
    {hexVal:0xFAB8,sysName:"BASTPO_12",sysVal:0x00},
    {hexVal:0xFAB9,sysName:"BASTPO_13",sysVal:0x00},
    {hexVal:0xFABA,sysName:"BASTPO_14",sysVal:0x00}, 
    {hexVal:0xFABB,sysName:"BASTPO_15",sysVal:0x00},
    {hexVal:0xFABC,sysName:"BASTPO_16",sysVal:0x00},
    {hexVal:0xFABD,sysName:"BASTPO_17",sysVal:0x00},
    {hexVal:0xFABE,sysName:"BASTPO_18",sysVal:0x00},
    {hexVal:0xFABF,sysName:"BASTPO_19",sysVal:0x00},
    {hexVal:0xFAC0,sysName:"BASTPO_20",sysVal:0x00},
    {hexVal:0xFAC1,sysName:"BASTPO_21",sysVal:0x00},
    {hexVal:0xFAC2,sysName:"BASTPO_22",sysVal:0x00},
    {hexVal:0xFAC3,sysName:"BASTPO_23",sysVal:0x00},
    {hexVal:0xFAC4,sysName:"BASTPO_24",sysVal:0x00},
    {hexVal:0xFAC5,sysName:"BASTPO_25",sysVal:0x00},
    {hexVal:0xFAC6,sysName:"BASTPO_26",sysVal:0x00},
    {hexVal:0xFAC7,sysName:"BASTPO_27",sysVal:0x00},
    {hexVal:0xFAC8,sysName:"BASTPO_28",sysVal:0x00},
    {hexVal:0xFAC9,sysName:"BASTPO_29",sysVal:0x00},
    {hexVal:0xFACA,sysName:"BASTPO_30",sysVal:0x00},
    {hexVal:0xFACB,sysName:"BASTPO_31",sysVal:0x00},  
    {hexVal:0xFACC,sysName:"ARRTOP",sysVal:0x00}, //top of arrays
    {hexVal:0xFACD,sysName:"ARRTOP_1",sysVal:0x00},
    {hexVal:0xFACE,sysName:"ARRTOP_2",sysVal:0x00},
    {hexVal:0xFACF,sysName:"BASELIN",sysVal:0x00},
    {hexVal:0xFAD0,sysName:"BASELIN_1",sysVal:0x40},
    {hexVal:0xFAD1,sysName:"BASLNP",sysVal:0x00},
    {hexVal:0xFAD2,sysName:"PAGE",sysVal:0x10}, //current page configuration
    {hexVal:0xFAD3,sysName:"CRNTPG",sysVal:0x00}, //current BASIC page
    {hexVal:0xFAD4,sysName:"PGN1",sysVal:0x00},
    {hexVal:0xFAD5,sysName:"PGN2",sysVal:0x00},
    {hexVal:0xFAD6,sysName:"PGTOP",sysVal:0x00},
    {hexVal:0xFAD7,sysName:"PGTOP_1",sysVal:0x40},
    {hexVal:0xFAD8,sysName:"GOSTACK",sysVal:0x00}, //GOSUB stack
    {hexVal:0xFAD9,sysName:"GOSTACK_1",sysVal:0x00},
    {hexVal:0xFADA,sysName:"GOSTACK_2",sysVal:0x00},
    {hexVal:0xFADB,sysName:"GOSTACK_3",sysVal:0x00},
    {hexVal:0xFADC,sysName:"GOSTACK_4",sysVal:0x00},
    {hexVal:0xFADD,sysName:"GOSTACK_5",sysVal:0x00},
    {hexVal:0xFADE,sysName:"GOSTACK_6",sysVal:0x00},
    {hexVal:0xFADF,sysName:"GOSTACK_7",sysVal:0x00},
    {hexVal:0xFAE0,sysName:"GOSTACK_8",sysVal:0x00},
    {hexVal:0xFAE1,sysName:"GOSTACK_9",sysVal:0x00},
    {hexVal:0xFAE2,sysName:"GOSTACK_10",sysVal:0x00},
    {hexVal:0xFAE3,sysName:"GOSTACK_11",sysVal:0x00},
    {hexVal:0xFAE4,sysName:"GOSTACK_12",sysVal:0x00},
    {hexVal:0xFAE5,sysName:"GOSTACK_13",sysVal:0x00},
    {hexVal:0xFAE6,sysName:"GOSTACK_14",sysVal:0x00},
    {hexVal:0xFAE7,sysName:"GOSTACK_15",sysVal:0x00},
    {hexVal:0xFAE8,sysName:"GOSTACK_16",sysVal:0x00},
    {hexVal:0xFAE9,sysName:"GOSTACK_17",sysVal:0x00},
    {hexVal:0xFAEA,sysName:"GOSTACK_18",sysVal:0x00},
    {hexVal:0xFAEB,sysName:"GOSTACK_19",sysVal:0x00},
    {hexVal:0xFAEC,sysName:"GOSTACK_20",sysVal:0x00},
    {hexVal:0xFAED,sysName:"GOSTACK_21",sysVal:0x00},
    {hexVal:0xFAEE,sysName:"GOSTACK_22",sysVal:0x00},
    {hexVal:0xFAEF,sysName:"GOSTACK_23",sysVal:0x00},
    {hexVal:0xFAF0,sysName:"GOSTACK_24",sysVal:0x00},
    {hexVal:0xFAF1,sysName:"GOSTACK_25",sysVal:0x00},
    {hexVal:0xFAF2,sysName:"GOSTACK_26",sysVal:0x00},
    {hexVal:0xFAF3,sysName:"GOSTACK_27",sysVal:0x00},
    {hexVal:0xFAF4,sysName:"GOSTACK_28",sysVal:0x00},
    {hexVal:0xFAF5,sysName:"GOSTACK_29",sysVal:0x00},
    {hexVal:0xFAF6,sysName:"GOSTACK_30",sysVal:0x00},
    {hexVal:0xFAF7,sysName:"GOSTACK_31",sysVal:0x00},
    {hexVal:0xFAF8,sysName:"GOSTACK_32",sysVal:0x00},
    {hexVal:0xFAF9,sysName:"GOSTACK_33",sysVal:0x00},
    {hexVal:0xFAFA,sysName:"GOSTACK_34",sysVal:0x00},
    {hexVal:0xFAFB,sysName:"GOSTACK_35",sysVal:0x00},
    {hexVal:0xFAFC,sysName:"GOSTACK_36",sysVal:0x00},
    {hexVal:0xFAFD,sysName:"GOSTACK_37",sysVal:0x00},
    {hexVal:0xFAFE,sysName:"GOSTACK_38",sysVal:0x00},
    {hexVal:0xFAFF,sysName:"GOSTACK_39",sysVal:0x00},
    {hexVal:0xFB00,sysName:"GOSTACK_40",sysVal:0x00},
    {hexVal:0xFB01,sysName:"GOSTACK_41",sysVal:0x00},
    {hexVal:0xFB02,sysName:"GOSTACK_42",sysVal:0x00},
    {hexVal:0xFB03,sysName:"GOSTACK_43",sysVal:0x00},
    {hexVal:0xFB04,sysName:"GOSTACK_44",sysVal:0x00},
    {hexVal:0xFB05,sysName:"GOSTACK_45",sysVal:0x00},
    {hexVal:0xFB06,sysName:"GOSTACK_46",sysVal:0x00},
    {hexVal:0xFB07,sysName:"GOSTACK_47",sysVal:0x00},
    {hexVal:0xFB08,sysName:"GOSTACK_48",sysVal:0x00},
    {hexVal:0xFB09,sysName:"GOSTACK_49",sysVal:0x00},
    {hexVal:0xFB0A,sysName:"GOSTACK_50",sysVal:0x00},
    {hexVal:0xFB0B,sysName:"GOSTACK_51",sysVal:0x00},
    {hexVal:0xFB0C,sysName:"GOSTACK_52",sysVal:0x00},
    {hexVal:0xFB0D,sysName:"GOSTACK_53",sysVal:0x00},
    {hexVal:0xFB0E,sysName:"GOSTACK_54",sysVal:0x00},
    {hexVal:0xFB0F,sysName:"GOSTACK_55",sysVal:0x00},
    {hexVal:0xFB10,sysName:"GOSTACK_56",sysVal:0x00},
    {hexVal:0xFB11,sysName:"GOSTACK_57",sysVal:0x00},
    {hexVal:0xFB12,sysName:"GOSTACK_58",sysVal:0x00},
    {hexVal:0xFB13,sysName:"GOSTACK_59",sysVal:0x00},
    {hexVal:0xFB14,sysName:"GOSTACK_60",sysVal:0x00},
    {hexVal:0xFB15,sysName:"GOSTACK_61",sysVal:0x00},
    {hexVal:0xFB16,sysName:"GOSTACK_62",sysVal:0x00},
    {hexVal:0xFB17,sysName:"GOSTACK_63",sysVal:0x00},
    {hexVal:0xFB18,sysName:"GOSTACK_64",sysVal:0x00},
    {hexVal:0xFB19,sysName:"GOSTACK_65",sysVal:0x00},
    {hexVal:0xFB1A,sysName:"GOSTACK_66",sysVal:0x00},
    {hexVal:0xFB1B,sysName:"GOSTACK_67",sysVal:0x00},
    {hexVal:0xFB1C,sysName:"GOSTACK_68",sysVal:0x00},
    {hexVal:0xFB1D,sysName:"GOSTACK_69",sysVal:0x00},
    {hexVal:0xFB1E,sysName:"GOSTACK_70",sysVal:0x00},
    {hexVal:0xFB1F,sysName:"GOSTACK_71",sysVal:0x00},
    {hexVal:0xFB20,sysName:"GOSTACK_72",sysVal:0x00},
    {hexVal:0xFB21,sysName:"GOSTACK_73",sysVal:0x00},
    {hexVal:0xFB22,sysName:"GOSTACK_74",sysVal:0x00},
    {hexVal:0xFB23,sysName:"GOSTACK_75",sysVal:0x00},
    {hexVal:0xFB24,sysName:"GOSTACK_76",sysVal:0x00},
    {hexVal:0xFB25,sysName:"GOSTACK_77",sysVal:0x00},
    {hexVal:0xFB26,sysName:"GOSTACK_78",sysVal:0x00},
    {hexVal:0xFB27,sysName:"GOSTACK_79",sysVal:0x00},
    {hexVal:0xFB28,sysName:"GOSTACK_80",sysVal:0x00},
    {hexVal:0xFB29,sysName:"GOSTACK_81",sysVal:0x00},
    {hexVal:0xFB2A,sysName:"GOSTACK_82",sysVal:0x00},
    {hexVal:0xFB2B,sysName:"GOSTACK_83",sysVal:0x00},
    {hexVal:0xFB2C,sysName:"GOSTACK_84",sysVal:0x00},
    {hexVal:0xFB2D,sysName:"GOSTACK_85",sysVal:0x00},
    {hexVal:0xFB2E,sysName:"GOSTACK_86",sysVal:0x00},
    {hexVal:0xFB2F,sysName:"GOSTACK_87",sysVal:0x00},
    {hexVal:0xFB30,sysName:"GOSTACK_88",sysVal:0x00},
    {hexVal:0xFB31,sysName:"GOSTACK_89",sysVal:0x00},
    {hexVal:0xFB32,sysName:"GOSTACK_90",sysVal:0x00},
    {hexVal:0xFB33,sysName:"GOSTACK_91",sysVal:0x00},
    {hexVal:0xFB34,sysName:"GOSTACK_92",sysVal:0x00},
    {hexVal:0xFB35,sysName:"GOSTACK_93",sysVal:0x00},
    {hexVal:0xFB36,sysName:"GOSTACK_94",sysVal:0x00},
    {hexVal:0xFB37,sysName:"GOSTACK_95",sysVal:0x00},
    {hexVal:0xFB38,sysName:"GOSTACK_96",sysVal:0x00},
    {hexVal:0xFB39,sysName:"GOSTACK_97",sysVal:0x00},
    {hexVal:0xFB3A,sysName:"GOSTACK_98",sysVal:0x00},
    {hexVal:0xFB3B,sysName:"GOSTACK_99",sysVal:0x00},
    {hexVal:0xFB3C,sysName:"GOSTACK_100",sysVal:0x00},
    {hexVal:0xFB3D,sysName:"GOSTACK_101",sysVal:0x00},
    {hexVal:0xFB3E,sysName:"GOSTACK_102",sysVal:0x00},
    {hexVal:0xFB3F,sysName:"GOSTACK_103",sysVal:0x00},
    {hexVal:0xFB40,sysName:"GOSTACK_104",sysVal:0x00},
    {hexVal:0xFB41,sysName:"GOPTR",sysVal:0xD8},
    {hexVal:0xFB42,sysName:"GOPTR_1",sysVal:0xFA},
    {hexVal:0xFB43,sysName:"GOSNUM",sysVal:0x00}, //number of nested GOSUBs
    {hexVal:0xFB44,sysName:"FORCOUNT",sysVal:0x00}, //number of active FOR loops
    {hexVal:0xFB45,sysName:"CTYSLT",sysVal:0x00}, //keyboard configuration
    {hexVal:0xFB46,sysName:"DATAAD",sysVal:0x00}, //DATA pointer
    {hexVal:0xFB47,sysName:"DATAAD_1",sysVal:0x40},
    {hexVal:0xFB48,sysName:"DATAPG",sysVal:0x80},
    {hexVal:0xFB49,sysName:"DESAVE",sysVal:0x00}, //2 bytes
    {hexVal:0xFB4A,sysName:"DESAVE_1",sysVal:0x00}
    //0xFB4B => 0xA9  0xFB4C =>0xFF 0xFB4D =>0x00 FB4E =>0x00 0xFB4F => 0xA9 0xFB50 =>0xFF
    //thereafter a number of rows of 20 and then 0x00
] //End of system variables saved                                                                                                                                                                                                                                                                                                                                                                                                                                                                        o tape

/**
 * Helper function to update createHdr using the default information
 */
function initCreateHdr(): void {
    createHdr = [];
    createHdr.push(0xFF); //first byte is 0xFF
    // 1-15 bytes contain spaces 0x20, this is where the filename will be stored.
    for (let i = 0; i < 15; i++) {
        createHdr.push(0x20);
    }
    // 16-17 bytes contain 0xF2 and 0xF8
    createHdr.push(...readMarkerDescriptor);

    // the 350 bytes (see hdrPadByteLength) contain 0x00
    for (let i = 0; i < hdrPadByteLength; i++) {
        createHdr.push(hdrPadByte);
    }

    // then add the default bytes in sysVal
    sysVarSaved.forEach(item => {
        createHdr.push(item.sysVal);
    });
}

export { createHdr, initCreateHdr };