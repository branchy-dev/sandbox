"use client";
import { firaCode } from "@/app/lib/fonts/main";
import { execute, OutputType } from "@/app/lib/shell/execute";
import { useEffect, useRef, useState } from "react";
import HistoryItem from "./log-history/history-item";
import PromptBar from "./prompt-bar/prompt-bar";
import styles from "./terminal.module.css";

export default function Terminal(props: { onUpdate: () => void }) {
  type historyItem = { args: string[]; output: React.ReactNode[] };
  const [running, setRunning] = useState<boolean>(false);
  const [history, setHistory] = useState<historyItem[]>([]);
  const historyDiv = useRef<HTMLDivElement>(null);

  function runCommand(args: string[]) {
    setRunning(true);
    const item: historyItem = { args, output: [] };
    const hist = [...history, item];
    setHistory(hist);
    execute(args, (output) => {
      switch (output.type) {
        case OutputType.TEXT:
          item.output.push(
            <div key={item.output.length} className={styles.outputText}>
              {output.content}
            </div>
          );
          setHistory(hist);
          break;
        case OutputType.ERR:
          item.output.push(
            <div key={item.output.length} className={styles.outputErr}>
              {output.message}
            </div>
          );
          setHistory(hist);
          break;
        case OutputType.END:
          setRunning(false);
          break;
      }
    });
  }

  useEffect(() => {
    props.onUpdate();
  }, [props, running]);

  useEffect(() => {
    setTimeout(
      () =>
        historyDiv.current?.lastElementChild?.scrollIntoView({
          block: "end",
          behavior: "smooth",
        }),
      100
    );
  }, [history]);

  return (
    <div className={styles.terminal + " " + firaCode.className}>
      <div className={styles.history} ref={historyDiv}>
        {history.map((item, i) => (
          <HistoryItem key={i} args={item.args}>
            {item.output}
          </HistoryItem>
        ))}
        <div aria-hidden></div>
      </div>
      <div className={styles.promptBar}>
        <PromptBar onCommand={runCommand} running={running} />
      </div>
    </div>
  );
}
