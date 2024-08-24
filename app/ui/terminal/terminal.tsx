"use client";
import { execute, OutputType } from "@/app/lib/shell/execute";
import { useState } from "react";
import HistoryItem from "./log-history/history-item";
import PromptBar from "./prompt-bar/prompt-bar";
import styles from "./terminal.module.css";
import { firaCode } from "@/app/lib/fonts/main";

export default function Terminal() {
  type historyItem = { args: string[]; output: React.ReactNode[] };
  const [running, setRunning] = useState<boolean>(false);
  const [history, setHistory] = useState<historyItem[]>([]);

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

  return (
    <div className={styles.terminal + " " + firaCode.className}>
      <div className={styles.history}>
        {history.map((item, i) => (
          <HistoryItem key={i} args={item.args}>
            {item.output}
          </HistoryItem>
        ))}
      </div>
      <div className={styles.promptBar}>
        <PromptBar onCommand={runCommand} running={running} />
      </div>
    </div>
  );
}
