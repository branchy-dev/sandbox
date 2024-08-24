"use client";
import mermaid from "mermaid";
import { useEffect, useRef } from "react";
import styles from "./chart.module.css";

export default function Chart(props: { data: string }) {
  const chartDiv = useRef<HTMLDivElement>(null);

  mermaid.initialize({ startOnLoad: false, theme: "dark" });
  async function renderChart() {
    if (!chartDiv.current) return;
    document.getElementById("mermaid-chart")?.remove();
    try {
      const { svg, bindFunctions } = await mermaid.render(
        "mermaid-chart",
        props.data
      );
      chartDiv.current.innerHTML = svg;
      bindFunctions?.(chartDiv.current);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (!props.data) return;
    renderChart();
  }, [props.data]);

  return (
    <div className={styles.chart} ref={chartDiv}>
      No data to show
    </div>
  );
}
