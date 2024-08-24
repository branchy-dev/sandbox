import styles from "./history-item.module.css";

export default function HistoryItem(props: {
  args: string[];
  children?: React.ReactNode | React.ReactNode[];
}) {
  return (
    <div className={styles.historyItem}>
      <div className={styles.historyCommand}>
        <span>$</span>
        {props.args.map((arg, i) => (
          <span className={styles.arg} key={i}>
            {arg}
          </span>
        ))}
      </div>
      {props.children &&
      (!(props.children instanceof Array) || props.children.length) ? (
        <pre className={styles.historyOutput}>{props.children}</pre>
      ) : undefined}
    </div>
  );
}
