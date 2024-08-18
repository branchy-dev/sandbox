import LightningFS from "@isomorphic-git/lightning-fs";
import path from "path";

export type Data = {
  dirs?: Record<string, Data>;
  files?: Set<string>;
};

export const fs = new LightningFS();
export const fsp = fs.promises;

export async function dumpFileTree(parent = "/") {
  const children = await fsp.readdir(parent);
  const data: Data = {
    dirs: {},
    files: new Set(),
  };
  for (const child of children) {
    const childPath = path.join(parent, child);
    const { type } = await fsp.stat(childPath);
    if (type === "dir") data.dirs![child] = await dumpFileTree(childPath);
    if (type === "file") data.files!.add(child);
  }
  return data;
}

export let initFS = () => {
  fs.init("main-fs");
  initFS = () => {};
};
