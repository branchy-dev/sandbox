"use client";
import { posix as path } from "path";
import { useEffect, useState } from "react";
import fs, { Data } from "../../lib/fs/main";
import styles from "./editor.module.css";
import FileTree from "./file-tree/file-tree";
import TextEditor from "./text-editor/text-editor";

export default function Editor(props: {
  onUpdate: () => void;
  update: number;
}) {
  const [data, setData] = useState<Data>({});
  const [currentFile, setCurrentFile] = useState<{
    path: string;
    body: string;
  } | null>(null);

  async function updateData() {
    await openFile(currentFile?.path);
    const newData = await fs.dumpTree(fileRoot);
    setData(newData);
  }

  useEffect(() => {
    updateData();
  }, [props.update]);

  async function overwriteCurrentFile(newData: string) {
    if (!currentFile) return;
    await fs.p.writeFile(currentFile.path, newData);
    props.onUpdate();
  }

  const fileRoot = fs.gitWorkingDir ?? "/";
  const cleanPath = (p: string) => {
    p = path.join(fileRoot, path.normalize(p));
    const rel = path.relative(fileRoot, p);
    if (rel.split(path.sep)[0] == ".." || path.isAbsolute(rel)) {
      throw new Error("Invalid path");
    }
    return p;
  };

  async function openFile(filePath?: string) {
    if (filePath === currentFile?.path) return;
    if (filePath) {
      filePath = await cleanPath(filePath);
      if (await fs.isFile(filePath)) {
        const data = (await fs.p.readFile(filePath)).toString();
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
    if (!(await fs.exists(dirPath))) {
      const res = await createDirectory(path.dirname(dirPath));
      if (res) return res;
      await fs.p.mkdir(dirPath);
    } else if (!(await fs.isDirectory(dirPath))) {
      return "Requested parent directory collides with existing file";
    }
  }

  async function writeFile(filePath: string) {
    if (filePath === "") return;
    filePath = cleanPath(filePath);
    if (await fs.exists(filePath)) throw new Error("Requested path exists");
    const err = await createDirectory(path.dirname(filePath));
    if (err) throw new Error(err);
    await fs.p.writeFile(filePath, "");
    await updateData();
  }

  async function removeFile(filePath: string) {
    filePath = cleanPath(filePath);
    await fs.p.unlink(filePath);
    await updateData();
  }

  async function renameFile(oldPath: string, newPath: string) {
    if (newPath === "") return;
    oldPath = cleanPath(oldPath);
    newPath = cleanPath(newPath);
    if (oldPath === newPath) return;
    await fs.p.rename(oldPath, newPath);
    await updateData();
  }

  useEffect(() => {
    fs.init();
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
