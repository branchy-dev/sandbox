"use client";
import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import styles from "./page.module.css";
import Editor from "./ui/editor/editor";
import Graph from "./ui/graph/graph";
import Terminal from "./ui/terminal/terminal";

export default function Page() {
  const [update, setUpdate] = useState<number>(0);

  return (
    <main className={styles.main}>
      <PanelGroup autoSaveId="main" direction="vertical">
        <Panel collapsible={true} defaultSize={30} order={1}>
          <Graph update={update} />
        </Panel>
        <PanelResizeHandle />
        <Panel collapsible={true} defaultSize={30} order={2}>
          <Editor update={update} onUpdate={() => setUpdate((x) => x + 1)} />
        </Panel>
        <PanelResizeHandle />
        <Panel collapsible={true} defaultSize={40} order={3}>
          <Terminal onUpdate={() => setUpdate((x) => x + 1)} />
        </Panel>
      </PanelGroup>
    </main>
  );
}
