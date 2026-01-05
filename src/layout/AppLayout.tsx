import { NavLink, Outlet } from "react-router-dom";
import styles from "./AppLayout.module.css";

const E = {
  today: "\u{1F4C5}",
  announcements: "\u{1F4E3}",
  substitutions: "\u{1F501}",
  profile: "\u{1F464}",
};

const L = {
  today: "\u0421\u044C\u043E\u0433\u043E\u0434\u043D\u0456",
  announcements: "\u041E\u0433\u043E\u043B\u043E\u0448\u0435\u043D\u043D\u044F",
  substitutions: "\u0417\u0430\u043C\u0456\u043D\u0438",
  profile: "\u041F\u0440\u043E\u0444\u0456\u043B\u044C",
};

function NavItem({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
      }
    >
      <span aria-hidden className={styles.icon}>
        {icon}
      </span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  return (
    <>
      <div className={styles.shell}>
        <Outlet />
      </div>

      <nav className={styles.bottomNav} aria-label="Main navigation">
        <NavItem to="/today" icon={"\u{1F4C5}"} label={"\u0421\u044C\u043E\u0433\u043E\u0434\u043D\u0456"} />
        <NavItem to="/announcements" icon={"\u{1F4E3}"} label={"\u041E\u0433\u043E\u043B\u043E\u0448\u0435\u043D\u043D\u044F"} />
        <NavItem to="/substitutions" icon={"\u{1F501}"} label={"\u0417\u0430\u043C\u0456\u043D\u0438"} />
        <NavItem to="/profile" icon={"\u{1F464}"} label={"\u041F\u0440\u043E\u0444\u0456\u043B\u044C"} />
      </nav>
    </>
  );
}

