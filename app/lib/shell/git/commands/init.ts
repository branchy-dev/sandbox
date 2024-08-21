import { fs, gitWorkingDir, initFS } from "@/app/lib/fs/main";
import arg from "arg";
import git from "isomorphic-git";
import { ExitStatus, Out } from "../../execute";

export const argSchema = {
  "--initial-branch": String,
  "-b": "--initial-branch",
};

export async function run(
  args: arg.Result<typeof argSchema>,
  out: Out
): Promise<ExitStatus> {
  if (args._.length) {
    out.err("git init: Unsupported argument configuration");
    return ExitStatus.ERR;
  }
  initFS();
  await git.init({
    fs,
    dir: gitWorkingDir,
    defaultBranch: args["--initial-branch"],
  });
  out.text("Initialized empty Git repository");
  return ExitStatus.OK;
}
