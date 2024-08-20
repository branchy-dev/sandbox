import {
  TokenType,
  stringTokens,
  tokenizeLine,
} from "@/app/lib/shell/tokenizer";

describe("shell parser", () => {
  it("should parse line", () => {
    const line = `my-executable`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeTruthy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: "" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should separate by spaces", () => {
    const line = `my-executable arg1 arg2`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeTruthy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.USED, content: "arg1" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.USED, content: "arg2" },
      { type: TokenType.TERMINATOR, content: "" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should split longer whitespace", () => {
    const line = `my-executable arg1   arg2 \narg3`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeTruthy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.USED, content: "arg1" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.USED, content: "arg2" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.TERMINATOR, content: "\n" },
      { type: TokenType.USED, content: "arg3" },
      { type: TokenType.TERMINATOR, content: "" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should ignore single quotes", () => {
    const line = `my-executable 'arg1' arg2`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeTruthy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.USED, content: "arg1" },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.USED, content: "arg2" },
      { type: TokenType.TERMINATOR, content: "" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should ignore double quotes", () => {
    const line = `my-executable "arg1" arg2`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeTruthy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.USED, content: "arg1" },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.USED, content: "arg2" },
      { type: TokenType.TERMINATOR, content: "" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should allow space in quotes", () => {
    const line = `my-executable "arg 1" 'a\nrg2 '`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeTruthy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.USED, content: "arg 1" },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.USED, content: "a\nrg2 " },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.TERMINATOR, content: "" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should allow partial quoting", () => {
    const line = `my-executable "ar"g1 ar'g'2`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeTruthy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.USED, content: "ar" },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.USED, content: "g1" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.USED, content: "ar" },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.USED, content: "g" },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.USED, content: "2" },
      { type: TokenType.TERMINATOR, content: "" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should allow empty quotes", () => {
    const line = `my-executable '' arg ""`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeTruthy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.USED, content: "arg" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.TERMINATOR, content: "" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should allow opposite quote type in string", () => {
    const line = `my-executable "arg'1" 'arg"2'`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeTruthy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.USED, content: "arg'1" },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.USED, content: 'arg"2' },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.TERMINATOR, content: "" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should escape any character outside quotes", () => {
    const line = String.raw`my-executable \\abc\d \"myarg\"xyz\'`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeTruthy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: "\\" },
      { type: TokenType.USED, content: "\\abc" },
      { type: TokenType.IGNORED, content: "\\" },
      { type: TokenType.USED, content: "d" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: "\\" },
      { type: TokenType.USED, content: '"myarg' },
      { type: TokenType.IGNORED, content: "\\" },
      { type: TokenType.USED, content: '"xyz' },
      { type: TokenType.IGNORED, content: "\\" },
      { type: TokenType.USED, content: "'" },
      { type: TokenType.TERMINATOR, content: "" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should escape some characters in double quotes", () => {
    const line = String.raw`my-executable "my\" arg" "abc\def"`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeTruthy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.USED, content: "my" },
      { type: TokenType.IGNORED, content: "\\" },
      { type: TokenType.USED, content: '" arg' },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.USED, content: "abc\\def" },
      { type: TokenType.IGNORED, content: '"' },
      { type: TokenType.TERMINATOR, content: "" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should escape no characters in single quotes", () => {
    const line = String.raw`my-executable 'my args \' 'hello\ world'`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeTruthy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.USED, content: "my args \\" },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.USED, content: "hello\\ world" },
      { type: TokenType.IGNORED, content: "'" },
      { type: TokenType.TERMINATOR, content: "" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should invalidate on trailing escape", () => {
    const line = `my-executable arg1 arg2\\`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeFalsy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.USED, content: "arg1" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.USED, content: "arg2" },
      { type: TokenType.IGNORED, content: "\\" },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });

  it("should invalidate on open double quote", () => {
    const line = `my-executable arg1 arg2"`;
    const data = tokenizeLine(line);
    expect(data.valid).toBeFalsy();
    expect(data.tokens).toStrictEqual([
      { type: TokenType.USED, content: "my-executable" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.USED, content: "arg1" },
      { type: TokenType.TERMINATOR, content: " " },
      { type: TokenType.USED, content: "arg2" },
      { type: TokenType.IGNORED, content: '"' },
    ]);
    expect(stringTokens(data.tokens)).toEqual(line);
  });
});
