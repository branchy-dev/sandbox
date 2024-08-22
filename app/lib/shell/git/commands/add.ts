import fs from "@/app/lib/fs/main";
import arg from "arg";
import git from "isomorphic-git";
import { posix as path } from "path";
import { ExitStatus, Out } from "../../execute";

export const argSchema = {
  "--force": Boolean,
  "-f": "--force",
};

export async function run(
  args: arg.Result<typeof argSchema>,
  out: Out
): Promise<ExitStatus> {
  fs.init();
  if (!(await fs.isFile(path.join(fs.gitWorkingDir, ".git", "HEAD")))) {
    out.err("Could not find git repository");
    return ExitStatus.ERR;
  }
  await git.add({
    fs: fs.p,
    dir: fs.gitWorkingDir,
    force: args["--force"],
    filepath: args._,
  });
  return ExitStatus.OK;
}
