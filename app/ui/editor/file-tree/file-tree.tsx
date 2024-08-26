"use client";
import { Data } from "@/app/lib/fs/main";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { posix as path } from "path";
import { useState } from "react";
import FileTreeItem from "./file-tree-item";
import styles from "./file-tree.module.css";

export default function FileTree(props: {
  data: Data;
  selectedFile: string | null;
  createFile: (path: string) => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  selectFile: (path: string) => void;
}) {
  function display(d: Data, pathParts: string[] = []) {
    return (
      <>
        {Object.keys(d.dirs ?? {})
          .toSorted()
          .map((dirname) => {
            const filePath = path.join(...pathParts, dirname);
            return (
              <FileTreeItem
                path={filePath}
                name={dirname}
                isDir
                key={filePath}
                onDelete={() => props.deleteFile(filePath)}
                onRename={(newName) => props.renameFile(filePath, newName)}
              >
                {display(d.dirs![dirname], [...pathParts, dirname])}
              </FileTreeItem>
            );
          })}
        {Array.from(d.files ?? [])
          .toSorted()
          .map((filename) => {
            const filePath = path.join(...pathParts, filename);
            return (
              <FileTreeItem
                path={filePath}
                name={filename}
                key={filePath}
                isSelected={props.selectedFile === filePath}
                onSelect={() => props.selectFile(filePath)}
                onDelete={() => props.deleteFile(filePath)}
                onRename={(newPath) => props.renameFile(filePath, newPath)}
              />
            );
          })}
      </>
    );
  }

  const [placeholder, setPlaceholder] = useState<boolean>(false);

  return (
    <section className={styles.fileTree}>
      <header>
        <h2>WORKING TREE</h2>
        <button title="Create a new file" onClick={() => setPlaceholder(true)}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </header>
      <ul>
        {display(props.data)}
        {placeholder && (
          <FileTreeItem
            isPlaceholder
            onRename={(newName) => {
              setPlaceholder(false);
              props.createFile(newName);
            }}
          />
        )}
      </ul>
    </section>
  );
}
