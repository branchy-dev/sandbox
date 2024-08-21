"use client";
import { posix as path } from "path";
import { useEffect, useState } from "react";
import {
  Data,
  dumpFileTree,
  fsp,
  gitWorkingDir,
  initFS,
} from "../../lib/fs/main";
import styles from "./editor.module.css";
import FileTree from "./file-tree/file-tree";
import TextEditor from "./text-editor/text-editor";

export default function Editor() {
  const [data, setData] = useState<Data>({});
  const [currentFile, setCurrentFile] = useState<{
    path: string;
    body: string;
  } | null>(null);

  async function updateData() {
    await openFile(currentFile?.path);
    const newData = await dumpFileTree(fileRoot);
    setData(newData);
  }

  async function overwriteCurrentFile(newData: string) {
    if (!currentFile) return;
    await fsp.writeFile(currentFile.path, newData);
  }

  const fileRoot = gitWorkingDir ?? "/";
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

  async function openFile(filePath?: string) {
    if (filePath) {
      filePath = await cleanPath(filePath);
      const stat = await tryStat(filePath);
      if (stat?.isFile()) {
        const data = (await fsp.readFile(filePath)).toString();
        return setCurrentFile({
          path: filePath,
          body: data,
        });
      }
    }
    return setCurrentFile(null);
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
    await updateData();
  }

  async function removeFile(filePath: string) {
    filePath = cleanPath(filePath);
    await fsp.unlink(filePath);
    await updateData();
  }

  async function renameFile(oldPath: string, newPath: string) {
    if (newPath === "") return;
    oldPath = cleanPath(oldPath);
    newPath = cleanPath(newPath);
    if (oldPath === newPath) return;
    await fsp.rename(oldPath, newPath);
    await updateData();
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
          selectedFile={currentFile?.path.substring(fileRoot.length) ?? null}
          createFile={writeFile}
          deleteFile={removeFile}
          renameFile={renameFile}
          selectFile={(p) => openFile(p)}
        />
      </div>
      <div className={styles.editorView}>
        {currentFile ? (
          <TextEditor
            contents={currentFile.body}
            onUpdate={(newData) => overwriteCurrentFile(newData)}
          />
        ) : null}
      </div>
    </div>
  );
}
