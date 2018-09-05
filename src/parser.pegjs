{
  var inPlural = false;
}

start = tokens:token*{ return 'Parsed Successfully'}

token
  = argument / select / plural / function
  / '#'
  / char+

argument = '{' _ id _ '}'

select = '{' _ id _ ',' _ ('select' { if (options.strictNumberSign) { inPlural = false; } }) _ ',' _ (selectCase+) _ '}'

plural = '{' _ id _ ',' _ (('plural'/'selectordinal') { inPlural = true; }) _ ',' _ offset? (pluralCase+) _ '}'

function = '{' _ id _ ',' _ (id { if (options.strictNumberSign) { inPlural = false; } }) _ functionParam? '}'

// not Pattern_Syntax or Pattern_White_Space
// TODO: Add additional replaceable characters here:
id = ('-' { throw new Error('Dashes are not allowed (-)')} / $[^\u0009-\u000d \u0085\u200e\u200f\u2028\u2029\u0021-\u002f\u003a-\u0040\u005b-\u005e\u0060\u007b-\u007e\u00a1-\u00a7\u00a9\u00ab\u00ac\u00ae\u00b0\u00b1\u00b6\u00bb\u00bf\u00d7\u00f7\u2010-\u2027\u2030-\u203e\u2041-\u2053\u2055-\u205e\u2190-\u245f\u2500-\u2775\u2794-\u2bff\u2e00-\u2e7f\u3001-\u3003\u3008-\u3020\u3030\ufd3e\ufd3f\ufe45\ufe46])+

selectCase = _ id _ caseTokens

pluralCase = _ pluralKey _ caseTokens

caseTokens = '{' (_ & '{')? (token*) _ '}'

offset = (_ 'offset' _ ':' _ digits _)

pluralKey
  = id
  / ('=' digits)

functionParam = (_ ',' paramChars+)

paramChars
  = doubleapos
  / quotedCurly
  / [^}]

doubleapos = "''"

inapos = doubleapos / [^']

quotedCurly
  = "'{"str:inapos*"'"
  / "'}"str:inapos*"'"

quoted
  = quotedCurly
  / ("'#" inapos* "'")
  / "'"

char
  = doubleapos
  / quoted
  / '#'
  / [^{}#\0-\x08\x0e-\x1f\x7f]

digits = ([0-9]+)

// Pattern_White_Space
_ = ([\u0009-\u000d \u0085\u200e\u200f\u2028\u2029]*)
