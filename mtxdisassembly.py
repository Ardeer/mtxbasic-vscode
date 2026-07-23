#!/usr/bin/env python3

#to convert a .mtx file to a .txt file
#version 0.1 by A.F. Wilson 16-May-2022
#v0.l takes a mtx program file and converts it to a text file (ie BASIC listing)
#17-Feb-2026
#includes mtx_tokens and Z80_mnemonics

#from tkinter import *
import tkinter.messagebox as msgbox
from tkinter.filedialog import asksaveasfilename
from tkinter.filedialog import askopenfilename
import os,sys
#from afw_mtx_tokens import * #includes ASCII 0 to 127 and mtx tokens 128 to 255
#from afw_Z80_mnemonics import *

global GV_fname_r,GV_fname_w,GC_extn_r,GC_extn_w,GC_MTXEOL,GV_nonprintable,run_codebaselen, run_codebase

GV_fname_r="Rtest"
GV_fname_w="Wtest"
GC_extn_r=".mtx" #default
GC_extn_w=".bas" #default
GC_MTXEOL=255
GC_MAXADDR=65535
GV_nonprintable=31
GV_sys_var=[0]*256 #where to store the information
run_codebaselen=0
run_codebase=0  

mtx_token_db=[
    [0,'NUL'],
    [1,'SCH'],
    [2,'STX'],
    [3,'ETX'],
    [4,'EOT'],
    [5,'ENQ'],
    [6,'ACK'],
    [7,'BEL'],
    [8,'BS'],
    [9,'HT'],
    [10,'LF'],
    [11,'VT'],
    [12,'FF'],
    [13,'CR'],
    [14,'SO'],
    [15,'SI'],
    [16,'DLE'],
    [17,'DC1'],
    [18,'DC2'],
    [19,'DC3'],
    [20,'DC4'],
    [21,'NAK'],
    [22,'SYN'],
    [23,'ETB'],
    [24,'CAN'],
    [25,'EM'],
    [26,'SUB'],
    [27,'ESC'],
    [28,'FS'],
    [29,'GS'],
    [30,'RS'],
    [31,'US'],
    [32,' '],
    [33,'!'],
    [34,chr(34)], #to avoid python using Unicode typographic quotes instead of the ASCII double quote '
    [35,'#'],
    [36,'$'],
    [37,'%'],
    [38,'&'],
    [39,"'"], #use double to surround ' chr(39) didn't work
    [40,'('],
    [41,')'],
    [42,'*'],
    [43,'+'],
    [44,','],
    [45,'-'],
    [46,'.'],
    [47,'/'],
    [48,'0'],
    [49,'1'],
    [50,'2'],
    [51,'3'],
    [52,'4'],
    [53,'5'],
    [54,'6'],
    [55,'7'],
    [56,'8'],
    [57,'9'],
    [58,':'],
    [59,';'],
    [60,'<'],
    [61,'='],
    [62,'>'],
    [63,'?'],
    [64,'@'],
    [65,'A'],
    [66,'B'],
    [67,'C'],
    [68,'D'],
    [69,'E'],
    [70,'F'],
    [71,'G'],
    [72,'H'],
    [73,'I'],
    [74,'J'],
    [75,'K'],
    [76,'L'],
    [77,'M'],
    [78,'N'],
    [79,'O'],
    [80,'P'],
    [81,'Q'],
    [82,'R'],
    [83,'S'],
    [84,'T'],
    [85,'U'],
    [86,'V'],
    [87,'W'],
    [88,'X'],
    [89,'Y'],
    [90,'Z'],
    [91,'['],
    [92,chr(92)], # '/' caused an issue
    [93,']'],
    [94,'^'],
    [95,'_'],
    [96,'`'],
    [97,'a'],
    [98,'b'],
    [99,'c'],
    [100,'d'],
    [101,'e'],
    [102,'f'],
    [103,'g'],
    [104,'h'],
    [105,'i'],
    [106,'j'],
    [107,'k'],
    [108,'l'],
    [109,'m'],
    [110,'n'],
    [111,'o'],
    [112,'p'],
    [113,'q'],
    [114,'r'],
    [115,'s'],
    [116,'t'],
    [117,'u'],
    [118,'v'],
    [119,'w'],
    [120,'x'],
    [121,'y'],
    [122,'z'],
    [123,'{'],
    [124,'|'],
    [125,'}'],
    [126,'~'],
    [127,'DEL'],
    [128,'REM'],
    [129,'CLS'],
    [130,'ASSEM'],
    [131,'AUTO'],
    [132,'BAUD'],
    [133,'VS'],
    [134,'CONT'],
    [135,'USER'],
    [136,'CRVS'],
    [137,'CLEAR'],
    [138,'CLOCK'],
    [139,'ATTR'],
    [140,'COLOUR'],
    [141,'INK'],
    [142,'CSR'],
    [143,'DATA'],
    [144,'PRINT'],
    [145,'DIM'],
    [146,'ADJSPR'],
    [147,'EDIT'],
    [148,'NEXT'],
    [149,'FOR'],
    [150,'GOTO'],
    [151,'GOSUB'],
    [152,'INPUT'],
    [153,'IF'],
    [154,'MVSPR'],
    [155,'LIST'],
    [156,'LET'],
    [157,'LLIST'],
    [158,'LOAD'],
    [159,'LPRINT'],
    [160,'SPRITE'],
    [161,'CTLSPR'],
    [162,'NODE'],
    [163,'NEW'],
    [164,'PAPER'],
    [165,'NODDY'],
    [166,'ON'],
    [167,'OUT'],
    [168,'PLOD'],
    [169,'PANEL'],
    [170,'GENPAT'],
    [171,'PAUSE'],
    [172,'PHI'],
    [173,'POKE'],
    [174,'RAND'],
    [175,'RETURN'],
    [176,'READ'],
    [177,'VIEW'],
    [178,'RESTORE'],
    [179,'ROM'],
    [180,'RUN'],
    [181,'SAVE'],
    [182,'SOUND'],
    [183,'EDITOR'],
    [184,'DSI'],
    [185,'PLOT'],
    [186,'STOP'],
    [187,'ANGLE'],
    [188,'SBUF'],
    [189,'VERIFY'],
    [190,'DRAW'],
    [191,'ARC'],
    [192,'CIRCLE'],
    [193,'LINE'],
    [194,'CODE'],
    [195,'ELSE'],
    [196,'FK'],
    [197,'OFF'],
    [198,'STEP'],
    [199,'THEN'],
    [200,'TO'],
    [201,'I'],
    [202,'J'],
    [203,'K'],
    [204,'L'],
    [205,'M'],
    [206,'N'],
    [207,'+'],
    [208,'-'],
    [209,'*'],
    [210,'/'],
    [211,'^'],
    [212,'='],
    [213,'>'],
    [214,'<'],
    [215,'>='],
    [216,'<='],
    [217,'<>'],
    [218,'AND'],
    [219,'OR'],
    [220,'NOT'],
    [221,'ABS'],
    [222,'ATN'],
    [223,'COS'],
    [224,'EXP'],
    [225,'FRE'],
    [226,'INT'],
    [227,'INT'],
    [228,'LN'],
    [229,'PEEK'],
    [230,'SGN'],
    [231,'SIN'],
    [232,'SQR'],
    [233,'TAN'],
    [234,'INP'],
    [235,'USR'],
    [236,'LN'],
    [237,'ASC'],
    [238,'LEN'],
    [239,'VAL'],
    [240,'LN'],
    [241,'MOD'],
    [242,'PI'],
    [243,'RND'],
    [244,'PI'],
    [245,'CHR$'],
    [246,'SPK$'],
    [247,'INKEY$'],
    [248,'LEFT$'],
    [249,'MID$'],
    [250,'RIGHT$'],
    [251,'GR$'],
    [252,'STR$'],
    [253,'TIME$'],
    [254,'*'],
    [255,'EOL']
]

'''z80 hex to mnemonic conversion table notes
no CB 30 to CB37
no DDCB zz 36
no FDCB zz 36
still to add CPU cycles
RST 00H, 08H, 10H, 18H, 20H, 28H, 20H, 38H coded in MTX assembler as RST 0,8,10,18,20,28,38
doesn't include the Zilog 11 assembler directives
ORG NN, EQU NN, DEFL NN, DEFB n, DEFB 'S', DEFW NN, DEFS NN, DEFM 'S', MACRO P0 P1 ...Pn, END, ENDM
Some of these are available in the MTX assembler for example DB n or DB "S", DW NN, DS n and
use of labels, reference to labels and comments.
'''

z80_mnemonic_db=[
["00","NOP",1],
["01 XXXX","LD BC,NN",3],
["02","LD (BC),A",1],
["03","INC BC",1],
["04","INC B",1],
["05","DEC B",1],
["06 xx","LD B,n",2],
["07","RLCA",1],
["08","EX AF,AF'",1],
["09","ADD HL,BC",1],
["0A","LD A,(BC)",1],
["0B","DEC BC",1],
["0C","INC C",1],
["0D","DEC C",1],
["0E xx","LD C,n",2],
["0F","RRCA",1],
["10 yy","DJNZ e",2],
["11 XXXX","LD DE,NN",3],
["12","LD (DE),A",1],
["13","INC DE",1],
["14","INC D",1],
["15","DEC D",1],
["16 xx","LD D,n",2],
["17","RLA",1],
["18 yy","JR e",2],
["19","ADD HL,DE",1],
["1A","LD A,(DE)",1],
["1B","DEC DE",1],
["1C","INC E",1],
["1D","DEC E",1],
["1E xx","LD E,n",2],
["1F","RRA",1],
["20 yy","JR NZ,e",2],
["21 XXXX","LD HL,NN",3],
["22 XXXX","LD (NN),HL",3],
["23","INC HL",1],
["24","INC H",1],
["25","DEC H",1],
["26 xx","LD H,n",2],
["27","DAA",1],
["28 yy","JR Z,e",2],
["29","ADD HL,HL",1],
["2A XXXX","LD HL,(NN)",3],
["2B","DEC HL",1],
["2C","INC L",1],
["2D","DEC L",1],
["2E xx","LD L,n",2],
["2F","CPL",1],
["30 yy","JR NC,e",2],
["31 XXXX","LD SP,NN",3],
["32 XXXX","LD (NN),A",3],
["33","INC SP",1],
["34","INC (HL)",1],
["35","DEC (HL)",1],
["36 xx","LD (HL),n",2],
["37","SCF",1],
["38 yy","JR C,e",2],
["39","ADD HL,SP",1],
["3A XXXX","LD A,(NN)",3],
["3B","DEC SP",1],
["3C","INC A",1],
["3D","DEC A",1],
["3E xx","LD A,n",2],
["3F","CCF",1],
["40","LD B,B",1],
["41","LD B,C",1],
["42","LD B,D",1],
["43","LD B,E",1],
["44","LD B,H",1],
["45","LD B,L",1],
["46","LD B,(HL)",1],
["47","LD B,A",1],
["48","LD C,B",1],
["49","LD C,C",1],
["4A","LD C,D",1],
["4B","LD C,E",1],
["4C","LD C,H",1],
["4D","LD C,L",1],
["4E","LD C,(HL)",1],
["4F","LD C,A",1],
["50","LD D,B",1],
["51","LD D,C",1],
["52","LD D,D",1],
["53","LD D,E",1],
["54","LD D,H",1],
["55","LD D,L",1],
["56","LD D,(HL)",1],
["57","LD D,A",1],
["58","LD E,B",1],
["59","LD E,C",1],
["5A","LD E,D",1],
["5B","LD E,E",1],
["5C","LD E,H",1],
["5D","LD E,L",1],
["5E","LD E,(HL)",1],
["5F","LD E,A",1],
["60","LD H,B",1],
["61","LD H,C",1],
["62","LD H,D",1],
["63","LD H,E",1],
["64","LD H,H",1],
["65","LD H,L",1],
["66","LD H,(HL)",1],
["67","LD H,A",1],
["68","LD L,B",1],
["69","LD L,C",1],
["6A","LD L,D",1],
["6B","LD L,E",1],
["6C","LD L,H",1],
["6D","LD L,L",1],
["6E","LD L,(HL)",1],
["6F","LD L,A",1],
["70","LD (HL),B",1],
["71","LD (HL),C",1],
["72","LD (HL),D",1],
["73","LD (HL),E",1],
["74","LD (HL),H",1],
["75","LD (HL),L",1],
["76","HALT",1],
["77","LD (HL),A",1],
["78","LD A,B",1],
["79","LD A,C",1],
["7A","LD A,D",1],
["7B","LD A,E",1],
["7C","LD A,H",1],
["7D","LD A,L",1],
["7E","LD A,(HL)",1],
["7F","LD A,A",1],
["80","ADD A,B",1],
["81","ADD A,C",1],
["82","ADD A,D",1],
["83","ADD A,E",1],
["84","ADD A,H",1],
["85","ADD A,L",1],
["86","ADD A,(HL)",1],
["87","ADD A,A",1],
["88","ADC A,B",1],
["89","ADC A,C",1],
["8A","ADC A,D",1],
["8B","ADC A,E",1],
["8C","ADC A,H",1],
["8D","ADC A,L",1],
["8E","ADC A,(HL)",1],
["8F","ADC A,A",1],
["90","SUB B",1],
["91","SUB C",1],
["92","SUB D",1],
["93","SUB E",1],
["94","SUB H",1],
["95","SUB L",1],
["96","SUB (HL)",1],
["97","SUB A",1],
["98","SBC A,B",1],
["99","SBC A,C",1],
["9A","SBC A,D",1],
["9B","SBC A,E",1],
["9C","SBC A,H",1],
["9D","SBC A,L",1],
["9E","SBC A,(HL)",1],
["9F","SBC A,A",1],
["A0","AND B",1],
["A1","AND C",1],
["A2","AND D",1],
["A3","AND E",1],
["A4","AND H",1],
["A5","AND L",1],
["A6","AND (HL)",1],
["A7","AND A",1],
["A8","XOR B",1],
["A9","XOR C",1],
["AA","XOR D",1],
["AB","XOR E",1],
["AC","XOR H",1],
["AD","XOR L",1],
["AE","XOR (HL)",1],
["AF","XOR A",1],
["B0","OR B",1],
["B1","OR C",1],
["B2","OR D",1],
["B3","OR E",1],
["B4","OR H",1],
["B5","OR L",1],
["B6","OR (HL)",1],
["B7","OR A",1],
["B8","CP B",1],
["B9","CP C",1],
["BA","CP D",1],
["BB","CP E",1],
["BC","CP H",1],
["BD","CP L",1],
["BE","CP (HL)",1],
["BF","CP A",1],
["C0","RET NZ",1],
["C1","POP BC",1],
["C2 XXXX","JP NZ,NN",3],
["C3 XXXX","JP NN",3],
["C4 XXXX","CALL NZ,NN",3],
["C5","PUSH BC",1],
["C6 xx","ADD A,n",2],
["C7","RST 00",1],
["C8","RET Z",1],
["C9","RET",1],
["CA XXXX","JP Z,NN",3],
["CB00","RLC B",2],
["CB01","RLC C",2],
["CB02","RLC D",2],
["CB03","RLC E",2],
["CB04","RLC H",2],
["CB05","RLC L",2],
["CB06","RLC (HL)",2],
["CB07","RLC A",2],
["CB08","RRC B",2],
["CB09","RRC C",2],
["CB0A","RRC D",2],
["CB0B","RRC E",2],
["CB0C","RRC H",2],
["CB0D","RRC L",2],
["CB0E","RRC (HL)",2],
["CB0F","RRC A",2],
["CB10","RL B",2],
["CB11","RL C",2],
["CB12","RL D",2],
["CB13","RL E",2],
["CB14","RL H",2],
["CB15","RL L",2],
["CB16","RL (HL)",2],
["CB17","RL A",2],
["CB18","RR B",2],
["CB19","RR C",2],
["CB1A","RR D",2],
["CB1B","RR E",2],
["CB1C","RR H",2],
["CB1D","RR L",2],
["CB1E","RR (HL)",2],
["CB1F","RR A",2],
["CB20","SLA B",2],
["CB21","SLA C",2],
["CB22","SLA D",2],
["CB23","SLA E",2],
["CB24","SLA H",2],
["CB25","SLA L",2],
["CB26","SLA (HL)",2],
["CB27","SLA A",2],
["CB28","SRA B",2],
["CB29","SRA C",2],
["CB2A","SRA D",2],
["CB2B","SRA E",2],
["CB2C","SRA H",2],
["CB2D","SRA L",2],
["CB2E","SRA (HL)",2],
["CB2F","SRA A",2],
["CB38","SRL B",2],
["CB39","SRL C",2],
["CB3A","SRL D",2],
["CB3B","SRL E",2],
["CB3C","SRL H",2],
["CB3D","SRL L",2],
["CB3E","SRL (HL)",2],
["CB3F","SRL A",2],
["CB40","BIT 0,B",2],
["CB41","BIT 0,C",2],
["CB42","BIT 0,D",2],
["CB43","BIT 0,E",2],
["CB44","BIT 0,H",2],
["CB45","BIT 0,L",2],
["CB46","BIT 0,(HL)",2],
["CB47","BIT 0,A",2],
["CB48","BIT 1,B",2],
["CB49","BIT 1,C",2],
["CB4A","BIT 1,D",2],
["CB4B","BIT 1,E",2],
["CB4C","BIT 1,H",2],
["CB4D","BIT 1,L",2],
["CB4E","BIT 1,(HL)",2],
["CB4F","BIT 1,A",2],
["CB50","BIT 2,B",2],
["CB51","BIT 2,C",2],
["CB52","BIT 2,D",2],
["CB53","BIT 2,E",2],
["CB54","BIT 2,H",2],
["CB55","BIT 2,L",2],
["CB56","BIT 2,(HL)",2],
["CB57","BIT 2,A",2],
["CB58","BIT 3,B",2],
["CB59","BIT 3,C",2],
["CB5A","BIT 3,D",2],
["CB5B","BIT 3,E",2],
["CB5C","BIT 3,H",2],
["CB5D","BIT 3,L",2],
["CB5E","BIT 3,(HL)",2],
["CB5F","BIT 3,A",2],
["CB60","BIT 4,B",2],
["CB61","BIT 4,C",2],
["CB62","BIT 4,D",2],
["CB63","BIT 4,E",2],
["CB64","BIT 4,H",2],
["CB65","BIT 4,L",2],
["CB66","BIT 4,(HL)",2],
["CB67","BIT 4,A",2],
["CB68","BIT 5,B",2],
["CB69","BIT 5,C",2],
["CB6A","BIT 5,D",2],
["CB6B","BIT 5,E",2],
["CB6C","BIT 5,H",2],
["CB6D","BIT 5,L",2],
["CB6E","BIT 5,(HL)",2],
["CB6F","BIT 5,A",2],
["CB70","BIT 6,B",2],
["CB71","BIT 6,C",2],
["CB72","BIT 6,D",2],
["CB73","BIT 6,E",2],
["CB74","BIT 6,H",2],
["CB75","BIT 6,L",2],
["CB76","BIT 6,(HL)",2],
["CB77","BIT 6,A",2],
["CB78","BIT 7,B",2],
["CB79","BIT 7,C",2],
["CB7A","BIT 7,D",2],
["CB7B","BIT 7,E",2],
["CB7C","BIT 7,H",2],
["CB7D","BIT 7,L",2],
["CB7E","BIT 7,(HL)",2],
["CB7F","BIT 7,A",2],
["CB80","RES 0,B",2],
["CB81","RES 0,C",2],
["CB82","RES 0,D",2],
["CB83","RES 0,E",2],
["CB84","RES 0,H",2],
["CB85","RES 0,L",2],
["CB86","RES 0,(HL)",2],
["CB87","RES 0,A",2],
["CB88","RES 1,B",2],
["CB89","RES 1,C",2],
["CB8A","RES 1,D",2],
["CB8B","RES 1,E",2],
["CB8C","RES 1,H",2],
["CB8D","RES 1,L",2],
["CB8E","RES 1,(HL)",2],
["CB8F","RES 1,A",2],
["CB90","RES 2,B",2],
["CB91","RES 2,C",2],
["CB92","RES 2,D",2],
["CB93","RES 2,E",2],
["CB94","RES 2,H",2],
["CB95","RES 2,L",2],
["CB96","RES 2,(HL)",2],
["CB97","RES 2,A",2],
["CB98","RES 3,B",2],
["CB99","RES 3,C",2],
["CB9A","RES 3,D",2],
["CB9B","RES 3,E",2],
["CB9C","RES 3,H",2],
["CB9D","RES 3,L",2],
["CB9E","RES 3,(HL)",2],
["CB9F","RES 3,A",2],
["CBA0","RES 4,B",2],
["CBA1","RES 4,C",2],
["CBA2","RES 4,D",2],
["CBA3","RES 4,E",2],
["CBA4","RES 4,H",2],
["CBA5","RES 4,L",2],
["CBA6","RES 4,(HL)",2],
["CBA7","RES 4,A",2],
["CBA8","RES 5,B",2],
["CBA9","RES 5,C",2],
["CBAA","RES 5,D",2],
["CBAB","RES 5,E",2],
["CBAC","RES 5,H",2],
["CBAD","RES 5,L",2],
["CBAE","RES 5,(HL)",2],
["CBAF","RES 5,A",2],
["CBB0","RES 6,B",2],
["CBB1","RES 6,C",2],
["CBB2","RES 6,D",2],
["CBB3","RES 6,E",2],
["CBB4","RES 6,H",2],
["CBB5","RES 6,L",2],
["CBB6","RES 6,(HL)",2],
["CBB7","RES 6,A",2],
["CBB8","RES 7,B",2],
["CBB9","RES 7,C",2],
["CBBA","RES 7,D",2],
["CBBB","RES 7,E",2],
["CBBC","RES 7,H",2],
["CBBD","RES 7,L",2],
["CBBE","RES 7,(HL)",2],
["CBBF","RES 7,A",2],
["CBC0","SET 0,B",2],
["CBC1","SET 0,C",2],
["CBC2","SET 0,D",2],
["CBC3","SET 0,E",2],
["CBC4","SET 0,H",2],
["CBC5","SET 0,L",2],
["CBC6","SET 0,(HL)",2],
["CBC7","SET 0,A",2],
["CBC8","SET 1,B",2],
["CBC9","SET 1,C",2],
["CBCA","SET 1,D",2],
["CBCB","SET 1,E",2],
["CBCC","SET 1,H",2],
["CBCD","SET 1,L",2],
["CBCE","SET 1,(HL)",2],
["CBCF","SET 1,A",2],
["CBD0","SET 2,B",2],
["CBD1","SET 2,C",2],
["CBD2","SET 2,D",2],
["CBD3","SET 2,E",2],
["CBD4","SET 2,H",2],
["CBD5","SET 2,L",2],
["CBD6","SET 2,(HL)",2],
["CBD7","SET 2,A",2],
["CBD8","SET 3,B",2],
["CBD9","SET 3,C",2],
["CBDA","SET 3,D",2],
["CBDB","SET 3,E",2],
["CBDC","SET 3,H",2],
["CBDD","SET 3,L",2],
["CBDE","SET 3,(HL)",2],
["CBDF","SET 3,A",2],
["CBE0","SET 4,B",2],
["CBE1","SET 4,C",2],
["CBE2","SET 4,D",2],
["CBE3","SET 4,E",2],
["CBE4","SET 4,H",2],
["CBE5","SET 4,L",2],
["CBE6","SET 4,(HL)",2],
["CBE7","SET 4,A",2],
["CBE8","SET 5,B",2],
["CBE9","SET 5,C",2],
["CBEA","SET 5,D",2],
["CBEB","SET 5,E",2],
["CBEC","SET 5,H",2],
["CBED","SET 5,L",2],
["CBEE","SET 5,(HL)",2],
["CBEF","SET 5,A",2],
["CBF0","SET 6,B",2],
["CBF1","SET 6,C",2],
["CBF2","SET 6,D",2],
["CBF3","SET 6,E",2],
["CBF4","SET 6,H",2],
["CBF5","SET 6,L",2],
["CBF6","SET 6,(HL)",2],
["CBF7","SET 6,A",2],
["CBF8","SET 7,B",2],
["CBF9","SET 7,C",2],
["CBFA","SET 7,D",2],
["CBFB","SET 7,E",2],
["CBFC","SET 7,H",2],
["CBFD","SET 7,L",2],
["CBFE","SET 7,(HL)",2],
["CBFF","SET 7,A",2],
["CC XXXX","CALL Z,NN",3],
["CD XXXX","CALL NN",3],
["CE xx","ADC A,n",2],
["CF","RST 8",1],
["D0","RET NC",1],
["D1","POP DE",1],
["D2 XXXX","JP NC,NN",3],
["D3 xx","OUT (n),A",2],
["D4 XXXX","CALL NC,NN",3],
["D5","PUSH DE",1],
["D6 xx","SUB n",2],
["D7","RST 10",1],
["D8","RET C",1],
["D9","EXX",1],
["DA XXXX","JP C,NN",3],
["DB xx","IN A,(n)",2],
["DC XXXX","CALL C,NN",3],
["DD09","ADD IX,BC",2],
["DD19","ADD IX,DE",2],
["DD21 XXXX","LD IX,NN",4],
["DD22 XXXX","LD (NN),IX",4],
["DD23","INC IX",2],
["DD29","ADD IX,IX",2],
["DD2A XXXX","LD IX,(NN)",4],
["DD2B","DEC IX",2],
["DD34 zz","INC (IX+d)",3],
["DD35 zz","DEC (IX+d)",3],
["DD36 zz xx","LD (IX+d),n",4],
["DD39","ADD IX,SP",2],
["DD46 zz","LD B,(IX+d)",3],
["DD4E zz","LD C,(IX+d)",3],
["DD56 zz","LD D,(IX+d)",3],
["DD5E zz","LD E,(IX+d)",3],
["DD66 zz","LD H,(IX+d)",3],
["DD6E zz","LD L,(IX+d)",3],
["DD70 zz","LD (IX+d),B",3],
["DD71 zz","LD (IX+d),C",3],
["DD72 zz","LD (IX+d),D",3],
["DD73 zz","LD (IX+d),E",3],
["DD74 zz","LD (IX+d),H",3],
["DD75 zz","LD (IX+d),L",3],
["DD77 zz","LD (IX+d),A",3],
["DD7E zz","LD A,(IX+d)",3],
["DD86 zz","ADD A,(IX+d)",3],
["DD8E zz","ADC A,(IX+d)",3],
["DD96 zz","SUB (IX+d)",3],
["DD9E zz","SBC A,(IX+d)",3],
["DDA6 zz","AND (IX+d)",3],
["DDAE zz","XOR (IX+d)",3],
["DDB6 zz","OR (IX+d)",3],
["DDBE zz","CP (IX+d)",3],
["DDCB zz 06","RLC (IX+d)",4],
["DDCB zz 0E","RRC (IX+d)",4],
["DDCB zz 16","RL (IX+d)",4],
["DDCB zz 1E","RR (IX+d)",4],
["DDCB zz 26","SLA (IX+d)",4],
["DDCB zz 2E","SRA (IX+d)",4],
["DDCB zz 3E","SRL (IX+d)",4],
["DDCB zz 46","BIT 0,(IX+d)",4],
["DDCB zz 4E","BIT 1,(IX+d)",4],
["DDCB zz 56","BIT 2,(IX+d)",4],
["DDCB zz 5E","BIT 3,(IX+d)",4],
["DDCB zz 66","BIT 4,(IX+d)",4],
["DDCB zz 6E","BIT 5,(IX+d)",4],
["DDCB zz 76","BIT 6,(IX+d)",4],
["DDCB zz 7E","BIT 7,(IX+d)",4],
["DDCB zz 86","RES 0,(IX+d)",4],
["DDCB zz 8E","RES 1,(IX+d)",4],
["DDCB zz 96","RES 2,(IX+d)",4],
["DDCB zz 9E","RES 3,(IX+d)",4],
["DDCB zz A6","RES 4,(IX+d)",4],
["DDCB zz AE","RES 5,(IX+d)",4],
["DDCB zz B6","RES 6,(IX+d)",4],
["DDCB zz BE","RES 7,(IX+d)",4],
["DDCB zz C6","SET 0,(IX+d)",4],
["DDCB zz CE","SET 1,(IX+d)",4],
["DDCB zz D6","SET 2,(IX+d)",4],
["DDCB zz DE","SET 3,(IX+d)",4],
["DDCB zz E6","SET 4,(IX+d)",4],
["DDCB zz EE","SET 5,(IX+d)",4],
["DDCB zz F6","SET 6,(IX+d)",4],
["DDCB zz FE","SET 7,(IX+d)",4],
["DDE1","POP IX",2],
["DDE3","EX (SP),IX",2],
["DDE5","PUSH IX",2],
["DDE9","JP (IX)",2],
["DDF9","LD SP,IX",2],
["DE xx","SBC A,n",2],
["DF","RST 18",1],
["E0","RET PO",1],
["E1","POP HL",1],
["E2 XXXX","JP PO,NN",3],
["E3","EX (SP),HL",1],
["E4 XXXX","CALL PO,NN",3],
["E5","PUSH HL",1],
["E6 xx","AND n",2],
["E7","RST 20",1],
["E8","RET PE",1],
["E9","JP (HL)",1],
["EA XXXX","JP PE,NN",3],
["EB","EX DE,HL",1],
["EC XXXX","CALL PE,NN",3],
["ED40","IN B,(C)",2],
["ED41","OUT (C),B",2],
["ED42","SBC HL,BC",2],
["ED43 XXXX","LD (NN),BC",4],
["ED44","NEG",2],
["ED45","RETN",2],
["ED46","IM 0",2],
["ED47","LD I,A",2],
["ED48","IN C,(C)",2],
["ED49","OUT (C),C",2],
["ED4A","ADC HL,BC",2],
["ED4B XXXX","LD BC,(NN)",4],
["ED4D","RETI",2],
["ED4F","LD R,A",2],
["ED50","IN D,(C)",2],
["ED51","OUT (C),D",2],
["ED52","SBC HL,DE",2],
["ED53 XXXX","LD (NN),DE",4],
["ED56","IM 1",2],
["ED57","LD A,I",2],
["ED58","IN E,(C)",2],
["ED59","OUT (C),E",2],
["ED5A","ADC HL,DE",2],
["ED5B XXXX","LD DE,(NN)",4],
["ED5E","IM 2",2],
["ED5F","LD A,R",2],
["ED60","IN H,(C)",2],
["ED61","OUT (C),H",2],
["ED62","SBC HL,HL",2],
["ED67","RRD",2],
["ED68","IN L,(C)",2],
["ED69","OUT (C),L",2],
["ED6A","ADC HL,HL",2],
["ED6F","RLD",2],
["ED72","SBC HL,SP",2],
["ED73 XXXX","LD (NN),SP",4],
["ED78","IN A,(C)",2],
["ED79","OUT (C),A",2],
["ED7A","ADC HL,SP",2],
["ED7B XXXX","LD SP,(NN)",4],
["EDA0","LDI",2],
["EDA1","CPI",2],
["EDA2","INI",2],
["EDA3","OUTI",2],
["EDA8","LDD",2],
["EDA9","CPD",2],
["EDAA","IND",2],
["EDAB","OUTD",2],
["EDB0","LDIR",2],
["EDB1","CPIR",2],
["EDB2","INIR",2],
["EDB3","OTIR",2],
["EDB8","LDDR",2],
["EDB9","CPDR",2],
["EDBA","INDR",2],
["EDBB","OTDR",2],
["EE xx","XOR n",2],
["EF","RST 28",1],
["F0","RET P",1],
["F1","POP AF",1],
["F2 XXXX","JP P,NN",3],
["F3","DI",1],
["F4 XXXX","CALL P,NN",3],
["F5","PUSH AF",1],
["F6 xx","OR n",2],
["F7","RST 30",1],
["F8","RET M",1],
["F9","LD SP,HL",1],
["FA XXXX","JP M,NN",3],
["FB","EI",1],
["FC XXXX","CALL M,NN",3],
["FD09","ADD IY,BC",2],
["FD19","ADD IY,DE",2],
["FD21 XXXX","LD IY,NN",4],
["FD22 XXXX","LD (NN),IY",4],
["FD23","INC IY",2],
["FD29","ADD IY,IY",2],
["FD2A XXXX","LD IY,(NN)",4],
["FD2B","DEC IY",2],
["FD34 zz","INC (IY+d)",3],
["FD35 zz","DEC (IY+d)",3],
["FD36 zz xx","LD (IY+d),n",4],
["FD39","ADD IY,SP",2],
["FD46 zz","LD B,(IY+d)",3],
["FD4E zz","LD C,(IY+d)",3],
["FD56 zz","LD D,(IY+d)",3],
["FD5E zz","LD E,(IY+d)",3],
["FD66 zz","LD H,(IY+d)",3],
["FD6E zz","LD L,(IY+d)",3],
["FD70 zz","LD (IY+d),B",3],
["FD71 zz","LD (IY+d),C",3],
["FD72 zz","LD (IY+d),D",3],
["FD73 zz","LD (IY+d),E",3],
["FD74 zz","LD (IY+d),H",3],
["FD75 zz","LD (IY+d),L",3],
["FD77 zz","LD (IY+d),A",3],
["FD7E zz","LD A,(IY+d)",3],
["FD86 zz","ADD A,(IY+d)",3],
["FD8E zz","ADC A,(IY+d)",3],
["FD96 zz","SUB (IY+d)",3],
["FD9E zz","SBC A,(IY+d)",3],
["FDA6 zz","AND (IY+d)",3],
["FDAE zz","XOR (IY+d)",3],
["FDB6 zz","OR (IY+d)",3],
["FDBE zz","CP (IY+d)",3],
["FDCB zz 06","RLC (IY+d)",4],
["FDCB zz 0E","RRC (IY+d)",4],
["FDCB zz 16","RL (IY+d)",4],
["FDCB zz 1E","RR (IY+d)",4],
["FDCB zz 26","SLA (IY+d)",4],
["FDCB zz 2E","SRA (IY+d)",4],
["FDCB zz 3E","SRL (IY+d)",4],
["FDCB zz 46","BIT 0,(IY+d)",4],
["FDCB zz 4E","BIT 1,(IY+d)",4],
["FDCB zz 56","BIT 2,(IY+d)",4],
["FDCB zz 5E","BIT 3,(IY+d)",4],
["FDCB zz 66","BIT 4,(IY+d)",4],
["FDCB zz 6E","BIT 5,(IY+d)",4],
["FDCB zz 76","BIT 6,(IY+d)",4],
["FDCB zz 7E","BIT 7,(IY+d)",4],
["FDCB zz 86","RES 0,(IY+d)",4],
["FDCB zz 8E","RES 1,(IY+d)",4],
["FDCB zz 96","RES 2,(IY+d)",4],
["FDCB zz 9E","RES 3,(IY+d)",4],
["FDCB zz A6","RES 4,(IY+d)",4],
["FDCB zz AE","RES 5,(IY+d)",4],
["FDCB zz B6","RES 6,(IY+d)",4],
["FDCB zz BE","RES 7,(IY+d)",4],
["FDCB zz C6","SET 0,(IY+d)",4],
["FDCB zz CE","SET 1,(IY+d)",4],
["FDCB zz D6","SET 2,(IY+d)",4],
["FDCB zz DE","SET 3,(IY+d)",4],
["FDCB zz E6","SET 4,(IY+d)",4],
["FDCB zz EE","SET 5,(IY+d)",4],
["FDCB zz F6","SET 6,(IY+d)",4],
["FDCB zz FE","SET 7,(IY+d)",4],
["FDE1","POP IY",2],
["FDE3","EX (SP),IY",2],
["FDE5","PUSH IY",2],
["FDE9","JP (IY)",2],
["FDF9","LD SP,IY",2],
["FE xx","CP n",2],
["FF","RST 38",1]
]

class Z80_Disassemble():
    ''' Z80_Disassemble Notes
        the Z80 commands range from a single byte to 4 bytes.
        the hex code if separated by a space is either xx, yy, zz or xxxx
        the mnemonic d is replaced with zz
        the mnemonic n is replaced with xx
        the mnemonic NN is replaced with XXXX
        the mnemonic e is replaced with yy

        There are 3 disassembler (non-Z80 instructions):- DB , DW and DS which could lead to incorrect Z80 disassembly output if not captured beforehand.

        2 bytes with address = 4 bytes       
        DD21 XXXX
        DD22 XXXX
        ED43 XXXX
        ED4B XXXX
        ED53 XXXX
        ED58 XXXX
        ED73 XXXX
        ED7B XXXX
        FD21 XXXX
        FD22 XXXX
        FD2A XXXX

        2 bytes with displacment and then hex = 4 bytes
        FDCB zz hex
        DDCB zz hex
        DD36 zz xx
        FD36 zz xx

        2 bytes wih a number = 3 bytes
        DD34,35,46,4e, 56, 5e, 66,6e zz
        DD70, 71,72,73,74,75,77, 7e zz
        DD86, 8e, 96, 9e, a6, ae, b6, be zz
        FD34,35 zz
        FD46,4e,56,5e,66,6e zz
        FD70,71,72,73,74,75,77, 7e zz
        FD86, 8e, 96, 9e, a6, ae, b6, be zz

        2 byte pairs searched

        1 byte with an 2 byte address = 3 bytes
        01 XXXX
        11 XXXX
        21 XXXX
        22 XXXX
        2A XXXX
        31 XXXX
        32 XXXX
        3A XXXX
        C2 XXXX
        C3 XXXX
        C4 XXXX
        CA XXXX
        CC XXXX
        CD XXXX
        D2 XXXX
        D4 XXXX
        DA XXXX
        DC XXXX
        E2 XXXX
        E4 XXXX
        EA XXXX
        EC XXXX
        F2 XXXX
        F4 XXXX           
        FA XXXX
        FC XXXX

        1 byte with a single number/displacment = 2bytes
        06,0e,16,1e,26,2e,36,3e xx
        10,18,20,28,30,38 yy
        c6, ce, d3, d6, db, de, e6, ee, f6, fe xx
                 
        finally the 1 byte only pairs searched = 1 byte.

        Note: RST 00H, 08H, 10H, 18H, 20H, 28H, 20H, 38H coded in MTX assembler as RST 0,8,10,18,20,28,38
    '''
    def __del__(self): #is this required?
        class_name = self.__class__.__name__
        #print (class_name, "destroyed")
    
    def __init__(self, dbf=None, z80wip=[],memaddr=16391):

        ''' Disassembles bytes to Z80 assembly language text
            parameters passed:
            1. list : dbf (default = None)
            2. list : z80WIP (default = []}
            3. integer : memaddr (default = 16391)
            4. integer : codest (default = 16391) - deleted
            5. integer : codeend (default = 16391) - deleted

            parameters returned:
            a) list: self.Z80Assem_res [0,"",0,""] where
            [0] = integer: 16-bit addr
            [1] = string: Z80 assembly code
            [2] = integer: num of bytes in Z80 instruction
            [3] = num_type (xx, yy, zz (+d), zz xx, xxxx)]

        '''
        self.DB=dbf
        self.Z80WIP=z80wip # data byte segement and number of bytes counter at [0]
        self.ByteCnt=self.Z80WIP[0]
        self.Z80Pos=-1 #no match
        self.Z80CPU_cycle=0 #still to be coded for
        self.Z80Assem_res=[0,"",0,""] #addr, Z80Assem_str, number of bytes, num_type (xx, yy, zz (+d), zz xx, xxxx)


        if self.DB==None or self.DB=="" or self.Z80WIP==None:
            print("Database empty or not specified &/or Z80 hex number not specified")
            #return
        else:
            #print("TEST: self.Z80WIP[]= ",self.Z80WIP)
            #Z80 hex number must be the 1st column.
            #displaying any numbers in the assembly code as hexadecimal with hash prefix       
            g=-1
            #print("length of self.DB[0]= ",len(self.DB))
            self.Z80Assem_res[0]=memaddr #assumes memory address is decimal and not hexadecimal
            tmp_str="" #working string
            try:
                while g<=len(self.DB[0]) or self.Z80Pos==-1:
                        g=g+1
                        #print(g,self.Z80Pos)
                        #print("TEST: self.DB[g][0], g index= ",g)
                        if self.Z80WIP[1] in self.DB[g][0]:
                            #print("a potential match")
                            #not an exact match, could be multiple entries, now check if exact             

                            if self.Z80WIP[1]==self.DB[g][0]:
                                self.Z80Pos = g
                                #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemonic_db[self.Z80Pos][1]
                                self.Z80Assem_res[1]=z80_mnemonic_db[self.Z80Pos][1]
                                self.Z80Assem_res[2]=1
                                #[3]=""
                                #print("TEST: single byte Z80 commands only")
                                #exact match to single byte Z80 mnemonics

                            elif self.Z80WIP[1]+self.Z80WIP[2]==self.DB[g][0]:
                                self.Z80Pos = g #exact match to two byte only Z80 mnemonics
                                #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemonic_db[self.Z80Pos][1]
                                self.Z80Assem_res[1]=z80_mnemonic_db[self.Z80Pos][1]
                                self.Z80Assem_res[2]=2
                                #[3]=""
                                #print("TEST: two byte only Z80 commands")

                            elif self.Z80WIP[1]+" xx"==self.DB[g][0]:
                                self.Z80Pos = g
                                #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemonic_db[self.Z80Pos][1]
                                tmp_str=z80_mnemonic_db[self.Z80Pos][1]
                                cnt=tmp_str.find("n")
                                self.Z80Assem_res[1]=tmp_str[:cnt]+"#"+self.Z80WIP[2]+tmp_str[cnt+1:]
                                self.Z80Assem_res[2]=2
                                self.Z80Assem_res[3]="xx"
                                #print("TEST: byte xx, replace n in Assem with byte")
                                #exact match to
                                #06,0e,16,1e,26,2e,36,3e xx
                                #c6, ce, d3, d6, db, de, e6, ee, f6, fe xx

                            elif self.Z80WIP[1]+" yy"==self.DB[g][0]:
                                self.Z80Pos = g
                                #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemonic_db[self.Z80Pos][1]
                                tmp_str=z80_mnemonic_db[self.Z80Pos][1]
                                cnt=tmp_str.find("e")
                                self.Z80Assem_res[1]=tmp_str[:cnt]+"#"+self.Z80WIP[2]+tmp_str[cnt+1:]
                                self.Z80Assem_res[2]=2
                                self.Z80Assem_res[3]="yy"
                                #print("TEST: byte yy. Replace e in Assem with byte")
                                #exact match to
                                #10,18,20,28,30,38 yy

                            elif self.Z80WIP[1]+" XXXX"==self.DB[g][0]:
                                self.Z80Pos = g 
                                #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemonic_db[self.Z80Pos][1]
                                tmp_str=z80_mnemonic_db[self.Z80Pos][1]
                                cnt=tmp_str.find("NN")
                                #note 16-bit address stored LSB 1st then MSB next in memory
                                self.Z80Assem_res[1]=tmp_str[:cnt]+"#"+self.Z80WIP[3]+self.Z80WIP[2]+tmp_str[cnt+2:]
                                self.Z80Assem_res[2]=3
                                self.Z80Assem_res[3]="XXXX"
                                #print("TEST: byte XXXX. Replace NN in Assem with 16-bit addr")
                                #exact match to
                                #01,11,21,22,2A,31,32,3A,C2,C3,C4,CA,CC,CD XXXX
                                #D2,D4,DA,DC,E2,E4,EA,EC,F2,F4,FA,FC XXXX

                            elif self.Z80WIP[1]+self.Z80WIP[2]+" zz"==self.DB[g][0]:
                                self.Z80Pos = g 
                                #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemonic_db[self.Z80Pos][1]
                                tmp_str=z80_mnemonic_db[self.Z80Pos][1]
                                cnt=tmp_str.find("d")
                                self.Z80Assem_res[1]=tmp_str[:cnt]+"#"+self.Z80WIP[3]+tmp_str[cnt+1:]
                                self.Z80Assem_res[2]=3
                                self.Z80Assem_res[3]="zz"
                                #print("TEST: remaining 2 byte pairs and zz. Replace d in Assem with byte")
                                #exact match to
                                #DD34,35,46,4e, 56, 5e, 66,6e zz
                                #DD70, 71,72,73,74,75,77, 7e zz
                                #DD86, 8e, 96, 9e, a6, ae, b6, be zz
                                #FD34,35 zz
                                #FD46,4e,56,5e,66,6e zz
                                #FD70,71,72,73,74,75,77, 7e zz
                                #FD86, 8e, 96, 9e, a6, ae, b6, be zz
                    
                            elif self.Z80WIP[1]+self.Z80WIP[2]+" zz "+self.Z80WIP[4]==self.DB[g][0]:
                                self.Z80Pos = g 
                                #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemonic_db[self.Z80Pos][1]
                                tmp_str=z80_mnemonic_db[self.Z80Pos][1]
                                cnt=tmp_str.find("d")
                                self.Z80Assem_res[1]=tmp_str[:cnt]+"#"+self.Z80WIP[3]+tmp_str[cnt+1:]
                                self.Z80Assem_res[2]=4
                                self.Z80Assem_res[3]="zz"
                                #print("DDCB or FDCB zz hex. Replace d in Assem with byte")
                                #exact match to
                                #DDCB zz hex and FDCB zz hex

                            elif self.Z80WIP[1]+self.Z80WIP[2]+" zz xx"==self.DB[g][0]:
                                self.Z80Pos = g 
                                #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemonic_db[self.Z80Pos][1]
                                tmp_str=z80_mnemonic_db[self.Z80Pos][1]
                                cnt=tmp_str.find("d")
                                tmp_str=tmp_str[:cnt]+"#"+self.Z80WIP[3]+tmp_str[cnt+1:]
                                cnt=tmp_str.find("n")
                                self.Z80Assem_res[1]=tmp_str[:cnt]+"#"+self.Z80WIP[4]+tmp_str[cnt+1:]
                                self.Z80Assem_res[2]=4
                                self.Z80Assem_res[3]="zz xx"
                                #print("TEST: DD36 or FD36 zz xx. Replace d with byte and replace n with byte")
                                #exact match to
                                #DD36 zz xx and FD36 zz xx

                            elif self.Z80WIP[1]+self.Z80WIP[2]+" XXXX"==self.DB[g][0]:
                                self.Z80Pos = g
                                #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemonic_db[self.Z80Pos][1]
                                tmp_str=z80_mnemonic_db[self.Z80Pos][1]
                                cnt=tmp_str.find("NN")
                                #note 16-bit address stored LSB 1st then MSB next in memory
                                self.Z80Assem_res[1]=tmp_str[:cnt]+"#"+self.Z80WIP[4]+self.Z80WIP[3]+tmp_str[cnt+2:]
                                self.Z80Assem_res[2]=4
                                self.Z80Assem_res[3]="XXXX"
                                #exact match to
                                #print("TEST: DD21,DD22,ED43,ED4B,ED53,ED58,ED73,ED7B,FD21,FD22,FD2A XXXX. Replace NN in Assem with 16-bit addr")
                                #DD21,DD22,ED43,ED4B,ED53,ED58,ED73,ED7B,FD21,FD22,FD2A XXXX

                        #end if-elif-else
                    #end if
                #end while
            except IndexError:
                #not a match on the 2nd byte where 1st byte is CB,DD,ED and FD
                ''' only Z80 opcode pairs are 
                    CB 2nd byte full byte range except 0x30 to 0x37
                    DD 2nd byte - not a full byte range, no DDCB ZZ 36
                    ED 2nd byte - not a full byte range
                    FD 2nd byte - not a full byte range, no FDCB ZZ 36
                '''
                self.Z80Assem_res[1]="DB #"+self.Z80WIP[1]+",#"+self.Z80WIP[2]+"\t; Err: Opcode pair not valid, trapped error with DB"
                self.Z80Assem_res[2]=2
        #end if-else
        return #returns self.Z80Assem_res

class get_mtx_directives_info():
    '''
        Doesn't include the Zilog 11 assembler directives - ORG NN, EQU NN, DEFL NN, DEFB n, DEFB 'S', DEFW NN, DEFS NN, DEFM 'S', MACRO P0 P1 ...Pn, END, ENDM
        Some of these are available in the MTX assembler for example DB n or DB "S", DW NN, DS n and use of labels, reference to labels and comments
        MTX specific diassembler commands which must be decoded in advance of main Z80 disassembly.
        e.g.
        adjusts any number or address to be either hex or decimal or use a mix in the listing.
        JR / DJNZ n
        JP addr
        Text labels (ends with a colon)
        DB n (0 to 255, can also be a list, e.g. DB 27,"K",0,1
        DW nn (16-bit address)
        DS n (reserve space - only allows values from 0 to 254 as 255 (#FF) is reserved for End of line/code
        Comments (starts with a semicolon)
        '''
    def __del__(self): #is this required?
        class_name = self.__class__.__name__
        #print (class_name, "destroyed")

    def __init__(self,fname_in=None, fname_in_pos=0,extra_len=0):
        ''' parameters passed
        list : fname_in (default = None)
        int : fname_in_pos (default = 0)
        int : extra_len (default = 0)
        '''
        self.fn_in=None
        self.fn_in_pos=fname_in_pos
        self.extra_cnt=extra_len
        self.extra_bytes=[0]*(extra_len)
        self.byte_read_cnt=0
        self.info_dbf=[] #create empty array
        self.row_cnt=0 #will need this for search info_dbf=disassem addr then swap for label 
          
        '''define memory storage for labels, comments, etc
        currently 1 decode per row, alternative array structure, collect all into 1 row per RAM offset
        info_dbf=[[]]
        [0] = "" Numbers as ASCII text. This is where the disassembler tracks if the user used hex or decimal for numbers or addresses
                 The coding here will skip this and either use all hex (default) or decimal (option to code into Z80_disassem class) and not a hybrid which this allows.
        [1] = "" 
        [2] = "" label includes ":" at end of label text
        [3] = "" DB text includes "DB " at start of text 
        [4] = "" DW text includes "DW " at start of text 
        [5] = "" DS text includes "DS " at start of text 
        [6] = ""
        [7] = ""
        [8] = comment includes ";" at start of text
        [9] = ""
        [10] = ""
        '''

        #test code - had to move this up as didn't run if after the other functions below
        if fname_in is None:
            return
        
        self.fn_in = open(fname_in, 'rb')
        #for vv in range(self.fn_in_pos):
        #    int.from_bytes(self.fn_in.read(1),"little") #skip 
        self.fn_in.seek(self.fn_in_pos,0) #goto file position as a displacement from file start

        vv=0
        prev_token_id=-1
        while vv<self.extra_cnt:
        #for vv in range(self.extra_cnt):
            token_start_pos=self.fn_in.tell()
            token_id=int.from_bytes(self.fn_in.read(1),"little")
            parse_num_token=True
            if vv<len(self.extra_bytes):
                self.extra_bytes[vv]=token_id #copy (best-effort debug mirror)
            if token_id==0:
                peek_pos=self.fn_in.tell()
                peek_bytes=self.fn_in.read(2)
                self.fn_in.seek(peek_pos)
                next_byte=peek_bytes[0] if len(peek_bytes)>=1 else 0
                next2_byte=peek_bytes[1] if len(peek_bytes)>=2 else 0
                # Quoted character literals such as CP "R" are valid Num_00
                # payloads and must follow the same path as the original parser.
                num_sig_ok=(next_byte in (34,35)) or \
                           (48<=next_byte<=57) or (176<=next_byte<=185) or \
                           (65<=next_byte<=90) or (97<=next_byte<=122) or \
                           (193<=next_byte<=218) or (225<=next_byte<=250)
                expected_pad=(next_byte in (0,1)) and (next2_byte in (2,3,4,5,8))
                if num_sig_ok==False:
                    if expected_pad==False:
                        pass
                    parse_num_token=False
            if token_id==0:
                if parse_num_token:
                    #print("Num_00")
                    self.Num_00()
            elif token_id==1:
                #print("Ptr_01")
                self.U_01()
            elif token_id==2:
                #print("Label_02")
                self.Label_02()
            elif token_id==3:
                #print("DB_03")
                self.DB_03()
            elif token_id==4:
                #print("DW_04")
                self.DW_04()
            elif token_id==5:
                #print("DS_05")
                self.DS_05()
            elif token_id==6:
                #print("U_06")
                self.U_06()
            elif token_id==7:
                #print("U_07")
                self.U_07()
            elif token_id==8:
                #print("Comment_08")
                self.Comment_08()
            elif token_id==9:
                #print("U_09")
                self.U_09()
            elif token_id==255:
                #print("end of directives")
                break #end while
            else:
                #print("Not defined")
                pass #skip
            #end if-elif-else
            token_end_pos=self.fn_in.tell()
            consumed=(token_end_pos-token_start_pos)
            if consumed<=0:
                consumed=1
            vv=vv+consumed
            prev_token_id=token_id
            self.byte_read_cnt=0 #reset for next loop
        #end while
        self.fn_in.close()

    def byte_type(self,ref_cnt,tdbf=[]):
        if ref_cnt>0: #guard
            for vv in range(ref_cnt): #number of instances of references to relative jump references
                tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
                tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                tdbf[1]=(tmp_msb*256)+tmp_lsb
                self.byte_read_cnt=self.byte_read_cnt+2
                self.info_dbf.append(tdbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
                self.row_cnt=self.row_cnt+1
            #end for
            tmp_lsb=int.from_bytes(self.fn_in.read(1),"little")
            self.byte_read_cnt=self.byte_read_cnt+1
            pad_pos=self.fn_in.tell()
            tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
            if tmp_lsb==tmp_msb==0:
                #two end pad bytes (0x00 0x00) required for byte types
                self.byte_read_cnt=self.byte_read_cnt+1
            elif tmp_lsb>0: #ref_cnt for a word hybrid
                #potential for a follow on word type
                #reset file pos back by 1 or byte pair out of sequence
                self.fn_in.seek(pad_pos)
                self.word_type(tmp_lsb,tdbf)
            #end if-elif
        #end if
        return

    def word_type(self,ref_cnt,tdbf=[]):
        if ref_cnt>0: #guard
            for vv in range(ref_cnt): #number of instances of references to relative jump references
                tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
                tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                tdbf[1]=(tmp_msb*256)+tmp_lsb
                self.byte_read_cnt=self.byte_read_cnt+2
                self.info_dbf.append(tdbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
                self.row_cnt=self.row_cnt+1
            #end for
            #one end pad byte (0x00) required for word types
            #potential for a follow on jump type, so set flag to 2
            tmp_lsb=int.from_bytes(self.fn_in.read(1),"little")
            self.byte_read_cnt=self.byte_read_cnt+1
            if tmp_lsb>0:
                #one end pad bytes (0x0) required for word types - None found
                self.jump_type(tmp_lsb,tdbf)
            #end if
        #end if
        return

    def jump_type(self,ref_cnt=0,tdbf=[]):
        if ref_cnt>0: #guard
            for vv in range(ref_cnt): #number of instances of references to relative jump references
                tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
                tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                tdbf[1]=(tmp_msb*256)+tmp_lsb
                self.byte_read_cnt=self.byte_read_cnt+2
                self.info_dbf.append(tdbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
                self.row_cnt=self.row_cnt+1
            #end for
        #end if
        #no end pad byte required for relative jumps - next byte could be 0x00 meaning a number so no need to test
        #mtxOS assesses in order of byte then word then jump if not defined beforehand.
        return

    def Num_00(self): 
        '''00 number (ie Number in characters)
        #<number> <type><ref offsets..><pad>
        in assembler section the 2nd byte of any relative jump (e.g. JR n or DJNZ n) is either 0-127 if the jump is forward (down) in the code
        or 255 to 128 if backward (up) in the code (i.e bit 7 is set). The count is from the 2nd byte of the relative jump instruction
        either forward or backward. The text label (if one assigned) will replace the number in the disassembled code
        <0x00>
        <decimal or hexadecimal number represented as ASCII characters> The hexadecimal number in MTX BASIC is prefixed with a # (hash) symbol
        Example, LD A,#0D would be represented in the main code block as 3E 0D and at the end of the by code block by 00 23 30 C4, where 00 is the token for number definition, 23 is ASCII for #, 30 is ASCII for 0 and C4 is ASCII for D with bit 7 set (#80+#44=#C4) to indicate end of number
                after the number definition, there will be either 3 or 5 or 7 or etc bytes depending on how many times the number is referenced in the code block. If only 3 bytes (see below) then the number has been discarded/not referenced.
        <type> & <number of bytes afterwards to track number of times the number is referenced> 
                3 types:
                a) byte (0x01). Note: pad bytes = 0x00 and 0x00 when type is byte 
                    <0x01> (for 1st reference (or instance) and increases if number is referenced more than once> <offset (LSB/MSB)> <2 pad bytes>
                    so if only 1 instance of number #C3, you should get 0x01+count = 0x01 not 0x02
                b) word (0x00) &  <n> where n = 0x01 if one instance, 0x02 if two etc. Note: pad bytes = 0x00 when type is word
                    <00> <number of instances of this word)> <offset of 1st instance (LSB/MSB)> <offset of 2nd instance (LSB/MSB)> <etc..><1 pad bytes>
                c) relative jump must be a label. The mtx inline editor throws an out of range error otherwise
                <0x00><0x00><n> where n = 0x01 if one instance, 0x02 if two etc. Note: NO pad byte(s)
        followed by:
        <ref offset, 2 bytes LSB/MSB> for each reference to the label in the code block, if only 0x00 and therefore three 0x00 bytes after the label ascii chars then label not referenced and can be discarded.
        {optional, pad 0x00 or 0x00 0x00 byte(s)  as types a) and c) use odd number of bytes for references}A normal JP instruction is followed by an address. The text label (if one assigned) will replace the address in the disassembled code
        '''

        if self.fn_in==None:
            return
        #tmp_dbf=[dis_code_byte,offset,"text"]
        tmp_dbf=[0,0,"",0]
        #tmp_dbf=self.default_dbf #this doesn't work!!!       
        self.byte_read_cnt=0 #read tracker set
        while True:
            tmp_read=int.from_bytes(self.fn_in.read(1),"little")
            self.byte_read_cnt=self.byte_read_cnt+1
            if tmp_read>31 and tmp_read<=127: #labels must be ascii - might need to fine tune ao that only 0-9,a-z and A-Z. Chars 0-31 and 127 and non-printable
                tmp_dbf[2]=str(tmp_dbf[2])+chr(tmp_read)
            elif tmp_read>127: # bit 7 set, so end of label
                tmp_dbf[2]=str(tmp_dbf[2])+chr((tmp_read-128))
                #next 3, 5 ,7 , 9, ext bytes or specify if a byte or a word or multiples of (ie number repeats throughout the code) and the memory offset
                #note if 3 zeroes after then remnant of a previous error and should be skipped.
                tmp_read=int.from_bytes(self.fn_in.read(1),"little")
                tmp_read1=int.from_bytes(self.fn_in.read(1),"little")
                tmp_read2=int.from_bytes(self.fn_in.read(1),"little")
                self.byte_read_cnt=self.byte_read_cnt+3
                if tmp_read==tmp_read1==tmp_read2==0: #potential remnant error - IS THIS STILL VALID - YES
                    pass #if a remnant error, the number is skipped (i.e. not outputed)
                    break #end while loop
                elif tmp_read==tmp_read1==0 and tmp_read2>0: 
                    #relative jump reference only. Note this will finish on an odd number count meaning end of label list.
                    self.jump_type(tmp_read2,tmp_dbf) #no pad bytes and checks for hybrids
                    #no pad byte required for relative jumps
                    break #end while loop
                elif tmp_read==0 and tmp_read1>0: #word address reference. Note this will finish on an even number. If the next odd number is not 00 then some relative adresses to deal with
                    #already have the 1st byte of the 1st label reference offset
                    tmp_lsb=tmp_read2
                    tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                    tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
                    self.byte_read_cnt=self.byte_read_cnt+1
                    self.info_dbf.append(tmp_dbf[:])
                    self.row_cnt=self.row_cnt+1
                    #any for word address references
                    self.word_type(tmp_read1-1,tmp_dbf) #includes pad byte test and checks for hybrids
                    break #end while loop
                elif tmp_read>0: #byte type single entry 
                    #already read the next 2 bytes after this
                    tmp_dbf[1]=(tmp_read2*256)+tmp_read1
                    self.info_dbf.append(tmp_dbf[:])
                    self.row_cnt=self.row_cnt+1
                    self.byte_type(tmp_read-1,tmp_dbf) #includes pad byte test and checks for hybrids
                    break #end while loop
                break #safety: never continue scanning chars after terminator-byte metadata processing
            #end if-elif
        #end while
        
        return
    
    def U_01(self):
        #unknown
        #tmp_dbf=[dis_code_byte,offset,"text"]
        tmp_dbf=[1,0,""]
        #add a hybrid guardrail alert - only works if a single hybrid, ie 0x01.
        if self.info_dbf!=[]:
            if self.info_dbf[self.row_cnt-1][0]==0:
                print("DEBUG: hydrid - byte first, now processing word number")
            elif self.info_dbf[self.row_cnt-1][0]==2:
                print("DEBUG: hydrid - word first, now processing jump label")
            #end if-elif

        return
    
    def Label_02(self):
        '''02 LABEL
        The disassembled text label ends with a colon (:)
        <02>
        <offset from code start (2 bytes)>
        <label ascii string (variable length), last character has bit 7 set> Note: for disassembly bit 7 is off and a colon is added after the label
        3,5,7,9,etc bytes afterwards track how many instances the label has been referred to in the code>
        <type> & <number of bytes afterwards to track number of times the label is referenced> 
                3 types of label usage:
                a) byte (0x01) Note: pad bytes = 0x00 and 0x00 when type is byte - unlikely as a label is always an address.
                b) word (0x00) &  n where n = 0x01 if one instance (excludes the actual label offset above), 0x02 if two etc. Note: pad bytes = 0x00 when type is word
                c) relative jump, JR or DJ (0x00 0x00)  &  n = 0x01 if one instance (excludes the actual label offset above), 0x02 if two etc. Note: no pad bytes when type is relative jump or for discards
        followed by:
        <ref offset, 2 bytes LSB/MSB> for each reference (CALL/USED) of the label in the code block, if not used elsewhere, then none of these reference offsets will be present.
        {optional, pad 0x00 or 0x00 0x00 byte(s)  as types a) and c) use odd number of bytes for references}
        self.info_dbf=[[id type,addr,string,number of bytes affected for DB,DS and DW]] where the "" are accumulated string information
        
        examples:
        MOVECODE: represented as the following mtx directive (hex dump)
        [0x02 0x00 0x00 0x4d 0x4f 0x56 0x45 0x43 0x4f 0x44 0xc5 0x00 0x00 0x00] => Label MOVECODE, it is 0 bytes offset. It is not referenced anywhere else.

        A more detailed example of a code block below as a hex dump  
        [0x1F 0x 00 0x0A 0x00 0xC2 0x05 0x00 0x3A 0x0A 0x40 0x0F 0xC9 0x02 0x03 0x00 0x56 0x41 0xCC 0x00 0x01 0x01 0x00 0x00]

        represents the following code block in MTX BASIC inline assembler:
        10 CODE   [0x1F 0x 00 0x0A 0x00 0xC2 0x05 0x00]
         4007 LD A,(VAL)  [0x3A 0x0A 0x40 ]
         400A VAL: DB 15 [0x0F]
         400B C9  [0xC9]
        <label ID> [0x02] 
        <LABEL offset from start of the opcode, LSB/MSB> [0x03 0x00]
        <ascii chars> [0x56 0x41 0xcc  (last char bit 7 set and colon not required)
        <type/number of calling offsets> [0x00 0x01] (VAL points to an address which is a word and 1 use of the label)
        <label referenced (used/called), relative offset to where the label is defined,  LSB/MSB> [0x01 0x00] 
        <pad> [0x00]

        Hydrid mode as well for labels. It processes word labels first then jump labels. Currently, this leads to an error by jumping to U_01

        example: where 2 numbers
        LD A,4
        LD DE,4
        LD HL,TEST
        JR TEST
        RET
        RET
        RET
        TEST: RET
        RET

        the mtx directive breakdown (similar to the hybrid in number but in number its byte follwed by a number)
        Number  00
                B4      4
                01      1 ref of 4 as part of a byte construct
                01 00   offset
                01      1 ref of 4 as part of a word construct
                03 00   offset
                00      pad byte as last ref was a word

        label   02 
                0D 00           offset where label is defined
                54 45 53 D4     ascii for TEST
                00 01           1 ref of label as part of a word construct
                06 00           offset where label was referenced
                01              1 ref of label as part of ajump construct
                09 00           offset where label was referenced. No pad as last ref was for a Jump.

        If a label is defined but not referenced, then it willend with 3 0x00 bytes
        02 
        0D 00
        54 45 53 D4     ascii for TEST
        00 00 00        TEST is defined but not referenced elsewhere in the code block
        '''

        if self.fn_in==None:
            return
        #tmp_dbf=[dis_code_byte,offset,"text"]
        tmp_dbf=[2,0,"",0] #investigate reason why didn't extend columns rather than add rows!
        #tmp_dbf=self.default_dbf #this doesn't work!!!
        tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
        tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
        tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
        self.byte_read_cnt=2 #read tracker set
        not_valid_cnt=0
        while True:
            #get "label:"
            tmp_read=int.from_bytes(self.fn_in.read(1),"little")
            self.byte_read_cnt=self.byte_read_cnt+1
            #loop until label fully formed - ascii characters first, then end character (bit 7 set) and add ":"
            #continue looping until references all identified. References are without the ":" which is unique to the label name only
            if tmp_read>31 and tmp_read<127: #labels must be ascii - might need to fine tune ao that only 0-9,a-z and A-Z. chars 0-31 and 127 are non-printable
                tmp_dbf[2]=str(tmp_dbf[2])+chr(tmp_read)
            elif tmp_read==127: #DEL - skip adding to label
                print("DEBUG: tmp_read=127 DEL - not a valid character or a BASIC token", tmp_read)
            elif tmp_read>127: # bit 7 set, so end of label
                tmp_dbf[2]=str(tmp_dbf[2])+chr((tmp_read-128))+":" #add colon to indicate label.
                if "\x7f" in tmp_dbf[2]:
                    #print("DEBUG: FOUND '\x7f'")
                    not_valid_cnt=self.row_cnt #delete entries from this position once all scanned
                self.info_dbf.append(tmp_dbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
                #print("TEST: decode = ",self.info_dbf[self.row_cnt])
                self.row_cnt=self.row_cnt+1
                #get references to this label
                #depending on many references to this label, the next 3,5,7,9 or .. bytes will provide the necessary information
                tmp_read=int.from_bytes(self.fn_in.read(1),"little")
                tmp_read1=int.from_bytes(self.fn_in.read(1),"little")
                tmp_read2=int.from_bytes(self.fn_in.read(1),"little")
                self.byte_read_cnt=self.byte_read_cnt+3
                #process the label references
                #strip colon out as not required for reference labels. swap out bytes, word (16-bit) and relative jumps
                a_str=tmp_dbf[2]
                tmp_dbf[2]=a_str[:-1] #strip out the colon from the label
                if tmp_read==tmp_read1==tmp_read2==0: #label defined but not referenced elsewhere
                    pass
                    #bytecount already covered above and no need to read and skip the pad byte as already done
                    break #end while loop
                elif tmp_read==tmp_read1==0 and tmp_read2>0: 
                    #relative jump reference only. Note this will finish on an odd number count meaning end of label list.
                    self.jump_type(tmp_read2,tmp_dbf) #no pad bytes and checks for hybrids
                    #no pad byte required for relative jumps
                    break #end while loop
                elif tmp_read==0 and tmp_read1>0: #word address reference. Note this will finish on an even number. If the next odd number is not 00 then some relative adresses to deal with
                    #already have the 1st byte of the 1st label reference offset
                    tmp_lsb=tmp_read2
                    tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                    tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
                    self.byte_read_cnt=self.byte_read_cnt+1
                    self.info_dbf.append(tmp_dbf[:])
                    self.row_cnt=self.row_cnt+1
                    #any for word address references
                    self.word_type(tmp_read1-1,tmp_dbf) #includes pad byte test and checks for hybrids
                    break #end while loop
                elif tmp_read>0: #byte type single entry 
                    #already read the next 2 bytes after this
                    tmp_dbf[1]=(tmp_read2*256)+tmp_read1
                    self.info_dbf.append(tmp_dbf[:])
                    self.row_cnt=self.row_cnt+1
                    self.byte_type(tmp_read-1,tmp_dbf) #includes pad byte test and checks for hybrids
                    break #end while loop
                break #safety: never continue scanning chars after terminator-byte metadata processing
            #end if-elif
        #end while
        if not_valid_cnt>0:
            #remove all '\x7f' control code labels just processed and update row_cnt
            not_valid_cnt=self.row_cnt-not_valid_cnt
            #print("DEBUG: not valid cnt", not_valid_cnt)
            del self.info_dbf[-not_valid_cnt:]
            self.row_cnt=self.row_cnt-not_valid_cnt
        
        return #self.info_dbf
        
    def DB_03(self):
        '''byte, separate with commas. Use quotations for text
        03 DB
        <03><offset (2bytes)><byte count><length><string>
        Note: if the number after DB is decimal it will be shown as ASCII decimal and likewise for hexadecimal
        '''
        if self.fn_in==None:
            return
        #tmp_dbf=[dis_code_byte,offset,"text"]
        tmp_dbf=[3,0,"",0]
        #tmp_dbf=self.default_dbf #this doesn't work!!!
        tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
        tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
        tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
        tmp_dbf[3]=int.from_bytes(self.fn_in.read(1),"little") #byte count
        char_cnt=int.from_bytes(self.fn_in.read(1),"little") #record number of chars because need to know when end as no comma
        self.byte_read_cnt=4 #read tracker set
        while (self.byte_read_cnt-4)<char_cnt:
            tmp_read=int.from_bytes(self.fn_in.read(1),"little")
            self.byte_read_cnt=self.byte_read_cnt+1
            if char_cnt==1 or self.byte_read_cnt==5:
                tmp_dbf[2]=str(tmp_dbf[2])+"DB " #starts with DB
            #end if
            if tmp_read>31 and tmp_read<128: #std ascii
                tmp_dbf[2]=str(tmp_dbf[2])+chr(tmp_read)
            elif tmp_read>127: # bit 7 set, punctuation or end
                if (self.byte_read_cnt-4)==char_cnt:
                    tmp_dbf[2]=str(tmp_dbf[2])+chr((tmp_read-128))
                    break #end while loop - don't add a comma at end
                else:
                    tmp_dbf[2]=str(tmp_dbf[2])+chr((tmp_read-128))+","
                #end if-else
            #end if-elif
        #end while
        self.info_dbf.append(tmp_dbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
        #print("TEST: Labe1_03 decoded")
        #print("TEST: decode = ",self.info_dbf[self.row_cnt])
        self.row_cnt=self.row_cnt+1
        return
    
    def DW_04(self):
        '''16-bit word / address
        04 DW
        <offset (2bytes)><word count><length><string>
        Note: if the number after DW is decimal it will be shown as ASCII decimal and likewise for hexadecimal
        '''
        if self.fn_in==None:
            return
        #tmp_dbf=[dis_code_byte,offset,"text"]
        tmp_dbf=[4,0,"",0]
        #tmp_dbf=self.default_dbf #this doesn't work!!!
        tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
        tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
        tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
        tmp_dbf[3]=int.from_bytes(self.fn_in.read(1),"little") #word byte count
        char_cnt=int.from_bytes(self.fn_in.read(1),"little") # number of chars
        self.byte_read_cnt=4 #read tracker set
        while (self.byte_read_cnt-4)<char_cnt:
            tmp_read=int.from_bytes(self.fn_in.read(1),"little")
            self.byte_read_cnt=self.byte_read_cnt+1
            if char_cnt==1 or self.byte_read_cnt==5:
                tmp_dbf[2]=str(tmp_dbf[2])+"DW " #starts with DW
            #end if
            if tmp_read>31 and tmp_read<128: #std ascii - might need to fine tune ao that only 0-9,a-z and A-Z
                tmp_dbf[2]=str(tmp_dbf[2])+chr(tmp_read)
            elif tmp_read>127: # bit 7 set, so end
                if (self.byte_read_cnt-4)==char_cnt:
                    tmp_dbf[2]=str(tmp_dbf[2])+chr((tmp_read-128))
                    break #end while loop - don't add a comma at end
                else:
                    tmp_dbf[2]=str(tmp_dbf[2])+chr((tmp_read-128))+"," 
                #end if-elif-else
            #end if-elif
        #end while


        self.info_dbf.append(tmp_dbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
        #print("TEST: Labe1_04 decoded")
        #print("TEST: decode = ",self.info_dbf[self.row_cnt])
        self.row_cnt=self.row_cnt+1
        return
    
    def DS_05(self):
        '''reserve space
        05 DS
        <offset (2bytes)><byte count><length><string>
        Note: if the number after DS is decimal it will be shown as ASCII decimal and likewise for hexadecimal
        Note: max space reserve is 254 bytes as 255 (0xFf) is reserved for EOL
        '''
        if self.fn_in==None:
            return
        #tmp_dbf=[dis_code_byte,offset,"text"]
        tmp_dbf=[5,0,"",0]
        #tmp_dbf=self.default_dbf #this doesn't work!!!
        tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
        tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
        tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
        tmp_dbf[3]=int.from_bytes(self.fn_in.read(1),"little") #byte count
        char_cnt=int.from_bytes(self.fn_in.read(1),"little") #number of chars
        self.byte_read_cnt=4 #read tracker set
        while (self.byte_read_cnt-4)<char_cnt:
            tmp_read=int.from_bytes(self.fn_in.read(1),"little")
            self.byte_read_cnt=self.byte_read_cnt+1
            if char_cnt==1 or self.byte_read_cnt==5:
                tmp_dbf[2]=str(tmp_dbf[2])+"DS " #starts with DS
            #end if
            if tmp_read>31 and tmp_read<128: #labels must be ascii - might need to fine tune ao that only 0-9,a-z and A-
                tmp_dbf[2]=str(tmp_dbf[2])+chr(tmp_read)
            elif tmp_read>127: # bit 7 set, so end
                tmp_dbf[2]=str(tmp_dbf[2])+chr((tmp_read-128))
                break #end while loop
            #end if-elif
        #end while
        self.info_dbf.append(tmp_dbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
        #print("TEST: Labe1_05 decoded")
        #print("TEST: decode = ",self.info_dbf[self.row_cnt])
        self.row_cnt=self.row_cnt+1
        return
    
    def U_06(self):
        #unknown
        #tmp_dbf=[dis_code_byte,offset,"text"]
        tmp_dbf=[6,0,"",0]
        pass
        return
    
    def U_07(self):
        #unknown
        #tmp_dbf=[dis_code_byte,offset,"text"]
        tmp_dbf=[7,0,"",0]
        pass
        return
    
    def Comment_08(self):
        '''08 COMMENT
        The disassembled text starts with a semicolon (;)
        #<offset (2bytes)><length><comment string><ff>
        '''
        if self.fn_in==None:
            return
        #tmp_dbf=[dis_code_byte,offset,"text",0]
        tmp_dbf=[8,0,"",0]
        #tmp_dbf=self.default_dbf #this doesn't work!!!
        tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
        tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
        tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
        
        tmp_skip=int.from_bytes(self.fn_in.read(1),"little") #skip length
        self.byte_read_cnt=3 #read tracker set
        while True: #comments end when #ff (255) is found
            tmp_read=int.from_bytes(self.fn_in.read(1),"little")
            if tmp_read==255:#end of label sequence is typically three zeros
                self.byte_read_cnt=self.byte_read_cnt+1
                break #end while loop
            elif tmp_read>31 and tmp_read<128: #labels must be ascii - might need to fine tune ao that only 0-9,a-z and A-Z
                if self.byte_read_cnt ==3: #next read after the length
                    tmp_dbf[2]=str(tmp_dbf[2])+";"+chr(tmp_read) #comments start with a semicolon
                else:
                    tmp_dbf[2]=str(tmp_dbf[2])+chr(tmp_read)
                #end if-else
                self.byte_read_cnt=self.byte_read_cnt+1
            elif tmp_read>127: # bit 7 set, subtract 128 to get the number of spaces (memory saving method)
                if self.byte_read_cnt ==3: #next read after the length and starts with a space
                    tmp_dbf[2]=str(tmp_dbf[2])+";"
                #end if
                for char_cnt in range(tmp_read-128):
                    tmp_dbf[2]=str(tmp_dbf[2])+" "
                #end for
                self.byte_read_cnt=self.byte_read_cnt+1
            #end if-elif
        #end while

        self.info_dbf.append(tmp_dbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
        #print("TEST: Labe1_08 decoded")
        #print("TEST: decode = ",self.info_dbf[self.row_cnt])
        self.row_cnt=self.row_cnt+1
        return
    
    def U_09(self):
        #unknown
        #tmp_dbf=[dis_code_byte,offset,"text"]
        tmp_dbf=[9,0,"",0]
        pass
        return

def decval_to_hexstr(dec_val=16384): #positive values only, default at hex=4000

    ''' Converts a 8 or 16-bit decimal number to its hexadecimal equivalent as a string
        parameters passed:
        1. integer : dec_val (0 to 65535)
        parameters returned
        a) string : hex_str
    '''
    dec_val=int(dec_val) 
    if dec_val>=0 and dec_val<256: #unsigned 8-bit
        hex_str=str('%02X' % dec_val)
    elif -128<=dec_val<=127: #signed 8-bit
        if dec_val<0:
            dec_val=256+dec_val
        hex_str=str('%02X' % dec_val)
    #option to include a signed 16-bit
    elif dec_val>=256 and dec_val<2**16: #unsigned 16-bit
        hex_str=str('%04X' % dec_val) #%04x is lowercase and %04X is uppercase hexadecimal
        #print("hex string: ",hex_str,"  ","dec value: ",dec_val)
    else:
        for v in range(1,WIP_code[0]+1):
            WIP_code[v]=hexval_to_hexstr(int.from_bytes(fn_r.read(1),"little"))
        #end for
        hex_str="4000" #default, lowest free RAM hexadecimal address for MTX512, 8000 if MTX500 and will be different for other 8-bit PCs
    #end if-elif-else
    return hex_str #from decval_to_hexstr

def hexval_to_hexstr(hex_val=0x00): #positive values only, default at hex=00

    ''' Converts a 8 or 16-bit heaxadecimal number to its hexadecimal equivalent as a string
        parameters passed:
        1. hexadecimal : hex_val (0x00 to 0xFFFF)
        parameters returned
        a) string : hex_str
    '''
    if hex_val>=0x00 and hex_val<0x0100:
        hex_str=str('%02X' % hex_val)
    elif hex_val>=0x0100 and hex_val<=0xFFFF:#16-bit
        hex_str=str('%04X' % hex_val) #%04x is lowercase and %04X is uppercase hexadecimal
        #print("hex string: ",hex_str,"  ","dec value: ",dec_val)
    else:
        hex_str="00" #default hex = 00 = NOP from z80 database
    #end if-elif-else
    return hex_str #from hexval_to_hexstr

class assem_decode():

    '''Class to decode the assembly code metadata from the MTX BASIC program
       The metadata is embedded in the BASIC program and is used to identify labels, comments, data bytes, data words and reserved space. 
       This metadata is critical to ensuring the correct assembly code is generated in the text file output and that it is assigned to the correct memory address.
    '''
    def __del__(self): #is this required?
        class_name = self.__class__.__name__
        #print (class_name, "destroyed")
    
    def __init__(self, z80wip=[],memaddr=16384,mtxlist_str="",
                 mtx_token_db=[],LineLen=0, CodeLen=0,CodeInc=0,
                 fn_in=None,fn_out=None, filetype="mtxflagTrue", VSC_flag=False,
                  mtxdirectives=None, RES_code=""):
        
        '''work in progress
            1) 3 different file constructs (mtx, BAS, RUN)to disassemble
            2) mtx and BAS very similar, difference being header size, dealt with in main code
            3) RUN files are more complex and require a more diagnostic approach. Therefore, need to breakdown
            how the ASSEM_loop works into smaller targeted functions within the main class
            a) ASSEM_skip(Lcode)
            b) Find the Directives and disassemble into a look up table (in memory as Z80 code in KB)
            c) Generate a symbols table aka MTX assembler
            d) Pure disassembly - in part needed for diagnostic work
            e) Disassembly with directives
            4) return data (list)    
        only the following global variables in the original ASSEM_loop() function were used
        The ones that are used there are: 
        fn_r, fn_w, LineLen, mtxlist_str, MemPos (run_codebase), CodeLen (run_codebaselen or variants of as still in development), CodeInc, 
        WIP_code, RES_code, GV_mtxdirectives, VSC_flag, mtxflag, sdxBflag, and sdxRflag.
        '''
        self.z80wip=z80wip #passes hex bytes to be converted to opcodes/operands
        self.MemPos=memaddr #program counter for the assembly code, default at 16384 (0x4000) for MTX512, 32768 (0x8000) for MTX500 and will be different for other 8-bit PCs
        self.mtxlist_str=mtxlist_str
        self.mtx_token_db=mtx_token_db #could be same as dbf above need to check
        self.LineLen=LineLen
        self.CodeLen=CodeLen
        self.CodeInc=CodeInc
        self.fn_in=fn_in #expects a file object to be passed in, e.g. fn_in=open("filename","rb")
        self.fn_out=fn_out #expects a file object to be passed in, e.g. fn_out=open("filename","wb")
        self.fn_r=fn_r if fn_r is not None else fn_in
        self.fn_w=fn_w if fn_w is not None else fn_out
        self.filetype=filetype #passes mtxflagTrue, sdxBflagTrue,sdxRflagTrue
        self.mtxdirectives=mtxdirectives if mtxdirectives is not None else []
        self.RES_code=RES_code

        self.byte_read_cnt=0 #tracker for number of bytes read in the current metadata block
        self.row_cnt=0 #tracker for number of rows in the database, used to append new rows and to track the current row for debugging purposes
        self.assem_dbf=[0,0,"",0] #default template for the dbf list which is used to store the decoded metadata information. The [:] is used to prevent overwriting all rows when appending a new row with the same default template.
        self.VSC_flag=VSC_flag # VSC = VS Code disassembly does use symbols list summary. Retained as part of wider mtx compatibility output
        self.mtxdirect=False #if False then no directives present. This can vary depending on the complexity of diagnostic analysis
        self.z80_mnemonic_db=globals().get("z80_mnemonic_db", [])
        self.symbols_list=[]
        self.ghost_label_names=set()
        self.invalid_directive_rows=set()
        
        if self.fn_in is None or self.fn_out is None:
            return
        
        if self.filetype=="sdxRflagTrue":
            '''if self.MemPos>=16384 and self.MemPos<32768: #then its MTX512
                self.MemPos=16384+self.CodeInc #disassemble from 0x4000 as this is the default load address for MTX512
            else: #MTX500
                self.MemPos=32768+self.CodeInc #disassemble from 0x8000 as this is the default load address for MTX500
            #end if-else '''
            #can breakup the decoding into blocks based on length of code and whether mtx drectives in play
            self.disassem_loop()
            #Note: this only decodes the jump code loader but any further BASIC disassembly needs to go either of the other flags.
            
        elif self.filetype=="mtxflagTrue" or self.filetype=="sdxBflagTrue":
            if self.mtxdirectives!=[]:
                self.mtxdirect=True #standard for mtx and SDX BAS files.
            self.mtxlist_str=self.mtxlist_str+self.mtx_token_db[194][1]
            self.RES_code=self.RES_code+"\n"
            #print("TEST: write line: ",self.mtxlist_str)
            self.fn_out.write(self.mtxlist_str) #write linenumber and CODE
            self.fn_out.write('\n') #new line
            self.disassem_loop()
        else:
            pass # potential other option to be defined
        #end if-elif-else

        return

    def get_labels_list(self,startaddr=16384):
        ''' Return all labels with their relative and absolute hexadecimal addresses 
            - a check function to confirm symbols list generated later is complete'''
        self.symbols_list=[]
        for k in range(len(self.mtxdirectives)):
            if self.mtxdirectives[k][0]==2 and self.mtxdirectives[k][2].endswith(":"):
                self.symbols_list.append([self.mtxdirectives[k][2],decval_to_hexstr(self.mtxdirectives[k][1]+startaddr)])
                #self.labels_list.append([self.mtxdirectives[k][2],decval_to_hexstr(self.mtxdirectives[k][1]),decval_to_hexstr(self.mtxdirectives[k][1]+startaddr)])
        #print("DEBUG: Labels, relative addresses and their absolute addresses\n",self.labels_list)
        #print("DEBUG: number of valid labels\n", len(self.labels_list))
        return
    
    def find_ghost_labels(self, code_start_pos=None):
        '''The class get_directives_info() identifies all mtx directives and stored in GV_mtxdirectives and passed to self.mtxdirectives.
            self.mtxdirectives is scanned (get_labels_list()) to find all labels, stored in self.symbols_list.
            The purpose of this function is 
            1)  store self.fn_in current position
            2)  to scan these labels against the file input code and the look up the table self.z80_mnemonic_db
                to see if a label falls an a valid opcode boundary or invalid in the middle of an operand.
                if invalid, the last column of self.mtxdirectives is to change from 0 to 1.
            3)  Find all references to the label (normally follow directly after the label in self.mtxdirectives) and update the last column with a 1
            4)  Delete the invalid label from self.symbols_list
            5)  Update self.mtxdirectives by deleting all last column entries with a 1 assigned to it
            6)  Restore self.fn_in back to the position at step 1). 

            parameters accessed:
            self.mtxdirectives
            self.symbols_list
            self.z80_mnemonic_db
            self.fn_in (using tell, seek and read)
            parameters changed per code block:
            self.mtxdirectives
            self.symbols_list
        '''
        if self.fn_in is None or not self.mtxdirectives or not self.symbols_list:
            return

        try:
            saved_pos=self.fn_in.tell()
        except (AttributeError, OSError):
            return

        if code_start_pos is None:
            code_start_pos=saved_pos

        valid_start_offsets=set()
        try:
            self.fn_in.seek(code_start_pos)
            code_bytes=self.fn_in.read(self.CodeLen)
            if isinstance(code_bytes, (bytes, bytearray)) and code_bytes:
                code_len=len(code_bytes)
                offset=0
                while offset < code_len:
                    wip_len=min(4, code_len-offset)
                    wip_code: list[object]=[wip_len]
                    for byte_val in code_bytes[offset:offset+wip_len]:
                        wip_code.append(hexval_to_hexstr(byte_val))
                    while len(wip_code) < 5:
                        wip_code.append("")
                    dis_size=Z80_Disassemble(self.z80_mnemonic_db, wip_code, self.MemPos+offset).Z80Assem_res[2]
                    if not isinstance(dis_size, int) or dis_size <= 0:
                        dis_size=1
                    valid_start_offsets.add(offset)
                    offset=offset+dis_size
        finally:
            self.fn_in.seek(saved_pos)

        label_rows_by_name={}
        for idx, directive in enumerate(self.mtxdirectives):
            if not isinstance(directive, (list, tuple)) or len(directive) < 3:
                continue
            if directive[0] == 2 and isinstance(directive[2], str):
                label_rows_by_name.setdefault(directive[2].rstrip(":"), []).append(idx)

        surviving_symbols=[]
        self.ghost_label_names=set()
        self.invalid_directive_rows=set()

        for symbol_name, symbol_addr_text in self.symbols_list:
            label_name=symbol_name.rstrip(":")
            label_row_indexes=label_rows_by_name.get(label_name, [])
            is_valid=False

            for row_index in label_row_indexes:
                try:
                    directive_addr=int(self.mtxdirectives[row_index][1])
                except (TypeError, ValueError, IndexError):
                    continue
                if directive_addr in valid_start_offsets:
                    is_valid=True
                    break

            if is_valid:
                surviving_symbols.append([symbol_name, symbol_addr_text])
                continue

            self.ghost_label_names.add(label_name)
            for row_index in label_rows_by_name.get(label_name, []):
                self.invalid_directive_rows.add(row_index)
            for idx, directive in enumerate(self.mtxdirectives):
                if not isinstance(directive, (list, tuple)) or len(directive) < 3:
                    continue
                if directive[0] == 2 and isinstance(directive[2], str) and directive[2].rstrip(":") == label_name:
                    self.invalid_directive_rows.add(idx)

        self.symbols_list=surviving_symbols
        return

    def convert_yy(self,dflag=False,mpos=0,tmp_str="",tmp_list=[0,"",0,""]):
        #When disassembling a file to comply with the mtx inline assembler/disassembler for relative jumps, MTX inline assembler expects 
        #add convert signed byte to an absolute address for DJNZ, JR and JZ flags
        #opcodes in [0x10,0x18,0x20,0x28,0x30,0x38]
        # 1) label (preferred) - check against mtx directives (labels) 
        # 2) an absolute hex address
        # 3) or as a single byte displacement, 0-127 for a fwd jump or 255-128 for a backward jump (fallback)
        if tmp_list[3]=="yy" and (tmp_list[1].startswith("DJNZ") or tmp_list[1].startswith("JR")):
        #if tmp_list[3]=="yy":
            cnt=tmp_str.find("#")
            if cnt!=-1 and len(tmp_str)>=cnt+3:
                try:
                    disp_txt=tmp_str[cnt+1:cnt+3]
                    if len(disp_txt)==2 and all(ch in "0123456789ABCDEFabcdef" for ch in disp_txt):
                        disp=int(disp_txt,16)
                        if disp>127:
                            disp=disp-256
                        tgt_addr=mpos+disp
                        tgt_label=""
                        if self.mtxdirect is True:
                            for rr in range(len(self.mtxdirectives)):
                                if self.mtxdirectives[rr][0]==2 and str(self.mtxdirectives[rr][2]).endswith(":"):
                                    lbl_addr=self.mtxdirectives[rr][1]+self.offset_st_addr
                                    if lbl_addr==tgt_addr:
                                        tgt_label=self.mtxdirectives[rr][2].rstrip(":")
                                        break
                            if tgt_label!="":
                                tmp_str=tmp_str[:cnt]+tgt_label+tmp_str[cnt+3:]
                                #print("TEST: Reference label - #yy - label", disp, tmp_str)
                            else:
                                if 0<=tgt_addr<=65535:
                                    tmp_str=tmp_str[:cnt+1]+decval_to_hexstr(tgt_addr)+tmp_str[cnt+3:]
                                    #print("TEST: Reference label - #yy - address", tmp_str)
                                elif -128<=disp<=127:
                                    #still to check if backward displacement is in the range 255 to 80.
                                    tmp_str=tmp_str[:cnt+1]+decval_to_hexstr(disp)
                                    #print("TEST: Reference label - #yy - signed displacement", disp, tmp_str)
                            #end if-else
                        else: #self.mtxdirect is False and no label
                            if 0<=tgt_addr<=65535:
                                tmp_str=tmp_str[:cnt+1]+decval_to_hexstr(tgt_addr)+tmp_str[cnt+3:]
                                #print("TEST: Reference label - #yy - address", tmp_str)
                            elif -128<=disp<=127:
                                #still to check if backward displacement is in the range 255 to 80.
                                tmp_str=tmp_str[:cnt+1]+decval_to_hexstr(disp)
                                #print("TEST: Reference label - #yy - signed displacement", disp, tmp_str)
                            #end if-else
                        
                except ValueError:
                    pass

        return tmp_str, tmp_list #if do not specify potential to return None

    def disassem_loop(self):

        assem_cnt=0
        dis_size=0
        reset_WIP_code=[0,"","","",""]
        Blocks=divmod(self.CodeLen-assem_cnt,4)
        WIP_code=reset_WIP_code[:]

        if Blocks[0]>0:
            WIP_code[0]=4
        else:
            WIP_code[0]=Blocks[1]
        #end if-else

        for v in range(1,WIP_code[0]+1):
            WIP_code[v]=hexval_to_hexstr(int.from_bytes(self.fn_in.read(1),"little"))
        #end for

        #print("TEST: WIP_code at start = ",WIP_code)
        assem_cnt=assem_cnt # include the initial byte reads above
        self.offset_st_addr=self.MemPos
        #print("DEBUG: mtx directives list\n",self.mtxdirectives)
        if self.mtxdirect is True:
            self.get_labels_list(self.offset_st_addr) # for comparison with GV_mtxdirectives and symbols
            #print("DEBUG: new symbols\n",self.symbols_list)
            if self.symbols_list!=[]:self.find_ghost_labels(self.fn_in.tell()-WIP_code[0])
        #end if

        while assem_cnt < self.CodeLen:
            num_ref=""
            label_st=""
            comment_st=""
            tmp_disassem_str=""
            tmp_disassem_list=[0,"",0,""] #addr, Z80Assem_str, number of bytes, num_type (xx, yy, zz (+d), zz xx, xxxx)
            skip_bytes=0

            #add a new bit to capture DB, DW and DS code to prevent errorenous z80_disassembly due to these non-z80 instructions - done (see z80 disasembly)
            if self.mtxdirect is True: #mtx directives present 

                for gg in range(len(self.mtxdirectives)):

                    if gg in self.invalid_directive_rows:
                        continue

                    if self.MemPos==self.mtxdirectives[gg][1]+self.offset_st_addr:

                        if self.mtxdirectives[gg][0]==0: #number but will not be at MemPos but between MemPos+dis_size
                            pass #skip
                            #print("DEBUG: mtxdirective=0",self.mtxdirectives[gg])

                        if self.mtxdirectives[gg][0]==2 and self.mtxdirectives[gg][2].endswith(":"):
                            #type-2 at current MemPos is the definition label - labels defined earlier
                            label_st=self.mtxdirectives[gg][2] #used later on

                        if self.mtxdirectives[gg][0]==3: #DB
                            #print("TEST: DB")
                            skip_bytes=self.mtxdirectives[gg][3]
                            tmp_disassem_str=self.mtxdirectives[gg][2]

                        if self.mtxdirectives[gg][0]==4: #DW
                            #print("TEST: DW")
                            skip_bytes=self.mtxdirectives[gg][3]
                            tmp_disassem_str=self.mtxdirectives[gg][2]

                        if self.mtxdirectives[gg][0]==5: #DS
                            #print("TEST: DS")
                            skip_bytes=self.mtxdirectives[gg][3]
                            tmp_disassem_str=self.mtxdirectives[gg][2]

                        if self.mtxdirectives[gg][0]==8: #comment
                            #print("TEST: comment")
                            comment_st=self.mtxdirectives[gg][2]
                            
                        if self.mtxdirectives[gg][0]==1 or self.mtxdirectives[gg][0]==7 or self.mtxdirectives[gg][0]==9:
                            pass #skip as these directives are not defined
                            #print("DEBUG: mtxdirective=1,or 7,or 9",self.mtxdirectives[gg])

                        #end if-ifs
                #end if
                #end for
            #end if

            if skip_bytes>0:#only DB, DW and DS require skip bytes. Uses label_st, comment_st, tmp_disassem_str and MemPos
                #print("TEST: skip bytes>0 section , = ",skip_bytes, tmp_disassem_str)
                self.RES_code=self.RES_code+"    "+decval_to_hexstr(self.MemPos)+" "+label_st+tmp_disassem_str+comment_st+"\n"
                #Format z80 output to improve readability
                if self.filetype!="sdxRflagTrue": #don't write the loader as part of the main BASIC listing
                    if label_st=="":
                        if comment_st=="":
                            self.fn_out.write("\t"+decval_to_hexstr(self.MemPos)+"\t\t\t"+tmp_disassem_str)
                        else:
                            self.fn_out.write("\t"+decval_to_hexstr(self.MemPos)+"\t\t\t"+tmp_disassem_str+"\t\t"+comment_st)
                        #end if-else
                        self.fn_out.write('\n')
                    else:
                        if comment_st=="":
                            self.fn_out.write("\t"+decval_to_hexstr(self.MemPos)+" "+label_st+"\t"+tmp_disassem_str)
                        else:
                            self.fn_out.write("\t"+decval_to_hexstr(self.MemPos)+" "+label_st+"\t"+tmp_disassem_str+"\t\t"+comment_st)
                        #end if-else
                        self.fn_out.write('\n')
                    #end if-else
                #end if
                if skip_bytes<4:
                    dis_size=skip_bytes
                else: #replace all 4 bytes but remember to exclude the 4 bytes already in play
                    dis_size=4
                    for st in range(skip_bytes-dis_size): #remember need to discount the 4 bytes in play
                        skip_read=int.from_bytes(self.fn_in.read(1),"little") #skip read
                        #print("TEST: bytes to skip = ",skip_read)
                    #end for
                #end if-else
                new_MemPos=self.MemPos+skip_bytes #this might be an error as its the bytes
                #print("next memory address (MemPos+skip_bytes) = ",new_MemPos)
                assem_cnt=assem_cnt+skip_bytes
                #print("TEST: disaasembled special as = ",decval_to_hexstr(self.MemPos)+" "+label_st+tmp_disassem_str+comment_st)
            else: #numbers, labels and comments that do not involve skip bytes. Uses label_st, comment_st, tmp_disassem_str and MemPos
                #print("TEST: Normal disassembly")
                tmp_disassem_list=Z80_Disassemble(self.z80_mnemonic_db,WIP_code,self.MemPos).Z80Assem_res
                tmp_disassem_str=tmp_disassem_list[1]
                dis_size=tmp_disassem_list[2]
                new_MemPos=self.MemPos+dis_size
                assem_cnt=assem_cnt+dis_size
                #now swap any number to a reference label - code to be inserted here
                if tmp_disassem_list[3]!="" and self.mtxdirect is True: #a Z80 instruction with data (xx, yy, zz, XXXX)
                    for gg in range(len(self.mtxdirectives)): #scan through finding reference labels
                        if gg in self.invalid_directive_rows:
                            continue
                        tmp_MemPos=self.mtxdirectives[gg][1]+self.offset_st_addr
                        #Most operands are tracked at the operand byte, but MTX can store JR/DJNZ
                        #label references at instruction start; include MemPos for yy only.
                        in_operand_window=(tmp_MemPos>self.MemPos and tmp_MemPos<new_MemPos)
                        if tmp_disassem_list[3]=="yy" and tmp_MemPos==self.MemPos:
                            in_operand_window=True
                        if in_operand_window:
                            if self.mtxdirectives[gg][0]==0: #number reference
                                num_ref=self.mtxdirectives[gg][2]
                                cnt=tmp_disassem_str.find("#")
                                #only override if decoded number text is printable; otherwise keep opcode-derived value
                                if cnt!=-1 and isinstance(num_ref,str) and num_ref!="" and all(31<ord(ch)<127 for ch in num_ref):
                                    #note ch=128 in MTX is the DEL key and not printable
                                    if "xx" in tmp_disassem_list[3]: #"xx" or "zz xx"
                                        tmp_disassem_str=tmp_disassem_str[:cnt]+num_ref+tmp_disassem_str[cnt+3:]
                                    elif "zz" in tmp_disassem_list[3]: #"zz" or "zz xx"
                                        tmp_disassem_str=tmp_disassem_str[:cnt]+num_ref+tmp_disassem_str[cnt+3:]
                                    elif tmp_disassem_list[3]=="yy":
                                        tmp_disassem_str=tmp_disassem_str[:cnt]+num_ref+tmp_disassem_str[cnt+3:]
                                    elif tmp_disassem_list[3]=="XXXX":
                                        tmp_disassem_str=tmp_disassem_str[:cnt]+num_ref+tmp_disassem_str[cnt+5:]
                                    #end if-elif
                                #end if
                            elif self.mtxdirectives[gg][0]==2:
                                if str(self.mtxdirectives[gg][2]).endswith(":"):
                                    continue #label with : ending dealt with this at 2030-2037
                                #type-2 between MemPos and new_MemPos is a reference label
                                lab_ref=self.mtxdirectives[gg][2].rstrip(":")
                                cnt=tmp_disassem_str.find("#")
                                if "xx" in tmp_disassem_list[3]: #"xx" or "zz xx" the latter might not be valid in MTX assembler
                                    tmp_disassem_str=tmp_disassem_str[:cnt]+lab_ref+tmp_disassem_str[cnt+3:]
                                    #print("TEST: Reference label - #xx replaced",tmp_disassem_str)
                                elif "zz" in tmp_disassem_list[3]: #"zz" or "zz xx" the latter might not be valid in MTX assembler
                                    tmp_disassem_str=tmp_disassem_str[:cnt]+lab_ref+tmp_disassem_str[cnt+3:]
                                    #print("TEST: Reference label - #zz replaced",tmp_disassem_str)
                                elif tmp_disassem_list[3]=="yy":
                                    tmp_disassem_str=tmp_disassem_str[:cnt]+lab_ref+tmp_disassem_str[cnt+3:]
                                    #print("TEST: Reference label - #yy replaced", tmp_disassem_str)
                                elif tmp_disassem_list[3]=="XXXX":
                                    tmp_disassem_str=tmp_disassem_str[:cnt]+lab_ref+tmp_disassem_str[cnt+5:]
                                    #print("TEST: Reference label - #XXXX replaced",tmp_disassem_str)
                                else:
                                    #print("TEST: No reference label")
                                    pass
                                #end if-elif-else
                            #end if
                        #end if
                    #end for

                #When disassembling a file to comply with the mtx inline assembler/disassembler for relative jumps, MTX inline assembler expects 
                # 1) label (preferred) - check against mtx directives (labels) 
                # 2) an absolute hex address
                # 3) or as a single byte displacement, 0-127 for a fwd jump or 255-128 for a backward jump (fallback)
                tmp_disassem_str, tmp_disassem_list = self.convert_yy(dflag=self.mtxdirect,mpos=new_MemPos,tmp_str=tmp_disassem_str,tmp_list=tmp_disassem_list)
                    

                self.RES_code=self.RES_code+"    "+decval_to_hexstr(self.MemPos)+" "+label_st+tmp_disassem_str+comment_st+"\n"
                #Format z80 output to improve readability
                if self.filetype!="sdxRflagTrue": #don't write the loader as part of the main BASIC listing
                    if label_st=="":
                        if comment_st=="":
                            self.fn_out.write("\t"+decval_to_hexstr(self.MemPos)+"\t\t\t"+tmp_disassem_str)
                        else:
                            self.fn_out.write("\t"+decval_to_hexstr(self.MemPos)+"\t\t\t"+tmp_disassem_str+"\t\t"+comment_st)
                        #enselfd if-else
                        self.fn_out.write('\n')
                    else:
                        if comment_st=="":
                            self.fn_out.write("\t"+decval_to_hexstr(self.MemPos)+" "+label_st+"\t"+tmp_disassem_str)
                        else:
                            self.fn_out.write("\t"+decval_to_hexstr(self.MemPos)+" "+label_st+"\t"+tmp_disassem_str+"\t\t"+comment_st)
                        #end if-else
                        self.fn_out.write('\n')
                    #end if-else
                #end if

                #print("TEST: Z80 disaasembled as = ",decval_to_hexstr(self.MemPos)+" "+label_st+tmp_disassem_str+comment_st)
            #end if-else
            
            self.MemPos=new_MemPos
            Blocks=divmod(self.CodeLen-assem_cnt,4) # blocks remaining after skipping or disassembly
            #print("dis_size = ",dis_size)
            if (Blocks[0]==0 and Blocks[1]==0):
                break #while
            elif Blocks[0]>0:
                'WIP_code[0] remains as 4 if Blocks0>0'
                if dis_size==4:
                    WIP_code=reset_WIP_code[:] #clear all 4 bytes
                    WIP_code[0]=4
                    shift_cnt=0
                    #print("TEST: dis_size=4, WIP_code reset = ",WIP_code)
                    for st in range(1,dis_size+1):
                        WIP_code[st]=hexval_to_hexstr(int.from_bytes(self.fn_in.read(1),"little")) #fill with 4 new bytes
                    #print("TEST: dis_size=4, WIP_code = ",WIP_code)
                else:
                    #shift down bytes not disassembled yet in the 4 byte block
                    shift_cnt=WIP_code[0]-dis_size
                    #print("TEST: shift_cnt = ",shift_cnt," WIP_code[0] = ",WIP_code[0], " skip bytes = ",skip_bytes)
                    for st in range(1,shift_cnt+1): #move down the bytes still to be disassembled
                        WIP_code[st]=WIP_code[dis_size+st]
                        #print("TEST: shift, WIP_code = ",WIP_code)
                    #end for
                    #fill the remaining 4 byte block with new read values
                    if dis_size==3: 
                        WIP_code[2]=hexval_to_hexstr(int.from_bytes(self.fn_in.read(1),"little"))
                        WIP_code[3]=hexval_to_hexstr(int.from_bytes(self.fn_in.read(1),"little"))
                        WIP_code[4]=hexval_to_hexstr(int.from_bytes(self.fn_in.read(1),"little"))
                        #print("TEST: dis_size=3, WIP_code = ",WIP_code)
                    elif dis_size==2:
                        WIP_code[3]=hexval_to_hexstr(int.from_bytes(self.fn_in.read(1),"little"))
                        WIP_code[4]=hexval_to_hexstr(int.from_bytes(self.fn_in.read(1),"little"))
                        #print("TEST: dis_size=2, WIP_code = ",WIP_code)
                    else: #dis_size==1:
                        WIP_code[4]=hexval_to_hexstr(int.from_bytes(self.fn_in.read(1),"little"))
                        #print("TEST: dis_size=1, WIP_code = ",WIP_code)
                    #end if-elif-else
                #print("Blocks[0]>0 SECTION - updated WIP_code= ",WIP_code)
                #end if-else
            else: #Blocks[0]<=0 and Blocks[1]>0
                #Blocks[1] = number of bytes still to decode and includes any shifted down.
                #print("Blocks[0]<=0 SECTION")
                if dis_size==4: #only got Blocks[1] to go.
                    WIP_code=reset_WIP_code[:]
                    WIP_code[0]=4
                    shift_cnt=0
                else: #not all bytes disassembled, move down those bytes still to be disassembled.
                    shift_cnt=WIP_code[0]-dis_size
                    for st in range(1,shift_cnt+1):
                        WIP_code[st]=WIP_code[dis_size+st]
                    #end for
                #end if-else
                WIP_code[0]=Blocks[1]
                #print("Blocks[0]<=0 SECTION - shift count =",shift_cnt, " Blocks1= ",Blocks[1], " and shifted code= ",WIP_code)
                a=WIP_code[0]
                if WIP_code[0]!=shift_cnt: #only read additional bytes if condition met 
                    for st in range(shift_cnt+1,a+1):
                        WIP_code[st]=hexval_to_hexstr(int.from_bytes(self.fn_in.read(1),"little"))
                        #print("TEST: dis_size=4, WIP_code = ",WIP_code)
                    #end for
                for st in range(a+1,5):
                    WIP_code[st]=""
                #end for
                #end if
                #print("Blocks[0]<=0 SECTION - updated WIP_code= ",WIP_code)
            #end if-else
        #end if-else
            #print("remaining Blocks = ",Blocks)
            #print("new assem_cnt = ",assem_cnt)
            #print("next memory address = ",new_MemPos)
        #end while
        
        #add the symbols table at the end of the assemmbly code - MAKE THIS OPTIONAL AS VS CODE editor doesn't use this
        self.sym_build()

        #part 2 to resolve the assembly extras like DS, DB, jump and call names etc
        #initially will skip the MTX assembly extra information
        self.ASSEM_skip(self.LineLen-(self.CodeLen+1)-self.CodeInc) #to be updated once part#1 is coded. currently based on codelen&extralen

        return

    def sym_build(self):
        ''' parameters passed as part of the class:-
            self.VSC_flag (True or False)
            self.symbols_list ([label,absolute memaddr])
            self.RES_code (memory output)
            self.fn_out (file output)
            appends symbol (labels) table to the bottom of Self.RES_code
            parameters changed, updated and returned:-
            self.RES_code (memory output)
            self.fn_out (file output)
            remove the : from the label as the mtx inline assembler/disassembler doesn't show it.
        '''
        #add the symbols table at the end of the assemmbly code - MAKE THIS OPTIONAL AS VS CODE editor doesn't use this
        if self.VSC_flag==False : #not VS code compatible.
            self.RES_code=self.RES_code+"\n"+"SYMBOLS:"+"\n"
            self.fn_out.write('\n')
            self.fn_out.write("SYMBOLS:")
            self.fn_out.write('\n')
            label_max=max(len(item[0]) for item in self.symbols_list)
            tab_str="\t" #default
            #print("DEBUG: maximum width of symbol",label_max)
            for vv in range(len(self.symbols_list)): 
                if len(self.symbols_list[vv][0].rstrip(":"))<4:
                    tab_str="\t\t\t\t"
                elif 4<=len(self.symbols_list[vv][0].rstrip(":"))<8:
                    tab_str="\t\t\t"
                elif 8<=len(self.symbols_list[vv][0].rstrip(":"))<12:
                     tab_str="\t\t"
                else:
                    tab_str="\t"
                #end if-elif-else
                self.RES_code=self.RES_code+self.symbols_list[vv][0].rstrip(":")+tab_str+str(self.symbols_list[vv][1])
                self.fn_out.write("\t"+self.symbols_list[vv][0].rstrip(":")+tab_str+str(self.symbols_list[vv][1])) #indent symbols as per other CODE indents
                self.fn_out.write('\n')
            self.fn_out.write('\n')
            #end for
        return 
    
    def ASSEM_skip(self,Lcode):
        ''' skip assembly code
            move the read pointer on to the end of the code
            parameters passed as part of the function
            Lcode
            parameters passed as part of the class:-
            self.fn_in (file input)
            self.MemPos
            parameters changed, updated and returned:-
            self.MemPos
            self.fn_in (file input - read position changes)
        '''
        self.Lcode=Lcode
        assem_cnt=0

        while assem_cnt <=self.Lcode: #1st 5 bytes already read
            int.from_bytes(self.fn_in.read(1),"little") #skip
            assem_cnt=assem_cnt+1
        #end while
        self.MemPos=self.MemPos+assem_cnt #no +1 as assem_cnt=assem_cnt+1 in the while loop
        #print("TEST: skip assem_cnt= ",self.assem_cnt," and next MemPos = ",self.MemPos)
        return #from ASSEM_skip

def convert_mtx_to_txt():

    ''' Converts a MTX BASIC program to a text file
        User selects the .mtx file to convert
        User selects the .txt file to write out
        If MTX500 then the program is loaded at address 32768 (0x8000) (not currently tested for - future option)
        If MTX512 then the program is loaded at address 16384 (0x4000) (default)
        Managing the memory position as the program is converted is critical to ensuring the assembly code is assigned to the correct address.

        The conversion is then carried out in 6 discrete steps
        1. Skips the block after the filename & 2 marker bytes (mtx) or Skips the block after the initial 4 bytes in SDX BAS and RUN files
        2. Reads system variables as some of the data is needed to correctly disassemble
        3. BASIC program
        4. Z80 assembly language
        5. MTX specific assembly language extensions/directives
        6. NODDY text language

        Note that RUN files structure is more complex and still be fully coded.
    '''
    
    def BASIC_loop():
        global GV_fname_r,GV_fname_w,GC_extn_r,GC_extn_w,GC_MTXEOL,GC_MAXADDR,GV_nonprintable
        #additional global
        global len_BASIC, hdr_cnt,fn_r_size,fn_r,fn_w,LineLen,LineNum,noddy_flag,i,mtxlist_str,mtxdirectives_flag
        global MemPos,CodeLen,CodeInc,CodeEnd,WIP_code,RES_code,GV_mtxdirectives,VSC_flag,mtxflag,sdxBflag, sdxRflag,PlodNameList
        #i=hdr_cnt needed for ASSEM_loop(), see later
        BAS_hdr=[0,0,0,0,0,0,0,0,0] 
        plodToken=168 #need to find this and add name (e.g. PLOD "PROG1") to plodNameList (e.g. plodNameList.append("PROG1"))
        i=0
        try:
            while i<len_BASIC: #issue in some cases when codeblock finishes but doesn't cleanly exit because of copy protection?
                #minimum BASIC line size if 5 bytes + 1 for 0xFF or BASIC line with a code block = 7 bytes + 1 opcode (e.g. 0xC9) + 1 for 0xFF bytes .
                #byte 0 could be 0xff if part of a codeblock length but never part of a BASIC line length - STILL TO BE RECODED
                BAS_hdr[0]=int.from_bytes(fn_r.read(1),"little")  #read 1 byte at a time and convert to decimal
                if BAS_hdr[0]==GC_MTXEOL: #this is reserved for end of BASIC listing. FF is reserved
                    i=i+1
                    print("DEBUG: reserved 0xFF, not a BASIC token. i=",i)
                    break #exit while loop
                #end if

                #no guardrail yet but should be enough for a single line of BASIC left

                for j in range(1,5):
                    BAS_hdr[j]=int.from_bytes(fn_r.read(1),"little")  #read 1 byte at a time and convert to decimal
                #end for

                if BAS_hdr[4]<128: #if not a BASIC keyword
                    i=i+1
                    print("DEBUG: not a BASIC token. i=",i)
                    break #exit while loop
                #end if

                LineLen=(BAS_hdr[1]*256)+BAS_hdr[0]
                LineNum=(BAS_hdr[3]*256)+BAS_hdr[2]
                #print("TEST: BASIC line length= ",LineLen," line number = ",LineNum," and while loop count= ",i)
                mtxlist_str=str(LineNum)+" " #assign line number
                tmp_MemPos=MemPos #because assembly code is essentially a line in BASIC, to avoid double counting, will need to hold a temporary copy of MemPos, see later to keep the code simple! 
                #for j in range(5,LineLen): #don't count the 1st 4 bytes (0,1,2,3) and move the 
                prev_read_dec=0
                fn_r.seek(-1,1) #go back 1 byte
                j=4
                while j<LineLen: #changed to a while loop to address the extra read counts for PLOD handling
                    read_dec=int.from_bytes(fn_r.read(1),"little") #read BASIC line

                    if read_dec==GC_MTXEOL: #end of basic line
                        RES_code=RES_code+mtxlist_str+"\n"
                        fn_w.write(mtxlist_str)
                        fn_w.write('\n') #skip 255 as this will be replaced by a text EOL
                        #print("TEST: write line: ",mtxlist_str)
                        MemPos=tmp_MemPos+LineLen #to keep the code simple and to avoid double count due to ASSEM code section, use the tmp_MemPos
                        #print ("TEST: BASIC Memory position (overrides that of code) =", MemPos)
                        i=i+j+1 #make sure the counter is updated, ready at the next read item
                        BAS_hdr=[0,0,0,0,0,0,0,0,0]  #don't use LineLen as this shortens the code and can cause issues with longer line lengths
                        break

                    elif read_dec>0 and read_dec<=26: #01 to 26
                        #special case associated with $. Note variable name text is always capitalised
                        #the 1st character in a string name is between 01 and 26. Rest of the variable string name is typical ascii
                        idx=read_dec+64
                        #print("TEST: idx=",idx)
                        #print("TEST: char=",mtx_token_db[idx][1])
                        mtxlist_str=mtxlist_str+mtx_token_db[idx][1]

                    elif read_dec>GV_nonprintable and read_dec<127: #ascii printable range-1 (32 to 126)
                        #mtxlist_str=mtxlist_str+chr(read_dec)
                        mtxlist_str=mtxlist_str+mtx_token_db[read_dec][1]
                        #special case to resolve. if a variable string is used $, the char(s) preceding start at 01=A, 02=B 03=C, 04=D

                    elif read_dec==168: #PLOD "<progname>"" detected
                        mtxlist_str=mtxlist_str+mtx_token_db[read_dec][1]+" " #add a space after MTX keyword
                        #need to continue reading in this section to get the name between the double quotes and store in the PlodListName
                        plodName=""
                        tmp=0
                        qx2=False
                        #check for ", skip if spaces after PLOD
                        while True:
                            tmp=int.from_bytes(fn_r.read(1),"little") #assume 1st byte is ascii 34 (")
                            j=j+1
                            if tmp==34:
                                break
                        #end while
                        if tmp != 34: #potential space, read again
                            tmp=int.from_bytes(fn_r.read(1),"little") #assume 1st byte is ascii 34 (")
                            j=j+1
                        while qx2 is False:
                            tmp=int.from_bytes(fn_r.read(1),"little")
                            j=j+1
                            if tmp==34 and qx2 is False:
                                qx2=True
                                break
                            #end if
                            plodName=plodName+chr(tmp)
                        #end while
                        PlodNameList.append(plodName)          # save to list
                        mtxlist_str=mtxlist_str+'"'+plodName+'"'  # restore to output
                        
                    elif read_dec==194: #assembly lastkip_read=int.from_bytes(fn_r.read(1),"little") #skipnguage - still to be coded                  
                        #print("TEST: Assembly code")
                        BAS_hdr[5]=int.from_bytes(fn_r.read(1),"little") #read codelength
                        BAS_hdr[6]=int.from_bytes(fn_r.read(1),"little")
                        CodeLen=(BAS_hdr[6]*256)+BAS_hdr[5]
                        CodeInc=j+3 #CODE token + 2-byte code length
                        MemPos=tmp_MemPos+CodeInc #adjusts for the bytes so far in specifying line and code lengths
                        #get the assembler specific info into a new list
                        #anchor directive parsing from current stream position to avoid
                        #index arithmetic drift on CODE lines.
                        code_data_pos=fn_r.tell() #first opcode byte position in file
                        if mtxdirectives_flag is True:
                            directive_start_pos=code_data_pos+CodeLen
                            extra_len=max(0,LineLen-CodeLen-CodeInc)
                            #print("TEST: CodeLen, CodeInc, MemPos, code_data_pos, directive_start_pos, extra_len",CodeLen, CodeInc, MemPos, code_data_pos, directive_start_pos,extra_len)
                            GV_mtxdirectives=get_mtx_directives_info(GV_fname_r,directive_start_pos,extra_len).info_dbf
                            #print("DEBUG: mtx directives\n",GV_mtxdirectives)
                            #print("TEST: returned from directive scavenging")
                            #print("TEST: Code Length= ",CodeLen," Start Memory position= ", MemPos," End Memory position= ",MemPos+CodeLen-1)
                        else:
                            GV_mtxdirectives=[]
                        #end if-else
                        ''' mtx_token_db=... on the left is the argument name being passed to the function.
                            mtx_token_db on the right is the existing variable in the caller scope.
                            Python evaluates the right-hand side first, then binds that value to the parameter name inside the callee.
                            The only time this becomes a real problem is if you write something like:
                            def func(mtx_token_db=mtx_token_db):
                            That can fail because the default value is evaluated at function definition time, not at call time
                        '''
                        decoder = assem_decode(
                                z80wip=[],
                                memaddr=MemPos,
                                LineLen=LineLen,
                                CodeLen=CodeLen,
                                CodeInc=CodeInc,
                                mtxlist_str=mtxlist_str,
                                mtx_token_db=mtx_token_db,
                                fn_in=fn_r,
                                fn_out=fn_w,
                                filetype=("sdxRflagTrue" if sdxRflag else
                                        ("mtxflagTrue" if mtxflag else "sdxBflagTrue")),
                                VSC_flag=VSC_flag,
                                mtxdirectives=GV_mtxdirectives,
                                RES_code=RES_code,
                            )

                        mtxlist_str = decoder.mtxlist_str
                        RES_code = decoder.RES_code
                        MemPos = decoder.MemPos
                        LineLen=decoder.LineLen
                        #print(RES_code)
                        i=i+LineLen+1 #make sure the counter is updated, ready at the next read item
                        BAS_hdr=[0,0,0,0,0,0,0,0,0]   #[] works with .BAS files. [0]*65535 doesn't work with .BAS either
                        #print("TEST: Code BASIC line length, ",LineLen, " read counter accumulator, i= ",i)
                        break #end while loop

                    elif read_dec in (128, 129, 134, 137, 143, 163, 165, 175, 180, 184, 186): #no space after standalone commands like CLS. Avoids exceeding 158 char limit per line
                        #no space after return in case ut is followed by else would lead to double spacing and cause an issue with VSC mtxbasic extension
                        #no space after DATA as this is added by MTX BASIC interpreter
                        mtxlist_str=mtxlist_str+mtx_token_db[read_dec][1]

                    elif read_dec in ( 195, 198, 199, 200, 218, 219, 220): #needs a space before and after the command 
                        mtxlist_str=mtxlist_str+" "+mtx_token_db[read_dec][1]+" "

                    elif read_dec in range(206,218): #unary symbol like - or +
                        mtxlist_str=mtxlist_str+mtx_token_db[read_dec][1] #no spaces after a symbol

                    elif read_dec in range(221,254): #Keywords with () like int()
                        if read_dec==238: #special case as need a space between LEN and ()
                            mtxlist_str=mtxlist_str+mtx_token_db[read_dec][1]+" "
                        else:
                            mtxlist_str=mtxlist_str+mtx_token_db[read_dec][1] #no space after

                    elif read_dec>127 and read_dec<255:
                        #look up mtx token
                        #j==4 is the first token position in a BASIC line;
                        #BAS_hdr[j-1] is then header byte 3 (line number high byte), not prior source text.
                        #Without this guard, line numbers with high byte 0x28 "(" suppress spacing after the first token.
                        if j>4 and mtx_token_db[prev_read_dec][1]=="(": #no spaces before or after keyword
                            mtxlist_str=mtxlist_str+mtx_token_db[read_dec][1]
                        elif mtxlist_str[-1] not in " \t:" and (read_dec==150 or read_dec==151): # ON var GOTO and ON var GOSUB
                            mtxlist_str +=" " #add space if no leading space as previous found with ON varGOTO and ON varGOSUB issue
                            mtxlist_str=mtxlist_str+mtx_token_db[read_dec][1]+" "
                        else:
                            mtxlist_str=mtxlist_str+mtx_token_db[read_dec][1]+" " #add a space after MTX keyword
                        #end if-elif-else

                    elif read_dec>26 and read_dec<=GV_nonprintable or read_dec==0 or read_dec==127: #0 or 27 to 31 or 127 which is delete, not ascii or token
                        #print("TEST: not coded for yet, ascii value ",read_dec)  #still to detrmine what this is for but skip for now
                        pass
                    else:
                        print("out of range")
                        break
                    #end if-elif-else
                    j=j+1
                    prev_read_dec=read_dec
                #end inner while
            #end while loop

        except IndexError:
            pass


        #print("TEST: while loop count at end of BASIC",i)

        return RES_code , PlodNameList #from BASIC_loop
    
    def NODDY_loop():
        #stored after BASIC code

        global i,fn_r_size,fn_r,fn_w,mtx_token_db,noddy_flag,PlodNameList,GC_MAXADDR,GC_MTXEOL
        #LineLen,mtxlist_str,nodData # these local as reset but usage is consistent within convert_mtx_to_text

        noddyCmds={'*ADVANCE', '*BRANCH', '*DISPLAY','*ENTER', '*GOTO', '*IF', '*LIST', '*OFFSTACK', '*PAUSE', '*RETURN', '*STACK'}
        noddyCmdsShort={'*A', '*B',  '*D', '*E', '*G', '*I', '*L', '*O', '*P', '*R', '*S'}
        nodProgTitle="Program "
        nodTextTitle="Text "
        nodPage=[]
        
        while i<fn_r_size+1 and noddy_flag is True: #Noddy test section
            #length of noddy code
            nodData=[0]*1280 # reset array
            nodData[0]=int.from_bytes(fn_r.read(1),"little")
            nodData[1]=int.from_bytes(fn_r.read(1),"little")
            LineLen=(nodData[1]*256)+nodData[0]
            #print("TEST: Length of Noddy text/prog ",LineLen)
            i=i+2
            #title of Noddy page maximum of 33 characters whith the last character with bit 7 high
            mtxlist_str=""
            j=2

            while j<=LineLen: 
                nodData[j]=int.from_bytes(fn_r.read(1),"little")

                #title is recommended to be alphanumeric (UPPERCASE (128+65 to 128+90) and NUMBERS (128+48 to 128+57 )) 
                #but in MEMU, a noddy program title can be case insensitive but must be PLOD "prog1 or P1 or ..". It cannot be @1P for instance
                #but in MEMU @1P is a valid text page name.
                if nodData[j]>128 :#bit 7 high (end of name) so could be 
                    nodData[j]=nodData[j]-128
                    mtxlist_str=mtxlist_str+mtx_token_db[nodData[j]][1]
                    mtxlist_str="title="+mtxlist_str
                    #print("TEST: "+mtxlist_str)
                    nodPage.append(mtxlist_str) #note the '\n' is done later when writing out
                    #fn_w.write(mtxlist_str) #Noddy text page title
                    #fn_w.write('\n') #skip 255 as this will be replaced by a text EOL
                    break #exit while
                else:
                    mtxlist_str=mtxlist_str+mtx_token_db[nodData[j]][1]
                #end if-else
                    
                j=j+1
            #end while

            #title done, move counter to next entry of this line until linelen reached or 255 detected
            j=j+1
            i=i+j
            #print(TEST: "j= ",j, "i= ",i)
            #Noddy text or noddy program
            mtxlist_str="" #reset string
            pg_wide=39 #still to code for a \n every 39 characters
            jcol=1 #insert a LF after every 39 chars

            while j<=LineLen:
                #print("TEST: in Noddy loop")
                nodData[j]=int.from_bytes(fn_r.read(1),"little")
                #print("TEST: ",nodData[j])

                if j==LineLen or nodData[j]==GC_MTXEOL:
                    #print("TEST: 1st if")
                    nodPage.append(mtxlist_str)
                    #print("TEST: write line: ",mtxlist_str)
                    break
                elif nodData[j]>168: #not a space or could be another title marker set as eol of line
                        nodPage.append(mtxlist_str)
                        jcol=0# new row and reset col counter
                        mtxlist_str=""
                elif nodData[j]>128:#bit 7 high then determines the number of spaces, maxium of 39 spaces
                    #print("TEST: elif")
                    for ggg in range(nodData[j]-128):
                        if jcol>=pg_wide: #end of row
                            nodPage.append(mtxlist_str)
                            #fn_w.write(mtxlist_str)
                            #fn_w.write('\n') #LF as end of row
                            #print("TEST: write line: ",mtxlist_str)
                            jcol=0# new row and reset col counter
                            mtxlist_str=""
                            break #end for as new line, saves a spurious extra space
                        #not end of row yet
                        jcol=jcol+1
                        mtxlist_str=mtxlist_str+" " #add a space for each count
                    #end for
                else:
                    #print("TEST: else")
                    if jcol>=pg_wide: #end of row
                            nodPage.append(mtxlist_str)
                            #fn_w.write(mtxlist_str)
                            #fn_w.write('\n') #LF as end of row
                            #print("TEST: write line: ",mtxlist_str)
                            jcol=0# new row and reset col counter
                            mtxlist_str=""
                    #not end of row yet
                    jcol=jcol+1
                    mtxlist_str=mtxlist_str+mtx_token_db[nodData[j]][1] #add a new entry
                #end if-elif-else    
                j=j+1
            #end while
            #determine if noddy page is a program page or a text page
            title_str=nodPage[0][6:] if nodPage and nodPage[0].startswith("title=") else ""
            #skip empty/unused noddy page slots (no title found)
            if not title_str:
                nodPage=[]
                i=i+j+1
                continue
            is_prog=(title_str in PlodNameList) or \
                    any(cmd in line for line in nodPage for cmd in noddyCmds) or \
                    any(cmd in line for line in nodPage for cmd in noddyCmdsShort)
            typeTitle=nodProgTitle if is_prog else nodTextTitle
            nodPage[0]=typeTitle+nodPage[0] #prepend type onto the title line
            for nline in nodPage:
                fn_w.write(nline)
                fn_w.write('\n') #adds eol
            nodPage=[] #reset page for next page    
            i=i+j+1  #noddy page done, move counter to next entry
        #end while
        return #from NODDY_loop

    def SYSVAR_check(m1=-1,m2=-1):
        global sysvar_flag, sysvar_start
        sysvar_flag=False
        sysvar_start=-1 #no match
        fn_r.seek(0,0) #scan from the starta of the file
        tmp_marker_def=[0,0,0,242,248]
        tmp_marker=[0,0,0,0,0]
        tmp_marker[3]=m1
        tmp_marker[4]=m2
        tmp_wip=tmp_marker.copy()
        while sysvar_flag is False: #and hdr_cnt<fn_r_size:
            #skip the next section of the tape header until find the system variable section
            #watch out for misaligned byte 16/17 - e.g. BOMBER.mtx
            #uplifted from mtxhexdump.py
            try:
                raw_byte=fn_r.read(1)
                if raw_byte==b'': #EOF reached.
                    print("DEBUG: EOF reached")
                    break #exit while loop
                #end if
                read_dec=int.from_bytes(raw_byte,"little")
                tmp_wip.pop(0)
                tmp_wip.append(read_dec)
                if tmp_wip==tmp_marker or tmp_wip==tmp_marker_def:
                    #print("TEST: marker block=",tmp_wip)
                    sysvar_flag=True
                    sysvar_start=fn_r.tell() #tell position increments by 1.
                    break #exit while loop
                #end if
            except EOFError:
                print("DEBUG: error trap: EOF reached")
                break
        #end while
        return sysvar_flag, sysvar_start
    
    #=======================================
    #MAIN CODE
    #=======================================
    #load results from disc/tape into array
    global GV_fname_r,GV_fname_w,GC_extn_r,GC_extn_w,GC_MTXEOL,GC_MAXADDR,GV_nonprintable,GV_sys_var
    #additional global
    global len_BASIC, hdr_cnt,fn_r_size,fn_r,fn_w,LineLen,LineNum,noddy_flag,i,mtxlist_str,run_codebaselen, run_codebase
    global MemPos,CodeLen,CodeInc,CodeEnd,WIP_code,RES_code,VSC_flag,mtxflag,sdxBflag, sdxRflag,PlodNameList
    global mtxdirectives_flag,sysvar_flag,sysvar_start
    CodeLen=0
    CodeInc=7 #starts at the 7th byte and will increment in 4 or less bytes per cycle.
    CodeEnd=7
    WIP_code=[0,"","","",""] # Number of bytes to pass and a maximum of 4 bytes
    RES_code="" #build up the code output
    #open('workfile', 'w', encoding="utf-8") not applicable to ytes
    #print("get file to convert (*.mtx) or *.BAS")
    GV_fname_r = askopenfilename(title="Binary (Program) input filename",defaultextension=GC_extn_r, filetypes=[("MTX Tape Program (Binary) files", GC_extn_r),("SDX Disk Program BAS files","*.BAS"),("SDX Disk Program RUN files","*.RUN"),("All files","*.*")])
    #print("write conversion out as a text BASIC file (*.bas)")
    GV_fname_w = asksaveasfilename(title="BASIC (text) output filename",defaultextension=GC_extn_w, filetypes=[("MTX/SDX BASIC text files", "*.bas"),("TEXT files", "*.txt"),("All files","*.*")]) 
    VSC_flag=False #Not required by VS Code as can view/edit a greater proportion of the listing and CTRL F to find than for the current 4 MTX editor.
    mtxflag=False #check if a valid binary file, should start with 255 on a MTX program.
    sdxBflag=False
    sdxRflag=False #for future use
    PlodNameList=[]


    #print("DEBUG: fname_r and fname_w",repr(GV_fname_r),repr(GV_fname_w))
    if (GV_fname_r and GV_fname_r.strip()) and (GV_fname_w and GV_fname_w.strip()) : #if not blank or cancelled
        fn_r_size=os.path.getsize (GV_fname_r) #replaces GC_array_rows
        #print("TEST: file size: ",fn_r_size)
        #still to check hdr_len<file size
        answer=msgbox.askyesno(title="MTX Disassembly",message="Do you require VS Code editor compatibility (i.e. no symbols list after the code block)?,\n ")
        VSC_flag=answer
        answer=msgbox.askyesno(title="MTX Disassembly",message="Do you require mtx directives (e.g. adds labels, comments, etc. if available) to be included in the disassembly?,\n ")
        mtxdirectives_flag=answer
        
        with open(GV_fname_r, 'rb') as fn_r: #read file plus byte rb 
            with open(GV_fname_w, 'w') as fn_w: #if read available, open write to save listing as text
                #test of MTX layout
                #normally header is 619 bytes. For BSHIPs its 2827
                mtxfn_str=""
                mtxlist_str=""
                sysvar_start=-1 #not detected
                sysvar_flag=False
                noddy_flag=False
                hdr_cnt=0
                len_BASIC=0 
                marker1_read_dec=0
                marker2_read_dec=0
                read_dec=int.from_bytes(fn_r.read(1),"little")
                hdr_cnt=hdr_cnt+1
                if (read_dec==GC_MTXEOL and GV_fname_r.lower().endswith(".mtx")) or (read_dec==242 and GV_fname_r.upper().endswith(".BAS")) or (GV_fname_r.upper().endswith(".RUN")):
                    if read_dec==GC_MTXEOL and GV_fname_r.lower().endswith(".mtx"): # MTX Tape file
                        #print("MTX file")
                        mtxflag=True
                        for gg in range(15): #this is the name
                            read_dec=int.from_bytes(fn_r.read(1),"little")
                            hdr_cnt=hdr_cnt+1
                            #print("TEST: byte = ",gg, read_dec)
                            if gg>0 and gg<16 and read_dec !=32: #assumes fname max 15 characters. Remove spaces after name
                                mtxfn_str=mtxfn_str+chr(read_dec)
                        #end for
                        #read bytes 16 and 17 as these are the markers that will signifiy later on where the sys_var section is located
                        marker1_read_dec=int.from_bytes(fn_r.read(1),"little") #typically 0xF2
                        marker2_read_dec=int.from_bytes(fn_r.read(1),"little") #typically 0xF8
                        hdr_cnt=hdr_cnt+2
                    elif read_dec==242 and GV_fname_r.upper().endswith(".BAS"): #SDX BASIC file, assumes 0xF2 as 1st byte
                        #print("SDX BASIC file")
                        marker1_read_dec=read_dec
                        marker2_read_dec=int.from_bytes(fn_r.read(1),"little")
                        hdr_cnt=hdr_cnt+1
                        if marker2_read_dec==248: #check to confirm 0xF8
                            sdxBflag=True
                        #end if
                    elif GV_fname_r.upper().endswith(".RUN"): #SDX RUN file
                        #filename, start,len, BASIC sys_var marker (0x000000F2F8)
                        RUN_list=[
                            ["ALPHA.RUN",0x8100,0x3000,False],
                            ["ASTROPAC.RUN",0x80FF,0x2181,False], 
                            ["BAKERY.RUN",0x8021,0x3334,False],
                            ["BLOBBO.RUN",0x4030,0x2900,False],
                            ["BUCK.RUN",0x8100,0x4400,False],
                            ["CHESS.RUN",0x8051,0x4BE7,False],
                            ["DEVILS.RUN",0x4007,0x2000,False],
                            ["HAWKWARS.RUN",0x4007,0x2000,False],
                            ["H-CHUMY.RUN",0x8021,0x2B10,False],
                            ["KILO.RUN",0x4031,0x1800,False],
                            ["KNUCKLES.RUN",0x80FF,0x4000,False],
                            ["MECHA8.RUN",0x4100,0x82D5,False],
                            ["MTXDRAG.RUN",0x401B,0x25AA,False],
                            ["MURDER.RUN",0x8007,0x4000,False],
                            ["NEMO.RUN",0x80FF,0x2400,False], 
                            ["OBLOIDS.RUN",0x8100,0x403F,False],
                            ["OLDMAC.RUN",0x8021,0x2EE4,False],
                            ["OMEGA.RUN",0x8083,0x2000,False],
                            ["PACMAN.RUN",0x8021,0x2070,False],
                            ["PHAID.RUN",0x80FF,0x2801,False], 
                            ["POWERPAC.RUN",0x8021,0x2305,False],
                            ["REV.RUN",0x4100,0x36CE,False],
                            ["REVERSI.RUN",0x80FF,0x4000,False],
                            ["SASA.RUN",0x8021,0x36B8,False],
                            ["SCANNER.RUN",0x8100,0x4380,False],
                            ["SMG.RUN",0x4100,0x7C70,False],
                            ["SPECTRON.RUN",0x8021,0x2719,False],
                            ["STAR.RUN",0x8100,0x4000,False],
                            ["TBUNNY.RUN",0x8021,0x32B8,False],
                            ["TMINVADE.RUN",0x8100,0x067A,False],
                            ["TOADO.RUN",0x402F,0x2020,True],
                            ["TURBO.RUN",0x80FF,0x3D01,False],
                            ["ZOMBNEAR.RUN",0x4100,0x934E,False]
                            ]
                        #print("SDX RUN (game) file")
                        #1st 2 bytes are the codebase, the 2nd 2 bytes are the codelength
                        run_codebase=read_dec+int.from_bytes(fn_r.read(1),"little")*256
                        run_codebaselen=int.from_bytes(fn_r.read(1),"little")+int.from_bytes(fn_r.read(1),"little")*256
                        hdr_cnt=hdr_cnt+3
                        code_start=fn_r.tell() #first opcode byte position in file
                        #scan the file to see if it has BASIC code and sys_vars
                        SYSVAR_check(242,248) #default case, other options possible.
                        print("DEBUG: initial sysvar and start are",sysvar_flag, sysvar_start)
                        sdxRflag=True
                        #check for mtx assembly directives - this will be after the code jump header loader / Might not be present?
                        LineLen=fn_r_size #need to review the size and run_codebaselen and have a more length
                        GV_mtxdirectives=[] #only update once into a proper BASIC construct.
                        fn_r.seek(code_start,0) #from start of file (already dispaced by 4)
                        if sysvar_flag is True:
                            data_len=(sysvar_start-6)-code_start #data_len might be same as run_codebaselen
                            print("DEBUG: data_len=",data_len)
                            if data_len>0:
                                try:
                                    decoder = assem_decode(
                                        z80wip=[],
                                        memaddr=run_codebase,
                                        LineLen=0,
                                        CodeLen=data_len,
                                        CodeInc=0,#normally hdr_cnt
                                        mtxlist_str="",
                                        mtx_token_db=mtx_token_db,
                                        fn_in=fn_r,
                                        fn_out=fn_w,
                                        filetype=("sdxRflagTrue" if sdxRflag else
                                                ("mtxflagTrue" if mtxflag else "sdxBflagTrue")),
                                        VSC_flag=True,
                                        mtxdirectives=GV_mtxdirectives, #doubles up as setting directives skip
                                        RES_code="0 CODE\n",
                                        )
                                    fn_w.write(decoder.RES_code)
                                except EOFError:
                                    pass
                            #end if
                            #however, further on is what looks like a BASIC program - so inject markers F2 F8 accordingly
                            marker1_read_dec=242
                            marker2_read_dec=248
                            #update flag to sdxBflag so that any remaining BASIC code is properly disassembled
                            sdxRflag=False
                            sdxBflag=True
                        else:
                            try:
                                decoder = assem_decode(
                                    z80wip=[],
                                    memaddr=run_codebase,
                                    LineLen=0,
                                    CodeLen=LineLen-hdr_cnt, # not run_codebaselen as misses a lot of the code & results in half complete end instruction
                                    CodeInc=0,#normally hdr_cnt
                                    mtxlist_str="",
                                    mtx_token_db=mtx_token_db,
                                    fn_in=fn_r,
                                    fn_out=fn_w,
                                    filetype=("sdxRflagTrue" if sdxRflag else
                                            ("mtxflagTrue" if mtxflag else "sdxBflagTrue")),
                                    VSC_flag=True,
                                    mtxdirectives=GV_mtxdirectives, #doubles up as setting directives skip
                                    RES_code="0 CODE\n", #for VSC compatibility
                                    )
                                fn_w.write(decoder.RES_code)
                            except EOFError:
                                pass
                        #end if-else
                    #end if-elif
                else:
                    mtxflag=False
                    sdxBflag=False
                    sdxRflag=False
                    msgbox.showwarning(title="MTX Disassembly",message="Not a MTX/SDX program (binary) file to disassemble,\n ")
                #end if-else
                #print("DEBUG: sdxFlag is",sdxBflag, sdxRflag)
                if mtxflag is True or sdxBflag is True: 
                    if mtxfn_str !="":
                        mtxfn_str=mtxfn_str 
                        #print("TEST: "+mtxfn_str+"."+GC_extn_r)
                        #else skip the rest for the moment
                    SYSVAR_check(marker1_read_dec,marker2_read_dec) #returned sysvar_flag and sysvar_start (note +5 bytes forward)
                    print("DEBUG: BASIC sysvar and start are",sysvar_flag, sysvar_start)
                    if sysvar_flag is True:
                        print("DEBUG: sysvar_flag is true and position of sys_var in file",sysvar_start)
                        fn_r.seek(sysvar_start,0) #from start of file
                        for ggg in range(5,251): #remaining system variable
                            GV_sys_var[ggg]=int.from_bytes(fn_r.read(1),"little")
                            hdr_cnt=hdr_cnt+1
                        #end for
                        #within system variables is the info to see if Noddy text/code is used
                        pos_noddy=(GV_sys_var[85]*256)+GV_sys_var[84] #end of Noddy in memory
                        pos_basic_st=(GV_sys_var[91]*256)+GV_sys_var[90] # start of BASIC in memory
                        pos_basic_end=(GV_sys_var[88]*256)+GV_sys_var[87] #end of BASIC (start of Noddy) in memory
                        print("TEST: BASIC_START = ", pos_basic_st, " BASIC_END = ",pos_basic_end, " and NODDY_START = ", pos_noddy)

                        if pos_noddy==pos_basic_end:
                            #print("TEST: No noddy text  ")
                            noddy_flag=False
                        else:
                            #print("TEST: Noddy text, starting at ",pos_noddy)
                            noddy_flag=True
                        #end if-else

                        len_BASIC=pos_basic_end-pos_basic_st
                        MemPos=pos_basic_st #required for assembly language code positioning if MemPos=16384 then MTX512. if MTX500 then 32768
                        #print("TEST: length of Basic = ",len_BASIC, "Start of Program address = ",MemPos)
                        #might be prudent to shift indent to the right to keep witin sysvar_flag is true    
                        #print("TEST: pos_basic_st=",pos_basic_st," pos_basic_end=",pos_basic_end," pos_noddy=",pos_noddy," len_BASIC=",len_BASIC)
                        try:
                            # b'' means a byte
                            # b'\xhh' is escape sequence (\x) followed by a hex value
                            #BASIC listing section
                            BASIC_loop() #note CODE and mtxdirectives will be called from this loop


                            # Check if noddy_flag is True and inject REM NODDY if needed
                            if noddy_flag is True:
                                # Split RES_code into lines to check the last line
                                lines = RES_code.rstrip('\n').split('\n') if RES_code.strip() else []
                                if lines:
                                    last_line = lines[-1]
                                    # Check if the last line contains "REM NODDY"
                                    if "REM NODDY" not in last_line.upper():
                                        # Check if line 65535 exists
                                        line_65535_exists = any(line.strip().startswith("65535 ") for line in lines)
                                        
                                        if line_65535_exists:
                                            # Line 65535 exists, append :REM NODDY to it in RES_code
                                            for idx, line in enumerate(lines):
                                                if line.strip().startswith("65535 "):
                                                    lines[idx] = line.rstrip() + ":REM NODDY"
                                                    RES_code = '\n'.join(lines) + '\n'
                                                    # Can't modify already written file, but update display
                                                    break
                                        else:
                                            # Insert new line 65535 REM NODDY
                                            fn_w.write("65535 REM NODDY\n")
                                            RES_code = RES_code + "65535 REM NODDY\n"

                                #print(RES_code)

                                NODDY_loop()
                                                    
                        except EOFError or IndexError:
                                fn_r.close()
                                fn_w.close()

            fn_r.close()
            fn_w.close()
            #end with
    else:
        print("FILENAME(S) NOT VALID or OPERATION CANCELLED")
    #end if-else
    return

convert_mtx_to_txt()
#quit() #loads prompt to kill the window





