"use client";
import createTheme from "@uiw/codemirror-themes";
import CodeMirror from "@uiw/react-codemirror";
import styles from "./text-editor.module.css";

export default function TextEditor(props: {
  contents: string;
  onUpdate: (newData: string) => void;
}) {
  const darkTheme = createTheme({
    theme: "dark",
    settings: {
      background: "#0D0E12",
      foreground: "#E1E1E1",
      caret: "#C6C6C6",
      selection: "#6199FF2F",
      selectionMatch: "#00000000",
      lineHighlight: "#FFFFFF0C",
      gutterBackground: "#0D0E12",
      gutterForeground: "#5B5B5B",
      gutterActiveForeground: "#A3A3A3",
      fontFamily:
        'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    },
    styles: [],
  });

  return (
    <div className={styles.textEditor}>
      <CodeMirror
        value={props.contents}
        theme={darkTheme}
        width="100%"
        height="100%"
        onChange={(s) => props.onUpdate(s)}
      />
    </div>
  );
}
