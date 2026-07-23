import { Outlet, NavLink } from "react-router-dom";
import { ANSIM_TYPES } from "./types";

function AnsimLayout() {
  return (
    <div className="ansim-container">
      <nav className="lnb">
        <ul className="lnb-list">
          {ANSIM_TYPES.map((type) => (
            <li key={type.key}>
              <NavLink
                to={type.path}
                className={({ isActive }) => (isActive ? "lnb-link lnb-link--active" : "lnb-link")}
              >
                {type.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AnsimLayout;
