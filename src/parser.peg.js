{
  var inPlural = false;
}

start = tokens:token*{ return tokens.join('')}

token
  = argument / select / plural / function
  / '#' & { return inPlural; } { return '#' }
  / str:char+ { return str.join(''); }

argument = a:'{' b:_ arg:id c:_ d:'}' { return Array.from(arguments).join('') }

select = a:'{' b:_ arg:id c:_ d:',' e:_ f:(m:'select' { if (options.strictNumberSign) { inPlural = false; } return m; }) g:_ h:',' i:_ j:(cases:selectCase+ {return cases.join('')}) k:_ l:'}' { return Array.from(arguments).join('') }

plural = a:'{' b:_ arg:id c:_ d:',' e: _ type:(m:('plural'/'selectordinal') { inPlural = true; return m; } ) f:_ g:',' h:_ offset:offset? cases:(cases:pluralCase+ {return cases.join('')}) j:_ k:'}' { return Array.from(arguments).join('')}

function = a:'{' b:_ c:id d:_ e:',' f:_ g:(m:id { if (options.strictNumberSign) { inPlural = false; } return m; }) h:_ i:functionParam? j:'}' { return Array.from(arguments).join('') }

// not Pattern_Syntax or Pattern_White_Space
// TODO: Add additional replaceable characters here:
id = x:('-' { return '_'} / $[^\u0009-\u000d \u0085\u200e\u200f\u2028\u2029\u0021-\u002f\u003a-\u0040\u005b-\u005e\u0060\u007b-\u007e\u00a1-\u00a7\u00a9\u00ab\u00ac\u00ae\u00b0\u00b1\u00b6\u00bb\u00bf\u00d7\u00f7\u2010-\u2027\u2030-\u203e\u2041-\u2053\u2055-\u205e\u2190-\u245f\u2500-\u2775\u2794-\u2bff\u2e00-\u2e7f\u3001-\u3003\u3008-\u3020\u3030\ufd3e\ufd3f\ufe45\ufe46])+ {return x.join('')}

selectCase = before:_ id:id mid:_ caseTokens:caseTokens { return before + id + mid + caseTokens}

pluralCase = a:_ b:pluralKey c:_ d:caseTokens { return Array.from(arguments).join('') }

caseTokens = a:'{' b:$(_ & '{')? tokens:(tokens:token* {return tokens.join('')} ) c:_ d:'}' { return Array.from(arguments).join('')}

offset = $(_ 'offset' _ ':' _ d:digits _)

pluralKey
  = id
  / $('=' d:digits)

functionParam = $(_ ',' str:paramChars+)

paramChars
  = doubleapos
  / quotedCurly
  / $[^}]

doubleapos = "''"

inapos = doubleapos / str:[^']+ { return str.join(''); }

quotedCurly
  = "'{"str:inapos*"'" { return '\u007B'+str.join(''); }
  / "'}"str:inapos*"'" { return '\u007D'+str.join(''); }

quoted
  = quotedCurly
  / $("'#" inapos* "'")
  / "'"

char
  = doubleapos
  / $quoted
  / $octo:'#' & { return !inPlural; } { return octo; }
  / $[^{}#\0-\x08\x0e-\x1f\x7f]

digits = $([0-9]+)

// Pattern_White_Space
_ = $([\u0009-\u000d \u0085\u200e\u200f\u2028\u2029]*)