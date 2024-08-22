import arg, { ArgError } from "arg";
import { ExitStatus, Out } from "../execute";
import * as add from "./commands/add";
import * as branch from "./commands/branch";
import * as checkout from "./commands/checkout";
import * as commit from "./commands/commit";
import * as init from "./commands/init";
import * as log from "./commands/log";
import * as rm from "./commands/rm";
import * as status from "./commands/status";

export async function execute(args: string[], out: Out): Promise<ExitStatus> {
  const [cmd, ...cmdArgs] = args;
  try {
    if (cmd === "init")
      return await init.run(arg(init.argSchema, { argv: cmdArgs }), out);
    if (cmd === "status")
      return await status.run(arg(status.argSchema, { argv: cmdArgs }), out);
    if (cmd === "add")
      return await add.run(arg(add.argSchema, { argv: cmdArgs }), out);
    if (cmd === "rm")
      return await rm.run(arg(rm.argSchema, { argv: cmdArgs }), out);
    if (cmd === "commit")
      return await commit.run(arg(commit.argSchema, { argv: cmdArgs }), out);
    if (cmd === "log")
      return await log.run(arg(log.argSchema, { argv: cmdArgs }), out);
    if (cmd === "checkout")
      return await checkout.run(
        arg(checkout.argSchema, { argv: cmdArgs }),
        out
      );
    if (cmd === "branch")
      return await branch.run(arg(branch.argSchema, { argv: cmdArgs }), out);
  } catch (e) {
    if (e instanceof ArgError) {
      out.err(`git: Unsupported arguments for command '${cmd}'`);
      return ExitStatus.ERR;
    }
    out.err(`git: Error processing command '${cmd}'`);
    console.error(e);
    return ExitStatus.ERR;
  }
  out.err("git: Unsupported command");
  return ExitStatus.ERR;
}
