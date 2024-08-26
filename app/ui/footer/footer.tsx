import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>&copy; 2024 Sátvik Karanam</div>
      <hr />
      <div>Branchy v0.1.0</div>
      <hr />
      <div>
        <a target="_blank" href="https://github.com/skara9/branchy">
          See on GitHub
        </a>
      </div>
    </footer>
  );
}
