import fs from "@/app/lib/fs/main";
import arg from "arg";
import git from "isomorphic-git";
import { posix as path } from "path";
import { ExitStatus, Out } from "../../execute";

export const argSchema = {};

export async function run(
  args: arg.Result<typeof argSchema>,
  out: Out
): Promise<ExitStatus> {
  if (args._.length) {
    out.err("git status: Unsupported argument configuration");
    return ExitStatus.ERR;
  }
  fs.init();
  if (!(await fs.isFile(path.join(fs.gitWorkingDir, ".git", "HEAD")))) {
    out.err("Could not find git repository");
    return ExitStatus.ERR;
  }
  const matrix = await git.statusMatrix({ fs: fs.p, dir: fs.gitWorkingDir });
  enum changeType {
    CREATE = "Create",
    DELETE = "Delete",
    UPDATE = "Update",
  }
  type changes = { [filename: string]: changeType };
  const indexChanges: changes = {};
  const workingChanges: changes = {};
  for (const [filename, a, c, b] of matrix) {
    if (a === 0 && b >= 2)
      // if absent in head and index != head
      indexChanges[filename] = changeType.CREATE;
    if (a === 1 && b >= 2)
      // if present in head and index != head
      indexChanges[filename] = changeType.UPDATE;
    if (a === 1 && b === 0)
      // if present in head and absent in index
      indexChanges[filename] = changeType.DELETE;
    if (b === 0 && c >= 1)
      // if absent in index and workdir != index
      workingChanges[filename] = changeType.CREATE;
    if (b === 1 && c === 2)
      // if index = head and workdir != index
      workingChanges[filename] = changeType.UPDATE;
    if (b === 1 && c === 0)
      // if index = head and absent in workdir
      workingChanges[filename] = changeType.DELETE;
    if (b === 3 && c === 2)
      // if index != workdir and workdir != head
      workingChanges[filename] = changeType.UPDATE;
    if (b === 3 && c === 1)
      // if index != workdir and workdir = head
      workingChanges[filename] = changeType.UPDATE;
    if (b === 3 && c === 0)
      // if index != workdir and absent in workdir
      workingChanges[filename] = changeType.DELETE;
  }
  out.text("Staged changes (changes in index)");
  Object.entries(indexChanges).forEach(([filename, type]) =>
    out.text(`    ${type} '${filename}'`)
  );
  out.text("Unstaged changes (changes in working tree)");
  Object.entries(workingChanges).forEach(([filename, type]) =>
    out.text(`    ${type} '${filename}'`)
  );
  return ExitStatus.OK;
}
