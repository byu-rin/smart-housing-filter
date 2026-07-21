import { Outlet } from "react-router-dom";
import GNB from "./GNB";

function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <GNB />
      </header>
      <Outlet />
    </div>
  );
}

export default Layout;
