
// Import the VS Code extensibility API
import * as vscode from 'vscode';

vscode.languages.registerHoverProvider('mtxbasic', {
  provideHover(document: vscode.TextDocument,position: vscode.Position) {
            const wordRange = document.getWordRangeAtPosition(position);

            if (!wordRange) {
                return;
            }
            var word = document.getText(wordRange);
            //gettext doesn't pick up chars like $ or _ as tried with if (word.endwith('$') === true)
            if (!word) {
                return;
            }
            // Additional logic to handle $ at the end of a word. Currently need to hover over the $ sign to get the command description
            if (position.character > 0) {
                const charAfter = document.getText(new vscode.Range(position.line, position.character, position.line, position.character + 1 ));
                if (charAfter === '$') {
                    var word = word + '$'   
                    //code below also works. In both cases, Hover only kicks in if over the $ sign though
                    //const start = wordRange.start.character; // Start of the word
                    //const end = wordRange.end.character + 1; // Include the $ character
                    //const extendedRange = new vscode.Range(wordRange.start.line, start, wordRange.end.line, end);
                    //var word = document.getText(extendedRange);

                }     
            }     
            // Handle specific BASIC commands            
            // MTX BASIC command match must be in capitals to comply with MTX BASIC language convention.
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
                    `Usage: ADJSPR p,n,v \n\n` +
                    `This command adjusts a value which has been assigned to a sprite either by the SPRITE command or subsequently by ADJSPR or MVSPR.\n\n` + 
                    `The advantage of ADJSPR is that unlike SPRITE, only 1 parameter is altered at a time thereby increasing the speed of updating single values.\n\n` + 
                    `n: Sprite number\n\n` +
                    `p = 0 : Sprite pattern. v = 0 to 31 (size 1) or 0 to 127 (size 0).\n\n` +
                    `p = 1 : Sprite colour. v = 0 to 15 (see colour table in appendix 7).\n\n` +
                    `p = 2 : Sprite x-position. v = 0 to 255.\n\n` +
                    `p = 3 : Sprite y-position. v = 0 to 255.\n\n` +
                    `p = 4 : Sprite x-speed. v = 0 to 255 (128 to 255 = negative).\n\n` +
                    `p = 5 : Sprite y-speed. v = 0 to 255 (128 to 255 = negative).`);
            }
            if (word === 'AND') {
		return new vscode.Hover(`**AND**: Boolean expression. compares two values to see if the condition is either True or False.\n\n` +
                    `Usage: AND \n\n` +
                    `Example: \n\n` + 
                    `10 IF X=1 AND Y=2 THEN STOP\n\n` + 
                    `True (-1) if X=1 and Y=2 otherwise its False (0).`);
            } 
            if (word === 'ANGLE') {
		return new vscode.Hover(`**ANGLE**: Initialises the direction to the specified angle.\n\n` +
                    `Usage: ANGLE angle \n\n` +
                    `The angle is in radians measured in an anticlockwise direction from the horizontal.\n\n` + 
                    `The computer holds a 'direction' which is used in commands such as ARC, DRAW and MVSPR.\n\n` + 
                    `The direction is made up of two components: ANGLE and PHI (see later)\n\n` + 
                    `For conversion to degrees: degrees = radians*360/2/PI\n\n` + 
                    `For conversion to radians: radians = degrees*PI*2/360`);
            }
            if (word === 'ARC') {
		return new vscode.Hover(`**ARC**:  Draws an arc of a circle with the specified parameters.\n\n` +
                    `Usage: ARC length,angle \n\n` +
                    `draws an arc of a circle. The starting position is the current plot position and the initial direction\n\n` + 
                    `is the direction currently held by the computer. Both the plot position and the direction are updated.\n\n` + 
                    `The angle parameter determines the curvature of the arc by specifying what angle is subtended.\n\n` +
                    `In other words the larger the angle, the tighter the curve.\n\n` +                     
                    `If the angle is greater than 360º or 2*pi radians, the arc will retrace its path.`);
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
                    `the number and the result are in radians\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `10 PRINT TAN(0.785): REM TAN of 0.785 rads (45 degrees) = 1\n\n` + 
                    `20 PRINT ATN(1): REM ATN of 1 rads is 0.785 rads = 45 degress`);
            }
            if (word === 'ATTR') {
		return new vscode.Hover(`**ATTR**:  Defines effects on the grahphics screen with the specified parameters.\n\n` +
                    `Usage: ATTR p,state\n\n` +
                    `ATTR determines the effect on the graphics screen of using one of the plotting commands such as PLOT, DRAW or ARC\n\n` + 
                    `The attributes are not exclusive but may be used in any combination.\n\n` + 
                    `The state of the attribute is either on or off where\n\n` + 
                    `state: 0 = OFF and 1 = ON\n\n` + 
                    `p takes the value 0,1,2 or 3.\n\n` + 
                    `p=0  Inverse print. Characters are printed in the paper colour on the ink colour.\n\n` +  
                    `p=1  Over print. Characters are merged with those already present.\n\n` + 
                    `p=2  Unplot. Plots the paper colour\n\n` +  
                    `p=3  Over-plot. Plots Plots the ink colour if paper was there before and the paper colour if ink was there before.\n\n` + 
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
            if (word === 'CIRCLE') {
		return new vscode.Hover(`**CIRCLE**: Draws a circle with the specified parameters.\n\n` +
                    `Usage: CIRCLE x,y,r\n\n` +
                    `x: X coordinate of the centre of a circle.\n\n` + 
                    `y: Y coordinate of the centre of a circle.\n\n` + 
                    `r: radius of a circle.`);
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
		return new vscode.Hover(`**CODE**: Code is not a command but rather a word to indicate that the following lines are assembly language.\n\n` +
                    `Usage: CODE \n\n` +
                    `In the normal MTX editor mode, use ASSEM line number to create assembly CODE, note the word cannot be typed and is inserted by the assembler into the BASIC line.\n\n` + 
                    `NOTE: In this free form VS code extension, ASSEM line number is not used. Use \\<line number\\> CODE instead. \n\n` + 
                    `Example: \n\n` +
                    `10 REM START OF PROGRAM\n\n` +                    
                    `20 CODE\n\n` + 
                    `   LABEL: LD A,(HL)\n\n` +
                    `	       RET\n\n` +   
                    `The heaxadecimal line numbers for the code 8030 and 8031 are not required, these will be added once the program is RUN (compiled)\n\n` +                      
                    `Referto  the MTX Series Owners Manual for details on assembler and Z80 assembly language`);
            }            
            if (word === 'COLOUR') {
		return new vscode.Hover(`**COLOUR**: Sets the colours for the graphics screen with the specified parameters.\n\n` +
                    `Usage: COLOUR p,n\n\n` +
                    `p: The value of p selects which areas of the screen the colour refers to.\n\n` + 
                    `Two sets of colours are defined. The print colours refer to Colours that will be used when colours are printed.\n\n` +  
                    `The non-print or PLOT colours refer to colours that will be used when colours are plotted or when screen functions are used.\n\n` + 
                    `p=0, print paper.\n\n` +  
		    `p=1, print ink.\n\n` + 
		    `p=2, non-print (plot) paper.\n\n` + 
		    `p=3, non-print ink.\n\n` +  
		    `p=4, border colour.\n\n` + 
		    `n: Selects the colour (see colour table in the appendix 7). (0 to 15)`);
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
                    `Usage: CRVS n,t,x,y,w,h,s\n\n` +
                    `n: Virtual screen reference number. (0 to 7)\n\n` +
                    `t: Type of screen. 0=text, 1=graphics.\n\n` +
                    `x: X coordinate of top left corner.\n\n` +
                    `y: Y coordinate of top left corner.\n\n` +
                    `w: Width of virtual screen in characters.\n\n` +
                    `h: Height of screen in lines.\n\n` +
                    `s: Width of screen. (40 for text, 32 for graphics)\n\n` +
                    `The virtual screen can be used for off-screen drawing and later copied to the main screen using the VS command.`);
            }
            if (word === 'CSR') {
		return new vscode.Hover(`**CSR**:  Moves the cursor to position with the specified parameters.\n\n` +
                    `Usage: CSR x,y \n\n` +
                    `x: X-coordinate.\n\n` + 
                    `y: Y-coordinate.\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `10 CSR 12,10\n\n` +
                    `Moves the cursor to position 12,10\n\n` +                     
                    `Any subsequent Printing or Input will occur at the new cursor position.`);
            }
            if (word === 'CTLSPR') {
		return new vscode.Hover(`**CTLSPR**:  Sprite control with the specified parameters.\n\n` +
                    `Usage: CTLSPR p,x \n\n` +
                    `p: parameter and can be any of the six below:\n\n` + 
                    `p=0  Speed (1 to 255 to 0 (1 is fastest)\n\n` + 
                    `p=1  Distance. Tells the computer to move the sprite by 'X' pixels when requested.\n\n` + 
                    `p=2  Number of sprites, 0 to 32 (The number of sprites must be at least 1)\n\n` +   
                    `p=3  Number of circling sprites. Sprites that will orbit when they go off the edge of the screen (must not exceed number of sprites)\n\n` +   
                    `p=4  Plot Sprite.A PLOT SPRITE can be chosen which will subsequently appear whenever a point is plotted. This sprite will move around the screen following any points or lines drawn by the BASIC GRAPHICS commands. This sprite can be any of the 32 defined in the normal way.\n\n` +
                    `p=5  number of moving sprites 0 to 32. This is the number of sprites that will move by themselves according to the x-speed and y-speed set in the SPRITE and ADJSPR commands\n\n` + 
                    `p=6  magnitude (mag 1 or 2) and size (8x8 or 16x16)\n\n` +                     
                    `x=0 mag 1, 8x8 ; x=1 mag 2, 8x8 ; x=2 mag 1, 16x16 and x=3 mag 2, 16x16`);
            }  
            if (word === 'DATA') {
		return new vscode.Hover(`**DATA**:  A data list construct accessible using a READ statement.\n\n` +
                    `Usage: DATA \\<list of values\\> \n\n` +
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
            if (word === 'DRAW') {
		return new vscode.Hover(`**DRAW**:  Draws a simple line with the specified parameter.\n\n` +
                    `Usage: DRAW x \n\n` +                   
                    `Draws a line of length X from the current plot position in the current direction The plot position is updated to the end of the line., see LINE`);
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
                    `Usage: EDITOR \\<variable list\\> \n\n` +
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
		return new vscode.Hover(`**FOR**:  FOR .. TO .. STEP .. NEXT control construct.\n\n` +
                    `Usage: FOR \\<control variable\\>=\\<start\\> TO \\<limit\\> STEP \\<increment\\> : NEXT \\<control variable\\>\n\n` +
                    `control variable is a simple numeric variable but in this instance is called the control variable.\n\n` + 
                    `Start, limit and increment are numeric expressions.\n\n` + 
                    `STEP increment is optional, default is STEP 1\n\n` + 
                    `NEXT control variable, sometimes the control variable is dropped\n\n` +                   
                    `see NEXT and the manula for examples.`);
            }
            if (word === 'GENPAT') {
		return new vscode.Hover(`**GENPAT**:  Defines a character or sprite pattern with the specified parameters.\n\n` +
                    `Usage: GENPAT p,n,d1,d2,d3,d4,d5.d6,d7,d8 \n\n` +
                    `The command is used to generate all types of patterns (d1 to d8) required by BASIC for characters and SPRITES.There are 5 modes:-\n\n` + 
                    `Mode 1: p=0, To redefine an ASCII character, n = 32 TO 127\n\n` + 
                    `Mode 2: p=1, To define a non ASCII character (User Definable Characters), n = 129 TO 154\n\n` + 
                    `Mode 3: p=2 To define ink and paper colour for each line of a character. This only applies to UDC with codes 147 to 154.\n\n` +    
                    `Mode 4: p=3, To define an 8 by 8 sprite pattern\n\n` +  
                    `Mode 5. p=4 to 7. To define each quadrant of a 16 by 16 sprite (NW, SW, NE, SE respectively).\n\n` +                    
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
                    `Usage: GR$ x,y,b \n\n` +
                    `This function should be used if you wish to print the graphics screen to a high resolution printer.\n\n` + 
                    `x and y: locations on the virtual screen.\n\n` + 
                    `b: the number of bits to be read, if b=1, equivalent to a POINT function.\n\n` + 
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
            if (word === 'LINE') {
		return new vscode.Hover(`**LINE**:  Draws a line between 2 sets of coordinates. See also DRAW\n\n` +
                    `Usage: LINE X1,Y1,X2,Y2 \n\n` +                     
                    `Draws a line from coordinates (X1,Y1) to (X2,Y2)`);
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
                    'The tapename is limited to 14 alphanumeric characters\n\n' +                      
                    'The extension is optional and is typically either be "BAS" or "MTX" for MTX BASIC programs with or without built-in Z80 assembly code.\n\n' +                    
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
                    `Usage: MOD(x,y) \n\n` +
                    `Returns the remainder on dividing X by Y\n\n` + 
                    `MOD (X,Y) is equivalent to X-INT(X/Y)*Y\n\n` +                    
                    `Gives an error if division by 0\n\n` + 
                    `EXAMPLE: \n\n` + 
                    `PRINT MOD(10,7)\n\n` +                     
                    `Returns a remainder of 3`);
            } 
            if (word === 'MVSPR ') {
		return new vscode.Hover(`**MVSPR**:  General purpose sprite command with the specified parameters.\n\n` +
                    `Usage: MVSPR p,n,d \n\n` +
                    `The functions are combined to allow complicated movements to occur whilst using only a single instruction. Add the p values together to get the movement combination required.\n\n` + 
                    `d is slightly more complicated as it must be able to reflect a value for several activities. If d is not in the range of any one of the chosen activities an error will occur.\n\n` +                     
                    `p=1 , MOVEMENT of Sprite in the direction specified by d (0 to 8). The step size is set in CTLSPR 1\n\n` + 
                    `p=2 , Pattern Selection, changes the sprite pattern to pattern number d, defined by a GENPAT statement\n\n` +  
                    `p=4 , Redirect picks up the current velocity vector and switches it to the new direction.\n\n` + 
                    `p=8 , Plot at centre causes a point to be plotted at the centre of the sprite specified by n. This is not directly affected by the value of d at all.\n\n` +                    
                    `n selects the sprite number (0 to 32)`);
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
                    `Passes control to the Noddy editor. Noddy should appear at the base of the screen\n\n` + 
                    `Refer to the MTX Series Owners Manual for details on the Noddy language.\n\n` +                    
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like NODDY.`);
            } 
            if (word === 'NOT') {
		return new vscode.Hover(`**NOT**: Boolean expression. compares two values to see if the condition is either True or False.\n\n` +
                    `Usage: NOT \n\n` +
                    `Example: \n\n` + 
                    `10 LET X=1:PRINT (NOT X=2)\n\n` + 
                    `Returns -1 as X is NOT equal to 2 (TRUE). If X=2 then X is equal to 2 Returns 0 (False).`);
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
            if (word === 'OUT') {
		return new vscode.Hover(`**OUT**:  Outputs the specified value to the specified port.\n\n` +
                    `Usage: OUT port,value\n\n` +                 
                    `Refer to MTX series Owners Manual, Technical Section, System Block Diagram`);
            }            
            if (word === 'PANEL') {
		return new vscode.Hover(`**PANEL**:  Z80 disasembler.\n\n` +
                    `Usage: PANEL \n\n` +
                    `Passes control to the PANEL dissassembler editor.\n\n` + 
                    `Refer to the MTX Series Owners Manual for details ON PANEL.\n\n` +                    
                    `NOTE: The VS CODE extension for MTX-BASIC does not use the Memotech built-in editor tools like PANEL.`);
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
            if (word === 'PHI') {
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
            if (word === 'PLOT') {
		return new vscode.Hover(`**PLOT**:  Plots a point on the graphics screen.\n\n` +
                    `Usage: PLOT x,y \n\n` +
                    `Plots a point in the graphics screen at the graphics coordinates (x,y)\n\n` +                     
                    `See COLOUR and ATTR`);
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
                    'The tapename is limited to 14 alphanumeric characters\n\n' +                       
                    'The extension is optional and is typically either be "BAS" or "MTX" for MTX BASIC programs with or without built-in Z80 assembly code.\n\n' +
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
                    `SOUND channel,frequency,volume \n\n` + 
                    `SOUND channel,frequency,volume ,freq inc,vol inc,duration,mode\n\n` + 
                    `channel: 0,1 and 2 are pure sound and 3 is for noise.\n\n` + 
                    `frequency: frequency of the sound (0 to 1023)\n\n` + 
                    `volume: loudness (0 to 15)\n\n` + 
                    `freq_inc and vol_inc are self explanatory. Every 1/64th of a second the computer adds the frequency increment to the frequency and the volume increment to the volume.\n\n` + 
                    `duration: This continues for a length of time equal to the duration which is also measured in 1/64ths of a second\n\n` + 
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
                    `Usage: SPRITE n,pat, xp,yp,xs, ys,col \n\n` +
                    `n: sprite number (1 to 32)\n\n` + 
                    `pat: sprite pattern number (size 0: 0 to 127 and size 1: 0 to 31)\n\n` + 
                    `xp: position x off centre (range -4095 to 4095)\n\n` + 
                    `yp: position y off centre (range -4095 to 4095)\n\n` +                     
                    `xs: speed in the x direction (-128 to 127) where 1 unit of speed moves the sprite 1/8 pixel every master speed cycle as set by CTLSPR 0\n\n` + 
                    `ys:  speed in the y direction (plus upwards) range -128 to 127\n\n` + 
                    `col: colour (0 to 15)\n\n` + 
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
                    `Usage: VS n \n\n` +
                    `This command selects a virtual screen from those already defined or created using the CRVS command. \n\n` + 
                    `The computer will automatically switch to the type of screen selected whether graphics or text.\n\n` +                    
                    `See CRVS`);
            }            
        }
    });


// Clean up resources if needed
function deactivate() {}
