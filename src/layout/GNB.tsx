import { NavLink } from "react-router-dom";
import { CATEGORIES } from "../categories";

function GNB() {
  return (
    <nav className="gnb">
      <ul className="gnb-list">
        {CATEGORIES.map((c) => (
          <li key={c.key}>
            <NavLink
              to={`/${c.path}`}
              className={({ isActive }) => (isActive ? "gnb-link gnb-link--active" : "gnb-link")}
            >
              {c.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default GNB;
