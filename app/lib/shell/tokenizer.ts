export type Token = {
  type: TokenType;
  content: string;
};

export enum TokenType {
  TERMINATOR,
  IGNORED,
  USED,
}

export function tokenizeLine(line: string): {
  tokens: Token[];
  valid: boolean;
} {
  const tokens: Token[] = [];

  enum quoteType {
    NONE,
    SINGLE,
    DOUBLE,
  }

  let buffer = "";
  let quote: quoteType = quoteType.NONE;
  let escapeOn = false;

  function addToken(type: TokenType, content: string) {
    if (buffer.length) tokens.push({ type: TokenType.USED, content: buffer });
    buffer = "";
    tokens.push({ type, content });
  }

  for (let i = 0; i < line.length; i++) {
    let char = line[i];

    if (escapeOn) {
      escapeOn = false;
      if (quote === quoteType.NONE) {
        addToken(TokenType.IGNORED, "\\");
        buffer += char;
        continue;
      }
      if (quote === quoteType.DOUBLE) {
        if (char === '"' || char === "\\") {
          addToken(TokenType.IGNORED, "\\");
          buffer += char;
          continue;
        }
        buffer += "\\";
      }
    }

    if (char === "'") {
      // End single quote
      if (quote === quoteType.SINGLE) {
        quote = quoteType.NONE;
        addToken(TokenType.IGNORED, "'");
        continue;
      }
      // Start single quote
      if (quote === quoteType.NONE) {
        quote = quoteType.SINGLE;
        addToken(TokenType.IGNORED, "'");
        continue;
      }
    }

    if (char === '"') {
      // End double quote
      if (quote === quoteType.DOUBLE) {
        quote = quoteType.NONE;
        addToken(TokenType.IGNORED, '"');
        continue;
      }
      // Start double quote
      if (quote === quoteType.NONE) {
        quote = quoteType.DOUBLE;
        addToken(TokenType.IGNORED, '"');
        continue;
      }
    }

    if (quote !== quoteType.SINGLE && char === "\\") {
      escapeOn = true;
      continue;
    }

    if (quote === quoteType.NONE && char.match(/\s/)) {
      addToken(TokenType.TERMINATOR, char);
      continue;
    }

    buffer += char;
  }

  if (escapeOn) addToken(TokenType.IGNORED, "\\");

  const valid = !escapeOn && quote === quoteType.NONE;

  if (buffer.length) tokens.push({ type: TokenType.USED, content: buffer });
  if (valid) tokens.push({ type: TokenType.TERMINATOR, content: "" });

  return { tokens, valid };
}

export function stringTokens(tokens: Token[]) {
  return tokens.reduce((a, b) => a + b.content, "");
}
