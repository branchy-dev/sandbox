import * as git from "./git/main";

export enum OutputType {
  END,
  TEXT,
  ERR,
}

export type Output =
  | {
      type: OutputType.TEXT;
      content: string;
    }
  | { type: OutputType.ERR; message: string }
  | { type: OutputType.END; status: number };

export enum ExitStatus {
  OK,
  ERR,
}

export type Out = {
  text: (content: string) => void;
  err: (content: string) => void;
};

export async function execute(args: string[], out: (data: Output) => void) {
  const [cmd, ...cmdArgs] = args;
  if (cmd === "git") {
    const status = await git.execute(cmdArgs, {
      text: (content: string) => out({ type: OutputType.TEXT, content }),
      err: (message: string) => out({ type: OutputType.ERR, message }),
    });
    return out({ type: OutputType.END, status });
  }
  out({ type: OutputType.ERR, message: "shell: Unsupported command" });
  return out({ type: OutputType.END, status: ExitStatus.ERR });
}
