import LightningFS from "@isomorphic-git/lightning-fs";
import { posix as path } from "path";

export type Data = {
  dirs?: Record<string, Data>;
  files?: Set<string>;
};

const fs = new LightningFS();
const fsp = fs.promises;

async function dumpTree(parent = "/") {
  const children = await fsp.readdir(parent);
  const data: Data = {
    dirs: {},
    files: new Set(),
  };
  for (const child of children) {
    const childPath = path.join(parent, child);
    const { type } = await fsp.stat(childPath);
    if (type === "dir") data.dirs![child] = await dumpTree(childPath);
    if (type === "file") data.files!.add(child);
  }
  return data;
}

let initialized = false;

const gitWorkingDir = "/my-repo";

async function init() {
  if (initialized) return;
  initialized = true;
  fs.init("main-fs");
  try {
    await fsp.mkdir(gitWorkingDir);
  } catch (e) {
    if (e instanceof Error) {
      const error = e.message.split(":")[0];
      if (error == "EEXIST") return;
      throw e;
    }
  }
}

async function exists(filepath: string) {
  try {
    await fsp.stat(filepath);
    return true;
  } catch (e) {
    if (e instanceof Error) {
      const error = e.message.split(":")[0];
      if (error === "ENOENT") {
        return false;
      }
    }
    throw e;
  }
}

async function isFile(filepath: string) {
  try {
    const stat = await fsp.stat(filepath);
    return stat.isFile();
  } catch (e) {
    if (e instanceof Error) {
      const error = e.message.split(":")[0];
      if (error === "ENOENT") {
        return false;
      }
    }
    throw e;
  }
}

async function isDirectory(filepath: string) {
  try {
    const stat = await fsp.stat(filepath);
    return stat.isDirectory();
  } catch (e) {
    if (e instanceof Error) {
      const error = e.message.split(":")[0];
      if (error === "ENOENT") {
        return false;
      }
    }
    throw e;
  }
}

const fsModule = {
  p: fsp,
  exists,
  isFile,
  isDirectory,
  dumpTree,
  init,
  gitWorkingDir,
};

export default fsModule;
