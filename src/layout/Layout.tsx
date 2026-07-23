import { Outlet } from "react-router-dom";
import GNB from "./GNB";
import NotificationInbox from "./NotificationInbox";

function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <GNB />
        <NotificationInbox />
      </header>
      <Outlet />
    </div>
  );
}

export default Layout;
