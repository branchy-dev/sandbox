"use client";
import { posix as path } from "path";
import { useEffect, useState } from "react";
import { Data, dumpFileTree, fsp, initFS } from "../../lib/fs/main";
import styles from "./editor.module.css";
import FileTree from "./file-tree/file-tree";

export default function Editor() {
  const [data, setData] = useState<Data>({});

  function updateData() {
    dumpFileTree().then((newData) => setData(newData));
  }

  const fileRoot = "/";
  const cleanPath = (p: string) => {
    p = path.join(fileRoot, path.normalize(p));
    const rel = path.relative(fileRoot, p);
    if (rel.split(path.sep)[0] == ".." || path.isAbsolute(rel)) {
      throw new Error("Invalid path");
    }
    return p;
  };

  async function tryStat(filePath: string) {
    try {
      return await fsp.stat(filePath);
    } catch (e) {
      if (e instanceof Error) {
        const error = e.message.split(":")[0];
        if (error === "ENOENT") {
          return null;
        }
      }
      throw e;
    }
  }

  async function createDirectory(dirPath: string): Promise<string | undefined> {
    if (dirPath === fileRoot) return;
    const stat = await tryStat(dirPath);
    if (!stat) {
      const res = await createDirectory(path.dirname(dirPath));
      if (res) return res;
      await fsp.mkdir(dirPath);
    } else if (!stat.isDirectory()) {
      return "Requested parent directory collides with existing file";
    }
  }

  async function writeFile(filePath: string) {
    if (filePath === "") return;
    filePath = cleanPath(filePath);
    const stat = await tryStat(filePath);
    if (stat) throw new Error("Requested path exists");
    const err = await createDirectory(path.dirname(filePath));
    if (err) throw new Error(err);
    await fsp.writeFile(filePath, "");
    updateData();
  }

  async function removeFile(filePath: string) {
    filePath = cleanPath(filePath);
    await fsp.unlink(filePath);
    updateData();
  }

  async function renameFile(oldPath: string, newPath: string) {
    if (newPath === "") return;
    oldPath = cleanPath(oldPath);
    newPath = cleanPath(newPath);
    if (oldPath === newPath) return;
    await fsp.rename(oldPath, newPath);
    updateData();
  }

  useEffect(() => {
    initFS();
    updateData();
  }, []);

  return (
    <div className={styles.editor}>
      <div className={styles.fileView}>
        <FileTree
          data={data}
          createFile={writeFile}
          deleteFile={removeFile}
          renameFile={renameFile}
        />
      </div>
    </div>
  );
}
