import fs from "@/app/lib/fs/main";
import arg from "arg";
import git from "isomorphic-git";
import { posix as path } from "path";
import { ExitStatus, Out } from "../../execute";

export const argSchema = {
  "--force": Boolean,
  "-f": "--force",
  "--cached": Boolean,
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

  const indexFiles = await git.listFiles({ fs: fs.p, dir: fs.gitWorkingDir });
  const missingFiles = args._.filter((file) => !indexFiles.includes(file));
  if (missingFiles.length) {
    out.err(
      `Could not find file${missingFiles.length === 1 ? "" : "s"} in index:`
    );
    for (const file of missingFiles) out.err("  " + file);
    return ExitStatus.ERR;
  }

  if (!args["--cached"] && !args["--force"]) {
    const presentFiles = [];
    for (const file of args._) {
      if (await fs.exists(path.join(fs.gitWorkingDir, file))) {
        presentFiles.push(file);
      }
    }
    if (presentFiles.length) {
      out.err(
        `The following files are present in the working directory. To remove only from index, use [--cached]. To force removal, use [--force/-f].`
      );
      for (const file of presentFiles) out.err("  " + file);
      return ExitStatus.ERR;
    }
  }

  for (const file of args._) {
    out.text(`Removing '${file}'`);
    await git.remove({
      fs: fs.p,
      dir: fs.gitWorkingDir,
      filepath: file,
    });
    if (!args["--cached"]) await fs.p.unlink(path.join(fs.gitWorkingDir, file));
  }

  return ExitStatus.OK;
}
