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

global GV_fname_r,GV_fname_w,GC_extn_r,GC_extn_w,GV_MTXEOL,GV_results,GV_nonprintable

GV_fname_r="Rtest"
GV_fname_w="Wtest"
GC_extn_r=".mtx" #default
GC_extn_w=".bas" #default
GV_results=[0]*1280 #likely to be 256 max(note Noddy screen is 39x24=936). Note maximum line input in BASIC will be 0 to FE as FF is reserved
GV_sys_var=[0]*256 #where to store the information
GV_MTXEOL=255
GV_nonprintable=31

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

'''z80 hex to mnemomic conversion table notes
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

z80_mnemomic_db=[
["00","NOP"],
["01 XXXX","LD BC,NN"],
["02","LD (BC),A"],
["03","INC BC"],
["04","INC B"],
["05","DEC B"],
["06 xx","LD B,n"],
["07","RLCA"],
["08","EX AF,AF'"],
["09","ADD HL,BC"],
["0A","LD A,(BC)"],
["0B","DEC BC"],
["0C","INC C"],
["0D","DEC C"],
["0E xx","LD C,n"],
["0F","RRCA"],
["10 yy","DJNZ e"],
["11 XXXX","LD DE,NN"],
["12","LD (DE),A"],
["13","INC DE"],
["14","INC D"],
["15","DEC D"],
["16 xx","LD D,n"],
["17","RLA"],
["18 yy","JR e"],
["19","ADD HL,DE"],
["1A","LD A,(DE)"],
["1B","DEC DE"],
["1C","INC E"],
["1D","DEC E"],
["1E xx","LD E,n"],
["1F","RRA"],
["20 yy","JR NZ,e"],
["21 XXXX","LD HL,NN"],
["22 XXXX","LD (NN),HL"],
["23","INC HL"],
["24","INC H"],
["25","DEC H"],
["26 xx","LD H,n"],
["27","DAA"],
["28 yy","JR Z,e"],
["29","ADD HL,HL"],
["2A XXXX","LD HL,(NN)"],
["2B","DEC HL"],
["2C","INC L"],
["2D","DEC L"],
["2E xx","LD L,n"],
["2F","CPL"],
["30 yy","JR NC,e"],
["31 XXXX","LD SP,NN"],
["32 XXXX","LD (NN),A"],
["33","INC SP"],
["34","INC (HL)"],
["35","DEC (HL)"],
["36 xx","LD (HL),n"],
["37","SCF"],
["38 yy","JR C,e"],
["39","ADD HL,SP"],
["3A XXXX","LD A,(NN)"],
["3B","DEC SP"],
["3C","INC A"],
["3D","DEC A"],
["3E xx","LD A,n"],
["3F","CCF"],
["40","LD B,B"],
["41","LD B,C"],
["42","LD B,D"],
["43","LD B,E"],
["44","LD B,H"],
["45","LD B,L"],
["46","LD B,(HL)"],
["47","LD B,A"],
["48","LD C,B"],
["49","LD C,C"],
["4A","LD C,D"],
["4B","LD C,E"],
["4C","LD C,H"],
["4D","LD C,L"],
["4E","LD C,(HL)"],
["4F","LD C,A"],
["50","LD D,B"],
["51","LD D,C"],
["52","LD D,D"],
["53","LD D,E"],
["54","LD D,H"],
["55","LD D,L"],
["56","LD D,(HL)"],
["57","LD D,A"],
["58","LD E,B"],
["59","LD E,C"],
["5A","LD E,D"],
["5B","LD E,E"],
["5C","LD E,H"],
["5D","LD E,L"],
["5E","LD E,(HL)"],
["5F","LD E,A"],
["60","LD H,B"],
["61","LD H,C"],
["62","LD H,D"],
["63","LD H,E"],
["64","LD H,H"],
["65","LD H,L"],
["66","LD H,(HL)"],
["67","LD H,A"],
["68","LD L,B"],
["69","LD L,C"],
["6A","LD L,D"],
["6B","LD L,E"],
["6C","LD L,H"],
["6D","LD L,L"],
["6E","LD L,(HL)"],
["6F","LD L,A"],
["70","LD (HL),B"],
["71","LD (HL),C"],
["72","LD (HL),D"],
["73","LD (HL),E"],
["74","LD (HL),H"],
["75","LD (HL),L"],
["76","HALT"],
["77","LD (HL),A"],
["78","LD A,B"],
["79","LD A,C"],
["7A","LD A,D"],
["7B","LD A,E"],
["7C","LD A,H"],
["7D","LD A,L"],
["7E","LD A,(HL)"],
["7F","LD A,A"],
["80","ADD A,B"],
["81","ADD A,C"],
["82","ADD A,D"],
["83","ADD A,E"],
["84","ADD A,H"],
["85","ADD A,L"],
["86","ADD A,(HL)"],
["87","ADD A,A"],
["88","ADC A,B"],
["89","ADC A,C"],
["8A","ADC A,D"],
["8B","ADC A,E"],
["8C","ADC A,H"],
["8D","ADC A,L"],
["8E","ADC A,(HL)"],
["8F","ADC A,A"],
["90","SUB B"],
["91","SUB C"],
["92","SUB D"],
["93","SUB E"],
["94","SUB H"],
["95","SUB L"],
["96","SUB (HL)"],
["97","SUB A"],
["98","SBC A,B"],
["99","SBC A,C"],
["9A","SBC A,D"],
["9B","SBC A,E"],
["9C","SBC A,H"],
["9D","SBC A,L"],
["9E","SBC A,(HL)"],
["9F","SBC A,A"],
["A0","AND B"],
["A1","AND C"],
["A2","AND D"],
["A3","AND E"],
["A4","AND H"],
["A5","AND L"],
["A6","AND (HL)"],
["A7","AND A"],
["A8","XOR B"],
["A9","XOR C"],
["AA","XOR D"],
["AB","XOR E"],
["AC","XOR H"],
["AD","XOR L"],
["AE","XOR (HL)"],
["AF","XOR A"],
["B0","OR B"],
["B1","OR C"],
["B2","OR D"],
["B3","OR E"],
["B4","OR H"],
["B5","OR L"],
["B6","OR (HL)"],
["B7","OR A"],
["B8","CP B"],
["B9","CP C"],
["BA","CP D"],
["BB","CP E"],
["BC","CP H"],
["BD","CP L"],
["BE","CP (HL)"],
["BF","CP A"],
["C0","RET NZ"],
["C1","POP BC"],
["C2 XXXX","JP NZ,NN"],
["C3 XXXX","JP NN"],
["C4 XXXX","CALL NZ,NN"],
["C5","PUSH BC"],
["C6 xx","ADD A,n"],
["C7","RST 00"],
["C8","RET Z"],
["C9","RET"],
["CA XXXX","JP Z,NN"],
["CB00","RLC B"],
["CB01","RLC C"],
["CB02","RLC D"],
["CB03","RLC E"],
["CB04","RLC H"],
["CB05","RLC L"],
["CB06","RLC (HL)"],
["CB07","RLC A"],
["CB08","RRC B"],
["CB09","RRC C"],
["CB0A","RRC D"],
["CB0B","RRC E"],
["CB0C","RRC H"],
["CB0D","RRC L"],
["CB0E","RRC (HL)"],
["CB0F","RRC A"],
["CB10","RL B"],
["CB11","RL C"],
["CB12","RL D"],
["CB13","RL E"],
["CB14","RL H"],
["CB15","RL L"],
["CB16","RL (HL)"],
["CB17","RL A"],
["CB18","RR B"],
["CB19","RR C"],
["CB1A","RR D"],
["CB1B","RR E"],
["CB1C","RR H"],
["CB1D","RR L"],
["CB1E","RR (HL)"],
["CB1F","RR A"],
["CB20","SLA B"],
["CB21","SLA C"],
["CB22","SLA D"],
["CB23","SLA E"],
["CB24","SLA H"],
["CB25","SLA L"],
["CB26","SLA (HL)"],
["CB27","SLA A"],
["CB28","SRA B"],
["CB29","SRA C"],
["CB2A","SRA D"],
["CB2B","SRA E"],
["CB2C","SRA H"],
["CB2D","SRA L"],
["CB2E","SRA (HL)"],
["CB2F","SRA A"],
["CB38","SRL B"],
["CB39","SRL C"],
["CB3A","SRL D"],
["CB3B","SRL E"],
["CB3C","SRL H"],
["CB3D","SRL L"],
["CB3E","SRL (HL)"],
["CB3F","SRL A"],
["CB40","BIT 0,B"],
["CB41","BIT 0,C"],
["CB42","BIT 0,D"],
["CB43","BIT 0,E"],
["CB44","BIT 0,H"],
["CB45","BIT 0,L"],
["CB46","BIT 0,(HL)"],
["CB47","BIT 0,A"],
["CB48","BIT 1,B"],
["CB49","BIT 1,C"],
["CB4A","BIT 1,D"],
["CB4B","BIT 1,E"],
["CB4C","BIT 1,H"],
["CB4D","BIT 1,L"],
["CB4E","BIT 1,(HL)"],
["CB4F","BIT 1,A"],
["CB50","BIT 2,B"],
["CB51","BIT 2,C"],
["CB52","BIT 2,D"],
["CB53","BIT 2,E"],
["CB54","BIT 2,H"],
["CB55","BIT 2,L"],
["CB56","BIT 2,(HL)"],
["CB57","BIT 2,A"],
["CB58","BIT 3,B"],
["CB59","BIT 3,C"],
["CB5A","BIT 3,D"],
["CB5B","BIT 3,E"],
["CB5C","BIT 3,H"],
["CB5D","BIT 3,L"],
["CB5E","BIT 3,(HL)"],
["CB5F","BIT 3,A"],
["CB60","BIT 4,B"],
["CB61","BIT 4,C"],
["CB62","BIT 4,D"],
["CB63","BIT 4,E"],
["CB64","BIT 4,H"],
["CB65","BIT 4,L"],
["CB66","BIT 4,(HL)"],
["CB67","BIT 4,A"],
["CB68","BIT 5,B"],
["CB69","BIT 5,C"],
["CB6A","BIT 5,D"],
["CB6B","BIT 5,E"],
["CB6C","BIT 5,H"],
["CB6D","BIT 5,L"],
["CB6E","BIT 5,(HL)"],
["CB6F","BIT 5,A"],
["CB70","BIT 6,B"],
["CB71","BIT 6,C"],
["CB72","BIT 6,D"],
["CB73","BIT 6,E"],
["CB74","BIT 6,H"],
["CB75","BIT 6,L"],
["CB76","BIT 6,(HL)"],
["CB77","BIT 6,A"],
["CB78","BIT 7,B"],
["CB79","BIT 7,C"],
["CB7A","BIT 7,D"],
["CB7B","BIT 7,E"],
["CB7C","BIT 7,H"],
["CB7D","BIT 7,L"],
["CB7E","BIT 7,(HL)"],
["CB7F","BIT 7,A"],
["CB80","RES 0,B"],
["CB81","RES 0,C"],
["CB82","RES 0,D"],
["CB83","RES 0,E"],
["CB84","RES 0,H"],
["CB85","RES 0,L"],
["CB86","RES 0,(HL)"],
["CB87","RES 0,A"],
["CB88","RES 1,B"],
["CB89","RES 1,C"],
["CB8A","RES 1,D"],
["CB8B","RES 1,E"],
["CB8C","RES 1,H"],
["CB8D","RES 1,L"],
["CB8E","RES 1,(HL)"],
["CB8F","RES 1,A"],
["CB90","RES 2,B"],
["CB91","RES 2,C"],
["CB92","RES 2,D"],
["CB93","RES 2,E"],
["CB94","RES 2,H"],
["CB95","RES 2,L"],
["CB96","RES 2,(HL)"],
["CB97","RES 2,A"],
["CB98","RES 3,B"],
["CB99","RES 3,C"],
["CB9A","RES 3,D"],
["CB9B","RES 3,E"],
["CB9C","RES 3,H"],
["CB9D","RES 3,L"],
["CB9E","RES 3,(HL)"],
["CB9F","RES 3,A"],
["CBA0","RES 4,B"],
["CBA1","RES 4,C"],
["CBA2","RES 4,D"],
["CBA3","RES 4,E"],
["CBA4","RES 4,H"],
["CBA5","RES 4,L"],
["CBA6","RES 4,(HL)"],
["CBA7","RES 4,A"],
["CBA8","RES 5,B"],
["CBA9","RES 5,C"],
["CBAA","RES 5,D"],
["CBAB","RES 5,E"],
["CBAC","RES 5,H"],
["CBAD","RES 5,L"],
["CBAE","RES 5,(HL)"],
["CBAF","RES 5,A"],
["CBB0","RES 6,B"],
["CBB1","RES 6,C"],
["CBB2","RES 6,D"],
["CBB3","RES 6,E"],
["CBB4","RES 6,H"],
["CBB5","RES 6,L"],
["CBB6","RES 6,(HL)"],
["CBB7","RES 6,A"],
["CBB8","RES 7,B"],
["CBB9","RES 7,C"],
["CBBA","RES 7,D"],
["CBBB","RES 7,E"],
["CBBC","RES 7,H"],
["CBBD","RES 7,L"],
["CBBE","RES 7,(HL)"],
["CBBF","RES 7,A"],
["CBC0","SET 0,B"],
["CBC1","SET 0,C"],
["CBC2","SET 0,D"],
["CBC3","SET 0,E"],
["CBC4","SET 0,H"],
["CBC5","SET 0,L"],
["CBC6","SET 0,(HL)"],
["CBC7","SET 0,A"],
["CBC8","SET 1,B"],
["CBC9","SET 1,C"],
["CBCA","SET 1,D"],
["CBCB","SET 1,E"],
["CBCC","SET 1,H"],
["CBCD","SET 1,L"],
["CBCE","SET 1,(HL)"],
["CBCF","SET 1,A"],
["CBD0","SET 2,B"],
["CBD1","SET 2,C"],
["CBD2","SET 2,D"],
["CBD3","SET 2,E"],
["CBD4","SET 2,H"],
["CBD5","SET 2,L"],
["CBD6","SET 2,(HL)"],
["CBD7","SET 2,A"],
["CBD8","SET 3,B"],
["CBD9","SET 3,C"],
["CBDA","SET 3,D"],
["CBDB","SET 3,E"],
["CBDC","SET 3,H"],
["CBDD","SET 3,L"],
["CBDE","SET 3,(HL)"],
["CBDF","SET 3,A"],
["CBE0","SET 4,B"],
["CBE1","SET 4,C"],
["CBE2","SET 4,D"],
["CBE3","SET 4,E"],
["CBE4","SET 4,H"],
["CBE5","SET 4,L"],
["CBE6","SET 4,(HL)"],
["CBE7","SET 4,A"],
["CBE8","SET 5,B"],
["CBE9","SET 5,C"],
["CBEA","SET 5,D"],
["CBEB","SET 5,E"],
["CBEC","SET 5,H"],
["CBED","SET 5,L"],
["CBEE","SET 5,(HL)"],
["CBEF","SET 5,A"],
["CBF0","SET 6,B"],
["CBF1","SET 6,C"],
["CBF2","SET 6,D"],
["CBF3","SET 6,E"],
["CBF4","SET 6,H"],
["CBF5","SET 6,L"],
["CBF6","SET 6,(HL)"],
["CBF7","SET 6,A"],
["CBF8","SET 7,B"],
["CBF9","SET 7,C"],
["CBFA","SET 7,D"],
["CBFB","SET 7,E"],
["CBFC","SET 7,H"],
["CBFD","SET 7,L"],
["CBFE","SET 7,(HL)"],
["CBFF","SET 7,A"],
["CC XXXX","CALL Z,NN"],
["CD XXXX","CALL NN"],
["CE xx","ADC A,n"],
["CF","RST 8"],
["D0","RET NC"],
["D1","POP DE"],
["D2 XXXX","JP NC,NN"],
["D3 xx","OUT (n),A"],
["D4 XXXX","CALL NC,NN"],
["D5","PUSH DE"],
["D6 xx","SUB n"],
["D7","RST 10"],
["D8","RET C"],
["D9","EXX"],
["DA XXXX","JP C,NN"],
["DB xx","IN A,(n)"],
["DC XXXX","CALL C,NN"],
["DD09","ADD IX,BC"],
["DD19","ADD IX,DE"],
["DD21 XXXX","LD IX,NN"],
["DD22 XXXX","LD (NN),IX"],
["DD23","INC IX"],
["DD29","ADD IX,IX"],
["DD2A XXXX","LD IX,(NN)"],
["DD2B","DEC IX"],
["DD34 zz","INC (IX+d)"],
["DD35 zz","DEC (IX+d)"],
["DD36 zz xx","LD (IX+d),n"],
["DD39","ADD IX,SP"],
["DD46 zz","LD B,(IX+d)"],
["DD4E zz","LD C,(IX+d)"],
["DD56 zz","LD D,(IX+d)"],
["DD5E zz","LD E,(IX+d)"],
["DD66 zz","LD H,(IX+d)"],
["DD6E zz","LD L,(IX+d)"],
["DD70 zz","LD (IX+d),B"],
["DD71 zz","LD (IX+d),C"],
["DD72 zz","LD (IX+d),D"],
["DD73 zz","LD (IX+d),E"],
["DD74 zz","LD (IX+d),H"],
["DD75 zz","LD (IX+d),L"],
["DD77 zz","LD (IX+d),A"],
["DD7E zz","LD A,(IX+d)"],
["DD86 zz","ADD A,(IX+d)"],
["DD8E zz","ADC A,(IX+d)"],
["DD96 zz","SUB (IX+d)"],
["DD9E zz","SBC A,(IX+d)"],
["DDA6 zz","AND (IX+d)"],
["DDAE zz","XOR (IX+d)"],
["DDB6 zz","OR (IX+d)"],
["DDBE zz","CP (IX+d)"],
["DDCB zz 06","RLC (IX+d)"],
["DDCB zz 0E","RRC (IX+d)"],
["DDCB zz 16","RL (IX+d)"],
["DDCB zz 1E","RR (IX+d)"],
["DDCB zz 26","SLA (IX+d)"],
["DDCB zz 2E","SRA (IX+d)"],
["DDCB zz 3E","SRL (IX+d)"],
["DDCB zz 46","BIT 0,(IX+d)"],
["DDCB zz 4E","BIT 1,(IX+d)"],
["DDCB zz 56","BIT 2,(IX+d)"],
["DDCB zz 5E","BIT 3,(IX+d)"],
["DDCB zz 66","BIT 4,(IX+d)"],
["DDCB zz 6E","BIT 5,(IX+d)"],
["DDCB zz 76","BIT 6,(IX+d)"],
["DDCB zz 7E","BIT 7,(IX+d)"],
["DDCB zz 86","RES 0,(IX+d)"],
["DDCB zz 8E","RES 1,(IX+d)"],
["DDCB zz 96","RES 2,(IX+d)"],
["DDCB zz 9E","RES 3,(IX+d)"],
["DDCB zz A6","RES 4,(IX+d)"],
["DDCB zz AE","RES 5,(IX+d)"],
["DDCB zz B6","RES 6,(IX+d)"],
["DDCB zz BE","RES 7,(IX+d)"],
["DDCB zz C6","SET 0,(IX+d)"],
["DDCB zz CE","SET 1,(IX+d)"],
["DDCB zz D6","SET 2,(IX+d)"],
["DDCB zz DE","SET 3,(IX+d)"],
["DDCB zz E6","SET 4,(IX+d)"],
["DDCB zz EE","SET 5,(IX+d)"],
["DDCB zz F6","SET 6,(IX+d)"],
["DDCB zz FE","SET 7,(IX+d)"],
["DDE1","POP IX"],
["DDE3","EX (SP),IX"],
["DDE5","PUSH IX"],
["DDE9","JP (IX)"],
["DDF9","LD SP,IX"],
["DE xx","SBC A,n"],
["DF","RST 18"],
["E0","RET PO"],
["E1","POP HL"],
["E2 XXXX","JP PO,NN"],
["E3","EX (SP),HL"],
["E4 XXXX","CALL PO,NN"],
["E5","PUSH HL"],
["E6 xx","AND n"],
["E7","RST 20"],
["E8","RET PE"],
["E9","JP (HL)"],
["EA XXXX","JP PE,NN"],
["EB","EX DE,HL"],
["EC XXXX","CALL PE,NN"],
["ED40","IN B,(C)"],
["ED41","OUT (C),B"],
["ED42","SBC HL,BC"],
["ED43 XXXX","LD (NN),BC"],
["ED44","NEG"],
["ED45","RETN"],
["ED46","IM 0"],
["ED47","LD I,A"],
["ED48","IN C,(C)"],
["ED49","OUT (C),C"],
["ED4A","ADC HL,BC"],
["ED4B XXXX","LD BC,(NN)"],
["ED4D","RETI"],
["ED4F","LD R,A"],
["ED50","IN D,(C)"],
["ED51","OUT (C),D"],
["ED52","SBC HL,DE"],
["ED53 XXXX","LD (NN),DE"],
["ED56","IM 1"],
["ED57","LD A,I"],
["ED58","IN E,(C)"],
["ED59","OUT (C),E"],
["ED5A","ADC HL,DE"],
["ED5B XXXX","LD DE,(NN)"],
["ED5E","IM 2"],
["ED5F","LD A,R"],
["ED60","IN H,(C)"],
["ED61","OUT (C),H"],
["ED62","SBC HL,HL"],
["ED67","RRD"],
["ED68","IN L,(C)"],
["ED69","OUT (C),L"],
["ED6A","ADC HL,HL"],
["ED6F","RLD"],
["ED72","SBC HL,SP"],
["ED73 XXXX","LD (NN),SP"],
["ED78","IN A,(C)"],
["ED79","OUT (C),A"],
["ED7A","ADC HL,SP"],
["ED7B XXXX","LD SP,(NN)"],
["EDA0","LDI"],
["EDA1","CPI"],
["EDA2","INI"],
["EDA3","OUTI"],
["EDA8","LDD"],
["EDA9","CPD"],
["EDAA","IND"],
["EDAB","OUTD"],
["EDB0","LDIR"],
["EDB1","CPIR"],
["EDB2","INIR"],
["EDB3","OTIR"],
["EDB8","LDDR"],
["EDB9","CPDR"],
["EDBA","INDR"],
["EDBB","OTDR"],
["EE xx","XOR n"],
["EF","RST 28"],
["F0","RET P"],
["F1","POP AF"],
["F2 XXXX","JP P,NN"],
["F3","DI"],
["F4 XXXX","CALL P,NN"],
["F5","PUSH AF"],
["F6 xx","OR n"],
["F7","RST 30"],
["F8","RET M"],
["F9","LD SP,HL"],
["FA XXXX","JP M,NN"],
["FB","EI"],
["FC XXXX","CALL M,NN"],
["FD09","ADD IY,BC"],
["FD19","ADD IY,DE"],
["FD21 XXXX","LD IY,NN"],
["FD22 XXXX","LD (NN),IY"],
["FD23","INC IY"],
["FD29","ADD IY,IY"],
["FD2A XXXX","LD IY,(NN)"],
["FD2B","DEC IY"],
["FD34 zz","INC (IY+d)"],
["FD35 zz","DEC (IY+d)"],
["FD36 zz xx","LD (IY+d),n"],
["FD39","ADD IY,SP"],
["FD46 zz","LD B,(IY+d)"],
["FD4E zz","LD C,(IY+d)"],
["FD56 zz","LD D,(IY+d)"],
["FD5E zz","LD E,(IY+d)"],
["FD66 zz","LD H,(IY+d)"],
["FD6E zz","LD L,(IY+d)"],
["FD70 zz","LD (IY+d),B"],
["FD71 zz","LD (IY+d),C"],
["FD72 zz","LD (IY+d),D"],
["FD73 zz","LD (IY+d),E"],
["FD74 zz","LD (IY+d),H"],
["FD75 zz","LD (IY+d),L"],
["FD77 zz","LD (IY+d),A"],
["FD7E zz","LD A,(IY+d)"],
["FD86 zz","ADD A,(IY+d)"],
["FD8E zz","ADC A,(IY+d)"],
["FD96 zz","SUB (IY+d)"],
["FD9E zz","SBC A,(IY+d)"],
["FDA6 zz","AND (IY+d)"],
["FDAE zz","XOR (IY+d)"],
["FDB6 zz","OR (IY+d)"],
["FDBE zz","CP (IY+d)"],
["FDCB zz 06","RLC (IY+d)"],
["FDCB zz 0E","RRC (IY+d)"],
["FDCB zz 16","RL (IY+d)"],
["FDCB zz 1E","RR (IY+d)"],
["FDCB zz 26","SLA (IY+d)"],
["FDCB zz 2E","SRA (IY+d)"],
["FDCB zz 3E","SRL (IY+d)"],
["FDCB zz 46","BIT 0,(IY+d)"],
["FDCB zz 4E","BIT 1,(IY+d)"],
["FDCB zz 56","BIT 2,(IY+d)"],
["FDCB zz 5E","BIT 3,(IY+d)"],
["FDCB zz 66","BIT 4,(IY+d)"],
["FDCB zz 6E","BIT 5,(IY+d)"],
["FDCB zz 76","BIT 6,(IY+d)"],
["FDCB zz 7E","BIT 7,(IY+d)"],
["FDCB zz 86","RES 0,(IY+d)"],
["FDCB zz 8E","RES 1,(IY+d)"],
["FDCB zz 96","RES 2,(IY+d)"],
["FDCB zz 9E","RES 3,(IY+d)"],
["FDCB zz A6","RES 4,(IY+d)"],
["FDCB zz AE","RES 5,(IY+d)"],
["FDCB zz B6","RES 6,(IY+d)"],
["FDCB zz BE","RES 7,(IY+d)"],
["FDCB zz C6","SET 0,(IY+d)"],
["FDCB zz CE","SET 1,(IY+d)"],
["FDCB zz D6","SET 2,(IY+d)"],
["FDCB zz DE","SET 3,(IY+d)"],
["FDCB zz E6","SET 4,(IY+d)"],
["FDCB zz EE","SET 5,(IY+d)"],
["FDCB zz F6","SET 6,(IY+d)"],
["FDCB zz FE","SET 7,(IY+d)"],
["FDE1","POP IY"],
["FDE3","EX (SP),IY"],
["FDE5","PUSH IY"],
["FDE9","JP (IY)"],
["FDF9","LD SP,IY"],
["FE xx","CP n"],
["FF","RST 38"]
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
            while g<=len(self.DB[0]) or self.Z80Pos==-1:
                g=g+1
                #print(g,self.Z80Pos)
                #print("TEST: self.DB[g][0], g index= ",g)
                if self.Z80WIP[1] in self.DB[g][0]:
                    #print("a potential match")
                    #not an exact match, could be multiple entries, now check if exact             

                    if self.Z80WIP[1]==self.DB[g][0]:
                        self.Z80Pos = g
                        #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemomic_db[self.Z80Pos][1]
                        self.Z80Assem_res[1]=z80_mnemomic_db[self.Z80Pos][1]
                        self.Z80Assem_res[2]=1
                        #[3]=""
                        #print("TEST: single byte Z80 commands only")
                        #exact match to single byte Z80 mnemomics

                    elif self.Z80WIP[1]+self.Z80WIP[2]==self.DB[g][0]:
                        self.Z80Pos = g #exact match to two byte only Z80 mnemomics
                        #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemomic_db[self.Z80Pos][1]
                        self.Z80Assem_res[1]=z80_mnemomic_db[self.Z80Pos][1]
                        self.Z80Assem_res[2]=2
                        #[3]=""
                        #print("TEST: two byte only Z80 commands")

                    elif self.Z80WIP[1]+" xx"==self.DB[g][0]:
                        self.Z80Pos = g
                        #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemomic_db[self.Z80Pos][1]
                        tmp_str=z80_mnemomic_db[self.Z80Pos][1]
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
                        #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemomic_db[self.Z80Pos][1]
                        tmp_str=z80_mnemomic_db[self.Z80Pos][1]
                        cnt=tmp_str.find("e")
                        self.Z80Assem_res[1]=tmp_str[:cnt]+"#"+self.Z80WIP[2]+tmp_str[cnt+1:]
                        self.Z80Assem_res[2]=2
                        self.Z80Assem_res[3]="yy"
                        #print("TEST: byte yy. Replace e in Assem with byte")
                        #exact match to
                        #10,18,20,28,30,38 yy

                    elif self.Z80WIP[1]+" XXXX"==self.DB[g][0]:
                        self.Z80Pos = g 
                        #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemomic_db[self.Z80Pos][1]
                        tmp_str=z80_mnemomic_db[self.Z80Pos][1]
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
                        #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemomic_db[self.Z80Pos][1]
                        tmp_str=z80_mnemomic_db[self.Z80Pos][1]
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
                        #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemomic_db[self.Z80Pos][1]
                        tmp_str=z80_mnemomic_db[self.Z80Pos][1]
                        cnt=tmp_str.find("d")
                        self.Z80Assem_res[1]=tmp_str[:cnt]+"#"+self.Z80WIP[3]+tmp_str[cnt+1:]
                        self.Z80Assem_res[2]=4
                        self.Z80Assem_res[3]="zz"
                        #print("DDCB or FDCB zz hex. Replace d in Assem with byte")
                        #exact match to
                        #DDCB zz hex and FDCB zz hex

                    elif self.Z80WIP[1]+self.Z80WIP[2]+" zz xx"==self.DB[g][0]:
                        self.Z80Pos = g 
                        #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemomic_db[self.Z80Pos][1]
                        tmp_str=z80_mnemomic_db[self.Z80Pos][1]
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
                        #self.Z80Assem_str=decval_to_hexstr(self.Addr)+"  "+z80_mnemomic_db[self.Z80Pos][1]
                        tmp_str=z80_mnemomic_db[self.Z80Pos][1]
                        cnt=tmp_str.find("NN")
                        #note 16-bit address stored LSB 1st then MSB next in memory
                        self.Z80Assem_res[1]=tmp_str[:cnt]+"#"+self.Z80WIP[4]+self.Z80WIP[3]+tmp_str[cnt+2:]
                        self.Z80Assem_res[2]=4
                        self.Z80Assem_res[3]="XXXX"
                        #exact match to
                        #print("TEST: DD21,DD22,ED43,ED4B,ED53,ED58,ED73,ED7B,FD21,FD22,FD2A XXXX. Replace NN in Assem with 16-bit addr")
                        #DD21,DD22,ED43,ED4B,ED53,ED58,ED73,ED7B,FD21,FD22,FD2A XXXX

                    #end if-elif
                #end if
            #end while

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
        for vv in range(self.fn_in_pos):
            skip_read=int.from_bytes(self.fn_in.read(1),"little") #skip

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
                # Num_00 can start with #/digits or label-like text (unresolved symbol names).
                num_sig_ok=(next_byte==35) or \
                           (48<=next_byte<=57) or (176<=next_byte<=185) or \
                           (65<=next_byte<=90) or (97<=next_byte<=122) or \
                           (193<=next_byte<=218) or (225<=next_byte<=250) 
                expected_pad=(next_byte in (0,1)) and (next2_byte in (2,3,4,5,8))
                if num_sig_ok==False:
                    if expected_pad==False:
                        pass
                    parse_num_token=False
                #print("Num_00")
            if token_id==0:
                if parse_num_token:
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
            elif token_id==8:
                #print("Comment_08")
                self.Comment_08()
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
        self.fn_in.close()
        

    def Num_00(self): 
        '''00 number (ie Number in characters. Note type either byte of word is after the ASCII number
        #<number>
        in assembler section the 2nd byte of any relative jump (e.g. JR n or DJNZ n) is either 0-127 if the jump is forward (down) in the code
        or 255 to 128 if backward (up) in the code (i.e bit 7 is set). The count is from the 2nd byte of the relative jump instruction
        either forward or backward. The text label (if one assigned) will replace the number in the disassembled code
        <0x00>
        <decimal or hexadecimal number represented as ASCII characters> The hexadecimal number in MTX BASIC is prefixed with a # (hash) symbol
        Example, LD A,#0D would be represented in the main code block as 3E 0D and at the end of the by code block by 00 23 30 C4, where 00 is the token for number definition, 23 is ASCII for #, 30 is ASCII for 0 and C4 is ASCII for D with bit 7 set (#80+#44=#C4) to indicate end of number
                after the number definition, there will be either 3 or 5 or 7 or etc bytes depending on how many times the number is referenced in the code block. If only 3 bytes (see below) then the number has been discarded/not referenced.
        <type> & <number of bytes afterwards to track number of times the number is referenced> 
                3 types:
                a) byte (0x01) Note: pad bytes = 0x00 and 0x00 when type is byte 
                <01 (for 1st instance and increases if more instances> <offset (LSB/MSB)> <2 pad bytes>
                so if only 1 instance of number #C3, you should get 0x01+count = 0x01 not 0x02
                b) word (0x00) &  n where n = 0x01 if one instance, 0x02 if two etc. Note: pad bytes = 0x00 when type is word
                <00> <number of instances of this word)> <offset of 1st instance (LSB/MSB)> <offset of 2nd instance (LSB/MSB)> <etc..><1 pad bytes>
                c) relative jump must be a label. The mtx inline editor throws an out of range error otherwise
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
            if tmp_read>31 and tmp_read<128: #labels must be ascii - might need to fine tune ao that only 0-9,a-z and A-Z
                tmp_dbf[2]=str(tmp_dbf[2])+chr(tmp_read)      
            elif tmp_read>127: # bit 7 set, so end of label
                tmp_dbf[2]=str(tmp_dbf[2])+chr((tmp_read-128))
                #next 3, 5 ,7 , 9, ext bytes or specify if a byte or a word or multiples of (ie number repeats throughout the code) and the memory offset
                #note if 3 zeroes after then reminent of a previous error and should be skipped.
                tmp_read=int.from_bytes(self.fn_in.read(1),"little")
                tmp_read1=int.from_bytes(self.fn_in.read(1),"little")
                tmp_read2=int.from_bytes(self.fn_in.read(1),"little")
                self.byte_read_cnt=self.byte_read_cnt+3
                if tmp_read==0: #potential word type
                    if tmp_read1==tmp_read2==0: #potential reminent error - IS THIS STILL VALID - YES
                        pass #if a reminent error, the number is skipped (i.e. not outputed)
                        break #end while loop
                    elif tmp_read1>0: # word type &/or potential multiple entries
                        #print("TEST: WORD type")
                        tmp_lsb=tmp_read2 #read memory displacement from start
                        tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                        tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
                        self.byte_read_cnt=self.byte_read_cnt+1
                        self.info_dbf.append(tmp_dbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
                        self.row_cnt=self.row_cnt+1
                        if (tmp_read1-1)!=0: #guard
                            for vv in range(tmp_read1-1): #already have the first addr (see above)
                                tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
                                tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                                tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
                                self.byte_read_cnt=self.byte_read_cnt+2
                                self.info_dbf.append(tmp_dbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
                                #print("TEST: Labe1_00 decoded - word type, 1 or more reference(s)")
                                #print("TEST: decode = ",self.info_dbf[self.row_cnt])
                                self.row_cnt=self.row_cnt+1
                            #end for
                        #end if
                        #hybrid number metadata support:
                        #word references can be followed by relative-jump references.
                        probe_pos=self.fn_in.tell()
                        probe_rel_cnt=int.from_bytes(self.fn_in.read(1),"little")
                        self.byte_read_cnt=self.byte_read_cnt+1
                        bytes_left=(self.fn_in_pos+self.extra_cnt)-self.fn_in.tell()
                        if probe_rel_cnt>0 and probe_rel_cnt<=32 and bytes_left>=probe_rel_cnt*2:
                            for rr in range(probe_rel_cnt):
                                tmp_lsb=int.from_bytes(self.fn_in.read(1),"little")
                                tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                                tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
                                self.byte_read_cnt=self.byte_read_cnt+2
                                self.info_dbf.append(tmp_dbf[:])
                                self.row_cnt=self.row_cnt+1
                        else:
                            self.fn_in.seek(probe_pos)
                            self.byte_read_cnt=self.byte_read_cnt-1
                        #optional pad byte (0x00) for word type only
                        pad_pos=self.fn_in.tell()
                        tmp_read=int.from_bytes(self.fn_in.read(1),"little")
                        self.byte_read_cnt=self.byte_read_cnt+1
                        if tmp_read==0:
                            pass
                        else:
                            self.fn_in.seek(pad_pos)
                            self.byte_read_cnt=self.byte_read_cnt-1
                        break #end while loop
                    elif tmp_read2>0:
                        #guard for 00 00 nn layout: consume nn reference offsets then optional pad
                        for vv in range(tmp_read2):
                            tmp_lsb=int.from_bytes(self.fn_in.read(1),"little")
                            tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                            tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
                            self.byte_read_cnt=self.byte_read_cnt+2
                            self.info_dbf.append(tmp_dbf[:])
                            self.row_cnt=self.row_cnt+1
                        pad_pos=self.fn_in.tell()
                        tmp_pad=int.from_bytes(self.fn_in.read(1),"little")
                        self.byte_read_cnt=self.byte_read_cnt+1
                        if tmp_pad==0:
                            pass
                        else:
                            self.fn_in.seek(pad_pos)
                            self.byte_read_cnt=self.byte_read_cnt-1
                        break #end while loop
                    else:
                        #unknown 00 xx yy layout; stop this record to avoid stream desync
                        break #end while loop
                    #end if-elif
                elif tmp_read>0: #byte type single entry 
                    pass
                    #already read the next 2 bytes
                    tmp_dbf[1]=(tmp_read2*256)+tmp_read1
                    self.info_dbf.append(tmp_dbf[:])
                    self.row_cnt=self.row_cnt+1
                    if (tmp_read-1)!=0:
                        for vv in range(tmp_read-1):
                            tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
                            tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                            tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
                            self.byte_read_cnt=self.byte_read_cnt+2
                            self.info_dbf.append(tmp_dbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
                            #print("TEST: Labe1_00 decoded - byte type 1 or more reference(s)")
                            #print("TEST: decode = ",self.info_dbf[self.row_cnt])
                            self.row_cnt=self.row_cnt+1
                        #end for
                    #end if
                    #mixed number metadata support:
                    #a byte-reference block can be followed by word-reference count + offsets.
                    mixed_tail=False
                    probe_pos=self.fn_in.tell()
                    probe_word_cnt=int.from_bytes(self.fn_in.read(1),"little")
                    self.byte_read_cnt=self.byte_read_cnt+1
                    if probe_word_cnt>0:
                        mixed_tail=True
                        for ww in range(probe_word_cnt):
                            tmp_lsb=int.from_bytes(self.fn_in.read(1),"little")
                            tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                            tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
                            self.byte_read_cnt=self.byte_read_cnt+2
                            self.info_dbf.append(tmp_dbf[:])
                            self.row_cnt=self.row_cnt+1
                        #optional single pad byte after mixed byte+word references
                        pad_pos=self.fn_in.tell()
                        tmp_pad=int.from_bytes(self.fn_in.read(1),"little")
                        self.byte_read_cnt=self.byte_read_cnt+1
                        if tmp_pad!=0:
                            self.fn_in.seek(pad_pos)
                            self.byte_read_cnt=self.byte_read_cnt-1
                    else:
                        self.fn_in.seek(probe_pos)
                        self.byte_read_cnt=self.byte_read_cnt-1
                    #optional pad bytes (0x00,0x00) for byte type only
                    if mixed_tail==False:
                        pad_pos=self.fn_in.tell()
                        tmp_pad0=int.from_bytes(self.fn_in.read(1),"little")
                        tmp_pad1=int.from_bytes(self.fn_in.read(1),"little")
                        self.byte_read_cnt=self.byte_read_cnt+2
                        if tmp_pad0==0 and tmp_pad1==0:
                            pass
                        else:
                            self.fn_in.seek(pad_pos)
                            self.byte_read_cnt=self.byte_read_cnt-2
                    break #end while loop
                else:
                    #unknown type byte after number; stop this record to avoid stream desync
                    break #end while loop
                #end if-elif
                break #safety: never continue scanning chars after terminator-byte metadata processing
            #end if-elif
        #end while
        
        return
    
    def U_01(self):
        #unknown
        #tmp_dbf=[dis_code_byte,offset,"text"]
        tmp_dbf=[1,0,""]
        pass
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
        while True:
            #get "label:"
            tmp_read=int.from_bytes(self.fn_in.read(1),"little")
            self.byte_read_cnt=self.byte_read_cnt+1
            if tmp_read>31 and tmp_read<128: #labels must be ascii - might need to fine tune ao that only 0-9,a-z and A-Z
                tmp_dbf[2]=str(tmp_dbf[2])+chr(tmp_read)
            elif tmp_read>127: # bit 7 set, so end of label
                tmp_dbf[2]=str(tmp_dbf[2])+chr((tmp_read-128))+":" #add colon to indicate label.
                self.info_dbf.append(tmp_dbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
                pass
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
                elif tmp_read==tmp_read1==0 and tmp_read2>0: #relative jump reference only. Note this will finish on an odd number count meaning end of label list.
                    if tmp_read2>0: #guard
                        for vv in range(tmp_read2): #number of instances of references to relative jump references
                            pass
                            tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
                            tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                            tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
                            self.byte_read_cnt=self.byte_read_cnt+2
                            self.info_dbf.append(tmp_dbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
                            #print("TEST: Labe1_02 decoded - relative jump reference 1st")
                            #print("TEST: decode = ",self.info_dbf[self.row_cnt])
                            self.row_cnt=self.row_cnt+1
                        #end for
                    #no pad byte required for relative jumps
                    break #end while loop
                elif tmp_read==0 and tmp_read1>0: #word address reference. Note this will finish on an even number. If the next odd number is not 00 then some relative adresses to deal with
                    pass
                    #already have the 1st byte
                    tmp_lsb=tmp_read2
                    tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                    tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
                    self.byte_read_cnt=self.byte_read_cnt+1
                    self.info_dbf.append(tmp_dbf[:])
                    self.row_cnt=self.row_cnt+1
                    #any for word address references
                    if (tmp_read1-1)!=0:
                        for vv in range(tmp_read1-1):
                            pass
                            tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
                            tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                            tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
                            self.byte_read_cnt=self.byte_read_cnt+2
                            self.info_dbf.append(tmp_dbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
                            #print("TEST: Labe1_02 decoded - word address reference")
                            #print("TEST: decode = ",self.info_dbf[self.row_cnt])
                            self.row_cnt=self.row_cnt+1
                        #end for
                    #end if
                    #optional pad byte (0x00) for word type only
                    pad_pos=self.fn_in.tell()
                    tmp_read=int.from_bytes(self.fn_in.read(1),"little")
                    self.byte_read_cnt=self.byte_read_cnt+1
                    if tmp_read==0:
                        pass
                    else:
                        self.fn_in.seek(pad_pos)
                        self.byte_read_cnt=self.byte_read_cnt-1
                    break #end while loop
                elif tmp_read>0: #byte type single entry 
                    pass
                    #already read the next 2 bytes after this
                    tmp_dbf[1]=(tmp_read2*256)+tmp_read1
                    self.info_dbf.append(tmp_dbf[:])
                    self.row_cnt=self.row_cnt+1
                    if (tmp_read-1)!=0:
                        for vv in range(tmp_read-1):
                            tmp_lsb=int.from_bytes(self.fn_in.read(1),"little") #read memory displacement from start
                            tmp_msb=int.from_bytes(self.fn_in.read(1),"little")
                            tmp_dbf[1]=(tmp_msb*256)+tmp_lsb
                            self.byte_read_cnt=self.byte_read_cnt+2
                            self.info_dbf.append(tmp_dbf[:]) #the [:] is to prevent the last item in the list overwriting all previous additions!
                            #print("TEST: Labe1_00 decoded - byte type 1 or more reference(s)")
                            #print("TEST: decode = ",self.info_dbf[self.row_cnt])
                            self.row_cnt=self.row_cnt+1
                        #end for
                    #end if
                    #optional pad bytes (0x00,0x00) for byte type only
                    pad_pos=self.fn_in.tell()
                    tmp_pad0=int.from_bytes(self.fn_in.read(1),"little")
                    tmp_pad1=int.from_bytes(self.fn_in.read(1),"little")
                    self.byte_read_cnt=self.byte_read_cnt+2
                    if tmp_pad0==0 and tmp_pad1==0:
                        pass
                    else:
                        self.fn_in.seek(pad_pos)
                        self.byte_read_cnt=self.byte_read_cnt-2
                    break #end while loop
                break #safety: never continue scanning chars after terminator-byte metadata processing
            #end if-elif
        #end while
        
        return
        
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
        <offset (2bytes)><byte count><length><string>
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
        tmp_dbf[3]=int.from_bytes(self.fn_in.read(1),"little") #byte count
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
                tmp_dbf[2]=str(tmp_dbf[2])+chr((tmp_read-128)) 
                break #end while loop
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


        return #return to be defined



def decval_to_hexstr(dec_val=16384): #positive values only, default at hex=4000

    ''' Converts a 8 or 16-bit decimal number to its hexadecimal equivalent as a string
        parameters passed:
        1. integer : dec_val (0 to 65535)
        parameters returned
        a) string : hex_str
    '''
    dec_val=int(dec_val) 
    if dec_val>=0 and dec_val<256:
        hex_str=str('%02X' % dec_val)
    elif dec_val>=256 and dec_val<2**16:#16-bit
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


def convert_mtx_to_txt():

    ''' Converts a MTX BASIC program to a text file
        User selects the .mtx file to convert
        User selects the .txt file to write out
        If MTX500 then the program is loaded at address 32768 (0x8000) (not currently tested for - future option)
        If MTX512 then the program is loaded at address 16384 (0x4000) (default)
        Managing the memory position as the program is converted is critical to ensuring the assembly code is assigned to the correct address.

        The conversion is then carried out in 5 discrete steps
        1. Skips the filename and system variables (option to assign these)
        2. BASIC program
        3. Z80 assembly language
        4. MTX specific assembly language extensions
        5. NODDY text language

        Note that items 2 and 3 are embedded in item 1. Whereas item 4 is after the main BASIC program
    '''
    
    def BASIC_loop():
        global GV_fname_r,GV_fname_w,GC_extn_r,GC_extn_w,GV_MTXEOL,GV_results,GV_nonprintable
        #additional global
        global len_BASIC, hdr_cnt,fn_r,fn_w,LineLen,LineNum,noddy_flag,i,mtxlist_str
        global MemPos,CodeLen,CodeInc,CodeEnd,WIP_code,RES_code,GV_extra_info,VSC_flag,MTX_prog_flag,PlodNameList
        #i=hdr_cnt needed for ASSEM_loop(), see line 1880

        #while i<hdr_cnt+len_BASIC:
        plodToken=168 #need to find this and add name (e.g. PLOD "PROG1") to plodNameList (e.g. plodNameList.append("PROG1"))
        i=0
        while i<len_BASIC:
            #ord converts a char to a number. This crashed!
            #GV_results[i]=int(fn+r.read(i),base=16)#issue with literals
            #GV_results[i]=int.from_bytes(fn_r.read(),"little") #doesn't work as intended
            #GV_results[i]=int(fn_r.read(i)[2:3],base=16)#issue with b''
            #GV_results[i]=fn_r.read() #reads as a single large text field
            #GV_results[i]=fn_r.read(1) #reads 1 byte at a time
            GV_results[0]=int.from_bytes(fn_r.read(1),"little") #read 1 byte at a time and convert to decimal

            if GV_results[0]==255: #this is reserved for end of BASIC listing. FF is reserved
                #save_read_contents=GV_results[0] #not sure this is needed
                i=i+1
                break #exit while loop
            #end if

            GV_results[1]=int.from_bytes(fn_r.read(1),"little")
            GV_results[2]=int.from_bytes(fn_r.read(1),"little")
            GV_results[3]=int.from_bytes(fn_r.read(1),"little")
            LineLen=(GV_results[1]*256)+GV_results[0]
            LineNum=(GV_results[3]*256)+GV_results[2]
            #print("TEST: BASIC line length= ",LineLen," line number = ",LineNum," and while loop count= ",i)
            mtxlist_str=str(LineNum)+" " #assign line number
            tmp_MemPos=MemPos #because assembly code is essentially a line in BASIC, to avoid double counting, will need to hold a temporary copy of MemPos, see later to keep the code simple! 
            #for j in range(4,LineLen): #don't count the 1st 4 bytes (0,1,2,3)
            j=4
            while j<LineLen: #changed to a while loop to address the extra read counts t PLOD handling
                GV_results[j]=int.from_bytes(fn_r.read(1),"little") #read BASIC line

                if GV_results[j]==255: #end of basic line
                    RES_code=RES_code+mtxlist_str+"\n"
                    fn_w.write(mtxlist_str)
                    fn_w.write('\n') #skip 255 as this will be replaced by a text EOL
                    #print("TEST: write line: ",mtxlist_str)
                    MemPos=tmp_MemPos+LineLen #to keep the code simple and to avoid double count due to ASSEM code section, use the tmp_MemPos
                    #print ("TEST: BASIC Memory position (overrides that of code) =", MemPos)
                    i=i+j+1 #make sure the counter is updated, ready at the next read item
                    GV_results=[0]*1280 #don't use LineLen as this shortens the code and can cause issues with longer line lengths
                    break

                elif GV_results[j]>0 and GV_results[j]<=26: #01 to 26
                    #special case associated with $. Note variable name text is always capitalised
                    #the 1st character in a string name is between 01 and 26. Rest of the variable string name is typical ascii
                    idx=GV_results[j]+64
                    #print("TEST: idx=",idx)
                    #print("TEST: char=",mtx_token_db[idx][1])
                    mtxlist_str=mtxlist_str+mtx_token_db[idx][1]

                elif GV_results[j]>GV_nonprintable and GV_results[j]<=127: #ascii printable range-1 (32 to 127)
                    #mtxlist_str=mtxlist_str+chr(GV_results[j])
                    mtxlist_str=mtxlist_str+mtx_token_db[GV_results[j]][1]
                    #special case to resolve. if a variable string is used $, the char(s) preceding start at 01=A, 02=B 03=C, 04=D

                elif GV_results[j]==168: #PLOD "<progname>"" detected
                    mtxlist_str=mtxlist_str+mtx_token_db[GV_results[j]][1]+" " #add a space after MTX keyword
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
                    
                elif GV_results[j]==194: #assembly lastkip_read=int.from_bytes(fn_r.read(1),"little") #skipnguage - still to be coded                  
                    #print("TEST: Assembly code")
                    GV_results[j+1]=int.from_bytes(fn_r.read(1),"little") #read codelength
                    GV_results[j+2]=int.from_bytes(fn_r.read(1),"little")
                    CodeLen=(GV_results[j+2]*256)+GV_results[j+1]
                    CodeInc=j+3 #CODE token + 2-byte code length
                    MemPos=tmp_MemPos+CodeInc #adjusts for the bytes so far in specifying line and code lengths
                    #get the assembler specific info into a new list
                    #anchor directive parsing from current stream position to avoid
                    #index arithmetic drift on CODE lines.
                    code_data_pos=fn_r.tell() #first opcode byte position in file
                    directive_start_pos=code_data_pos+CodeLen
                    extra_len=max(0,LineLen-CodeLen-CodeInc)
                    GV_extra_info=get_mtx_directives_info(GV_fname_r,directive_start_pos,extra_len).info_dbf
                    #print("TEST: Code Length= ",CodeLen," Start Memory position= ", MemPos," End Memory position= ",MemPos+CodeLen-1)
                    ASSEM_loop()
                    #ASSEM_skip(LineLen-(CodeInc+1))
                    i=i+LineLen+1 #make sure the counter is updated, ready at the next read item
                    GV_results=[0]*1280
                    #print("TEST: Code BASIC line length, ",LineLen, " read counter accumulator, i= ",i)
                    break

                elif GV_results[j] in (128, 129, 134, 137, 143, 163, 165, 175, 180, 184, 186): #no space after standalone commands like CLS. Avoids exceeding 158 char limit per line
                    #no space after return in case ut is followed by else would lead to double spacing and cause an issue with VSC mtxbasic extension
                    #no space after DATA as this is added by MTX BASIC interpreter
                    mtxlist_str=mtxlist_str+mtx_token_db[GV_results[j]][1]

                elif GV_results[j] in (195, 198, 199, 200, 218, 219, 220): #needs a space before and after the command
                    mtxlist_str=mtxlist_str+" "+mtx_token_db[GV_results[j]][1]+" "

                elif GV_results[j] in range(206,218): #unary symbol like - or +
                    mtxlist_str=mtxlist_str+mtx_token_db[GV_results[j]][1] #no spaces after a symbol

                elif GV_results[j] in range(221,254): #Keywords with () like int()
                    if GV_results[j]==238: #special case as need a space between LEN and ()
                        mtxlist_str=mtxlist_str+mtx_token_db[GV_results[j]][1]+" "
                    else:
                        mtxlist_str=mtxlist_str+mtx_token_db[GV_results[j]][1] #no space after

                elif GV_results[j]>127 and GV_results[j]<255:
                    #look up mtx token
                    #j==4 is the first token position in a BASIC line;
                    #GV_results[j-1] is then header byte 3 (line number high byte), not prior source text.
                    #Without this guard, line numbers with high byte 0x28 "(" suppress spacing after the first token.
                    if j>4 and mtx_token_db[GV_results[j-1]][1]=="(": #no spaces before or after keyword
                        mtxlist_str=mtxlist_str+mtx_token_db[GV_results[j]][1]
                    else:
                        mtxlist_str=mtxlist_str+mtx_token_db[GV_results[j]][1]+" " #add a space after MTX keyword
                    #end if-elif-else

                elif GV_results[j]>26 and GV_results[j]<=GV_nonprintable or GV_results[j]==0: #0 or 27 to 31
                    #print("TEST: not coded for yet, ascii value ",GV_results[j])  #still to detrmine what this is for but skip for now
                    pass
                else:
                    print("out of range")
                    break
                #end if-elif-else
                j=j+1 
            #end inner while


        #end while loop

        #print("TEST: while loop count at end of BASIC",i)

        return RES_code , PlodNameList #from BASIC_loop

    def ASSEM_skip(Lcode):
        #skip assembly code
        global GV_fname_r,GV_fname_w,GC_extn_r,GC_extn_w,GV_MTXEOL,GV_results,GV_nonprintable
        #additional global
        global len_BASIC, hdr_cnt,fn_r,fn_w,LineLen,LineNum,noddy_flag,i,mtxlist_str
        global MemPos,CodeLen,CodeInc,CodeEnd,WIP_code,RES_code,GV_extra_info
        #move the read pointer on to the end of the code
        skip_read=0
        assem_cnt=0

        while assem_cnt <=Lcode: #1st 5 bytes already read
            skip_read=int.from_bytes(fn_r.read(1),"little") #skip
            assem_cnt=assem_cnt+1
        #end while
        MemPos=MemPos+assem_cnt #no +1 as assem_cnt=assem_cnt+1 in the while loop
        #print("TEST: skip assem_cnt= ",assem_cnt," and next MemPos = ",MemPos)
        return #from ASSEM_skip

    def ASSEM_loop():
        #this is embedded within the BASIC_loop processing
        global GV_fname_r,GV_fname_w,GC_extn_r,GC_extn_w,GV_MTXEOL,GV_results,GV_nonprintable
        #additional global
        global len_BASIC, hdr_cnt,fn_r,fn_w,LineLen,LineNum,noddy_flag,i,mtxlist_str
        global MemPos,CodeLen,CodeInc,CodeEnd,WIP_code,RES_code,GV_extra_info,VSC_flag,MTX_prog_flag,PlodNameList
        #part 1 to disassembly the machine code (bytes) into Z80 assembly language
        #print("TEST: not coded for yet, assembly language. Starting memory position is ",MemPos)
        mtxlist_str=mtxlist_str+mtx_token_db[194][1]
        RES_code=RES_code+"\n"
        #print("TEST: write line: ",mtxlist_str)
        fn_w.write(mtxlist_str) #write linenumber and CODE
        fn_w.write('\n') #new line
        assem_cnt=0
        dis_size=0
        reset_WIP_code=[0,"","","",""]
        
        Blocks=divmod(CodeLen-assem_cnt,4)
        WIP_code=reset_WIP_code[:]

        if Blocks[0]>0:
            WIP_code[0]=4
        else:
            WIP_code[0]=Blocks[1]
        #end if-else

        for v in range(1,WIP_code[0]+1):
            WIP_code[v]=hexval_to_hexstr(int.from_bytes(fn_r.read(1),"little"))
        #end for

        #print("TEST: WIP_code at start = ",WIP_code)
        assem_cnt=assem_cnt # include the initial byte reads above
        offset_st_addr=MemPos
        symbols=[] #symbols list at end of assembly code, label and address
        while assem_cnt < CodeLen:
            num_ref=""
            label_st=""
            label_ref=""
            comment_st=""
            tmp_disassem_str=""
            tmp_disassem_list=[0,"",0,""]
            skip_bytes=0
            tmp_sym=[0,""] #label and address tmp list
            #add a new bit to capture DB, DW and DS code to prevent errorenous z80_disassembly due to these non-z80 instructions
            for gg in range(len(GV_extra_info)):
                if MemPos==GV_extra_info[gg][1]+offset_st_addr: #more than 1 condition may apply so use multiple ifs rather than if-elif
                    #print("TEST: MemPos= ",MemPos," GV_extra_info[gg][1]+offset_st_addr",GV_extra_info[gg][1]+offset_st_addr)
                    if GV_extra_info[gg][0]==0: #number but will not be at MemPos but between MemPos+dis_size
                        pass #skip

                    if GV_extra_info[gg][0]==2 and GV_extra_info[gg][2]!="" and GV_extra_info[gg][2].endswith(":"):
                        #type-2 at current MemPos is the definition label
                        label_st=GV_extra_info[gg][2]
                        tmp_sym[0]=label_st
                        tmp_sym[1]=decval_to_hexstr(MemPos) #convert to hexadecimal address
                        symbols.append(tmp_sym[:])

                    if GV_extra_info[gg][0]==3: #DB
                        #print("TEST: DB")
                        skip_bytes=GV_extra_info[gg][3]
                        tmp_disassem_str=GV_extra_info[gg][2]

                    if GV_extra_info[gg][0]==4: #DW
                        #print("TEST: DW")
                        skip_bytes=GV_extra_info[gg][3]
                        tmp_disassem_str=GV_extra_info[gg][2]

                    if GV_extra_info[gg][0]==5: #DS
                        #print("TEST: DS")
                        skip_bytes=GV_extra_info[gg][3]
                        tmp_disassem_str=GV_extra_info[gg][2]

                    if GV_extra_info[gg][0]==8: #comment
                        #print("TEST: comment")
                        comment_st=GV_extra_info[gg][2]

                    #break #exit for loop if match
                    #end if-ifs
                else:
                    pass #skipped
                #end if-else
            #end for

            if skip_bytes>0:
                #print("TEST: skip bytes>0 section , = ",skip_bytes)
                RES_code=RES_code+decval_to_hexstr(MemPos)+" "+label_st+tmp_disassem_str+comment_st+"\n"
                fn_w.write("\t "+decval_to_hexstr(MemPos)+" "+label_st+tmp_disassem_str+comment_st) #add an indent (tab + 1 space)
                fn_w.write('\n')
                if skip_bytes<4:
                    dis_size=skip_bytes
                else: #replace all 4 bytes but remember to exclude the 4 bytes already in play
                    dis_size=4
                    for st in range(skip_bytes-dis_size): #remember need to discount the 4 bytes in play
                        skip_read=int.from_bytes(fn_r.read(1),"little") #skip read
                        #print("TEST: bytes to skip = ",skip_read)
                    #end for
                #end if-else
                new_MemPos=MemPos+skip_bytes #this might be an error as its the bytes
                #print("next memory address (MemPos+skip_bytes) = ",new_MemPos)
                assem_cnt=assem_cnt+skip_bytes
                #print("TEST: disaasembled special as = ",decval_to_hexstr(MemPos)+" "+label_st+tmp_disassem_str+comment_st)
            else:
                #print("TEST: Normal disassembly")
                tmp_disassem_list=Z80_Disassemble(z80_mnemomic_db,WIP_code,MemPos).Z80Assem_res
                tmp_disassem_str=tmp_disassem_list[1]
                dis_size=tmp_disassem_list[2]
                new_MemPos=MemPos+dis_size
                assem_cnt=assem_cnt+dis_size
                #now swap any number to a reference label - code to be inserted here
                if tmp_disassem_list[3]!="": #a Z80 instruction with data (xx, yy, zz, XXXX)
                    for gg in range(len(GV_extra_info)): #scan through finding reference labels
                        tmp_MemPos=GV_extra_info[gg][1]+offset_st_addr
                        #Most operands are tracked at the operand byte, but MTX can store JR/DJNZ
                        #label references at instruction start; include MemPos for yy only.
                        in_operand_window=(tmp_MemPos>MemPos and tmp_MemPos<new_MemPos)
                        if tmp_disassem_list[3]=="yy" and tmp_MemPos==MemPos:
                            in_operand_window=True
                        if in_operand_window:
                            if GV_extra_info[gg][0]==0: #number reference
                                num_ref=GV_extra_info[gg][2]
                                cnt=tmp_disassem_str.find("#")
                                #only override if decoded number text is printable; otherwise keep opcode-derived value
                                if cnt!=-1 and isinstance(num_ref,str) and num_ref!="" and all(31<ord(ch)<127 for ch in num_ref):
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
                            elif GV_extra_info[gg][0]==2 and GV_extra_info[gg][2]!="":
                                if str(GV_extra_info[gg][2]).endswith(":"):
                                    continue
                                #type-2 between MemPos and new_MemPos is a reference label
                                lab_ref=GV_extra_info[gg][2].rstrip(":")
                                cnt=tmp_disassem_str.find("#")
                                if "xx" in tmp_disassem_list[3]: #"xx" or "zz xx" the latter might not be valid in MTX assembler
                                    #print("TEST: Reference label - #xx replaced")
                                    tmp_disassem_str=tmp_disassem_str[:cnt]+lab_ref+tmp_disassem_str[cnt+3:]
                                elif "zz" in tmp_disassem_list[3]: #"zz" or "zz xx" the latter might not be valid in MTX assembler
                                    #print("TEST: Reference label - #zz replaced")
                                    tmp_disassem_str=tmp_disassem_str[:cnt]+lab_ref+tmp_disassem_str[cnt+3:]
                                elif tmp_disassem_list[3]=="yy":
                                    #print("TEST: Reference label - #yy replaced")
                                    tmp_disassem_str=tmp_disassem_str[:cnt]+lab_ref+tmp_disassem_str[cnt+3:]
                                elif tmp_disassem_list[3]=="XXXX":
                                    #print("TEST: Reference label - #XXXX replaced")
                                    tmp_disassem_str=tmp_disassem_str[:cnt]+lab_ref+tmp_disassem_str[cnt+5:]
                                else:
                                    #print("TEST: No reference label")
                                    pass
                                #end if-elif-else
                            #end if
                        #end if
                    #end for
                    #For relative jumps, MTX inline assembler expects label or absolute address form.
                    #If still unresolved as displacement (#yy), prefer a known target label,
                    #otherwise convert to absolute target address.
                    if tmp_disassem_list[3]=="yy":
                        cnt=tmp_disassem_str.find("#")
                        if cnt!=-1 and len(tmp_disassem_str)>=cnt+3:
                            try:
                                disp_txt=tmp_disassem_str[cnt+1:cnt+3]
                                if len(disp_txt)==2 and all(ch in "0123456789ABCDEFabcdef" for ch in disp_txt):
                                    disp=int(disp_txt,16)
                                    if disp>127:
                                        disp=disp-256
                                    tgt_addr=new_MemPos+disp
                                    tgt_label=""
                                    for rr in range(len(GV_extra_info)):
                                        if GV_extra_info[rr][0]==2 and str(GV_extra_info[rr][2]).endswith(":"):
                                            lbl_addr=GV_extra_info[rr][1]+offset_st_addr
                                            if lbl_addr==tgt_addr:
                                                tgt_label=GV_extra_info[rr][2].rstrip(":")
                                                break
                                    if tgt_label!="":
                                        tmp_disassem_str=tmp_disassem_str[:cnt]+tgt_label+tmp_disassem_str[cnt+3:]
                                    else:
                                        tmp_disassem_str=tmp_disassem_str[:cnt+1]+decval_to_hexstr(tgt_addr)+tmp_disassem_str[cnt+3:]
                            except ValueError:
                                pass
                #end if
                RES_code=RES_code+decval_to_hexstr(MemPos)+label_st+tmp_disassem_str+comment_st+"\n"
                fn_w.write("\t "+decval_to_hexstr(MemPos)+" "+label_st+tmp_disassem_str+comment_st) #add an indent (tab + 1 space)
                fn_w.write('\n') 
                #print("TEST: Z80 disaasembled as = ",decval_to_hexstr(MemPos)+" "+label_st+tmp_disassem_str+comment_st)
            #end if-else
            
            MemPos=new_MemPos
            Blocks=divmod(CodeLen-assem_cnt,4) # blocks remaining after skipping or disassembly
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
                        WIP_code[st]=hexval_to_hexstr(int.from_bytes(fn_r.read(1),"little")) #fill with 4 new bytes
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
                        WIP_code[2]=hexval_to_hexstr(int.from_bytes(fn_r.read(1),"little"))
                        WIP_code[3]=hexval_to_hexstr(int.from_bytes(fn_r.read(1),"little"))
                        WIP_code[4]=hexval_to_hexstr(int.from_bytes(fn_r.read(1),"little"))
                        #print("TEST: dis_size=3, WIP_code = ",WIP_code)
                    elif dis_size==2:
                        WIP_code[3]=hexval_to_hexstr(int.from_bytes(fn_r.read(1),"little"))
                        WIP_code[4]=hexval_to_hexstr(int.from_bytes(fn_r.read(1),"little"))
                        #print("TEST: dis_size=2, WIP_code = ",WIP_code)
                    else: #dis_size==1:
                        WIP_code[4]=hexval_to_hexstr(int.from_bytes(fn_r.read(1),"little"))
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
                        WIP_code[st]=hexval_to_hexstr(int.from_bytes(fn_r.read(1),"little"))
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
        if VSC_flag==False : #not VS code compatible.
            RES_code=RES_code+"\n"+"SYMBOLS:"+"\n"
            fn_w.write('\n')
            fn_w.write("SYMBOLS:")
            fn_w.write('\n')
            for vv in range(len(symbols)):
                RES_code=RES_code+symbols[vv][0]+str(symbols[vv][1])
                fn_w.write("\t "+symbols[vv][0]+str(symbols[vv][1])) #indent symbols as per other CODE indents
                fn_w.write('\n')
            fn_w.write('\n')
            #end for

        #part 2 to resolve the assembly extras like DS, DB, jup and call names etc
        #initially will skip the MTX assembly extra information
        ASSEM_skip(LineLen-(CodeLen+1)-CodeInc) #to be updated once part#1 is coded. currently based on codelen&extralen

        return RES_code #from ASSEM_loop

    def NODDY_loop():
        #stored after BASIC code
        global GV_fname_r,GV_fname_w,GC_extn_r,GC_extn_w,GV_MTXEOL,GV_results,GV_nonprintable
        #additional global
        global len_BASIC, hdr_cnt,fn_r,fn_w,LineLen,LineNum,noddy_flag,i,mtxlist_str
        global MemPos,CodeLen,CodeInc,CodeEnd,WIP_code,RES_code,VSC_flag,MTX_prog_flag,PlodNameList
        noddyCmds={'*ADVANCE', '*BRANCH', '*DISPLAY','*ENTER', '*GOTO', '*IF', '*LIST', '*OFF', '*PAUSE', '*RETURN', '*STACK'}
        noddyCmdsShort={'*A', '*B',  '*D', '*E', '*G', '*I', '*L', '*O', '*P', '*R', '*S'}
        nodProgTitle="Program "
        nodTextTitle="Text "
        nodPage=[]
        
        #fn_w.write('\n') #LF between BASIC and NODDY
        #add a check to see if REM NODDY, if NOT and 
        
        while i<fn_r_size+1 and noddy_flag is True: #Noddy test section
            #length of noddy code
            GV_results=[0]*1280 # reset array
            GV_results[0]=int.from_bytes(fn_r.read(1),"little")
            GV_results[1]=int.from_bytes(fn_r.read(1),"little")
            LineLen=(GV_results[1]*256)+GV_results[0]
            #print("TEST: Length of Noddy text/prog ",LineLen)
            i=i+2
            #title of Noddy page maximum of 33 characters whith the last character with bit 7 high
            mtxlist_str=""
            j=2

            while j<=LineLen: 
                GV_results[j]=int.from_bytes(fn_r.read(1),"little")

                #title is recommended to be alphanumeric (UPPERCASE (128+65 to 128+90) and NUMBERS (128+48 to 128+57 )) 
                #but in MEMU, a noddy program title can be case insensitive but must be PLOD "prog1 or P1 or ..". It cannot be @1P for instance
                #but in MEMU @1P is a valid text page name.
                if GV_results[j]>128 :#bit 7 high (end of name) so could be 
                    GV_results[j]=GV_results[j]-128
                    mtxlist_str=mtxlist_str+mtx_token_db[GV_results[j]][1]
                    mtxlist_str="title="+mtxlist_str
                    #print("TEST: "+mtxlist_str)
                    nodPage.append(mtxlist_str) #note the '\n' is done later when writing out
                    #fn_w.write(mtxlist_str) #Noddy text page title
                    #fn_w.write('\n') #skip 255 as this will be replaced by a text EOL
                    break #exit while
                else:
                    mtxlist_str=mtxlist_str+mtx_token_db[GV_results[j]][1]
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
                GV_results[j]=int.from_bytes(fn_r.read(1),"little")
                #print("TEST: ",GV_results[j])

                if j==LineLen or GV_results[j]==255:
                    #print("TEST: 1st if")
                    nodPage.append(mtxlist_str)
                    #print("TEST: write line: ",mtxlist_str)
                    break
                elif GV_results[j]>168: #not a space or could be another title marker set as eol of line
                        nodPage.append(mtxlist_str)
                        jcol=0# new row and reset col counter
                        mtxlist_str=""
                elif GV_results[j]>128:#bit 7 high then determines the number of spaces, maxium of 39 spaces
                    #print("TEST: elif")
                    for ggg in range(GV_results[j]-128):
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
                    mtxlist_str=mtxlist_str+mtx_token_db[GV_results[j]][1] #add a new entry
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

    #=======================================
    #MAIN CODE
    #=======================================
    #load results from disc/tape into array
    global GV_fname_r,GV_fname_w,GC_extn_r,GC_extn_w,GV_MTXEOL,GV_results,GV_nonprintable,GV_sys_var
    #additional global
    global len_BASIC, hdr_cnt,fn_r,fn_w,LineLen,LineNum,noddy_flag,i,mtxlist_str
    global MemPos,CodeLen,CodeInc,CodeEnd,WIP_code,RES_code,VSC_flag,MTX_prog_flag,PlodNameList
    CodeLen=0
    CodeInc=7 #starts at the 7th byte and will increment in 4 or less bytes per cycle.
    CodeEnd=7
    WIP_code=[0,"","","",""] # Number of bytes to pass and a maximum of 4 bytes
    RES_code="" #build up the code output
    #open('workfile', 'w', encoding="utf-8") not applicable to ytes
    #print("get file to convert (*.mtx)")
    GV_fname_r = askopenfilename(title="Binary (Program) input filename",defaultextension=GC_extn_r, filetypes=[("MTX Program (Binary) files", GC_extn_r),("FDXB COM files", "*.com"),("EXE files", "*.exe"),("All files","*.*")])
    #print("write conversion out as a text BASIC file (*.bas)")
    GV_fname_w = asksaveasfilename(title="BASIC (text) output filename",defaultextension=GC_extn_w, filetypes=[("MTX BASIC text files", "*.bas"),("TEXT files", "*.txt"),("All files","*.*")]) 
    VSC_flag=False #Not required by VS Code as can view/edit a greater proportion of the listing and CTRL F to find than for the current 4 MTX editor.
    MTX_prog_flag=False #check if a valid binary file, should start with 255 on a MTX program.
    PlodNameList=[]

    answer=msgbox.askyesno(title="MTX Disassembly",message="Do you require VS Code editor compatibility?,\n ")
    VSC_flag=answer

    if GV_fname_r and GV_fname_w:
        fn_r_size=os.path.getsize (GV_fname_r) #replaces GC_array_rows
        #print("TEST: file size: ",fn_r_size)
        #still to check hdr_len<file size

        with open(GV_fname_r, 'rb') as fn_r: #read file plus byte rb 
            with open(GV_fname_w, 'w') as fn_w: #if read available, open write to save listing as text
                #test of MTX layout
                #normally header is 619 bytes. For BSHIPs its 2827
                mtxfn_str=""
                mtxlist_str=""
                sys_var_flag=False
                noddy_flag=False
                hdr_cnt=0
                len_BASIC=0 
                for gg in range(0,16): #this is the name
                    read_dec=int.from_bytes(fn_r.read(1),"little")
                    #print("TEST: byte = ",gg, read_dec)
                    if gg==0:
                        if read_dec==255:
                            #its a mtx program
                            MTX_prog_flag=True
                        else:
                            MTX_prog_flag=False
                            msgbox.showwarning(title="MTX Disassembly",message="Not a valid MTX program (binary) file to disassemble,\n ")
                            break #end for loop
                        #end if-else
                    hdr_cnt=hdr_cnt+1
                    if gg>0 and gg<16 and read_dec !=32: #assumes fname max 15 characters. Remove spaces after name
                        mtxfn_str=mtxfn_str+chr(read_dec)
                #end for
                if MTX_prog_flag is True: 
                    if mtxfn_str !="":
                        mtxfn_str=mtxfn_str 
                        #print("TEST: "+mtxfn_str+"."+GC_extn_r)
                        #else skip the rest for the moment
                    #read bytes 16 and 17 as these are the markers that will signifiy later on where the sys_var section is located
                    marker1_read_dec=int.from_bytes(fn_r.read(1),"little")
                    marker2_read_dec=int.from_bytes(fn_r.read(1),"little")
                    hdr_cnt=hdr_cnt+2
                    tmp_marker_def=[0,0,0,242,248]
                    tmp_marker=[0,0,0,0,0]
                    tmp_marker[3]=marker1_read_dec
                    tmp_marker[4]=marker2_read_dec
                    tmp_wip=tmp_marker.copy()

                    while sys_var_flag is False:
                        #skip the next section of the tape header until find the system variable section
                        #watch out for misaligned byte 16/17 - e.g. BOMBER.mtx
                        #uplifted from mtxhexdump.py
                        read_dec=int.from_bytes(fn_r.read(1),"little")
                        hdr_cnt=hdr_cnt+1
                        tmp_wip.pop(0)
                        tmp_wip.append(read_dec)
                        if tmp_wip==tmp_marker or tmp_wip==tmp_marker_def:
                            #print("TEST: marker block=",tmp_wip)
                            sys_var_flag=True
                            break #exit while loop
                #end if
                    #end while
                            
                    if sys_var_flag is True:
                        #print("TEST: sys_var_flag is true")                   
                        for ggg in range(5,251): #remaining system variable
                            GV_sys_var[ggg]=int.from_bytes(fn_r.read(1),"little")
                            hdr_cnt=hdr_cnt+1
                        #end for
                    #within system variables is the info to see if Noddy text/code is used
                        pos_noddy=(GV_sys_var[85]*256)+GV_sys_var[84] #end of Noddy in memory
                        pos_basic_st=(GV_sys_var[91]*256)+GV_sys_var[90] # start of BASIC in memory
                        pos_basic_end=(GV_sys_var[88]*256)+GV_sys_var[87] #end of BASIC (start of Noddy) in memory
                        #print("TEST: BASIC_START = ", pos_basic_st, " BASIC_END = ",pos_basic_end, " and NODDY_START = ", pos_noddy)

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
                        #might be prudent to shift indent to the right to keep witin sys_var_flag is true    
                        #print("TEST: pos_basic_st=",pos_basic_st," pos_basic_end=",pos_basic_end," pos_noddy=",pos_noddy," len_BASIC=",len_BASIC)
                        try:
                            # b'' means a byte
                            # b'\xhh' is escape sequence (\x) followed by a hex value
                            #BASIC listing section
                            BASIC_loop() #note CODE will be a sub-loop of this loop


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
    #end if
    return

convert_mtx_to_txt()
#quit() #loads prompt to kill the window





