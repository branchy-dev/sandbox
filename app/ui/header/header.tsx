import Logo from "../logo/logo";
import styles from "./header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Logo />
      </div>
      <h1>Branchy</h1>
    </header>
  );
}
