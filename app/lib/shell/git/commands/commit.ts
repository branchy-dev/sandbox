import fs from "@/app/lib/fs/main";
import arg from "arg";
import git from "isomorphic-git";
import { posix as path } from "path";
import { ExitStatus, Out } from "../../execute";

export const argSchema = {
  "--amend": Boolean,
  "--message": String,
  "-m": "--message",
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
  const message = args["--message"];
  if (message === undefined) {
    out.err("Please provide a commit message");
    return ExitStatus.ERR;
  }
  const hash = await git.commit({
    fs: fs.p,
    dir: fs.gitWorkingDir,
    amend: args["--amend"],
    message,
    author: {
      name: "You",
      email: "your-email@example.com",
    },
  });
  out.text(
    `${
      args["--amend"] ? "Updated" : "Created"
    } commit [${hash}] with message "${message}"`
  );
  return ExitStatus.OK;
}
