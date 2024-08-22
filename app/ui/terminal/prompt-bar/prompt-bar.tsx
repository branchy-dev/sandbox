"use client";
import { firaCode } from "@/app/lib/fonts/main";
import { tokenizeLine, TokenType } from "@/app/lib/shell/tokenizer";
import { useLayoutEffect, useRef, useState } from "react";
import styles from "./prompt-bar.module.css";

export default function PromptBar(props: {
  onCommand: (args: string[]) => void;
  running: boolean;
}) {
  const commandInput = useRef<HTMLPreElement>(null);
  const [inputData, setInputData] = useState<[string, number?]>([
    "",
    undefined,
  ]);

  function getCaretPos() {
    const textbox = commandInput.current;
    if (!textbox) return;
    const selection = window.getSelection();
    if (!selection) return;
    const range = selection.getRangeAt(0);
    const preCaret = range.cloneRange();
    preCaret.selectNodeContents(textbox);
    preCaret.setEnd(range.endContainer, range.endOffset);
    return preCaret.toString().length;
  }

  function setCaretPos(pos: number) {
    const textbox = commandInput.current;
    if (!textbox) return;
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();

    // Necessary to allow moving to last line on some browsers
    if (pos >= textbox.textContent!.length) {
      const br = textbox.lastChild;
      if (br instanceof HTMLBRElement) {
        range.setStartBefore(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
    }

    let length = 0;
    const found = (function traverse(node: Node = textbox) {
      if (node.nodeType === Node.TEXT_NODE) {
        const newLength = length + node.textContent!.length;
        if (newLength >= pos) {
          // Necessary to allow moving to next line in some browsers
          if (
            pos - length === 1 &&
            node.textContent === "\n" &&
            node.parentElement?.classList.contains(styles.newline) &&
            node.parentElement.nextSibling
          ) {
            range.setStart(node.parentElement.nextSibling, 0);
            return true;
          }
          range.setStart(node, pos - length);
          return true;
        }
        length = newLength;
        return false;
      }
      for (let i = 0; i < node.childNodes.length; i++)
        if (traverse(node.childNodes[i])) return true;
      return false;
    })();
    if (!found) return;

    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function highlight() {
    const textbox = commandInput.current;
    if (!textbox) return;
    const value = inputData[0];
    const data = tokenizeLine(value);

    textbox.innerHTML = "";
    let argSpan = document.createElement("span");
    argSpan.classList.add(styles.arg);
    argSpan.dataset.val = "";
    for (const token of data.tokens) {
      const span = document.createElement("span");
      span.classList.add(styles.token);
      span.textContent = token.content;
      if (token.type === TokenType.USED) argSpan.dataset.val += token.content;
      if (token.type === TokenType.TERMINATOR) {
        span.classList.add(styles.tokenTerminator);
        if (argSpan.childElementCount) {
          textbox.appendChild(argSpan);
          argSpan = document.createElement("span");
          argSpan.classList.add(styles.arg);
          argSpan.dataset.val = "";
        }
        if (span.textContent === "\n") {
          span.classList.add(styles.newline);
        }
        if (span.textContent) textbox.appendChild(span);
        continue;
      }
      if (token.type === TokenType.IGNORED) {
        span.classList.add(styles.tokenIgnored);
        argSpan.appendChild(span);
        continue;
      }
      if (token.type === TokenType.USED) {
        span.classList.add(styles.tokenUsed);
        argSpan.appendChild(span);
        continue;
      }
    }
    if (argSpan.childElementCount) {
      argSpan.classList.add(styles.incomplete);
      textbox.appendChild(argSpan);
    }

    textbox.dataset.valid = data.valid ? "true" : "false";
  }

  function update() {
    setInputData([commandInput.current?.textContent || "", getCaretPos()]);
  }

  useLayoutEffect(() => {
    if (!commandInput.current) return;
    highlight();
    commandInput.current.appendChild(document.createElement("br"));
    if (inputData[1] !== undefined) setCaretPos(inputData[1]);
  }, [inputData]);

  function submitCommand() {
    const textbox = commandInput.current;
    if (!textbox) return;
    if (textbox.dataset.valid !== "true") return false;
    const args: string[] = [];
    for (let i = 0; i < textbox.children.length; i++) {
      const child = textbox.children[i];
      if (
        child instanceof HTMLSpanElement &&
        child.classList.contains(styles.arg)
      ) {
        if (child.dataset.val === undefined) return false;
        args.push(child.dataset.val);
      }
    }
    if (!args.length) return false;
    textbox.replaceChildren(document.createElement("br"));
    props.onCommand(args);
    return true;
  }

  return (
    <div className={styles.promptBar + " " + firaCode.className} aria-disabled={props.running}>
      <div className={styles.prompt}>$</div>
      <pre
        role="textbox"
        className={styles.commandInput}
        contentEditable={!props.running}
        autoCorrect="no"
        autoCapitalize="no"
        spellCheck={false}
        onInput={() => update()}
        ref={commandInput}
        aria-disabled={props.running}
        onKeyDownCapture={(e) => {
          if (e.key === "Enter") {
            if (commandInput.current?.dataset.valid === "true") {
              if (submitCommand()) {
                e.preventDefault();
                return;
              }
            }
            const selection = window.getSelection();
            if (!selection) return;
            const range = selection.getRangeAt(0);
            // Allows adding newlines at the end
            if (range.startContainer instanceof HTMLBRElement)
              range.setStartBefore(range.startContainer);
            range.insertNode(document.createTextNode("\n"));
            range.collapse(false);
            e.preventDefault();
            update();
          }
        }}
      ></pre>
    </div>
  );
}
