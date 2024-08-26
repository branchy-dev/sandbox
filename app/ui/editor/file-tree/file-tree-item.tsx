"use client";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import styles from "./file-tree-item.module.css";

export default function FileTreeItem(
  props:
    | { isPlaceholder: true; onRename: (newName: string) => void }
    | ({
        isPlaceholder?: false;
        path: string;
        name: string;
        onDelete: () => void;
        onRename: (newName: string) => void;
      } & (
        | {
            isDir?: false;
            onSelect: () => void;
            isSelected: boolean;
          }
        | {
            isDir: true;
            children?: React.ReactNode | React.ReactNode[];
          }
      ))
) {
  const [isBeingRenamed, setIsBeingRenamed] = useState<boolean>(
    !!props.isPlaceholder // Placeholder is always being renamed
  );

  const [isOpen, setIsOpen] = useState<boolean>(false); // For directories

  let editButtons = <></>;
  if (!props.isPlaceholder)
    editButtons = (
      <>
        <button
          title="Rename"
          onClick={(e) => (e.stopPropagation(), setIsBeingRenamed(true))}
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
        <button
          title="Delete"
          onClick={(e) => (e.stopPropagation(), props.onDelete())}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </>
    );

  const topLine = (
    <div>
      <span
        onKeyDown={(e) =>
          e.key == "Enter" ? e.currentTarget.blur() : undefined
        }
        onBlur={(e) => {
          setIsBeingRenamed(false);
          props.onRename(e.currentTarget.textContent!.trim());
        }}
        ref={(x) => {
          if (x == null) return;
          if (props.isPlaceholder) {
            x.focus();
            return;
          }
          if (!isBeingRenamed) {
            // If user edited path, React will not know to re-render it
            if (x.textContent !== props.name) x.textContent = props.name;
            return;
          }
          x.focus();
          const range = document.createRange();
          const text = x.firstChild;
          // Select basename of file path
          if (
            text?.nodeType === Node.TEXT_NODE &&
            text.textContent === props.path
          ) {
            range.setStart(text, props.path.length - props.name.length);
            range.setEnd(text, props.path.length);
            const selection = window.getSelection();
            if (selection) {
              selection?.removeAllRanges();
              selection?.addRange(range);
            }
          }
        }}
        // For renaming
        suppressContentEditableWarning={true}
        contentEditable={isBeingRenamed ? true : undefined}
        aria-multiline={isBeingRenamed ? false : undefined}
        spellCheck={isBeingRenamed ? false : undefined}
        tabIndex={isBeingRenamed ? 0 : undefined}
        role={isBeingRenamed ? "textbox" : undefined}
        aria-placeholder={
          isBeingRenamed
            ? "The new file path, separated by slashes if necessary"
            : undefined
        }
        onClick={isBeingRenamed ? (e) => e.stopPropagation() : undefined}
      >
        {props.isPlaceholder ? (
          <>&nbsp;</>
        ) : isBeingRenamed ? (
          props.path
        ) : (
          props.name
        )}
      </span>
      {editButtons}
    </div>
  );

  // Display placeholder
  if (props.isPlaceholder) {
    return (
      <li className={styles.fileTreeItem} aria-label="New file">
        {topLine}
      </li>
    );
  }

  // Display file
  if (!props.isDir) {
    return (
      <li
        className={styles.fileTreeItem}
        aria-label={props.path}
        data-selected={props.isSelected}
        onClick={(e) => (e.stopPropagation(), props.onSelect())}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            props.onSelect();
          }
        }}
        tabIndex={0}
      >
        {topLine}
      </li>
    );
  }

  // Display directory
  return (
    <li
      className={styles.fileTreeItem}
      data-isdir
      data-expanded={isOpen}
      aria-label={props.path}
      onClick={(e) => (e.stopPropagation(), setIsOpen((x) => !x))}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.stopPropagation();
          setIsOpen((x) => !x);
        }
      }}
      tabIndex={0}
    >
      {topLine}
      {isOpen ? <ul role="group">{props.children}</ul> : null}
    </li>
  );
}
