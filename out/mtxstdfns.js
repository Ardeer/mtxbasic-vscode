"use strict";
// stdFns.ts
// author A F Wilson
// 19-Nov-2025
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHexNumber = isHexNumber;
exports.parseSignedHex = parseSignedHex;
exports.parseHex = parseHex;
exports.isValidVarName = isValidVarName;
exports.isValidStrVarName = isValidStrVarName;
exports.isValidString = isValidString;
exports.isBalancedParentheses = isBalancedParentheses;
exports.isBalancedDoubleQuotes = isBalancedDoubleQuotes;
exports.stripAllCharacters = stripAllCharacters;
exports.stripOuterParentheses = stripOuterParentheses;
exports.convertToNumber = convertToNumber;
exports.stringExprParts = stringExprParts;
exports.varExprParts = varExprParts;
exports.captureParenthesesGroup = captureParenthesesGroup;
exports.simpleTokeniser = simpleTokeniser;
exports.complexTokeniser = complexTokeniser;
exports.isValidVarExprArithmetic = isValidVarExprArithmetic;
exports.isValidArithmetic = isValidArithmetic;
exports.classifyExpr = classifyExpr;
exports.isSpaceNeeded = isSpaceNeeded;
exports.isNoSpaceFound = isNoSpaceFound;
exports.isMultiSpaceFound = isMultiSpaceFound;
exports.splitLineSegments = splitLineSegments;
exports.splitTopLevel = splitTopLevel;
exports.isParenthesisedBooleanExpression = isParenthesisedBooleanExpression;
exports.findBooleanOperatorSpacingIssues = findBooleanOperatorSpacingIssues;
exports.validateBooleanConnectors = validateBooleanConnectors;
exports.splitBooleanExpression = splitBooleanExpression;
exports.trimCommaList = trimCommaList;
exports.trimArray = trimArray;
exports.splitCommandsByColon = splitCommandsByColon;
exports.parseNoddyContent = parseNoddyContent;
exports.validateNoddyProgram = validateNoddyProgram;
exports.isNoddyTrigger = isNoddyTrigger;
exports.findPlodReferences = findPlodReferences;
// check if the number is hexadecimal (16-bit UNSIGNED hexadecimal is allowed)
function isHexNumber(expr) {
    return typeof expr === 'string' && /^[#][0-9A-Fa-f]{1,4}$/.test(expr);
    // optional sign, then # , then 1‑4 hex digits, whole‑string match
    //return /^[+-]?[#][0-9A-Fa-f]{1,4}$/.test(expr); // use if what SIGNED but must use - or + in front of the hex number.
} //  END of isHexNumber
function parseSignedHex(s) {
    var m = s.match(/^([#])([0-9A-Fa-f]{1,4})$/);
    if (!m)
        return null;
    var raw = parseInt(m[2], 16); // 0‑65535 (m[2] is guaranteed by the regex and the null check)
    // Convert to signed 16‑bit:
    var signed = raw & 0x8000 ? raw - 0x10000 : raw;
    // 16‑bit signed range: -32768 … 32767
    // negative numbers starts at #8000 (-32768) to #FFFF (-1)
    // postive numbers start at 0 to #7FFF
    if (signed < -32768 || signed > 32767)
        return null;
    return signed; // e.g. #FFA0 → -96
} //  END of isHexadecimalNumber
function parseHex(s) {
    var m = s.match(/^([+-]?)([#])([0-9A-Fa-f]{1,4})$/);
    if (!m)
        return null; // not a valid literal
    var sign = m[1] === '-' ? -1 : 1;
    var hexDigits = m[3];
    if (hexDigits) { //check hexDigits is not undefined
        var value = sign * parseInt(hexDigits, 16);
        // 16‑bit signed range: -32768 … 32767
        if (value < 0 || value > 65535)
            return null;
        return value;
    }
    return null;
} //  END of isHexadecimalNumber
function isValidVarName(s) {
    // Reject null/undefined, empty, and literal "()"
    if (!s || s === '()' || s.startsWith('"') || s.endsWith('$'))
        return false;
    // Must start with a letter, then letters/digits allowed (underscore not allowed)
    // Reject string variables that starts with 1 or more numbers followed by 1 or more letters, followed by none or more alphanumerics. 
    // ^[A-Z][A-Z0-9_]*$
    // Allow simple variables (A, ABC) and array subscripts (A(I), Y(H,I))
    // Pattern: variable name optionally followed by (subscripts)
    return /^[A-Z][A-Z0-9]*(?:\([^)]+\))?$/.test(s);
} //END of isValidVarName
function isValidStrVarName(s) {
    // Reject null/undefined, empty, and literal "()" and starts with ". !s replaces s===null || s===undefined
    if (!s || s === '()' || s.startsWith('"'))
        return false;
    // Must start with a letter, then letters/digits allowed (underscore not allowed)
    // Allow simple string variables (A$, ABC$) and string array subscripts (A$(I), F$(C), Y$(H,I))
    // Pattern: variable name + $ + optional (subscripts)
    if (isBalancedParentheses(s)) {
        // Check for valid string variable or string array with subscripts
        // Match: letter + alphanumerics + $ + optional(subscripts)
        return /^[A-Z][A-Z0-9]*\$(?:\([^)]+\))?$/.test(s);
    }
    return false;
} //END of isValidStrVarName
function isValidString(s) {
    if (!s || s === '()')
        return false;
    // Check for balanced parentheses and then test against simple variable arithmetic
    if (isBalancedParentheses(s)) {
        // Check for valid parenthesized expression
        var sStrip = String(s).replace(/[\s[(|)]/g, '');
        if (sStrip.startsWith('"') && sStrip.endsWith('"'))
            return true;
    }
    return false;
} // END of isvalidString
function isBalancedParentheses(s) {
    var count = 0;
    for (var _i = 0, s_1 = s; _i < s_1.length; _i++) {
        var char = s_1[_i];
        if (char === '(')
            count++;
        if (char === ')')
            count--;
        if (count < 0)
            return false;
    }
    return count === 0; //true if condition met
} //END of isBalancedParentheses
function isBalancedDoubleQuotes(s) {
    var count = 0;
    for (var _i = 0, s_2 = s; _i < s_2.length; _i++) {
        var char = s_2[_i];
        if (char === '"')
            count++;
        if (char === '"')
            count--;
        if (count < 0)
            return false;
    }
    return count === 0; //true if condition met
} //END of isBalancedParentheses
function stripAllCharacters(input, chars) {
    // Escape characters that have special meaning in a RegExp (e.g. . * + ? ^ $ \)
    // The 'g' flag replaces all occurrences, not just the first one
    //const escaped = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); //single char only, not useful for ()
    // Build a global RegExp that matches the exact character
    //const regex = new RegExp(escaped, 'g');
    // Escape characters that have special meaning inside a character class
    var escaped = chars.replace(/[-\\^]/g, '\\$&'); // -, \, ^ need escaping
    // Build a global RegExp that matches any of the characters in the class
    var regex = new RegExp("[".concat(escaped, "]"), 'g');
    return String(input).replace(regex, '');
}
function stripOuterParentheses(s) {
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
function convertToNumber(s) {
    // Early type guards
    if (!s)
        return null; //s === null || s === undefined
    // Handle different input types
    if (typeof s === 'number')
        return Number.isFinite(s) ? s : null;
    if (isHexNumber(s)) {
        return parseHex(s);
    }
    if (typeof s === 'string') {
        try { // tiny sandboxed eval for arithmetic-only strings
            // eslint-disable-next-line no-new-func
            // will return a number if '67' or 67 or '(67)' - no need to strip out the parenthesis. Retruns null if 'abc'
            var v = Function('"use strict"; return (' + s + ')')();
            return typeof v === 'number' && Number.isFinite(v) ? v : null;
        }
        catch (_a) {
            return null;
        }
    }
    return null;
} // END of convertToNumber   
function stringExprParts(expr) {
    var s = expr; //  no trim – keep original spacing for regexes
    if (!s)
        return [['', false]];
    // “tuple type”  [string, boolean]
    // “array of tuples”  [string, boolean][]
    //let extractParts: [string, boolean][] = []; this and the line below are equally valid
    var extractParts = [];
    //1. DIM is a special as it can be either a var or a string var DIM A(10,10) or DIM A$(1,4)
    // see additional comments in complexTokeniser function
    if (/^DIM\s(?:[A-Z][A-Z0-9]*\([^)]*\)$)/.test(s)) {
        extractParts.push([s, true]);
        return extractParts;
    } // this should be a standalone statement
    // 2. if function it should have parenthesis and/or nested parenthesis depending on the expression
    var sStrip = stripOuterParentheses(s); // Removes outer parenthesis and returns an updated string  Doesn't remove function ()      
    // Split on + for concatenation, then check each part
    //A common trick is to split on a “+” that is followed by an even number of opening “(” characters without a matching closing “)”. 
    // In JavaScript/TypeScript we can use a balanced‑parentheses look‑ahead:
    var parts = sStrip.split(/\+(?![^(]*\))/).map(function (p) { return p.trim(); }); //backup option to use complexTokeniser() as used by VarExprParts
    parts.every(function (part) {
        // Check each part for: Order changed
        // 3. Nested String function call which requires numeric but returns a string e.g. CHRS(65)
        //if (/^(?:CHR)\$\([^)]([\d+]*|[A-Z][A-Z0-9]*)\)$/.test(part)) return extractParts.push([part, true]);
        if (/^(?:CHR)\$\([^)]([\d+]*|[A-Z][A-Z0-9]*)\)$/.test(part))
            return extractParts.push([part, true]);
        // 4. Nested String function call which have 1 or more arguments, which can be string, string variable or variable or numeric, e.g. LEFT$(B$,2) or CHRS(65)
        // 4a. GR$(x,y,b)
        if (/^(?:GR)\$\((?:\d+|[A-Z][A-Z0-9]*?),(?:\d+|[A-Z][A-Z0-9]*?),(?:\d+|[A-Z][A-Z0-9]*?)\s*\)$/.test(part))
            return extractParts.push([part, true]);
        // 4b. LEFT$(str,num)
        if (/^(?:LEFT)\$\((?:"[^"]*"|[A-Z][A-Z0-9]*\$?),(?:\d+|[A-Z][A-Z0-9]*?)\s*\)$/.test(part))
            return extractParts.push([part, true]);
        // 4c. MID$(str,x,y)
        if (/^(?:MID)\$\((?:"[^"]*"|[A-Z][A-Z0-9]*\$?),(?:\d+|[A-Z][A-Z0-9]*?),(?:\d+|[A-Z][A-Z0-9]*?)\s*\)$/.test(part))
            return extractParts.push([part, true]);
        // 4d. RIGHT$(str,num)
        if (/^(?:RIGHT)\$\((?:"[^"]*"|[A-Z][A-Z0-9]*\$?),(?:\d+|[A-Z][A-Z0-9]*?)\s*\)$/.test(part))
            return extractParts.push([part, true]);
        // 4e. STR$(num/expr) allows 2+2 Returns a string, allows STR$(2+2) but not suitable for nested STR$((3^2)*2-4)
        //if (/^STR\$\((?:[A-Z][A-Z0-9]*|\d+(?:\.\d+)?)(?:\s*[\+\-\*\/\^]\s*(?:[A-Z][A-Z0-9]*|\d+(?:\.\d+)?|\([^)]*$))*\s*\)$/.test(part)){
        //        return extractParts.push([part, true]);
        //}
        if (/^(?:STR\$\()/.test(part)) { //deals with nested
            var stripPart = part.slice(4);
            if (isValidVarExprArithmetic(stripPart)) {
                return extractParts.push([part, true]);
            }
            else {
                return extractParts.push([part, false]);
            }
        }
        // 5. Nested String Command call - no associated argunments
        if (/^(?:INKEY|SPK|TIME)\$\s*$/.test(part))
            return extractParts.push([part, true]);
        // 6. Nested String variable (ends with $)
        if (isValidStrVarName(part) || isValidString(part))
            return extractParts.push([part, true]);
        //if (/^(?:[A-Z][A-Z0-9]*\$)$/.test(part)) return extractParts.push([part, true]);
        // 7. Quoted string option to check with isBalancedDoubleQuotes()
        //if (/^(?:"[^"]*")$/.test(part)) return extractParts.push([part, true]);
        else
            return extractParts.push([part, false]); //not valid
        // if not a match then skips and doesn't complete the rest of the row.
    });
    return extractParts;
} // END of stringExprParts function
function varExprParts(expr) {
    var s = expr; //  no trim – keep original spacing for regexes
    if (!s)
        return [['', false]];
    // “tuple type”  [string, boolean]
    // “array of tuples”  [string, boolean][]
    //let extractParts: [string, boolean][] = []; this and the line below are equally valid
    var extractParts = [];
    var parts = complexTokeniser(s);
    //1. standalone construct DIM is a special as it can be either a var or a string var DIM A(10,10) or DIM A$(1,4)
    // see additional comments in complexTokeniser function
    if (/^DIM\s(?:[A-Z][A-Z0-9]*\([^)]*\)$)/.test(s)) {
        extractParts.push([s, true]);
        return extractParts;
    } //assumes followed by colon, this can be added
    // Split down if variable expression is complex containing simple or variable arithmetic and numerical functions.
    // Split on arithmetic operators (keep operators as tokens) and validate parts
    //(/([+\-*/^])/) OK until you get FUNC(A+B), the + sign or any operator causes incorrect splits
    //covers 1 deep nested functions but not 1 deep variables.
    if (parts.length === 0)
        extractParts.push(['', false]);
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        // Check each part for: Order changed
        // 2. Nested functions excluding specials
        // 2a. LN(x)
        //if (/^(?:LN)\s*\(/.test(part)) { //removed LN as copvered by isValidVarExprArithmetic
        /*        const stripPart=part.slice(2,);
                if (isValidVarExprArithmetic(stripPart)) {
                        extractParts.push([part, true]);
                }
                else {
                        extractParts.push([part, false]);
                }
        } */
        // 2b. FCN(x)
        if (/^(?:ABS|ATN|COS|INP|INT|SGN|SIN|SQR|TAN|USR)\s*\(/.test(part)) { //removed EXP as copvered by isValidVarExprArithmetic
            var stripPart = part.slice(3);
            if (isValidVarExprArithmetic(stripPart)) {
                extractParts.push([part, true]);
            }
            else {
                extractParts.push([part, false]);
            }
        }
        // 2c. MOD(x,y)
        else if (/^(?:MOD)\((?:\d+|[A-Z][A-Z0-9]*?),(?:\d+|[A-Z][A-Z0-9]*?)\s*\)$/.test(part)) {
            extractParts.push([part, true]);
        }
        // 3. other function calls which requires strings but return numeric
        // 3a. ASC()
        else if (/^(?:ASC\()/.test(part)) {
            var stripPart = part.slice(3);
            var ifStrExpr = stringExprParts(stripPart);
            //if (isValidStrVarName(stripPart) || isValidString(stripPart) || (ifStrExpr.every(row => row[1] === true))) {
            if ((ifStrExpr.every(function (row) { return row[1] === true; }))) {
                extractParts.push([part, true]);
            }
            else {
                extractParts.push([part, false]);
            }
        }
        // 3b. LEN () //LEN needs a space after it 
        else if (/^(?:LEN\s\()/.test(part)) {
            var stripPart = part.slice(4);
            var ifStrExpr = stringExprParts(stripPart);
            //if (isValidStrVarName(stripPart) || isValidString(stripPart) || (ifStrExpr.every(row => row[1] === true))){
            if ((ifStrExpr.every(function (row) { return row[1] === true; }))) {
                extractParts.push([part, true]);
            }
            else {
                extractParts.push([part, false]);
            }
        }
        // 3c. VAL()
        else if (/^(?:VAL\()/.test(part)) {
            var stripPart = part.slice(3);
            var ifStrExpr = stringExprParts(stripPart);
            //if (isValidStrVarName(stripPart) || isValidString(stripPart) || (ifStrExpr.every(row => row[1] === true))) {
            if ((ifStrExpr.every(function (row) { return row[1] === true; }))) {
                extractParts.push([part, true]);
            }
            else {
                extractParts.push([part, false]);
            }
        }
        // Check for expression wrapped in parentheses - e.g. (A+B) or (Y(AA,P)*Q)
        // Only strip outer parentheses if they match (opening at pos 0, closing at end)
        else if (part.startsWith('(') && part.endsWith(')')) {
            // Check if outer parentheses match by ensuring depth returns to 0 at the end
            var depth = 0;
            var matchesAtEnd = false;
            for (var i = 0; i < part.length; i++) {
                if (part[i] === '(')
                    depth++;
                if (part[i] === ')')
                    depth--;
                if (depth === 0 && i === part.length - 1)
                    matchesAtEnd = true;
            }
            if (matchesAtEnd) {
                // Strip outer parentheses and validate
                var stripPart = part.slice(1, -1);
                if (isValidVarExprArithmetic(stripPart)) {
                    extractParts.push([part, true]);
                }
                else {
                    extractParts.push([part, false]);
                }
            }
            else {
                extractParts.push([part, false]);
            }
        }
        // 4. simple arithmetic or variable check (including array variables like Y(1,1))
        else if (isValidVarExprArithmetic(part)) {
            extractParts.push([part, true]);
        } //avoids double entry for LN() or EXP() which are causing double check
        else if (isValidArithmetic(part)) {
            extractParts.push([part, true]);
        } // 5. Simple Variable arithmetic with and without parenthesis check
        //else if (!(/([+\-*/^()])/).test(part)) {extractParts.push([part, false]);} 
        else {
            extractParts.push([part, false]);
        } //not valid for everything else
        // if not a match then skips and doesn't complete the rest of the row.
    }
    return extractParts;
} // END of varExprParts function
// capture parentheses groups
function captureParenthesesGroup(s, n) {
    if (s.charAt(n) !== '(')
        return null;
    var depth = 0;
    //const start = n; // replicated in the calling routine
    while (n < s.length) {
        var ch = s.charAt(n);
        if (ch === '(')
            depth++;
        else if (ch === ')')
            depth--;
        n++;
        if (depth === 0)
            break;
    }
    return n;
} //END of captureParenthesesGroup
// simple tokeniser – split on whitespace and keep punctuation as separate tokens
function simpleTokeniser(str) {
    // order is critical, need to check decimal before the last option otherwise '4.5' is split as 4,.,5. The last bit allows vars starting with numbers to avoid splitting down
    var _a;
    var re = /("[^"]*"|[A-Z]{1,}[0-9]*\$(?![A-Z0-9])|(?=[A-Z0-9]*[A-Z])[A-Z0-9]+|\d+(?:\.\d+)?|\S)/g; //LEN\s isn't correct and split down further.
    // regex above matches
    // \"[^"]*\" captures a double‑quoted string (including any lowercase letters) as one token.
    // [A-Z]{1,}[0-9]*\$(?![A-Za-z0-9]) matches the special $‑ending tokens.
    //[A-Z][A-Za-z0-9]* matches regular identifiers that start with a capital letter and may contain only capitals or digits
    // \d+ matches pure numbers but for decimals its \d+(?:\.\d+)?
    // \S catches any remaining single non‑space character (punctuation, symbols, etc.).
    return (_a = str.match(re)) !== null && _a !== void 0 ? _a : [];
} // END of simple tokeniser
// ------------------------------------------------------------
// complexTokeniser – tokenises according to the exact rules
// it doesn't validate the code. allows lowercase to ensure 
// no standalone characters like INKEY$-Ab321 would have been
// INKEY$-A , b , 321 
// ------------------------------------------------------------
function complexTokeniser(expr) {
    var tokens = [];
    var i = 0;
    // --------------------------------------------------------
    // Helper: try to match a RegExp at the current index `i`
    // --------------------------------------------------------
    var consume = function (re) {
        var m = re.exec(expr.slice(i));
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
    var reDim = /^DIM\s(?:[A-Z][A-Z0-9]*\([^)]*\)$)/; // DIM var(expr) or var$(expr)
    var reQuoted = /^"[^"]*"/; // "text"
    var reNumFn = /^(?:ABS|ASC|ATN|COS|EXP|INP|INT|LEN|LN|MOD|PEEK|SGN|SIN|SQR|TAN|USR|VAL)\s*/; // replaced $[^)]*$ with (?=\s*())
    var reStrFn = /^(?:CHR|GR|LEFT|MID|RIGHT|STR)\$\s*/; // replaced $[^)]*$ with (?=\s*()) didn't work with nested parentheses \([^)]*\)* kinda worked
    //const reLenFn   = /^(?:LEN)\s*/;                                     // LEN needs a space after it to be valid but handled separately
    // $‑ending identifier that is a function call (e.g. CHR$(…))
    var reDollarFn = /^[A-Z][A-Z0-9]*\$(?=\s*\()/; //replaced [A-Z]{1,}[0-9] with [A-Z][A-Z0-9]
    var reDollar = /^[A-Z][A-Z0-9]*\$(?![A-Z0-9])/; // plain $‑ending token
    var reIdent = /^(?:[A-Z][A-Z0-9]*\$?)/; // identifiers containing at least one letter
    var reNumber = /^(\d+(?:.\d+)?(?:[eE][+-]?\d+)?)/; // integer or decimal or scientific
    var reArithOp = /^[+\-*/^]/; // Arthimetical operators
    var reBoolOp = /^(?:AND|NOT|OR)\s*/; // Boolean operators
    var reRelOp = /^(<>|<=|>=|=|<|>)/; // Relational operators
    var reOther = /^\S/; // any other single non‑space char
    //const reMultiArithOps = /^[+|*|/|^]{2}/;                            // don't include minus as 2 minus make a plus, 3 minus make a minus and 4 minus make a plus ...  
    // const reBoolExpr =    // refer to pages 143-144 of the manual for boolean expressions (MTX_Series_Owners_Manual.pdf)
    while (i < expr.length) {
        // ---- 1. skip whitespace (LEN needs a space, but we keep it here) ----
        if (/\s/.test(expr.charAt(i))) {
            i++;
            continue;
        }
        // ---- 2. Check for array variables BEFORE generic parentheses ----
        // Match: identifier (possibly ending in $) followed by '('
        // This catches Y(1,1), F$(C), etc. BEFORE they're split into separate tokens
        var arrayVarMatch = /^([A-Z][A-Z0-9]*\$?)(?=\()/.exec(expr.slice(i));
        if (arrayVarMatch) {
            var varName = arrayVarMatch[1];
            i += varName.length;
            // Now capture the subscripts
            var subscriptStart = i;
            var subscriptEnd = captureParenthesesGroup(expr, i);
            if (subscriptEnd) {
                tokens.push(varName + expr.slice(subscriptStart, subscriptEnd));
                i = subscriptEnd;
                continue;
            }
        }
        // ---- 3. capture variable expressions contained within parentheses ----            
        var grp = captureParenthesesGroup(expr, i); //procedurised section of code below
        if (grp) {
            var start = i;
            i = grp; // update i to keep track of progress through the expression
            tokens.push(expr.slice(start, i));
            continue;
        }
        // ---- 4. DIM var(expr) or var$(expr)
        var d = consume(reDim);
        if (d) {
            tokens.push(d);
            continue;
        }
        // ---- 4. quoted string ------------------------------------------------
        var q = consume(reQuoted);
        if (q) {
            tokens.push(q);
            continue;
        }
        // ---- 5. numeric functions --------------------------------------------
        //includes LEN which needs a space after it but validity is checked out with this function
        var numFn = consume(reNumFn);
        //if (numFn) { tokens.push(numFn); continue; }
        var nfgrp = captureParenthesesGroup(expr, i); //procedurised section of code below
        if (nfgrp) {
            var start = i;
            i = nfgrp; // update i to keep track of progress through the expression
            tokens.push(numFn + expr.slice(start, i));
            continue;
        }
        // ---- 6. string functions ----------------------------------------------
        var strFn = consume(reStrFn);
        //if (strFn) { tokens.push(strFn); continue; }
        var sfgrp = captureParenthesesGroup(expr, i); //procedurised section of code below
        if (sfgrp) {
            var start = i;
            i = sfgrp; // update i to keep track of progress through the expression
            tokens.push(strFn + expr.slice(start, i));
            continue;
        }
        // ---- 7. $‑ending identifier that is a function call (e.g. AB$(…) ) -----
        var dollarFn = consume(reDollarFn);
        if (dollarFn) {
            // capture the balanced parentheses that follow
            var depth = 0;
            var start = i;
            while (i < expr.length) {
                var ch = expr.charAt(i);
                if (ch === '(')
                    depth++;
                else if (ch === ')')
                    depth--;
                i++;
                if (depth === 0)
                    break;
            }
            var call = expr.slice(start, i); // '(' … ')'
            tokens.push(dollarFn + call);
            continue;
        }
        // ---- 8. plain $‑ending token (no '(' after it) -----------------------
        var dol = consume(reDollar);
        if (dol) {
            tokens.push(dol);
            continue;
        }
        // ---- 9. ordinary identifier / variable --------------------------------
        var id = consume(reIdent);
        if (id) {
            // Arrays are already handled above (step 2), so this is just plain identifiers
            tokens.push(id);
            continue;
        }
        // ---- 10. numbers (decimal / integer / scientific numbers) ---------------------------------
        var num = consume(reNumber);
        if (num) {
            tokens.push(num);
            continue;
        }
        // ---- 11. Arithmetic operators ---------------------------------
        var arop = consume(reArithOp);
        if (arop) {
            tokens.push(arop);
            continue;
        }
        // ---- 12. Boolean operators ---------------------------------
        var boop = consume(reBoolOp);
        if (boop) {
            tokens.push(boop);
            continue;
        }
        // ---- 13. Relational operators ---------------------------------
        var reop = consume(reRelOp);
        if (reop) {
            tokens.push(reop);
            continue;
        }
        // ---- 14. any other single non‑space character -------------------------
        var oth = consume(reOther);
        if (oth) {
            tokens.push(oth);
            continue;
        }
    }
    return tokens;
}
// END of complexToleniser
function isValidVarExprArithmetic(s) {
    // Check for valid variable arithmetic without parentheses (strips out parentheses)
    // variable OR number at the start, then zero‑or‑more operator‑operand pairs
    //\d+(?:\.\d+)?)
    // Consider adding  unary plus/minus at the start, as shown below 2 options still to test
    //const simpleVar=^(?:[+\-]?(?:[A-Z][A-Z0-9]*|\d+(?:\.\d+)?))(?:[+\-*/^](?:[+\-]?(?:[A-Z][A-Z0-9]*|\d+(?:\.\d+)?)))*$
    //const simpleVar= /^(?:[+\-]?(?:[A-Z][A-Z0-9]*|\d.+))(?:[+\-*/^](?:[+\-]?(?:[A-Z][A-Z0-9]*|\d.+)))*$/;
    // Consider scientific numbers as part of the expression
    //const simpleVar = /^(?:[A-Z][A-Z0-9]*|\d.+)(?:[+\-*/^](?:[A-Z][A-Z0-9]*|\d+(?:\.\d+)?))*$/; //weird but \d.+ needed in 1st and \d+(?:\.\d+)?) in the second
    // Final version including scientific notation, unary plus/minus, and array subscripts like Y(1,1)
    var simpleVar = /^(?:[A-Z][A-Z0-9]*(?:\([^)]+\))?|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)(?:[+\-*/^](?:[A-Z][A-Z0-9]*(?:\([^)]+\))?|[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?))*$/;
    // don't include minus as 2 minus make a plus, 3 minus make a minus and 4 minus make a plus ...
    if (/[+|*|/|^]{2}/.test(s))
        return false;
    // Special case for empty parentheses
    if (s === '()')
        return false;
    // Check for balanced parentheses
    if (isBalancedParentheses(s)) {
        // First try to match WITH parentheses (for array subscripts like Y(1,1))
        if (simpleVar.test(s))
            return true;
        // If that fails, strip parentheses and try again (for arithmetic like (A+B))
        var sStrip = String(s).replace(/[\s[(|)]/g, '');
        return simpleVar.test(sStrip); //also covers LN(num) and EXP(num)
    }
    return false;
} // END of isValidVarExprArithmetic
function isValidArithmetic(rawArith) {
    //Note under the main checks, whitespace between numbers will be flagged as an error as MTX BASIC editor would remove.
    // 1 Strip *all* whitespace characters (space, tab, newline, etc.)
    var s = rawArith.replace(/\s+/g, '');
    // don't include minus as 2 minus make a plus, 3 minus make a minus and 4 minus make a plus ...
    if (/[+|*|/|^]{2}/.test(s))
        return false;
    // Check for balanced parentheses or use function isBalancedParentheses()
    //const openParens = s.split('(').length - 1;
    //const closeParens = s.split(')').length - 1;
    // Regex that enforces the rules described above
    // regex is a full-grammar checker
    var simpleArith1 = /^[+\-]?(?:\d+(\.\d*)?|\.\d+)(?:[eE][+\-]?\d+)?(?:[+\-*/^()]([+\-]?(?:\d+(\.\d*)?|\.\d+)(?:[eE][+\-]?\d+)?))*$/; // integer or decimal or scientific
    //  simple character-class checker — it accepts any string made only of digits, dot, sign chars, operator chars and parens, so a single "+" matches.
    var simpleArith2 = /^[\d.+\-*/^()]+$/;
    // Special case for empty parentheses
    if (s === '()')
        return false;
    // Check for balanced parentheses
    if (isBalancedParentheses(s)) {
        // Check for valid parenthesized expression
        var sStrip = String(s).replace(/[\s[(|)]/g, '');
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
function classifyExpr(expr) {
    var _a;
    var trimmed = expr.trim();
    if (!trimmed)
        return { hasString: false, hasNumeric: false };
    var simpleVar = /^[A-Z][A-Z0-9]*\$?$/.test(trimmed);
    if (simpleVar)
        return { hasString: trimmed.endsWith('$'), hasNumeric: !trimmed.endsWith('$') };
    var leadingTokenMatch = /^([A-Za-z][A-Za-z0-9]*\$?)/.exec(trimmed);
    var leadingToken = (_a = leadingTokenMatch === null || leadingTokenMatch === void 0 ? void 0 : leadingTokenMatch[1]) !== null && _a !== void 0 ? _a : '';
    var upper = trimmed.toUpperCase();
    var stringReturningFns = /^(CHR\$|LEFT\$|MID\$|RIGHT\$|STR\$|SPK\$|TIME\$)/;
    if (leadingToken && leadingToken === leadingToken.toUpperCase() && stringReturningFns.test(upper))
        return { hasString: true, hasNumeric: false };
    var numericReturningFns = /^(ABS|ASC|ATN|COS|EXP|INP|INT|LEN|LN|MOD|PEEK|SGN|SIN|SQR|TAN|USR|VAL|PI|RND)/;
    if (leadingToken && leadingToken === leadingToken.toUpperCase() && numericReturningFns.test(upper))
        return { hasString: false, hasNumeric: true };
    var strParts = stringExprParts(trimmed);
    var numParts = varExprParts(trimmed);
    return {
        hasString: strParts.some(function (r) { return r[1] === true; }),
        hasNumeric: numParts.some(function (r) { return r[1] === true; })
    };
}
function isSpaceNeeded(input) {
    //exclude these commands . Still to decide on AND, NOT and OR
    //use of Set rather just an array uses setname.has(item) versus just an array arrayname.includes(item) - set is better for multiple look ups
    //prevents false positives where INK previously threw  up a space required error for INKEY$.
    var noSpaceAllowed = new Set(['ABS', 'ASC', 'ATN', 'CHR$', 'CLEAR', 'CLS', 'CODE', 'CONT', 'COS', 'DSI', 'EXP', 'GR\$', 'INKEY\$', 'INP', 'INT', 'LEFT$', 'LN', 'MID$', 'MOD',
        'NODDY', 'PI', 'RETURN', 'RIGHT$', 'RND', 'SGN', 'SIN', 'SPK$', 'SQR', 'STOP', 'STR$', 'TAN', 'TIME$', 'USR', 'VAL'
    ]); // set exludes the function LEN which requires a space
    // capture the command token (letters and optional trailing $)
    var m = input.trim().toUpperCase().match(/^([A-Z]+\$?)/);
    var cmd = m ? m[1] : '';
    if (!cmd)
        return true; // no command found -> treat as requires space
    return !noSpaceAllowed.has(cmd); // returns true if requires a space and false if no space required
}
function isNoSpaceFound(expr) {
    var s = expr; //don't trim as s!== ' ' will never be triggered.
    var msgStr = '';
    if ((s !== ' ' || s.indexOf(' ') === -1) && !(/\s{2,}/.test(s))) { // can use indexOf to detect no space
        msgStr = "MTX Command requires a single space (got none) between the command and the first argument/parameter ";
        return { spaceMissingYes: true, msg0: msgStr };
    }
    return { spaceMissingYes: false, msg0: msgStr };
} // END of isNoSpace function
function isMultiSpaceFound(expr) {
    var s = expr; //don't trim as s!== ' ' will never be triggered.
    var msgStr = '';
    if (/\s{2,}/.test(s)) { // can use indexOf to detect no space
        msgStr = "MTX Command requires a single space (got > 1) between the command and the first argument/parameter)";
        return { multiSpaceYes: true, msg2: msgStr };
    }
    return { multiSpaceYes: false, msg2: msgStr };
} // END of isMultiSpace function
// helper: split a line into top-level segments at ':' 
function splitLineSegments(text) {
    // Strip leading line number if present
    var lineNumMatch = /^\s*\d+\s+/.exec(text);
    if (lineNumMatch) {
        // Adjust start position to skip line number
        var skipLen = lineNumMatch[0].length;
        text = text.slice(skipLen);
    }
    var segments = [];
    var inString = false;
    var segStart = 0;
    for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch === '"') {
            inString = !inString;
        }
        else if (!inString && ch === ':') {
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
function splitTopLevel(s) {
    var parts = [];
    var depth = 0;
    var cur = '';
    var i = 0;
    while (i < s.length) {
        var ch = s[i];
        // handle quoted strings (single or double) as atomic, allow escapes like \" or \'
        if (ch === '"') { //not required || ch === "'"
            var quote = ch;
            cur += ch;
            i++;
            while (i < s.length) {
                var c = s[i];
                cur += c;
                if (c === '\\') { // escape next char
                    i++;
                    if (i < s.length) {
                        cur += s[i];
                    }
                }
                else if (c === quote) {
                    i++;
                    break;
                }
                i++;
            }
            continue;
        }
        // parentheses depth tracking (math / grouped expressions)
        if (ch === '(') {
            depth++;
            cur += ch;
            i++;
            continue;
        }
        if (ch === ')') {
            depth = Math.max(0, depth - 1);
            cur += ch;
            i++;
            continue;
        }
        // treat + at top level as part of the token (string concatenation or addition)
        // we only need to avoid splitting when + is used inside an entry; so include it normally
        // splitting separators only apply when depth === 0 and not inside quotes
        if ((ch === ',' || ch === ';') && depth === 0) {
            if (cur.trim() !== '')
                parts.push(cur.trim());
            cur = '';
            i++;
            continue;
        }
        cur += ch;
        i++;
    }
    if (cur.trim() !== '')
        parts.push(cur.trim());
    return parts;
} // END of splitTopLevel 
// helper: detect top-level parenthesized boolean/comparison expressions such as `(PX=31)`
// returns true for "(...)" where the top-level inside contains a relational operator
function isParenthesisedBooleanExpression(expr) {
    var s = expr.trim();
    var inner = s.slice(1, -1);
    var innerUpper = inner.toUpperCase();
    var depth = 0;
    var inString = false;
    var keywordRe = /\b(?:AND|OR|NOT)\b/;
    for (var i = 0; i < inner.length; i++) {
        var ch = inner[i];
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (inString)
            continue;
        if (ch === '(') {
            depth++;
            continue;
        }
        if (ch === ')') {
            if (depth > 0)
                depth--;
            continue;
        }
        if (depth === 0) {
            // relational operators: =, <>, <=, >=, <, >
            if (inner.substring(i, i + 2) === '<>' || inner.substring(i, i + 2) === '<=' || inner.substring(i, i + 2) === '>=')
                return true;
            if (ch === '=' || ch === '<' || ch === '>')
                return true;
        }
    }
    // if boolean keywords appear at top-level (AND/OR/NOT), accept as boolean expression
    if (keywordRe.test(innerUpper))
        return true;
    return false;
} // END of isParenthesisedBooleanExpression     
// helper: detect AND/OR/NOT tokens that are missing whitespace separators
function findBooleanOperatorSpacingIssues(expr) {
    var _a, _b, _c;
    var issues = [];
    var exprUpper = expr.toUpperCase();
    var boolRe = /\b(AND|OR|NOT)\b/g;
    var match;
    while ((match = boolRe.exec(exprUpper)) !== null) {
        var token = (_b = (_a = match[1]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : '';
        var start = (_c = match.index) !== null && _c !== void 0 ? _c : 0;
        var end = start + token.length;
        var prevChar = start > 0 ? expr.charAt(start - 1) : '';
        var nextChar = end < expr.length ? expr.charAt(end) : '';
        var prevIllegal = /[A-Za-z0-9_$]/.test(prevChar);
        var nextIllegal = /[A-Za-z0-9_$]/.test(nextChar);
        if (prevIllegal || nextIllegal) {
            var fragStart = prevIllegal ? start - 1 : start;
            var fragEnd = nextIllegal ? end + 1 : end;
            issues.push({
                start: Math.max(0, fragStart),
                end: Math.min(expr.length, fragEnd),
                token: token,
                fragment: expr.slice(Math.max(0, fragStart), Math.min(expr.length, fragEnd))
            });
        }
    }
    return issues;
} // END of findBooleanOperatorSpacingIssues
function validateBooleanConnectors(expr, spans, report) {
    // If there are 0 or 1 spans, there are no connectors to validate
    if (spans.length <= 1) {
        return;
    }
    var cursor = 0;
    var flushGap = function (nextStart) {
        if (nextStart <= cursor)
            return;
        var rawGap = expr.slice(cursor, nextStart);
        var trimmed = rawGap.trim();
        var trimmedUpper = trimmed.toUpperCase();
        // Empty gap or valid boolean connector - OK
        if (!trimmed || /^(AND|OR|NOT)$/.test(trimmedUpper))
            return;
        // Skip if the gap contains only arithmetic operators and operands
        // This handles cases like "B+C+3" which is part of a comparison RHS
        // Pattern: variables, numbers, arithmetic operators (+,-,*,/,^), parentheses, commas, spaces
        if (/^[\s\w\d.+\-*/^(),]+$/.test(trimmed)) {
            // Additional check: must not contain standalone AND/OR/NOT as words
            // (they would be invalid if not properly separated)
            if (!/\b(AND|OR|NOT)\b/.test(trimmedUpper)) {
                return; // It's a valid arithmetic expression, not an invalid connector
            }
        }
        var leading = rawGap.length - rawGap.replace(/^\s+/, '').length;
        var trailing = rawGap.replace(/\s+$/, '').length;
        var startIdx = cursor + leading;
        var endIdx = cursor + trailing;
        report(startIdx, endIdx, trimmed);
    };
    spans.forEach(function (span) {
        var _a, _b;
        flushGap((_a = span.spanStart) !== null && _a !== void 0 ? _a : cursor);
        cursor = (_b = span.spanEnd) !== null && _b !== void 0 ? _b : cursor;
    });
    flushGap(expr.length);
} // END of validateBooleanConnectors
function splitBooleanExpression(expr) {
    var spans = [];
    var inString = false;
    var depth = 0;
    var clauseStart = -1;
    var relopSeen = false;
    var flushClause = function (idx) {
        if (clauseStart !== -1 && relopSeen) {
            spans.push({ spanStart: clauseStart, spanEnd: idx });
            clauseStart = -1;
            relopSeen = false;
        }
    };
    for (var i = 0; i < expr.length; i++) {
        var ch = expr[i];
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (inString)
            continue;
        if (ch === '(') {
            depth++;
            continue;
        }
        if (ch === ')') {
            if (depth > 0)
                depth--;
            continue;
        }
        if (depth !== 0)
            continue;
        // Start a new clause on first non-whitespace
        if (clauseStart === -1 && !/\s/.test(ch))
            clauseStart = i;
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
        if (/[A-Z]/.test(ch)) {
            var j = i + 1;
            while (j < expr.length && /[A-Z0-9$]/.test(expr[j]))
                j++;
            var word = expr.slice(i, j).toUpperCase();
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
function trimCommaList(s, n) {
    if (n === void 0) { n = 3; }
    var items = s
        .split(',')
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
    if (n === 0)
        return '';
    var result = n > 0 ? items.slice(0, n) : items.slice(n); // slice(n) with negative n keeps last |n|
    return result.join(', ');
} //END of trimCommaList  
function trimArray(arr, n) {
    if (n === void 0) { n = 3; }
    var safe = arr !== null && arr !== void 0 ? arr : [];
    if (n === 0)
        return [];
    return n > 0 ? safe.slice(0, n) : safe.slice(n);
} //END trim arrays
function splitCommandsByColon(text) {
    //same as splitLineSegments but returns string array only and doesn't remove leading line numbers
    var chunks = [];
    var current = '';
    var depth = 0;
    var inString = false;
    for (var idx = 0; idx < text.length; idx++) {
        var ch = text[idx];
        if (ch === '"') {
            inString = !inString;
            current += ch;
            continue;
        }
        if (inString) {
            current += ch;
            continue;
        }
        if (ch === '(') {
            depth++;
            current += ch;
            continue;
        }
        if (ch === ')') {
            depth = Math.max(0, depth - 1);
            current += ch;
            continue;
        }
        if (depth === 0 && ch === ':') {
            if (current.trim())
                chunks.push(current.trim());
            current = '';
            continue;
        }
        current += ch;
    }
    if (current.trim())
        chunks.push(current.trim());
    return chunks;
} // END of splitCommandsByColon
// NODDY label pattern - labels are prefixed with ^
var noddyLabelPattern = /^\^(\w+)\s*/;
// NODDY page title patterns - user explicitly declares page type
// "Text title=NAME"    → text page  - name: printable ASCII 33-126 excluding * ^ . (special NODDY chars)
// "Program title=NAME" → program page - name: alphanumeric only (A-Z, 0-9)
var noddyTextTitlePattern = /^Text title=([^\x00-\x20*^.\x7F]+)\s*$/i;
var noddyProgTitlePattern = /^Program title=([A-Za-z0-9]+)\s*$/i;
// NODDY command definitions - includes full names and abbreviations
var noddyCommands = [
    // *A or *ADVANCE - advance to next page
    { id: 'ADVANCE', pattern: /^\*(?:A|ADVANCE)\s*$/, hasArg: false, argType: 'none', description: 'Advance to next page' },
    // *B or *BRANCH <label> - unconditional branch to label
    { id: 'BRANCH', pattern: /^\*(?:B|BRANCH)\s+(\w+)\s*$/, hasArg: true, argType: 'label', description: 'Unconditional branch to label' },
    // *D or *DISPLAY <pagename>. - display a text page (note the trailing period)
    // Page name: printable ASCII excluding space, *, ^, . (special NODDY chars)
    { id: 'DISPLAY', pattern: /^\*(?:D|DISPLAY)\s+([^\s*^.]+)\.\s*$/, hasArg: true, argType: 'pagename', description: 'Display a text page' },
    // *E or *ENTER - wait for user input
    { id: 'ENTER', pattern: /^\*(?:E|ENTER)\s*$/, hasArg: false, argType: 'none', description: 'Wait for user input' },
    // *G or *GOTO <label> - goto label (similar to BRANCH)
    { id: 'GOTO', pattern: /^\*(?:G|GOTO)\s+(\w+)\s*$/, hasArg: true, argType: 'label', description: 'Go to label' },
    // *I or *IF <char>,<label> - conditional branch on character input
    { id: 'IF', pattern: /^\*(?:I|IF)\s+([A-Z0-9]),(\w+)\s*$/, hasArg: true, argType: 'char_label', description: 'Conditional branch on character input' },
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
function parseNoddyContent(lines, startLine) {
    var pages = [];
    var errors = [];
    var currentPage = null;
    var textLineCount = 0;
    var isFirstContentLine = false;
    for (var i = startLine; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();
        // Check for explicit page-type title
        // Guard: "Program title=" with a non-alphanumeric name → specific error before pattern match
        if (/^Program title=/i.test(trimmed) && !noddyProgTitlePattern.exec(trimmed)) {
            var badName = trimmed.replace(/^Program title=/i, '').trim();
            errors.push({
                line: i,
                message: "Program page name \"".concat(badName, "\" is invalid \u2014 only A-Z, a-z and 0-9 are allowed (no spaces, underscores or symbols)"),
                start: 0,
                end: trimmed.length
            });
            continue;
        }
        var textTitleMatch = noddyTextTitlePattern.exec(trimmed);
        var progTitleMatch = noddyProgTitlePattern.exec(trimmed);
        var titleMatch = textTitleMatch || progTitleMatch;
        if (titleMatch) {
            // Validate and save previous page before starting the next one
            if (currentPage) {
                if (currentPage.type === 'program') {
                    var hasCommand = currentPage.content.some(function (l) { return l.trim().startsWith('*'); });
                    if (!hasCommand) {
                        errors.push({
                            line: currentPage.lineStart,
                            message: "Program page \"".concat(currentPage.name, "\" contains no NODDY commands ") +
                                "(*ADVANCE, *BRANCH, *DISPLAY, *ENTER, *GOTO, *IF, *LIST, *OFF, *PAUSE, *RETURN, *STACK)",
                            start: 0,
                            end: lines[currentPage.lineStart].length
                        });
                    }
                }
                currentPage.lineEnd = i - 1;
                pages.push(currentPage);
            }
            // Page type is declared explicitly by the prefix used
            var pageType = progTitleMatch ? 'program' : 'text';
            currentPage = {
                name: titleMatch[1],
                lineStart: i,
                lineEnd: i,
                type: pageType,
                content: []
            };
            textLineCount = 0;
            isFirstContentLine = true;
            continue;
        }
        if (currentPage) {
            // Skip empty lines while waiting for first real content
            if (isFirstContentLine && trimmed.length === 0) {
                currentPage.content.push(line);
                continue;
            }
            if (isFirstContentLine && trimmed.length > 0) {
                isFirstContentLine = false;
            }
            currentPage.content.push(line);
            textLineCount++;
            if (textLineCount > 24) {
                errors.push({
                    line: i,
                    message: "Page \"".concat(currentPage.name, "\" exceeds maximum of 24 rows"),
                    start: 0,
                    end: line.length
                });
            }
            if (line.length > 39) {
                errors.push({
                    line: i,
                    message: "Text line exceeds maximum of 39 characters (got ".concat(line.length, ")"),
                    start: 39,
                    end: line.length
                });
            }
        }
    }
    // Flush the last page
    if (currentPage) {
        if (currentPage.type === 'program') {
            var hasCommand = currentPage.content.some(function (l) { return l.trim().startsWith('*'); });
            if (!hasCommand) {
                errors.push({
                    line: currentPage.lineStart,
                    message: "Program page \"".concat(currentPage.name, "\" contains no NODDY commands ") +
                        "(*ADVANCE, *BRANCH, *DISPLAY, *ENTER, *GOTO, *IF, *LIST, *OFF, *PAUSE, *RETURN, *STACK)",
                    start: 0,
                    end: lines[currentPage.lineStart].length
                });
            }
        }
        currentPage.lineEnd = lines.length - 1;
        pages.push(currentPage);
    }
    return { pages: pages, errors: errors };
}
/**
 * Validate a NODDY program page
 */
/**
 * Validate a NODDY program page
 */
function validateNoddyProgram(page, allPages, lineOffset) {
    var errors = [];
    var definedLabels = new Set();
    var usedLabels = [];
    var textPageNames = new Set(allPages.filter(function (p) { return p.type === 'text'; }).map(function (p) { return p.name; }));
    // First content line should be the program name - skip it for command validation
    var foundProgramName = false;
    var programNameLineIndex = -1;
    // Find and validate program name line
    for (var i = 0; i < page.content.length; i++) {
        var trimmed = page.content[i].trim();
        if (trimmed.length === 0)
            continue; // Skip empty lines
        if (trimmed === page.name) {
            foundProgramName = true;
            programNameLineIndex = i;
            break;
        }
        else {
            // First non-empty line is not the program name
            errors.push({
                line: lineOffset + i + 1,
                message: "Program page must start with \"".concat(page.name, "\" on its own line"),
                start: 0,
                end: trimmed.length
            });
            break;
        }
    }
    if (!foundProgramName && programNameLineIndex === -1) {
        errors.push({
            line: lineOffset + 1,
            message: "Program page \"".concat(page.name, "\" is missing the program name as first line"),
            start: 0,
            end: page.name.length
        });
    }
    // First pass: collect defined labels (skip program name line)
    for (var i = 0; i < page.content.length; i++) {
        // Skip the program name line
        if (i === programNameLineIndex)
            continue;
        var line = page.content[i].trim();
        var labelMatch = noddyLabelPattern.exec(line);
        if (labelMatch) {
            var labelName = labelMatch[1];
            if (definedLabels.has(labelName)) {
                errors.push({
                    line: lineOffset + i + 1,
                    message: "Duplicate label \"^".concat(labelName, "\""),
                    start: 0,
                    end: labelMatch[0].length
                });
            }
            definedLabels.add(labelName);
        }
    }
    // Second pass: validate commands and collect used labels (skip program name line)
    for (var i = 0; i < page.content.length; i++) {
        // Skip the program name line
        if (i === programNameLineIndex)
            continue;
        var line = page.content[i];
        var trimmed = line.trim();
        var actualLine = lineOffset + i + 1;
        // Skip empty lines
        if (!trimmed)
            continue;
        // Handle labels - can have commands on the same line after the label
        var commandPart = trimmed;
        if (trimmed.startsWith('^')) {
            var labelMatch = noddyLabelPattern.exec(trimmed);
            if (!labelMatch) {
                errors.push({
                    line: actualLine,
                    message: "Invalid label syntax: \"".concat(trimmed, "\""),
                    start: 0,
                    end: trimmed.length
                });
                continue;
            }
            // Get the part after the label
            commandPart = trimmed.slice(labelMatch[0].length).trim();
            if (!commandPart)
                continue; // Label only line is valid
        }
        // Handle commands - can have multiple per line
        var cmdParts = commandPart.split(/(?=\*)/);
        var charPos = line.indexOf(commandPart);
        for (var _i = 0, cmdParts_1 = cmdParts; _i < cmdParts_1.length; _i++) {
            var part = cmdParts_1[_i];
            var cmd = part.trim();
            if (!cmd)
                continue;
            if (!cmd.startsWith('*')) {
                // Text after label without command is invalid in program pages
                errors.push({
                    line: actualLine,
                    message: "Invalid NODDY syntax: \"".concat(cmd, "\" (commands must start with *)"),
                    start: charPos,
                    end: charPos + cmd.length
                });
                charPos += cmd.length;
                continue;
            }
            // Try to match against known commands
            var matched = false;
            for (var _a = 0, noddyCommands_1 = noddyCommands; _a < noddyCommands_1.length; _a++) {
                var noddyCmd = noddyCommands_1[_a];
                var match = noddyCmd.pattern.exec(cmd);
                if (match) {
                    matched = true;
                    // Validate arguments based on type
                    if (noddyCmd.argType === 'pagename') {
                        var pageName = match[1];
                        if (!textPageNames.has(pageName)) {
                            errors.push({
                                line: actualLine,
                                message: "Unknown text page \"".concat(pageName, "\" in *").concat(noddyCmd.id),
                                start: charPos,
                                end: charPos + cmd.length
                            });
                        }
                    }
                    else if (noddyCmd.argType === 'label') {
                        var labelName = match[1];
                        usedLabels.push({ label: labelName, line: actualLine, start: charPos });
                    }
                    else if (noddyCmd.argType === 'char_label') {
                        // For *IF char,label - validate both parts
                        var charInput = match[1];
                        var labelName = match[2];
                        // Validate character is single alphanumeric
                        if (!/^[A-Z0-9]$/.test(charInput)) {
                            errors.push({
                                line: actualLine,
                                message: "*IF: character must be single alphanumeric (got \"".concat(charInput, "\")"),
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
                var displayNoperiod = /^\*(?:D|DISPLAY)\s+[^\s*^.]+\s*$/.exec(cmd);
                if (displayNoperiod) {
                    errors.push({
                        line: actualLine,
                        message: "*DISPLAY command missing trailing period: \"".concat(cmd, "\" (should end with \".\")"),
                        start: charPos,
                        end: charPos + cmd.length
                    });
                }
                else if (/^\*(?:B|BRANCH|G|GOTO)\s*$/.exec(cmd)) {
                    errors.push({
                        line: actualLine,
                        message: "*".concat(cmd.slice(1), " requires a label argument"),
                        start: charPos,
                        end: charPos + cmd.length
                    });
                }
                else if (/^\*(?:I|IF)\s*$/.exec(cmd) || /^\*(?:I|IF)\s+[^,]+\s*$/.exec(cmd)) {
                    errors.push({
                        line: actualLine,
                        message: "*IF requires format: *IF <char>,<label>",
                        start: charPos,
                        end: charPos + cmd.length
                    });
                }
                else {
                    errors.push({
                        line: actualLine,
                        message: "Unknown or malformed NODDY command: \"".concat(cmd, "\""),
                        start: charPos,
                        end: charPos + cmd.length
                    });
                }
            }
            charPos += cmd.length + 1;
        }
    }
    // Check for undefined labels
    for (var _b = 0, usedLabels_1 = usedLabels; _b < usedLabels_1.length; _b++) {
        var used = usedLabels_1[_b];
        if (!definedLabels.has(used.label)) {
            errors.push({
                line: used.line,
                message: "Undefined label \"^".concat(used.label, "\""),
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
function isNoddyTrigger(line) {
    return /^\s*\d+\s+NODDY\s*$/.test(line.toUpperCase());
}
/**
 * Get all PLOD references from BASIC code
 */
function findPlodReferences(lines) {
    var refs = [];
    var plodPattern = /PLOD\s+"(\w+)"/g;
    for (var i = 0; i < lines.length; i++) {
        var lineUpper = lines[i].toUpperCase();
        var match = void 0;
        while ((match = plodPattern.exec(lineUpper)) !== null) {
            refs.push({
                line: i,
                progName: match[1],
                start: match.index
            });
        }
    }
    return refs;
}
