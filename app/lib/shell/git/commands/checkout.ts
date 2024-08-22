import fs from "@/app/lib/fs/main";
import arg from "arg";
import git from "isomorphic-git";
import { posix as path } from "path";
import { ExitStatus, Out } from "../../execute";

export const argSchema = {
  // "--detach": Boolean,
  "-b": Boolean,
  "-B": Boolean,
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

  if (args["-b"] || args["-B"]) {
    if (!args._.length) {
      out.err("Could not create branch, no name specified");
      return ExitStatus.ERR;
    }
    try {
      await git.branch({
        fs: fs.p,
        dir: fs.gitWorkingDir,
        ref: args._[0],
        object: args._[1],
        checkout: true,
        force: args["-B"],
      });
      out.text(`Checked out a new branch '${args._[0]}'`);
      return ExitStatus.OK;
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === "AlreadyExistsError") {
          out.err("Could not create branch, already exists");
          return ExitStatus.ERR;
        }
      }
      throw e;
    }
  }

  try {
    await git.checkout({
      fs: fs.p,
      dir: fs.gitWorkingDir,
      ref: args._[0],
      force: args["--force"],
    });
  } catch (e) {
    if (e instanceof Error) {
      if (e.name === "CheckoutConflictError") {
        out.err(
          `You have local changes in the working tree and/or index that would be overwritten by checking out '${args._[0]}'. If you want to discard them, use [--force].`
        );
        return ExitStatus.ERR;
      }
    }
  }

  return ExitStatus.OK;
}
