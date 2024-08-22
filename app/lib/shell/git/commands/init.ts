import fs from "@/app/lib/fs/main";
import arg from "arg";
import git from "isomorphic-git";
import { posix as path } from "path";
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
  fs.init();
  const initialized: boolean = await fs.isFile(
    path.join(fs.gitWorkingDir, ".git", "HEAD")
  );
  await git.init({
    fs: fs.p,
    dir: fs.gitWorkingDir,
    defaultBranch: args["--initial-branch"],
  });
  out.text(
    initialized
      ? "Reinitialized existing Git repository"
      : "Initialized empty Git repository"
  );
  return ExitStatus.OK;
}
