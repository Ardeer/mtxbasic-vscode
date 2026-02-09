"use strict";
/** MTX BASIC system variables that are SAVED to tape or disc
AFWilson
31-Oct-2022
v0.1

12-Dec-2025 converted to typescript and fixed a few minor errors and added the default hex values for a NEW file based on PANEL info.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.sysVarSaved = void 0;
/** mtx system variable saved to tape only, refer Memotech owners manual, appendix 5
addresses (2 bytes) are stored in reverse order, ie 5A (LSB) 40 (MSB) is adrress 0x405A
0xfa51 (64081) to //0xfb4a (64330) = 249+2 bytes, ie 0 to 250 entries

NOTE: hex address is specified twice! from .mtx fies there are contents for each
however the hex address cannot be correct. should the list start at 0xfa50 and
one of the 0xfa7a's to be 0xfa79?

on MTX it was # or £ (depending on the keymap)
in the Z80 mnenomic tables, they use postfix "H" for hexadecimal numbers
so when converting mtx assembly language use shift F3 for hexadecimal prefix
*/
/**	information needed for disassembly
    END OF NODDY found at 64081 (#FA51) + 83 & 84 => FAA4 & FAA5
    START of BAISC found at 64081 + 89 & 90 => FAAA & FAAB
    END of BASIC found at 64081 + 86 & 87 => FAA7 & FAA8
*/

// If MTX BASIC is used then MTXOS grabs 0xC000 to #FA50 for its own use. NOTE: if no BASIC, and only Machine code, then the machine code can only use this space.

//Start of the system variables saved to tape
// sysVal contains the default hexadecimal value stored when the MTX512 is first switched on, for reference.
var sysVarSaved = [
    // FA50 sysVal=0
    { hexVal: "FA51", sysName: "SND_Env_buf", sysVal: "00" }, //top of envelope buffers for sound
    { hexVal: "FA52", sysName: "CTRBADR", sysVal: "00" }, //control buffers for sound (10 bits/channel)
    { hexVal: "FA53", sysName: "CTRBADR_1", sysVal: "F2" },
    { hexVal: "FA54", sysName: "CTRBADR_2", sysVal: "F8" },
    { hexVal: "FA55", sysName: "CTRBADR_3", sysVal: "02" },
    { hexVal: "FA56", sysName: "CTRBADR_4", sysVal: "00" },
    { hexVal: "FA57", sysName: "CTRBADR_5", sysVal: "00" },
    { hexVal: "FA58", sysName: "CTRBADR_6", sysVal: "00" },
    { hexVal: "FA59", sysName: "CTRBADR_7", sysVal: "00" },
    { hexVal: "FA5A", sysName: "CTRBADR_8", sysVal: "00" },
    { hexVal: "FA5B", sysName: "CTRBADR_9", sysVal: "00" },
    { hexVal: "FA5C", sysName: "CTRBADR_10", sysVal: "00" },
    { hexVal: "FA5D", sysName: "CTRBADR_11", sysVal: "0A" },
    { hexVal: "FA5E", sysName: "CTRBADR_12", sysVal: "F9" },
    { hexVal: "FA5F", sysName: "CTRBADR_13", sysVal: "02" },
    { hexVal: "FA60", sysName: "CTRBADR_14", sysVal: "00" },
    { hexVal: "FA61", sysName: "CTRBADR_15", sysVal: "00" },
    { hexVal: "FA62", sysName: "CTRBADR_16", sysVal: "00" },
    { hexVal: "FA63", sysName: "CTRBADR_17", sysVal: "00" },
    { hexVal: "FA64", sysName: "CTRBADR_18", sysVal: "00" },
    { hexVal: "FA65", sysName: "CTRBADR_19", sysVal: "00" },
    { hexVal: "FA66", sysName: "CTRBADR_20", sysVal: "00" },
    { hexVal: "FA67", sysName: "CTRBADR_21", sysVal: "02" },
    { hexVal: "FA68", sysName: "CTRBADR_22", sysVal: "F9" },
    { hexVal: "FA69", sysName: "CTRBADR_23", sysVal: "02" },
    { hexVal: "FA6A", sysName: "CTRBADR_24", sysVal: "00" },
    { hexVal: "FA6B", sysName: "CTRBADR_25", sysVal: "00" },
    { hexVal: "FA6C", sysName: "CTRBADR_26", sysVal: "00" },
    { hexVal: "FA6D", sysName: "CTRBADR_27", sysVal: "00" },
    { hexVal: "FA6E", sysName: "CTRBADR_28", sysVal: "00" },
    { hexVal: "FA6F", sysName: "CTRBADR_29", sysVal: "00" },
    { hexVal: "FA70", sysName: "CTRBADR_30", sysVal: "00" },
    { hexVal: "FA71", sysName: "CTRBADR_31", sysVal: "3A" },
    { hexVal: "FA72", sysName: "CTRBADR_32", sysVal: "F9" },
    { hexVal: "FA73", sysName: "CTRBADR_33", sysVal: "02" },
    { hexVal: "FA74", sysName: "CTRBADR_34", sysVal: "00" },
    { hexVal: "FA75", sysName: "CTRBADR_35", sysVal: "00" },
    { hexVal: "FA76", sysName: "CTRBADR_36", sysVal: "00" },
    { hexVal: "FA77", sysName: "CTRBADR_37", sysVal: "00" },
    { hexVal: "FA78", sysName: "CTRBADR_38", sysVal: "00" },
    { hexVal: "FA79", sysName: "CTRBADR_39", sysVal: "00" },
    { hexVal: "FA7A", sysName: "LSTPG", sysVal: "01" }, //number of 32K pages (00 for MTX500 and 01 for MTX512)
    { hexVal: "FA7B", sysName: "VARNUM", sysVal: "00" }, //bottom of variable names
    { hexVal: "FA7C", sysName: "VARNUM_1", sysVal: "C0" },
    { hexVal: "FA7D", sysName: "VALBOT", sysVal: "01" }, //bottom of variable values
    { hexVal: "FA7E", sysName: "VALBOT_1", sysVal: "C0" },
    { hexVal: "FA7F", sysName: "CALCBOT", sysVal: "01" }, //bottom of calculator stack
    { hexVal: "FA80", sysName: "CALCBOT_1", sysVal: "C0" },
    { hexVal: "FA81", sysName: "CALCST", sysVal: "01" }, //top of calculator stack
    { hexVal: "FA82", sysName: "CALCST_1", sysVal: "C0" },
    { hexVal: "FA83", sysName: "KBDBUF", sysVal: "4B" }, //address of keyboard buffer
    { hexVal: "FA84", sysName: "KBDBUF_1", sysVal: "FB" },
    { hexVal: "FA85", sysName: "syntax_URS_routine", sysVal: "00" }, //syntax for user routine
    { hexVal: "FA86", sysName: "syntax_URS_routine_1", sysVal: "00" },
    { hexVal: "FA87", sysName: "syntax_URS_routine_2", sysVal: "00" },
    { hexVal: "FA88", sysName: "syntax_URS_routine_3", sysVal: "00" },
    { hexVal: "FA89", sysName: "USER", sysVal: "00" }, //BASIC user jump
    { hexVal: "FA8A", sysName: "USER_1", sysVal: "C9" },
    { hexVal: "FA8B", sysName: "USER_2", sysVal: "C9" },
    { hexVal: "FA8C", sysName: "SETCALL", sysVal: "00" },
    { hexVal: "FA8D", sysName: "SETCALL_1", sysVal: "00" },
    { hexVal: "FA8E", sysName: "SETCALL_1", sysVal: "00" },
    { hexVal: "FA8F", sysName: "IOPL", sysVal: "01" }, //list device
    { hexVal: "FA90", sysName: "REALBY", sysVal: "FF" }, //PANEL breakpoint
    { hexVal: "FA91", sysName: "KBFLAG", sysVal: "80" }, //see below
    { hexVal: "FA92", sysName: "STKLIM", sysVal: "F2" }, //top of free space
    { hexVal: "FA93", sysName: "STKLIM_1", sysVal: "F8" },
    { hexVal: "FA94", sysName: "SYSTOP", sysVal: "4B" }, //top of variables to be saved
    { hexVal: "FA95", sysName: "SYSTOP_1", sysVal: "FB" },
    { hexVal: "FA96", sysName: "SSTACK", sysVal: "48" }, //address of the machine stack
    { hexVal: "FA97", sysName: "SSTACK_1", sysVal: "FD" },
    { hexVal: "FA98", sysName: "USERINT", sysVal: "C9" }, //see below
    { hexVal: "FA99", sysName: "USERINT_1", sysVal: "00" },
    { hexVal: "FA9A", sysName: "USERINT_2", sysVal: "00" },
    { hexVal: "FA9B", sysName: "NODLOC", sysVal: "C9" },
    { hexVal: "FA9C", sysName: "NODLOC_1", sysVal: "00" },
    { hexVal: "FA9C", sysName: "NODLOC_2", sysVal: "00" },
    { hexVal: "FA9E", sysName: "FEXPAND", sysVal: "C9" }, //PANEL expansion
    { hexVal: "FA9F", sysName: "FEXPAND_1", sysVal: "00" },
    { hexVal: "FAA0", sysName: "FEXPAND_2", sysVal: "00" },
    { hexVal: "FAA1", sysName: "USERNOD", sysVal: "C9" }, //NODDY expansion
    { hexVal: "FAA2", sysName: "USERNOD_1", sysVal: "00" },
    { hexVal: "FAA3", sysName: "USERNOD_2", sysVal: "00" },
    { hexVal: "FAA4", sysName: "NBTOP", sysVal: "00" }, //top of NODDY (END of Noddy code in memory)
    { hexVal: "FAA5", sysName: "NBTOP_1", sysVal: "40" }, //80 for MTX500 & 40 for MTX512
    { hexVal: "FAA6", sysName: "NBTPG", sysVal: "00" }, //top of NODDY page (1 byte)
    { hexVal: "FAA7", sysName: "BASTOP", sysVal: "00" }, //top of current BASIC page (END of BASIC listing in memory)
    { hexVal: "FAA8", sysName: "BASTOP_1", sysVal: "40" }, //80 for MTX500 & 40 for MTX512
    { hexVal: "FAA9", sysName: "BASTPG", sysVal: "00" }, // top of BASIC page (1 byte)
    { hexVal: "FAAA", sysName: "BASBOT", sysVal: "00" }, //bottom of BASIC (START of BASIC listing in memory)
    { hexVal: "FAAB", sysName: "BASBOT_1", sysVal: "40" }, // 80 for MTX500 & 40 for MTX512
    { hexVal: "FAAC", sysName: "BASTPO", sysVal: "00" }, //top of each BASIC page
    { hexVal: "FAAD", sysName: "BASTPO_1", sysVal: "40" }, // 80 for MTX500 & 40 for MTX512
    { hexVal: "FAAE", sysName: "BASTPO_2", sysVal: "00" },
    { hexVal: "FAAF", sysName: "BASTPO_3", sysVal: "00" },
    { hexVal: "FAB0", sysName: "BASTPO_4", sysVal: "00" },
    { hexVal: "FAB1", sysName: "BASTPO_5", sysVal: "00" },
    { hexVal: "FAB2", sysName: "BASTPO_6", sysVal: "00" },
    { hexVal: "FAB3", sysName: "BASTPO_7", sysVal: "00" },
    { hexVal: "FAB4", sysName: "BASTPO_8", sysVal: "00" },
    { hexVal: "FAB5", sysName: "BASTPO_9", sysVal: "00" },
    { hexVal: "FAB6", sysName: "BASTPO_10", sysVal: "00" },
    { hexVal: "FAB7", sysName: "BASTPO_11", sysVal: "00" },
    { hexVal: "FAB8", sysName: "BASTPO_12", sysVal: "00" },
    { hexVal: "FAB9", sysName: "BASTPO_13", sysVal: "00" },
    { hexVal: "FABA", sysName: "BASTPO_14", sysVal: "00" },
    { hexVal: "FABB", sysName: "BASTPO_15", sysVal: "00" },
    { hexVal: "FABC", sysName: "BASTPO_16", sysVal: "00" },
    { hexVal: "FABD", sysName: "BASTPO_17", sysVal: "00" },
    { hexVal: "FABE", sysName: "BASTPO_18", sysVal: "00" },
    { hexVal: "FABF", sysName: "BASTPO_19", sysVal: "00" },
    { hexVal: "FAC0", sysName: "BASTPO_20", sysVal: "00" },
    { hexVal: "FAC1", sysName: "BASTPO_21", sysVal: "00" },
    { hexVal: "FAC2", sysName: "BASTPO_22", sysVal: "00" },
    { hexVal: "FAC3", sysName: "BASTPO_23", sysVal: "00" },
    { hexVal: "FAC4", sysName: "BASTPO_24", sysVal: "00" },
    { hexVal: "FAC5", sysName: "BASTPO_25", sysVal: "00" },
    { hexVal: "FAC6", sysName: "BASTPO_26", sysVal: "00" },
    { hexVal: "FAC7", sysName: "BASTPO_27", sysVal: "00" },
    { hexVal: "FAC8", sysName: "BASTPO_28", sysVal: "00" },
    { hexVal: "FAC9", sysName: "BASTPO_29", sysVal: "00" },
    { hexVal: "FACA", sysName: "BASTPO_30", sysVal: "00" },
    { hexVal: "FACB", sysName: "BASTPO_31", sysVal: "00" },
    { hexVal: "FACC", sysName: "ARRTOP", sysVal: "00" }, //top of arrays
    { hexVal: "FACD", sysName: "ARRTOP_1", sysVal: "00" },
    { hexVal: "FACE", sysName: "ARRTOP_2", sysVal: "00" },
    { hexVal: "FACF", sysName: "BASELIN", sysVal: "00" },
    { hexVal: "FAD0", sysName: "BASELIN_1", sysVal: "40" },
    { hexVal: "FAD1", sysName: "BASLNP", sysVal: "00" },
    { hexVal: "FAD2", sysName: "PAGE", sysVal: "10" }, //current page configuration. User memory starts at 0x4000 to 0xBFFF (32k). MTX allows paging of 32k blocks up to 16 pages.
    { hexVal: "FAD3", sysName: "CRNTPG", sysVal: "00" }, //current BASIC page
    { hexVal: "FAD4", sysName: "PGN1", sysVal: "00" },
    { hexVal: "FAD5", sysName: "PGN2", sysVal: "00" },
    { hexVal: "FAD6", sysName: "PGTOP", sysVal: "00" },
    { hexVal: "FAD7", sysName: "PGTOP_1", sysVal: "40" },
    { hexVal: "FAD8", sysName: "GOSTACK", sysVal: "00" }, //GOSUB stack
    { hexVal: "FAD9", sysName: "GOSTACK_1", sysVal: "00" },
    { hexVal: "FADA", sysName: "GOSTACK_2", sysVal: "00" },
    { hexVal: "FADB", sysName: "GOSTACK_3", sysVal: "00" },
    { hexVal: "FADC", sysName: "GOSTACK_4", sysVal: "00" },
    { hexVal: "FADD", sysName: "GOSTACK_5", sysVal: "00" },
    { hexVal: "FADE", sysName: "GOSTACK_6", sysVal: "00" },
    { hexVal: "FADF", sysName: "GOSTACK_7", sysVal: "00" },
    { hexVal: "FAE0", sysName: "GOSTACK_8", sysVal: "00" },
    { hexVal: "FAE1", sysName: "GOSTACK_9", sysVal: "00" },
    { hexVal: "FAE2", sysName: "GOSTACK_10", sysVal: "00" },
    { hexVal: "FAE3", sysName: "GOSTACK_11", sysVal: "00" },
    { hexVal: "FAE4", sysName: "GOSTACK_12", sysVal: "00" },
    { hexVal: "FAE5", sysName: "GOSTACK_13", sysVal: "00" },
    { hexVal: "FAE6", sysName: "GOSTACK_14", sysVal: "00" },
    { hexVal: "FAE7", sysName: "GOSTACK_15", sysVal: "00" },
    { hexVal: "FAE8", sysName: "GOSTACK_16", sysVal: "00" },
    { hexVal: "FAE9", sysName: "GOSTACK_17", sysVal: "00" },
    { hexVal: "FAEA", sysName: "GOSTACK_18", sysVal: "00" },
    { hexVal: "FAEB", sysName: "GOSTACK_19", sysVal: "00" },
    { hexVal: "FAEC", sysName: "GOSTACK_20", sysVal: "00" },
    { hexVal: "FAED", sysName: "GOSTACK_21", sysVal: "00" },
    { hexVal: "FAEE", sysName: "GOSTACK_22", sysVal: "00" },
    { hexVal: "FAEF", sysName: "GOSTACK_23", sysVal: "00" },
    { hexVal: "FAF0", sysName: "GOSTACK_24", sysVal: "00" },
    { hexVal: "FAF1", sysName: "GOSTACK_25", sysVal: "00" },
    { hexVal: "FAF2", sysName: "GOSTACK_26", sysVal: "00" },
    { hexVal: "FAF3", sysName: "GOSTACK_27", sysVal: "00" },
    { hexVal: "FAF4", sysName: "GOSTACK_28", sysVal: "00" },
    { hexVal: "FAF5", sysName: "GOSTACK_29", sysVal: "00" },
    { hexVal: "FAF6", sysName: "GOSTACK_30", sysVal: "00" },
    { hexVal: "FAF7", sysName: "GOSTACK_31", sysVal: "00" },
    { hexVal: "FAF8", sysName: "GOSTACK_32", sysVal: "00" },
    { hexVal: "FAF9", sysName: "GOSTACK_33", sysVal: "00" },
    { hexVal: "FAFA", sysName: "GOSTACK_34", sysVal: "00" },
    { hexVal: "FAFB", sysName: "GOSTACK_35", sysVal: "00" },
    { hexVal: "FAFC", sysName: "GOSTACK_36", sysVal: "00" },
    { hexVal: "FAFD", sysName: "GOSTACK_37", sysVal: "00" },
    { hexVal: "FAFE", sysName: "GOSTACK_38", sysVal: "00" },
    { hexVal: "FAFF", sysName: "GOSTACK_39", sysVal: "00" },
    { hexVal: "FB00", sysName: "GOSTACK_40", sysVal: "00" },
    { hexVal: "FB01", sysName: "GOSTACK_41", sysVal: "00" },
    { hexVal: "FB02", sysName: "GOSTACK_42", sysVal: "00" },
    { hexVal: "FB03", sysName: "GOSTACK_43", sysVal: "00" },
    { hexVal: "FB04", sysName: "GOSTACK_44", sysVal: "00" },
    { hexVal: "FB05", sysName: "GOSTACK_45", sysVal: "00" },
    { hexVal: "FB06", sysName: "GOSTACK_46", sysVal: "00" },
    { hexVal: "FB07", sysName: "GOSTACK_47", sysVal: "00" },
    { hexVal: "FB08", sysName: "GOSTACK_48", sysVal: "00" },
    { hexVal: "FB09", sysName: "GOSTACK_49", sysVal: "00" },
    { hexVal: "FB0A", sysName: "GOSTACK_50", sysVal: "00" },
    { hexVal: "FB0B", sysName: "GOSTACK_51", sysVal: "00" },
    { hexVal: "FB0C", sysName: "GOSTACK_52", sysVal: "00" },
    { hexVal: "FB0D", sysName: "GOSTACK_53", sysVal: "00" },
    { hexVal: "FB0E", sysName: "GOSTACK_54", sysVal: "00" },
    { hexVal: "FB0F", sysName: "GOSTACK_55", sysVal: "00" },
    { hexVal: "FB10", sysName: "GOSTACK_56", sysVal: "00" },
    { hexVal: "FB11", sysName: "GOSTACK_57", sysVal: "00" },
    { hexVal: "FB12", sysName: "GOSTACK_58", sysVal: "00" },
    { hexVal: "FB13", sysName: "GOSTACK_59", sysVal: "00" },
    { hexVal: "FB14", sysName: "GOSTACK_60", sysVal: "00" },
    { hexVal: "FB15", sysName: "GOSTACK_61", sysVal: "00" },
    { hexVal: "FB16", sysName: "GOSTACK_62", sysVal: "00" },
    { hexVal: "FB17", sysName: "GOSTACK_63", sysVal: "00" },
    { hexVal: "FB18", sysName: "GOSTACK_64", sysVal: "00" },
    { hexVal: "FB19", sysName: "GOSTACK_65", sysVal: "00" },
    { hexVal: "FB1A", sysName: "GOSTACK_66", sysVal: "00" },
    { hexVal: "FB1B", sysName: "GOSTACK_67", sysVal: "00" },
    { hexVal: "FB1C", sysName: "GOSTACK_68", sysVal: "00" },
    { hexVal: "FB1D", sysName: "GOSTACK_69", sysVal: "00" },
    { hexVal: "FB1E", sysName: "GOSTACK_70", sysVal: "00" },
    { hexVal: "FB1F", sysName: "GOSTACK_71", sysVal: "00" },
    { hexVal: "FB20", sysName: "GOSTACK_72", sysVal: "00" },
    { hexVal: "FB21", sysName: "GOSTACK_73", sysVal: "00" },
    { hexVal: "FB22", sysName: "GOSTACK_74", sysVal: "00" },
    { hexVal: "FB23", sysName: "GOSTACK_75", sysVal: "00" },
    { hexVal: "FB24", sysName: "GOSTACK_76", sysVal: "00" },
    { hexVal: "FB25", sysName: "GOSTACK_77", sysVal: "00" },
    { hexVal: "FB26", sysName: "GOSTACK_78", sysVal: "00" },
    { hexVal: "FB27", sysName: "GOSTACK_79", sysVal: "00" },
    { hexVal: "FB28", sysName: "GOSTACK_80", sysVal: "00" },
    { hexVal: "FB29", sysName: "GOSTACK_81", sysVal: "00" },
    { hexVal: "FB2A", sysName: "GOSTACK_82", sysVal: "00" },
    { hexVal: "FB2B", sysName: "GOSTACK_83", sysVal: "00" },
    { hexVal: "FB2C", sysName: "GOSTACK_84", sysVal: "00" },
    { hexVal: "FB2D", sysName: "GOSTACK_85", sysVal: "00" },
    { hexVal: "FB2E", sysName: "GOSTACK_86", sysVal: "00" },
    { hexVal: "FB2F", sysName: "GOSTACK_87", sysVal: "00" },
    { hexVal: "FB30", sysName: "GOSTACK_88", sysVal: "00" },
    { hexVal: "FB31", sysName: "GOSTACK_89", sysVal: "00" },
    { hexVal: "FB32", sysName: "GOSTACK_90", sysVal: "00" },
    { hexVal: "FB33", sysName: "GOSTACK_91", sysVal: "00" },
    { hexVal: "FB34", sysName: "GOSTACK_92", sysVal: "00" },
    { hexVal: "FB35", sysName: "GOSTACK_93", sysVal: "00" },
    { hexVal: "FB36", sysName: "GOSTACK_94", sysVal: "00" },
    { hexVal: "FB37", sysName: "GOSTACK_95", sysVal: "00" },
    { hexVal: "FB38", sysName: "GOSTACK_96", sysVal: "00" },
    { hexVal: "FB39", sysName: "GOSTACK_97", sysVal: "00" },
    { hexVal: "FB3A", sysName: "GOSTACK_98", sysVal: "00" },
    { hexVal: "FB3B", sysName: "GOSTACK_99", sysVal: "00" },
    { hexVal: "FB3C", sysName: "GOSTACK_100", sysVal: "00" },
    { hexVal: "FB3D", sysName: "GOSTACK_101", sysVal: "00" },
    { hexVal: "FB3E", sysName: "GOSTACK_102", sysVal: "00" },
    { hexVal: "FB3F", sysName: "GOSTACK_103", sysVal: "00" },
    { hexVal: "FB40", sysName: "GOSTACK_104", sysVal: "00" },
    { hexVal: "FB41", sysName: "GOPTR", sysVal: "D8" },
    { hexVal: "FB42", sysName: "GOPTR_1", sysVal: "FA" },
    { hexVal: "FB43", sysName: "GOSNUM", sysVal: "00" }, //number of nested GOSUBs
    { hexVal: "FB44", sysName: "FORCOUNT", sysVal: "00" }, //number of active FOR loops
    { hexVal: "FB45", sysName: "CTYSLT", sysVal: "00" }, //keyboard configuration
    { hexVal: "FB46", sysName: "DATAAD", sysVal: "00" }, //DATA pointer
    { hexVal: "FB47", sysName: "DATAAD_1", sysVal: "40" },
    { hexVal: "FB48", sysName: "DATAPG", sysVal: "80" },
    { hexVal: "FB49", sysName: "DESAVE", sysVal: "00" }, //2 bytes
    { hexVal: "FB4A", sysName: "DESAVE_1", sysVal: "00" }
    //FB4B => A9  FB4C =>FF FB4D =>00 FB4E =>00 FB4F => A9 FB50 =>FF
    //thereafter a number of rows of 20 and then 00
]; //End of system variables saved t                                                                                                                                                                                                                                                                                                                                                                                                                                                                        o tape
exports.sysVarSaved = sysVarSaved;
