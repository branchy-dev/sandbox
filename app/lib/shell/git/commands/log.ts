import fs from "@/app/lib/fs/main";
import arg from "arg";
import git from "isomorphic-git";
import { posix as path } from "path";
import { ExitStatus, Out } from "../../execute";

export const argSchema = {
  "--max-count": Number,
  "-n": "--max-count",
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
  const logs = await git.log({
    fs: fs.p,
    dir: fs.gitWorkingDir,
    depth: args["--max-count"],
    ref: args._[0],
  });
  for (const log of logs) {
    out.text(`commit [${log.oid}]`);
    out.text(`Author: ${log.commit.author.name} <${log.commit.author.email}>`);
    out.text(`Date: ${new Date(log.commit.committer.timestamp * 1000)}`);
    out.text(`\n`);
    out.text(log.commit.message.replace(/^/g, "  "));
    out.text(`\n`);
  }
  return ExitStatus.OK;
}
