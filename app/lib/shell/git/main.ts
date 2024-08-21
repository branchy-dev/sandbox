import arg from "arg";
import { ExitStatus, Out } from "../execute";
import * as init from "./commands/init";

export async function execute(args: string[], out: Out): Promise<ExitStatus> {
  const [cmd, ...cmdArgs] = args;
  if (cmd === "init")
    return await init.run(arg(init.argSchema, { argv: cmdArgs }), out);
  out.err("git: Unsupported command");
  return ExitStatus.ERR;
}
