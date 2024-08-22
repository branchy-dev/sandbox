import fs from "@/app/lib/fs/main";
import arg from "arg";
import git from "isomorphic-git";
import { posix as path } from "path";
import { ExitStatus, Out } from "../../execute";
import { Minimatch } from "minimatch";

export const argSchema = {
  "--delete": Boolean,
  "-d": "--delete",
  "--force": Boolean,
  "-f": "--force",
  "--list": Boolean,
  "-l": "--list",
  "--show-current": Boolean,
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
  const options: (keyof typeof args)[] = [
    "--delete",
    "--list",
    "--show-current",
  ];
  if (options.reduce((a, b) => a + ((args[b] as boolean) ? 1 : 0), 0) > 1) {
    out.err("git run: Unsupported argument configuration");
    return ExitStatus.ERR;
  }
  if (args["--show-current"]) {
    const branch = await git.currentBranch({
      fs: fs.p,
      dir: fs.gitWorkingDir,
    });
    if (branch) out.text(branch);
    return ExitStatus.OK;
  }
  if (args["--delete"]) {
    if (args._.length > 1) {
      out.err("git run: Unsupported argument configuration");
      return ExitStatus.ERR;
    }
  }
  if (args["--list"] || !args._.length) {
    let branches = await git.listBranches({
      fs: fs.p,
      dir: fs.gitWorkingDir,
    });
    if (args._.length) {
      const patterns = args._.map((arg) => new Minimatch(arg));
      branches = branches.filter((branch) =>
        patterns.some((pattern) => pattern.match(branch))
      );
    }
    for (const branch of branches) out.text("  " + branch);
    return ExitStatus.OK;
  }
  try {
    await git.branch({
      fs: fs.p,
      dir: fs.gitWorkingDir,
      ref: args._[0],
      object: args._[1],
      force: args["--force"],
    });
  } catch (e) {
    if (e instanceof Error) {
      if (e.name === "AlreadyExistsError") {
        out.err("git run: Failed to create branch, already exists");
        return ExitStatus.ERR;
      }
    }
    throw e;
  }
  return ExitStatus.OK;
}
