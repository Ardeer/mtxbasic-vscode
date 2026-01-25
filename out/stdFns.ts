// stdFns.ts
// author A F Wilson
// 19-Nov-2025
//

// ------------------------------------------------------------
//  Types used by functions
// ------------------------------------------------------------
// “tuple type”  [string, boolean]
// “array of tuples”  [string, boolean][]
type validparts = [string,boolean];
type BoolSpan = { spanStart: number; spanEnd: number };

    // check if the number is hexadecimal (16-bit UNSIGNED hexadecimal is allowed)
    function isHexNumber(expr: unknown): expr is string {
            return typeof expr === 'string' && /^[#£][0-9A-Fa-f]{1,4}$/.test(expr);
            // optional sign, then # or £, then 1‑4 hex digits, whole‑string match
            //return /^[+-]?[#£][0-9A-Fa-f]{1,4}$/.test(expr); // use if what SIGNED but must use - or + in front of the hex number.
    }//  END of isHexNumber

    function parseSignedHex(s: string): number | null { 

            const m = s.match(/^([#£])([0-9A-Fa-f]{1,4})$/);
            if (!m) return null;

            const raw = parseInt(m[2]!, 16);          // 0‑65535 (m[2] is guaranteed by the regex and the null check)
            // Convert to signed 16‑bit:
            const signed = raw & 0x8000 ? raw - 0x10000 : raw;

            // 16‑bit signed range: -32768 … 32767
            // negative numbers starts at £8000 (-32768) to £FFFF (-1)
            // postive numbers start at 0 to £7FFF
            if (signed < -32768 || signed> 32767) return null;

            return signed; // e.g. £FFA0 → -96
    } //  END of isHexadecimalNumber

    function parseHex(s: string): number | null {
            const m = s.match(/^([+-]?)([#£])([0-9A-Fa-f]{1,4})$/);
            if (!m) return null;                     // not a valid literal

            const sign = m[1] === '-' ? -1 : 1;
            const hexDigits = m[3];
            if (hexDigits) { //check hexDigits is not undefined
                    const value = sign * parseInt(hexDigits, 16);

                    // 16‑bit signed range: -32768 … 32767
                    if (value < 0 || value > 65535) return null;

                    return value;}
            return null;
    } //  END of isHexadecimalNumber

    function isValidVarName(s: string | null | undefined): boolean {
            // Reject null/undefined, empty, and literal "()"
            if (!s || s === '()' || s.startsWith('"') || s.endsWith('$')) return false;

            // Must start with a letter, then letters/digits allowed (underscore not allowed)
            // Reject string variables that starts with 1 or more numbers followed by 1 or more letters, followed by none or more alphanumerics. 
            // ^[A-Z][A-Z0-9_]*$
            return /^[A-Z][A-Z0-9]*$/.test(s);
    } //END of isValidVarName

    function isValidStrVarName(s: string | null | undefined): boolean {
            // Reject null/undefined, empty, and literal "()" and starts with ". !s replaces s===null || s===undefined
            if (!s || s === '()' || s.startsWith('"')) return false;

            // Must start with a letter, then letters/digits allowed (underscore not allowed)
            // Reject string variables that starts with 1 or more numbers followed by 1 or more letters, followed by none or more alphanumerics. 
            // ^[A-Z][A-Z0-9_]*\$$
            if (isBalancedParentheses(s)) {
            //console.log('Balanced parenthesis');
            // Check for valid parenthesized expression
            const sStrip=String(s).replace(/[\s[(|)]/g, '');
            //console.log('stripped out parentheses);
            return /^[A-Z][A-Z0-9]*\$$/.test(sStrip);// added to trailing anchor to prevent false positives like foo$bar
            }
            return false;
    } //END of isValidStrVarName

    function isValidString(s: string | null | undefined): boolean {
            if (!s || s === '()' ) return false; 
            // Check for balanced parentheses and then test against simple variable arithmetic
            if (isBalancedParentheses(s)) {
                    //console.log('Balanced parenthesis');
                    // Check for valid parenthesized expression
                    const sStrip=String(s).replace(/[\s[(|)]/g, '');
                    //console.log('stripped out parentheses);
                    if (sStrip.startsWith('"') && sStrip.endsWith('"')) return true;
            }
            return false;

    } // END of isvalidString

    function isBalancedParentheses(s: string): boolean {
            let count = 0;
            for (const char of s) {
            if (char === '(') count++;
            if (char === ')') count--;
            if (count < 0) return false;
            }
            return count ===0; //true if condition met
    } //END of isBalancedParentheses

    function isBalancedDoubleQuotes(s: string): boolean {
            let count = 0;
            for (const char of s) {
            if (char === '"') count++;
            if (char === '"') count--;
            if (count < 0) return false;
            }
            return count ===0; //true if condition met
    } //END of isBalancedParentheses


    function stripAllCharacters(input: string | number, chars: string): string {
        // Escape characters that have special meaning in a RegExp (e.g. . * + ? ^ $ \)
        // The 'g' flag replaces all occurrences, not just the first one
        
        //const escaped = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); //single char only, not useful for ()
        // Build a global RegExp that matches the exact character
        //const regex = new RegExp(escaped, 'g');

        // Escape characters that have special meaning inside a character class
        const escaped = chars.replace(/[-\\^]/g, '\\$&'); // -, \, ^ need escaping

        // Build a global RegExp that matches any of the characters in the class
        const regex = new RegExp(`[${escaped}]`, 'g');    

        return String(input).replace(regex, '');
    }

    function stripOuterParentheses(s: string): string {
            // Trim whitespace
            s = s.trim();
            
            //is BalancedParentheses() is checked elsewhere

            // If not wrapped in parentheses, return as is
            if (!s.startsWith('(') || !s.endsWith(')')) {
                    return s;
            }
            
            // ELSE  Extract the substring between the outermost parentheses
            return s.slice(1, -1).trim();

    } // END of stripOuterParentheses

    function convertToNumber(s: unknown): number | null {
            // Early type guards
            if (!s) return null; //s === null || s === undefined
            
            // Handle different input types
            if (typeof s === 'number') return Number.isFinite(s) ? s : null;
            if (isHexNumber(s)) {
                    return parseHex(s);
            }
            if (typeof s === 'string') {
            try {  // tiny sandboxed eval for arithmetic-only strings
                    // eslint-disable-next-line no-new-func
                    // will return a number if '67' or 67 or '(67)' - no need to strip out the parenthesis. Retruns null if 'abc'
                    const v = Function('"use strict"; return (' + s + ')')();
                    return typeof v === 'number' && Number.isFinite(v) ? v : null;
            } catch {
                    return null;
            }
            }        
            return null;
    }   // END of convertToNumber   


    function stringExprParts(expr: string): validparts[] { // Updated to handle concatenated expressions. Used by splitStringConcats
            const s = expr; //  no trim – keep original spacing for regexes
            if (!s) return [['',false]];

            // “tuple type”  [string, boolean]
            // “array of tuples”  [string, boolean][]
            //let extractParts: [string, boolean][] = []; this and the line below are equally valid
            let extractParts:validparts[]=[];
                    
            //1. DIM is a special as it can be either a var or a string var DIM A(10,10) or DIM A$(1,4)
            // see additional comments in complexTokeniser function
            if (/^DIM\s(?:[A-Z][A-Z0-9]*\$\([^)]*\)$)/.test(s)) {extractParts.push([s, true]); return extractParts;} // this should be a standalone statement

            // 2. if function it should have parenthesis and/or nested parenthesis depending on the expression
            const sStrip= stripOuterParentheses(s); // Removes outer parenthesis and returns an updated string  Doesn't remove function ()      

            // Split on + for concatenation, then check each part
            //A common trick is to split on a “+” that is followed by an even number of opening “(” characters without a matching closing “)”. 
            // In JavaScript/TypeScript we can use a balanced‑parentheses look‑ahead:
            const parts = sStrip.split(/\+(?![^(]*\))/).map(p => p.trim()); //backup option to use complexTokeniser() as used by VarExprParts
            parts.every(part => { //push used instead of using a counter
                    //console.log('strexpr parts based on cat',part);
                    // Check each part for: Order changed
                    // 3. Nested String function call which requires numeric but returns a string e.g. CHRS(65)
                    //if (/^(?:CHR)\$\([^)]([\d+]*|[A-Z][A-Z0-9]*)\)$/.test(part)) return extractParts.push([part, true]);
                    if (/^(?:CHR)\$\([^)]([\d+]*|[A-Z][A-Z0-9]*)\)$/.test(part)) return extractParts.push([part, true]);
                    // 4. Nested String function call which have 1 or more arguments, which can be string, string variable or variable or numeric, e.g. LEFT$(B$,2) or CHRS(65)
                    // 4a. GR$(x,y,b)
                    if (/^(?:GR)\$\((?:\d+|[A-Z][A-Z0-9]*?),(?:\d+|[A-Z][A-Z0-9]*?),(?:\d+|[A-Z][A-Z0-9]*?)\s*\)$/.test(part))  return extractParts.push([part, true]);
                    // 4b. LEFT$(str,num)
                    if (/^(?:LEFT)\$\((?:"[^"]*"|[A-Z][A-Z0-9]*\$?),(?:\d+|[A-Z][A-Z0-9]*?)\s*\)$/.test(part))  return extractParts.push([part, true]);
                    // 4c. MID$(str,x,y)
                    if (/^(?:MID)\$\((?:"[^"]*"|[A-Z][A-Z0-9]*\$?),(?:\d+|[A-Z][A-Z0-9]*?),(?:\d+|[A-Z][A-Z0-9]*?)\s*\)$/.test(part))  return extractParts.push([part, true]);
                    // 4d. RIGHT$(str,num)
                    if (/^(?:RIGHT)\$\((?:"[^"]*"|[A-Z][A-Z0-9]*\$?),(?:\d+|[A-Z][A-Z0-9]*?)\s*\)$/.test(part))  return extractParts.push([part, true]);
                    // 4e. STR$(num/expr) allows 2+2 Returns a string, allows STR$(2+2) but not suitable for nested STR$((3^2)*2-4)
                    //if (/^STR\$\((?:[A-Z][A-Z0-9]*|\d+(?:\.\d+)?)(?:\s*[\+\-\*\/\^]\s*(?:[A-Z][A-Z0-9]*|\d+(?:\.\d+)?|\([^)]*$))*\s*\)$/.test(part)){
                    //        return extractParts.push([part, true]);
                    //}
                    if (/^(?:STR\$\()/.test(part)){ //deals with nested
                            const stripPart=part.slice(4,);
                            //console.log('remove STR$(',stripPart); 
                            if (isValidVarExprArithmetic(stripPart)) {
                                    //console.log('valid arithmetic variable expression');
                                    return extractParts.push([part, true]);         
                            } 
                            else {
                                    //console.log('invalid arithmetic/var expression');
                                    return extractParts.push([part, false]);                                
                            }
                    }
                    // 5. Nested String Command call - no associated argunments
                    if (/^(?:INKEY|SPK|TIME)\$\s*$/.test(part)) return extractParts.push([part, true]);
                    // 6. Nested String variable (ends with $)
                    if (isValidStrVarName(part) || isValidString(part)) return extractParts.push([part, true]);
                    //if (/^(?:[A-Z][A-Z0-9]*\$)$/.test(part)) return extractParts.push([part, true]);              
                    // 7. Quoted string option to check with isBalancedDoubleQuotes()
                    //if (/^(?:"[^"]*")$/.test(part)) return extractParts.push([part, true]);

                    else return extractParts.push([part, false]); //not valid
            // if not a match then skips and doesn't complete the rest of the row.
                    
            });
            return extractParts;
    } // END of stringExprParts function

    function varExprParts(expr: string): validparts[] { // Updated to handle concatenated expressions. Used by splitStringConcats
            const s = expr; //  no trim – keep original spacing for regexes
            if (!s) return [['',false]];

            // “tuple type”  [string, boolean]
            // “array of tuples”  [string, boolean][]
            //let extractParts: [string, boolean][] = []; this and the line below are equally valid
            let extractParts:validparts[]=[];
            const parts=complexTokeniser(s);
            //1. standalone construct DIM is a special as it can be either a var or a string var DIM A(10,10) or DIM A$(1,4)
            // see additional comments in complexTokeniser function
            if (/^DIM\s(?:[A-Z][A-Z0-9]*\([^)]*\)$)/.test(s)) {extractParts.push([s, true]); return extractParts;}   //assumes followed by colon, this can be added
        

            // Split down if variable expression is complex containing simple or variable arithmetic and numerical functions.
            // Split on arithmetic operators (keep operators as tokens) and validate parts
            //(/([+\-*/^])/) OK until you get FUNC(A+B), the + sign or any operator causes incorrect splits
            // reuse the trick used by strExprParts to prevent functs s.split(/([+\-*/^(])(?![^(]*\))/) works but misses out the closing ')'
            //s.split(/([+\-*/^(])(?![^(]*\))/) works - however, as above it fails with (AB+3), only showing '+' & '3' with AB missing 
            //const parts = s.split(/(?:\([^()]*\))|(?:[+\-*/^(])(?![^(]*\))/).map(p => p.trim()).filter(p => p !== ''); 
            //const parts = t.split(/([+\-*/^])/).map(p => p.trim()).filter(p => p !== '');
            //const parts = s.match(/(?:[A-Z][A-Z0-9]*\s*\()(?:[^()]+|\([^()]*\))*\)|\([^()]*\)|[+\-*/^]|\d+(?:\.\d+)?/g) ?? []; //\s* needed to capture LEN ()S
            //allows 1 deep nested SIN((AB+4)-5) returns as 'SIN((AB+4)+5)'
            //doesn't allow nested ((AB+0.4)+5), however, best option for testing is the one with no single '(' as this would appear as unbalanced
            // [+\-*/^] => '(AB+0.4)' , '+' , '5'
            //[+\-*/^(] => '(' , '(AB+0.4)' , '+' , '5'
            //[+\-*/^()] => '(' , '(AB+0.4)' , '+' , '5' , ')'

            //covers 1 deep nested functions but not 1 deep variables.
                    if (parts.length === 0) extractParts.push(['', false]);
                            console.log('parts are',parts);
                        for (const part of parts) {
                            //console.log('strexpr parts based on cat',part);
                            // Check each part for: Order changed                               

                            // 2. Nested functions excluding specials
                            // 2a. LN(x)
                            //if (/^(?:LN)\s*\(/.test(part)) { //removed LN as copvered by isValidVarExprArithmetic
                            /*        const stripPart=part.slice(2,);
                                    console.log('remove LN(',stripPart); 
                                    if (isValidVarExprArithmetic(stripPart)) {
                                            console.log('valid arithmetic variable expression');
                                            extractParts.push([part, true]);         
                                    } 
                                    else {
                                            console.log('invalid arithmetic/var expression');
                                            extractParts.push([part, false]);                                
                                    }
                            } */                        
                            // 2b. FCN(x)
                            if (/^(?:ABS|ATN|COS|INP|INT|SGN|SIN|SQR|TAN|USR)\s*\(/.test(part)) { //removed EXP as copvered by isValidVarExprArithmetic
                                    const stripPart=part.slice(3,);
                                    //console.log('remove FUNC(',stripPart); 
                                    if (isValidVarExprArithmetic(stripPart)) {
                                            //console.log('valid arithmetic variable expression');
                                            extractParts.push([part, true]);         
                                    } 
                                    else {
                                            //console.log('invalid arithmetic/var expression');
                                            extractParts.push([part, false]);                                
                                    }
                            }
                            // 2c. MOD(x,y)
                            else if (/^(?:MOD)\((?:\d+|[A-Z][A-Z0-9]*?),(?:\d+|[A-Z][A-Z0-9]*?)\s*\)$/.test(part)) {
                                    extractParts.push([part, true]); }                                   
                            // 3. other function calls which requires strings but return numeric
                            // 3a. ASC()
                            else if (/^(?:ASC\()/.test(part)) {
                                    const stripPart=part.slice(3,);
                                    const ifStrExpr=stringExprParts(stripPart);
                                    console.log('remove ASC(',stripPart); 
                                    //if (isValidStrVarName(stripPart) || isValidString(stripPart) || (ifStrExpr.every(row => row[1] === true))) {
                                    if ((ifStrExpr.every(row => row[1] === true))) {
                                    console.log('valid string variable expression');
                                            extractParts.push([part, true]);         
                                    } 
                                    else {
                                            console.log('invalid string/string var expression');
                                            extractParts.push([part, false]);                                
                                    }
                            }
                            // 3b. LEN () //LEN needs a space after it 
                            else if (/^(?:LEN\s\()/.test(part)) {
                                    const stripPart=part.slice(4,);
                                    const ifStrExpr=stringExprParts(stripPart);
                                    //console.log('remove LEN (',stripPart); 
                                    //if (isValidStrVarName(stripPart) || isValidString(stripPart) || (ifStrExpr.every(row => row[1] === true))){
                                    if ((ifStrExpr.every(row => row[1] === true))) {
                                            //console.log('valid string variable expression');
                                            extractParts.push([part, true]);         
                                    } 
                                    else {
                                            //console.log('invalid string/string var expression');
                                            extractParts.push([part, false]);                                
                                    }
                            }
                            // 3c. VAL()
                            else if (/^(?:VAL\()/.test(part)) {
                                    const stripPart=part.slice(3,);
                                    const ifStrExpr=stringExprParts(stripPart);
                                    //console.log('remove VAL(',stripPart); 
                                    //if (isValidStrVarName(stripPart) || isValidString(stripPart) || (ifStrExpr.every(row => row[1] === true))) {
                                    if ((ifStrExpr.every(row => row[1] === true))) {
                                            //console.log('valid string variable expression');
                                            extractParts.push([part, true]);         
                                    } 
                                    else {
                                            //console.log('invalid string/string var expression');
                                            extractParts.push([part, false]);                                
                                    }
                            } 
                            // Check for plain parentheses token
                            else if (/\([^()]*\)/.test(part)){
                                    
                                    const stripPart=stripAllCharacters(part,'()');
                                    //console.log('plan=',part,' stripped part=',stripPart);
                                    if (isValidVarExprArithmetic(stripPart)) {
                                            //console.log('valid arithmetic variable expression');
                                            extractParts.push([part, true]);         
                                    } 
                                    else {
                                            //console.log('invalid arithmetic/var expression');
                                            extractParts.push([part, false]);                                
                                    }
                            }                      
                            // 4. simple arithmetic or variable check
                            else if (isValidVarExprArithmetic(part)) {
                                    extractParts.push([part, true]); } //avoids double entry for LN() or EXP() which are causing double check
                            else if (isValidArithmetic(part)) {extractParts.push([part, true]); }    // 5. Simple Variable arithmetic with and without parenthesis check
                                
                            //else if (!(/([+\-*/^()])/).test(part)) {extractParts.push([part, false]);} 
                            else {extractParts.push([part, false]);} //not valid for everything else
            // if not a match then skips and doesn't complete the rest of the row.
                    
            }
            return extractParts;
    } // END of varExprParts function

    // capture parentheses groups
    function captureParenthesesGroup(s:string, n:number): number | null {
            if (s.charAt(n) !== '(') return null; 
            let depth = 0;
            //const start = n; // replicated in the calling routine
            while (n < s.length) {
                    const ch = s.charAt(n);
                    if (ch === '(') depth++;
                    else if (ch === ')') depth--;
                    n++;
                    if (depth === 0) break;
            }
            //console.log('captureParenthesesGroups, n=',n)
            return n;
    } //END of captureParenthesesGroup


    // simple tokeniser – split on whitespace and keep punctuation as separate tokens
    function simpleTokeniser(str: string): string[] {
        //const re = /([A-Z]\w*|\d+|\S)/g; // identifiers, numbers, or any single non‑space char
        //const re =  /([A-Z]{1,}[0-9]*\$(?!\w)|[A-Z]\w*|\d+|\S)/g; // w allows alphanumeric and underscores
        //const re = /("[^"]*"|[A-Z]{1,}[0-9]*\$*(?![A-Za-z0-9])|[A-Z][A-Za-z0-9]*|\d+(?:\.\d+)?|\S)/g; //doesn't allow _ or variables starting with a number, this is fine for a validator not a tokeniser
        
        // order is critical, need to check decimal before the last option otherwise '4.5' is split as 4,.,5. The last bit allows vars starting with numbers to avoid splitting down
        //const re = /("[^"]*"|[A-Z]{1,}[0-9]*\$*(?![A-Za-z0-9])|\d+(?:\.\d+)?|[A-Za-z0-9_]+|\S)/g; 
        
        const re = /("[^"]*"|[A-Z]{1,}[0-9]*\$(?![A-Za-z0-9])|(?=[A-Za-z0-9_]*[A-Za-z])[A-Za-z0-9_]+|\d+(?:\.\d+)?|\S)/g; //LEN\s isn't correct and split down further.
        // regex above matches
        // \"[^"]*\" captures a double‑quoted string (including any lowercase letters) as one token.
        // [A-Z]{1,}[0-9]*\$(?![A-Za-z0-9]) matches the special $‑ending tokens.
        //[A-Z][A-Za-z0-9]* matches regular identifiers that start with a capital letter and may contain only capitals or digits
        // \d+ matches pure numbers but for decimals its \d+(?:\.\d+)?
        // \S catches any remaining single non‑space character (punctuation, symbols, etc.).
        return str.match(re) ?? [];
    } // END of simple tokeniser

    // ------------------------------------------------------------
    // complexTokeniser – tokenises according to the exact rules
    // it doesn't validate the code. allows lowercase to ensure 
    // no standalone characters like INKEY$-Ab321 would have been
    // INKEY$-A , b , 321 
    // ------------------------------------------------------------
    function complexTokeniser(expr: string): string[] {
        const tokens: string[] = [];
        let i = 0;

        // --------------------------------------------------------
        // Helper: try to match a RegExp at the current index `i`
        // --------------------------------------------------------
        const consume = (re: RegExp): string | null => {
            const m = re.exec(expr.slice(i));
            if (m) {
                i += m[0].length;
                return m[0];
            }
            return null;
        };

        // -----------------------------------------------------------------
        // Regexes – most‑specific first (order matters!)
        // -----------------------------------------------------------------
        //matches only a single numeric array like DIM A(4) or DIM AB(4,6) but not DIM A(10),B(5) as fails after the first )
        //To support string arrays, multiple arrays, and comma-separated declarations you need a dedicated DIM handler - not part of stdFns.ts
        // note do not use /^\s*DIM\s+(.+)$/ ould blindly accept every string beginning with “DIM” and mark it “valid,” masking real syntax errors. 
        // Instead, delete those DIM-specific branches (or leave the narrow regex if you still need to catch the legacy pattern) and rely on the new DIM block for validation.        
        const reDim      = /^DIM\s(?:[A-Z][A-Z0-9]*\([^)]*\)$)/;            // DIM var(expr) or var$(expr)
        const reQuoted   = /^"[^"]*"/;                                      // "text"
        const reNumFn    = /^(?:ABS|ASC|ATN|COS|EXP|INP|INT|LEN|LN|MOD|SGN|SIN|SQR|TAN|USR|VAL)\s*/; // replaced $[^)]*$ with (?=\s*())
        const reStrFn    = /^(?:CHR|GR|LEFT|MID|RIGHT|STR)\$\s*/; // replaced $[^)]*$ with (?=\s*()) didn't work with nested parentheses \([^)]*\)* kinda worked
        //const reLenFn   = /^(?:LEN)\s*/;                                     // LEN needs a space after it to be valid but handled separately
        // $‑ending identifier that is a function call (e.g. CHR$(…))
        const reDollarFn = /^[A-Z][A-Za-z0-9]*\$(?=\s*\()/;                  //replaced [A-Z]{1,}[0-9] with [A-Z][A-Za-z0-9]
        const reDollar   = /^[A-Z][A-Za-z0-9]*\$(?![A-Za-z0-9])/;            // plain $‑ending token
        const reIdent    = /^(?:[A-Z][A-Za-z0-9]*\$?)/;                     // identifiers containing at least one letter
        const reNumber   = /^(\d+(?:.\d+)?(?:[eE][+-]?\d+)?)/;              // integer or decimal or scientific
        const reArithOp  = /^[+\-*/^]/;                                     // Arthimetical operators
        const reBoolOp   = /^(?:AND|NOT|OR)\s*/;                            // Boolean operators
        const reRelOp    = /^(<>|<=|>=|=|<|>)/;                             // Relational operators
        const reOther    = /^\S/;                                           // any other single non‑space char
        //const reMultiArithOps = /^[+|*|/|^]{2}/;                            // don't include minus as 2 minus make a plus, 3 minus make a minus and 4 minus make a plus ...  
        // const reBoolExpr =    // refer to pages 143-144 of the manual for boolean expressions (MTX_Series_Owners_Manual.pdf)

        
        while (i < expr.length) {
            // ---- 1. skip whitespace (LEN needs a space, but we keep it here) ----
                        if (/\s/.test(expr.charAt(i))) {
                                i++;
                                continue;
                        }
        // ---- 2. capture variable expressions contained within parentheses ----
            //const captureParenGroup = () => {
            //if (expr[i] !== '(') return null; // checked here before calling function
            //const start = i;       
            //let depth = 0;       
            //while (i < expr.length) {
            //if (expr[i] === '(') depth++;
            //else if (expr[i] === ')') depth--;
            //i++;
            //if (depth === 0) break;
            //}
            //return expr.slice(start,i);
            //};
            //const grp = captureParenGroup();
            //if (grp) { tokens.push(grp)); continue; }
            
            const grp=captureParenthesesGroup(expr,i); //procedurised section of code below
            if (grp) { const start = i; i=grp; // update i to keep track of progress through the expression
                    tokens.push(expr.slice(start,i)); 
                    continue; }

            // ---- 3. DIM var(expr) or var$(expr)
            const d = consume(reDim);
            if (d) { tokens.push(d); continue; }

            // ---- 4. quoted string ------------------------------------------------
            const q = consume(reQuoted);
            if (q) { tokens.push(q); continue; }


            // ---- 5. numeric functions --------------------------------------------
            //includes LEN which needs a space after it but validity is checked out with this function
            const numFn = consume(reNumFn);
            //if (numFn) { tokens.push(numFn); continue; }
            const nfgrp=captureParenthesesGroup(expr,i); //procedurised section of code below
            if (nfgrp) { const start = i; i=nfgrp; // update i to keep track of progress through the expression
                    tokens.push(numFn + expr.slice(start,i)); 
                    continue; }
            

            // ---- 6. string functions ----------------------------------------------
            const strFn = consume(reStrFn);
            //if (strFn) { tokens.push(strFn); continue; }
            const sfgrp=captureParenthesesGroup(expr,i); //procedurised section of code below
            if (sfgrp) { const start = i; i=sfgrp; // update i to keep track of progress through the expression
                    tokens.push(strFn + expr.slice(start,i)); 
                    continue; }

            // ---- 7. $‑ending identifier that is a function call (e.g. AB$(…) ) -----
            const dollarFn = consume(reDollarFn);
            if (dollarFn) {
                // capture the balanced parentheses that follow
                let depth = 0;
                const start = i;
                                while (i < expr.length) {
                                        const ch = expr.charAt(i);
                                        if (ch === '(') depth++;
                                        else if (ch === ')') depth--;
                                        i++;
                                        if (depth === 0) break;
                                }
                const call = expr.slice(start, i); // '(' … ')'
                tokens.push(dollarFn + call);
                continue;
            }

            // ---- 8. plain $‑ending token (no '(' after it) -----------------------
            const dol = consume(reDollar);
            if (dol) { tokens.push(dol); continue; }

            // ---- 9. ordinary identifier / variable --------------------------------
            const id = consume(reIdent);
            if (id) {

                // ----- 9a. normal function call without the required space (e.g. AB(…) ) -----
                                        if (expr.charAt(i) === '(') {
                                        let depth = 0;
                                        const start = i;
                                        while (i < expr.length) {
                                                const ch = expr.charAt(i);
                                                if (ch === '(') depth++;
                                                else if (ch === ')') depth--;
                                                i++;
                                                if (depth === 0) break;
                                        }
                    const call = expr.slice(start, i);
                    tokens.push(id + call);
                    continue;
                }

                // ----- 9b. plain identifier ------------------------------------
                tokens.push(id);
                continue;
            }

            // ---- 10. numbers (decimal / integer / scientific numbers) ---------------------------------
            const num = consume(reNumber);
            if (num) { tokens.push(num); continue; }

            // ---- 11. Arithmetic operators ---------------------------------
            const arop = consume(reArithOp);
            if (arop) { tokens.push(arop); continue; }

            // ---- 12. Boolean operators ---------------------------------
            const boop = consume(reBoolOp);
            if (boop) { tokens.push(boop); continue; }

            // ---- 13. Relational operators ---------------------------------
            const reop = consume(reRelOp);
            if (reop) { tokens.push(reop); continue; }

            // ---- 14. any other single non‑space character -------------------------
            const oth = consume(reOther);
            if (oth) { tokens.push(oth); continue; }
        }

        return tokens;
    }
    // END of complexToleniser

    function isValidVarExprArithmetic(s: string): boolean {
            // Check for valid variable arithmetic without parentheses (strips out parentheses)
            // variable OR number at the start, then zero‑or‑more operator‑operand pairs
            //\d+(?:\.\d+)?)
            // Consider adding  unary plus/minus at the start, as shown below 2 options still to test
            //const simpleVar=^(?:[+\-]?(?:[A-Z][A-Z0-9]*|\d+(?:\.\d+)?))(?:[+\-*/^](?:[+\-]?(?:[A-Z][A-Z0-9]*|\d+(?:\.\d+)?)))*$
            //const simpleVar= /^(?:[+\-]?(?:[A-Z][A-Z0-9]*|\d.+))(?:[+\-*/^](?:[+\-]?(?:[A-Z][A-Z0-9]*|\d.+)))*$/;
            // Consider scientific numbers as part of the expression
            //const simpleVar = /^(?:[A-Z][A-Z0-9]*|\d.+)(?:[+\-*/^](?:[A-Z][A-Z0-9]*|\d+(?:\.\d+)?))*$/; //weird but \d.+ needed in 1st and \d+(?:\.\d+)?) in the second
            // Final version including scientific notation and unary plus/minus at the start of numbers but doesn't give true for operators, use isValidArithmetic for that
            const simpleVar = /^(?:[A-Z][A-Z0-9]*|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)(?:[+\-*/^](?:[A-Z][A-Z0-9]*|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?))*$/;

            // don't include minus as 2 minus make a plus, 3 minus make a minus and 4 minus make a plus ...
            if (/[+|*|/|^]{2}/.test(s)) return false; 

            // Special case for empty parentheses
            if (s === '()') return false;

            // Check for balanced parentheses and then test against simple variable arithmetic
            if (isBalancedParentheses(s)) {
                    //console.log('Balanced parenthesis');
                    // Check for valid parenthesized expression
                    const sStrip=String(s).replace(/[\s[(|)]/g, '');
                    //console.log('stripped out parenthesis and tested against simpleVar', sStrip);
                    return simpleVar.test(sStrip); //also covers LN(num) and EXP(num)
            } 
            return false;
    } // END of isValidVarExprArithmetic

    function isValidArithmetic(rawArith: string): boolean {
            //Note under the main checks, whitespace between numbers will be flagged as an error as MTX BASIC editor would remove.
            // 1 Strip *all* whitespace characters (space, tab, newline, etc.)
            const s = rawArith.replace(/\s+/g, '');

            // don't include minus as 2 minus make a plus, 3 minus make a minus and 4 minus make a plus ...
            if (/[+|*|/|^]{2}/.test(s)) return false; 

            // Check for balanced parentheses or use function isBalancedParentheses()
            //const openParens = s.split('(').length - 1;
            //const closeParens = s.split(')').length - 1;

            // Regex that enforces the rules described above
            // regex is a full-grammar checker
            const simpleArith1 = /^[+\-]?(?:\d+(\.\d*)?|\.\d+)(?:[eE][+\-]?\d+)?(?:[+\-*/^()]([+\-]?(?:\d+(\.\d*)?|\.\d+)(?:[eE][+\-]?\d+)?))*$/;             // integer or decimal or scientific
            
            //  simple character-class checker — it accepts any string made only of digits, dot, sign chars, operator chars and parens, so a single "+" matches.
            const simpleArith2 = /^[\d.+\-*/^()]+$/;

            // Special case for empty parentheses
            if (s === '()') return false;

            // Check for balanced parentheses
            if (isBalancedParentheses(s)) {
                    //console.log('Balanced parenthesis');
                    // Check for valid parenthesized expression
                    const sStrip=String(s).replace(/[\s[(|)]/g, ''); 
                    //console.log('stripped out parenthesis', sStrip);
                    if (simpleArith1.test(sStrip) || simpleArith2.test(sStrip)) {
                            return true;         
                    }   
            } 
            return false;

            // start of string then optional leading sign then first number (int or decimal)
            //  repeat zero‑or‑more times then a single operator that is NOT followed by another operator
            // operand: number or simple parenthesised group then end of string

            //return simpleArith.test(s) && openParens === closeParens;
    }

// Used by the IF handler...
function classifyExpr(expr: string): { hasString: boolean; hasNumeric: boolean } {
    const trimmed = expr.trim();
    if (!trimmed) return { hasString: false, hasNumeric: false };

    const simpleVar = /^[A-Za-z][A-Za-z0-9]*\$?$/.test(trimmed);
    if (simpleVar) return { hasString: trimmed.endsWith('$'), hasNumeric: !trimmed.endsWith('$') };

    const upper = trimmed.toUpperCase();

    const stringReturningFns = /^(CHR\$|LEFT\$|MID\$|RIGHT\$|STR\$|SPK\$|TIME\$)/i;
    if (stringReturningFns.test(trimmed)) return { hasString: true, hasNumeric: false };

    const numericReturningFns = /^(ABS|ASC|ATN|COS|EXP|INP|INT|LEN|LN|MOD|PEEK|SGN|SIN|SQR|TAN|USR|VAL|PI|RND|SOUND|RND)/i;
    if (numericReturningFns.test(trimmed)) return { hasString: false, hasNumeric: true };

    const strParts = stringExprParts(trimmed);
    const numParts = varExprParts(trimmed);
    return {
        hasString: strParts.some(r => r[1] === true),
        hasNumeric: numParts.some(r => r[1] === true)
    };
}    

    function isSpaceNeeded(input: string): boolean {
    //exclude these commands . Still to decide on AND, NOT and OR
    //use of Set rather just an array uses setname.has(item) versus just an array arrayname.includes(item) - set is better for multiple look ups
    //prevents false positives where INK previously threw  up a space required error for INKEY$.
    const noSpaceAllowed= new Set (['ABS','ASC','ATN','CHR$','CLEAR','CLS','CODE','CONT','COS','DSI','EXP','GR\$','INKEY\$','INP','INT','LEFT$','LN','MID$','MOD',
            'NODDY','PI','RETURN','RIGHT$','RND','SGN','SIN','SPK$','SQR','STOP','STR$','TAN','TIME$','USR','VAL'               
    ]); // set exludes the function LEN which requires a space
    // capture the command token (letters and optional trailing $)
    const m = input.trim().toUpperCase().match(/^([A-Z]+\$?)/);
    const cmd = m ? m[1] : '';
    //console.log('cmd = ',cmd);
    if (!cmd) return true; // no command found -> treat as requires space
    //console.log('!noSpaceAllowed boolean =', !noSpaceAllowed.has(cmd))
    return !noSpaceAllowed.has(cmd); // returns true if requires a space and false if no space required
    }

    function isNoSpaceFound(expr: string): {spaceMissingYes:boolean ; msg0: string} { 
        const s = expr; //don't trim as s!== ' ' will never be triggered.
        let msgStr='';
        if ((s !== ' ' || s.indexOf(' ')===-1) && !(/\s{2,}/.test(s))) { // can use indexOf to detect no space
            msgStr=`MTX Command requires a single space (got none) between the command and the first argument/parameter `;
            return {spaceMissingYes:true, msg0:msgStr};}

        return {spaceMissingYes:false, msg0:msgStr};
    } // END of isNoSpace function

    function isMultiSpaceFound(expr: string): {multiSpaceYes:boolean ; msg2: string} {
        const s = expr; //don't trim as s!== ' ' will never be triggered.
        let msgStr='';
        if (/\s{2,}/.test(s)) { // can use indexOf to detect no space
            msgStr=`MTX Command requires a single space (got > 1) between the command and the first argument/parameter)`;
            return {multiSpaceYes:true, msg2:msgStr};}

        return {multiSpaceYes:false, msg2:msgStr};
    } // END of isMultiSpace function

    // helper: split a line into top-level segments at ':' 
    function splitLineSegments(text: string): { text: string; start: number }[] {
            // Strip leading line number if present
            const lineNumMatch = /^\s*\d+\s+/.exec(text);
            if (lineNumMatch) {
                    // Adjust start position to skip line number
                    const skipLen = lineNumMatch[0].length;
                    text = text.slice(skipLen);
            }

            const segments: { text: string; start: number }[] = [];
            let inString = false;
            let segStart = 0;
            
            for (let i = 0; i < text.length; i++) {
                    const ch = text[i];
                    if (ch === '"') {
                    inString = !inString;
                    } else if (!inString && ch === ':') {
                    segments.push({ 
                            text: text.slice(segStart, i),
                            // Preserve original column by adding back line number length if it was stripped
                            start: segStart + (lineNumMatch ? lineNumMatch[0].length : 0)
                    });
                    segStart = i + 1;
                    }
            }
            
            if (segStart < text.length) {
                    segments.push({ 
                    text: text.slice(segStart),
                    start: segStart + (lineNumMatch ? lineNumMatch[0].length : 0)
                    });
            }
            
            return segments;
    } // END of splitLineSegments function

    function splitTopLevel(s: string): string[] {
        const parts: string[] = [];
        let depth = 0;
        let cur = '';
        let i = 0;
        while (i < s.length) {
        const ch = s[i];

        // handle quoted strings (single or double) as atomic, allow escapes like \" or \'
        if (ch === '"' ) { //not required || ch === "'"
        const quote = ch;
        cur += ch;
        i++;
        while (i < s.length) {
                const c = s[i];
                cur += c;
                if (c === '\\') { // escape next char
                i++;
                if (i < s.length) { cur += s[i]; }
                } else if (c === quote) {
                i++;
                break;
                }
                i++;
        }
        continue;
        }

        // parentheses depth tracking (math / grouped expressions)
        if (ch === '(') { depth++; cur += ch; i++; continue; }
        if (ch === ')') { depth = Math.max(0, depth - 1); cur += ch; i++; continue; }

        // treat + at top level as part of the token (string concatenation or addition)
        // we only need to avoid splitting when + is used inside an entry; so include it normally
        // splitting separators only apply when depth === 0 and not inside quotes
        if ((ch === ',' || ch === ';') && depth === 0) {
        if (cur.trim() !== '') parts.push(cur.trim());
        cur = '';
        i++;
        continue;
        }

        cur += ch;
        i++;
        }

        if (cur.trim() !== '') parts.push(cur.trim());
        return parts;
        } // END of splitTopLevel 

// helper: detect top-level parenthesized boolean/comparison expressions such as `(PX=31)`
// returns true for "(...)" where the top-level inside contains a relational operator
function isParenthesisedBooleanExpression(expr: string): boolean {
    const s = expr.trim();
    if (!s.startsWith('(') || !s.endsWith(')')) return false;
    if (!isBalancedParentheses(s)) return false;
    const inner = s.slice(1, -1);
    let depth = 0;
    let inString = false;
    const keywordRe = /\b(?:AND|OR|NOT)\b/i;

    for (let i = 0; i < inner.length; i++) {
        const ch = inner[i];
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '(') { depth++; continue; }
        if (ch === ')') { if (depth > 0) depth--; continue; }

        if (depth === 0) {
            // relational operators: =, <>, <=, >=, <, >
            if (inner.substr(i, 2) === '<>' || inner.substr(i, 2) === '<=' || inner.substr(i, 2) === '>=' ) return true;
            if (ch === '=' || ch === '<' || ch === '>') return true;
        }
    }

    // if boolean keywords appear at top-level (AND/OR/NOT), accept as boolean expression
    if (keywordRe.test(inner)) return true;

    return false;
} // END of isParenthesisedBooleanExpression     

// helper: detect AND/OR/NOT tokens that are missing whitespace separators
function findBooleanOperatorSpacingIssues(expr: string) {
    const issues: { start: number; end: number; token: string; fragment: string }[] = [];
    const boolRe = /(AND|OR|NOT)/gi;
    let match: RegExpExecArray | null;
    while ((match = boolRe.exec(expr)) !== null) {
        const token = match[1]?.toUpperCase() ?? '';
        const start = match.index ?? 0;
        const end = start + token.length;
        const prevChar = start > 0 ? expr.charAt(start - 1) : '';
        const nextChar = end < expr.length ? expr.charAt(end) : '';
        const prevIllegal = /[A-Za-z0-9$]/.test(prevChar);
        const nextIllegal = /[A-Za-z0-9$]/.test(nextChar);
        if (prevIllegal || nextIllegal) {
            const fragStart = prevIllegal ? start - 1 : start;
            const fragEnd = nextIllegal ? end + 1 : end;
            issues.push({
                start: Math.max(0, fragStart),
                end: Math.min(expr.length, fragEnd),
                token,
                fragment: expr.slice(Math.max(0, fragStart), Math.min(expr.length, fragEnd))
            });
        }
    }
    return issues;
} // END of findBooleanOperatorSpacingIssues

function validateBooleanConnectors(
    expr: string,
    spans: BoolSpan[],
    report: (spanStart: number, spanEnd: number, fragment: string) => void
) {
    // If there are 0 or 1 spans, there are no connectors to validate
    if (spans.length <= 1) {
        return;
    }

    let cursor = 0;
    const flushGap = (nextStart: number) => {
        if (nextStart <= cursor) return;
        const rawGap = expr.slice(cursor, nextStart);
        const trimmed = rawGap.trim();
        
        // Empty gap or valid boolean connector - OK
        if (!trimmed || /^(AND|OR|NOT)$/i.test(trimmed)) return;
        
        // Skip if the gap contains only arithmetic operators and operands
        // This handles cases like "B+C+3" which is part of a comparison RHS
        // Pattern: variables, numbers, arithmetic operators (+,-,*,/,^), parentheses, commas, spaces
        if (/^[\s\w\d.+\-*/^(),]+$/.test(trimmed)) {
            // Additional check: must not contain standalone AND/OR/NOT as words
            // (they would be invalid if not properly separated)
            if (!/\b(AND|OR|NOT)\b/i.test(trimmed)) {
                return; // It's a valid arithmetic expression, not an invalid connector
            }
        }
        
        const leading = rawGap.length - rawGap.replace(/^\s+/, '').length;
        const trailing = rawGap.replace(/\s+$/, '').length;
        const startIdx = cursor + leading;
        const endIdx = cursor + trailing;
        report(startIdx, endIdx, trimmed);
    };

    spans.forEach(span => {
        flushGap(span.spanStart ?? cursor);
        cursor = span.spanEnd ?? cursor;
    });
    flushGap(expr.length);
} // END of validateBooleanConnectors

function splitBooleanExpression(expr: string): BoolSpan[] {
    const spans: BoolSpan[] = [];
    let inString = false;
    let depth = 0;
    let clauseStart = -1;
    let relopSeen = false;

    const flushClause = (idx: number) => {
        if (clauseStart !== -1 && relopSeen) {
            spans.push({ spanStart: clauseStart, spanEnd: idx });
            clauseStart = -1;
            relopSeen = false;
        }
    };

    for (let i = 0; i < expr.length; i++) {
        const ch = expr[i];

        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;

        if (ch === '(') { depth++; continue; }
        if (ch === ')') {
            if (depth > 0) depth--;
            continue;
        }

        if (depth !== 0) continue;

        // Start a new clause on first non-whitespace
        if (clauseStart === -1 && !/\s/.test(ch)) clauseStart = i;

        // Detect relational operators
        if ('=<>'.includes(ch)) {
            relopSeen = true;
            // Handle two-character operators like <=, >=, <>
            if ((ch === '<' || ch === '>') && i + 1 < expr.length && 
                (expr[i + 1] === '=' || expr[i + 1] === '>')) {
                i++;
            }
            continue;
        }

        // Arithmetic operators are part of the expression, not separators
        if ('+-*/^'.includes(ch)) {
            continue;
        }

        // Check for boolean keywords (AND, OR, NOT) at word boundaries
        if (/[A-Za-z]/.test(ch)) {
            let j = i + 1;
            while (j < expr.length && /[A-Za-z0-9_$]/.test(expr[j])) j++;
            const word = expr.slice(i, j).toUpperCase();

            if (word === 'AND' || word === 'OR') {
                // Flush current clause before the boolean operator
                flushClause(i);
                clauseStart = -1;
                relopSeen = false;
                i = j - 1; // Skip the rest of the word
                continue;
            }
            
            if (word === 'NOT') {
                // NOT can appear at the start of a clause or after AND/OR
                // Flush current clause if we have one
                if (clauseStart !== -1 && relopSeen) {
                    flushClause(i);
                }
                clauseStart = -1;
                relopSeen = false;
                i = j - 1; // Skip the rest of the word
                continue;
            }

            // It's a regular identifier (variable/function name)
            // Skip to end of identifier
            i = j - 1;
            continue;
        }
    }

    // Flush any remaining clause
    flushClause(expr.length);
    return spans;
} // END of splitBooleanExpression //END of splitBooleanExpression

//a -ve number trims from the last entry backwards. A +ve trims from the 1st entry forward
 function trimCommaList(s: string, n = 3): string { 
  const items = s
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (n === 0) return '';

  const result =
    n > 0 ? items.slice(0, n) : items.slice(n); // slice(n) with negative n keeps last |n|

  return result.join(', ');
} //END of trimCommaList  

function trimArray<T>(arr: T[] | null | undefined, n = 3): T[] {
  const safe = arr ?? [];
  if (n === 0) return [];
  return n > 0 ? safe.slice(0, n) : safe.slice(n);
} //END trim arrays

function splitCommandsByColon(text: string): string[] {
    //same as splitLineSegments but returns string array only and doesn't remove leading line numbers
    const chunks: string[] = [];
    let current = '';
    let depth = 0;
    let inString = false;
    for (let idx = 0; idx < text.length; idx++) {
        const ch = text[idx];
        if (ch === '"') { inString = !inString; current += ch; continue; }
        if (inString) { current += ch; continue; }
        if (ch === '(') { depth++; current += ch; continue; }
        if (ch === ')') { depth = Math.max(0, depth - 1); current += ch; continue; }
        if (depth === 0 && ch === ':') {
            if (current.trim()) chunks.push(current.trim());
            current = '';
            continue;
        }
        current += ch;
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
} // END of splitCommandsByColon


// NODDY command specification
interface NoddyCommand {
    id: string;
    pattern: RegExp;
    hasArg: boolean;
    argType?: 'pagename' | 'label' | 'char_label' | 'none';
    description: string;
}

// NODDY page types
interface NoddyPage {
    name: string;
    lineStart: number;
    lineEnd: number;
    type: 'text' | 'program';
    content: string[];
}

// NODDY command specification
interface NoddyCommand {
    id: string;
    pattern: RegExp;
    hasArg: boolean;
    argType?: 'pagename' | 'label' | 'char_label' | 'none';
    description: string;
}

// NODDY label pattern - labels are prefixed with ^
const noddyLabelPattern = /^\^(\w+)\s*/;

// NODDY page title pattern
const noddyPageTitlePattern = /^Noddy page title is (\w+)\s*$/;

// NODDY command definitions - includes full names and abbreviations
const noddyCommands: NoddyCommand[] = [
    // *A or *ADVANCE - advance to next page
    { id: 'ADVANCE', pattern: /^\*(?:A|ADVANCE)\s*$/, hasArg: false, argType: 'none', description: 'Advance to next page' },
    
    // *B or *BRANCH <label> - unconditional branch to label
    { id: 'BRANCH', pattern: /^\*(?:B|BRANCH)\s+(\w+)\s*$/, hasArg: true, argType: 'label', description: 'Unconditional branch to label' },
    
    // *D or *DISPLAY <pagename>. - display a text page (note the trailing period)
    { id: 'DISPLAY', pattern: /^\*(?:D|DISPLAY)\s+(\w+)\.\s*$/, hasArg: true, argType: 'pagename', description: 'Display a text page' },
    
    // *E or *ENTER - wait for user input
    { id: 'ENTER', pattern: /^\*(?:E|ENTER)\s*$/, hasArg: false, argType: 'none', description: 'Wait for user input' },
    
    // *G or *GOTO <label> - goto label (similar to BRANCH)
    { id: 'GOTO', pattern: /^\*(?:G|GOTO)\s+(\w+)\s*$/, hasArg: true, argType: 'label', description: 'Go to label' },
    
    // *I or *IF <char>,<label> - conditional branch on character input
    { id: 'IF', pattern: /^\*(?:I|IF)\s+([A-Za-z0-9]),(\w+)\s*$/, hasArg: true, argType: 'char_label', description: 'Conditional branch on character input' },
    
    // *L or *LIST - list the noddy program
    { id: 'LIST', pattern: /^\*(?:L|LIST)\s*$/, hasArg: false, argType: 'none', description: 'List the Noddy program' },
    
    // *O or *OFF - turn off/exit noddy
    { id: 'OFF', pattern: /^\*(?:O|OFF)\s*$/, hasArg: false, argType: 'none', description: 'Turn off/exit Noddy' },
    
    // *P or *PAUSE - wait for keypress
    { id: 'PAUSE', pattern: /^\*(?:P|PAUSE)\s*$/, hasArg: false, argType: 'none', description: 'Wait for keypress' },
    
    // *R or *RETURN - return to BASIC
    { id: 'RETURN', pattern: /^\*(?:R|RETURN)\s*$/, hasArg: false, argType: 'none', description: 'Return to BASIC program' },
    
    // *S or *STACK - stack operation (push current position)
    { id: 'STACK', pattern: /^\*(?:S|STACK)\s*$/, hasArg: false, argType: 'none', description: 'Stack current position for later return' },
];


/**
 * Parse NODDY content from document starting at a given line
 */
// Update parseNoddyContent to validate program page first line:

function parseNoddyContent(lines: string[], startLine: number): {
    pages: NoddyPage[];
    errors: { line: number; message: string; start: number; end: number }[];
} {
    const pages: NoddyPage[] = [];
    const errors: { line: number; message: string; start: number; end: number }[] = [];
    
    let currentPage: NoddyPage | null = null;
    let textLineCount = 0;
    let isFirstContentLine = false;
    
    for (let i = startLine; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Check for page title
        const titleMatch = noddyPageTitlePattern.exec(line);
        if (titleMatch) {
            // Save previous page
            if (currentPage) {
                currentPage.lineEnd = i - 1;
                pages.push(currentPage);
            }
            
            // Start new page
            currentPage = {
                name: titleMatch[1],
                lineStart: i,
                lineEnd: i,
                type: 'text', // Will be updated if we find NODDY commands
                content: []
            };
            textLineCount = 0;
            isFirstContentLine = true; // Next non-empty line is the first content line
            continue;
        }
        
        if (currentPage) {
            // Skip empty lines for first content line check
            if (isFirstContentLine && trimmed.length === 0) {
                currentPage.content.push(line);
                continue;
            }
            
            // Check if this is a NODDY command or label (indicates program page)
            if (trimmed.startsWith('*') || trimmed.startsWith('^')) {
                currentPage.type = 'program';
            }
            
            // For program pages, validate first content line matches page name
            if (isFirstContentLine && trimmed.length > 0) {
                isFirstContentLine = false;
                
                // Check if first content line is the program name (indicates program page)
                // The first line should be JUST the program name with no other text
                if (trimmed === currentPage.name) {
                    currentPage.type = 'program';
                }
                // If first line has commands/labels, it's a program but missing the name line
                else if (trimmed.startsWith('*') || trimmed.startsWith('^')) {
                    currentPage.type = 'program';
                    errors.push({
                        line: i,
                        message: `Program page "${currentPage.name}" must have "${currentPage.name}" as the first line (before any commands)`,
                        start: 0,
                        end: trimmed.length
                    });
                }
                // Otherwise it's a text page - no validation needed for first line
            }
            
            currentPage.content.push(line);
            textLineCount++;
            
            // Text pages have max 24 rows
            if (currentPage.type === 'text' && textLineCount > 24) {
                errors.push({
                    line: i,
                    message: `Text page "${currentPage.name}" exceeds maximum of 24 rows`,
                    start: 0,
                    end: line.length
                });
            }
            
            // Text pages have max 40 characters per line
            if (currentPage.type === 'text' && line.length > 40) {
                errors.push({
                    line: i,
                    message: `Text line exceeds maximum of 40 characters (got ${line.length})`,
                    start: 40,
                    end: line.length
                });
            }
        }
    }
    
    // Don't forget the last page
    if (currentPage) {
        currentPage.lineEnd = lines.length - 1;
        pages.push(currentPage);
    }
    
    return { pages, errors };
} 


/**
 * Validate a NODDY program page
 */
/**
 * Validate a NODDY program page
 */
function validateNoddyProgram(
    page: NoddyPage,
    allPages: NoddyPage[],
    lineOffset: number
): { line: number; message: string; start: number; end: number }[] {
    const errors: { line: number; message: string; start: number; end: number }[] = [];
    const definedLabels = new Set<string>();
    const usedLabels: { label: string; line: number; start: number }[] = [];
    const textPageNames = new Set(allPages.filter(p => p.type === 'text').map(p => p.name));
    
    // First content line should be the program name - skip it for command validation
    let foundProgramName = false;
    let programNameLineIndex = -1;
    
    // Find and validate program name line
    for (let i = 0; i < page.content.length; i++) {
        const trimmed = page.content[i].trim();
        if (trimmed.length === 0) continue; // Skip empty lines
        
        if (trimmed === page.name) {
            foundProgramName = true;
            programNameLineIndex = i;
            break;
        } else {
            // First non-empty line is not the program name
            errors.push({
                line: lineOffset + i + 1,
                message: `Program page must start with "${page.name}" on its own line`,
                start: 0,
                end: trimmed.length
            });
            break;
        }
    }
    
    if (!foundProgramName && programNameLineIndex === -1) {
        errors.push({
            line: lineOffset + 1,
            message: `Program page "${page.name}" is missing the program name as first line`,
            start: 0,
            end: page.name.length
        });
    }
    
    // First pass: collect defined labels (skip program name line)
    for (let i = 0; i < page.content.length; i++) {
        // Skip the program name line
        if (i === programNameLineIndex) continue;
        
        const line = page.content[i].trim();
        const labelMatch = noddyLabelPattern.exec(line);
        if (labelMatch) {
            const labelName = labelMatch[1];
            if (definedLabels.has(labelName)) {
                errors.push({
                    line: lineOffset + i + 1,
                    message: `Duplicate label "^${labelName}"`,
                    start: 0,
                    end: labelMatch[0].length
                });
            }
            definedLabels.add(labelName);
        }
    }
    
    // Second pass: validate commands and collect used labels (skip program name line)
    for (let i = 0; i < page.content.length; i++) {
        // Skip the program name line
        if (i === programNameLineIndex) continue;
        
        const line = page.content[i];
        const trimmed = line.trim();
        const actualLine = lineOffset + i + 1;
        
        // Skip empty lines
        if (!trimmed) continue;
        
        // Handle labels - can have commands on the same line after the label
        let commandPart = trimmed;
        if (trimmed.startsWith('^')) {
            const labelMatch = noddyLabelPattern.exec(trimmed);
            if (!labelMatch) {
                errors.push({
                    line: actualLine,
                    message: `Invalid label syntax: "${trimmed}"`,
                    start: 0,
                    end: trimmed.length
                });
                continue;
            }
            // Get the part after the label
            commandPart = trimmed.slice(labelMatch[0].length).trim();
            if (!commandPart) continue; // Label only line is valid
        }
        
        // Handle commands - can have multiple per line
        const cmdParts = commandPart.split(/(?=\*)/);
        let charPos = line.indexOf(commandPart);
        
        for (const part of cmdParts) {
            const cmd = part.trim();
            if (!cmd) continue;
            
            if (!cmd.startsWith('*')) {
                // Text after label without command is invalid in program pages
                errors.push({
                    line: actualLine,
                    message: `Invalid NODDY syntax: "${cmd}" (commands must start with *)`,
                    start: charPos,
                    end: charPos + cmd.length
                });
                charPos += cmd.length;
                continue;
            }
            
            // Try to match against known commands
            let matched = false;
            for (const noddyCmd of noddyCommands) {
                const match = noddyCmd.pattern.exec(cmd);
                if (match) {
                    matched = true;
                    
                    // Validate arguments based on type
                    if (noddyCmd.argType === 'pagename') {
                        const pageName = match[1];
                        if (!textPageNames.has(pageName)) {
                            errors.push({
                                line: actualLine,
                                message: `Unknown text page "${pageName}" in *${noddyCmd.id}`,
                                start: charPos,
                                end: charPos + cmd.length
                            });
                        }
                    } else if (noddyCmd.argType === 'label') {
                        const labelName = match[1];
                        usedLabels.push({ label: labelName, line: actualLine, start: charPos });
                    } else if (noddyCmd.argType === 'char_label') {
                        // For *IF char,label - validate both parts
                        const charInput = match[1];
                        const labelName = match[2];
                        
                        // Validate character is single alphanumeric
                        if (!/^[A-Za-z0-9]$/.test(charInput)) {
                            errors.push({
                                line: actualLine,
                                message: `*IF: character must be single alphanumeric (got "${charInput}")`,
                                start: charPos,
                                end: charPos + cmd.length
                            });
                        }
                        
                        usedLabels.push({ label: labelName, line: actualLine, start: charPos });
                    }
                    break;
                }
            }
            
            if (!matched) {
                // Check for common errors
                const displayNoperiod = /^\*(?:D|DISPLAY)\s+\w+\s*$/.exec(cmd);
                if (displayNoperiod) {
                    errors.push({
                        line: actualLine,
                        message: `*DISPLAY command missing trailing period: "${cmd}" (should end with ".")`,
                        start: charPos,
                        end: charPos + cmd.length
                    });
                } else if (/^\*(?:B|BRANCH|G|GOTO)\s*$/.exec(cmd)) {
                    errors.push({
                        line: actualLine,
                        message: `*${cmd.slice(1)} requires a label argument`,
                        start: charPos,
                        end: charPos + cmd.length
                    });
                } else if (/^\*(?:I|IF)\s*$/.exec(cmd) || /^\*(?:I|IF)\s+[^,]+\s*$/.exec(cmd)) {
                    errors.push({
                        line: actualLine,
                        message: `*IF requires format: *IF <char>,<label>`,
                        start: charPos,
                        end: charPos + cmd.length
                    });
                } else {
                    errors.push({
                        line: actualLine,
                        message: `Unknown or malformed NODDY command: "${cmd}"`,
                        start: charPos,
                        end: charPos + cmd.length
                    });
                }
            }
            
            charPos += cmd.length + 1;
        }
    }
    
    // Check for undefined labels
    for (const used of usedLabels) {
        if (!definedLabels.has(used.label)) {
            errors.push({
                line: used.line,
                message: `Undefined label "^${used.label}"`,
                start: used.start,
                end: used.start + used.label.length + 1
            });
        }
    }
    
    return errors;
}

/**
 * Check if a line is a NODDY trigger line
 */
function isNoddyTrigger(line: string): boolean {
    return /^\s*\d+\s+NODDY\s*$/i.test(line);
}

/**
 * Get all PLOD references from BASIC code
 */
function findPlodReferences(lines: string[]): { line: number; progName: string; start: number }[] {
    const refs: { line: number; progName: string; start: number }[] = [];
    const plodPattern = /PLOD\s+"(\w+)"/gi;
    
    for (let i = 0; i < lines.length; i++) {
        let match;
        while ((match = plodPattern.exec(lines[i])) !== null) {
            refs.push({
                line: i,
                progName: match[1],
                start: match.index
            });
        }
    }
    
    return refs;
}

// Exports: named exports so other files can import what they need
export {
        isHexNumber,
        parseSignedHex,
        parseHex,
        isValidVarName,
        isValidStrVarName,
        isValidString,
        isBalancedParentheses,
        isBalancedDoubleQuotes,
        stripAllCharacters,
        stripOuterParentheses,
        convertToNumber,
        stringExprParts,
        varExprParts,
        captureParenthesesGroup,
        simpleTokeniser,
        complexTokeniser,
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
        splitCommandsByColon,
        parseNoddyContent,
        validateNoddyProgram,
        isNoddyTrigger,
        findPlodReferences,
        NoddyPage
};
