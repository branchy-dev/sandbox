"use client";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from "./ui/editor/editor";
import Graph from "./ui/graph/graph";
import Terminal from "./ui/terminal/terminal";

export default function Page() {
  return (
    <main>
      <PanelGroup autoSaveId="main" direction="vertical">
        <Panel collapsible={true} defaultSize={30} order={1}>
          <Graph />
        </Panel>
        <PanelResizeHandle />
        <Panel collapsible={true} defaultSize={30} order={2}>
          <Editor />
        </Panel>
        <PanelResizeHandle />
        <Panel collapsible={true} defaultSize={40} order={3}>
          <Terminal />
        </Panel>
      </PanelGroup>
    </main>
  );
}
