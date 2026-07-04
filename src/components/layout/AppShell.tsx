import { Outlet, useLocation } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import { ChevronSymbol, Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell() {
  const { leftExpanded, rightExpanded, toggleLeft, toggleRight, bodyClass } = useSidebar();
  const location = useLocation();

  return (
    <>
      <ChevronSymbol />
      <div className="app-shell">
        <Topbar />
        <div className={`body${bodyClass ? ` ${bodyClass}` : ""}`} id="app-body">
          <Sidebar
            side="left"
            expanded={leftExpanded}
            onToggle={toggleLeft}
            activePath={location.pathname}
          />
          <Outlet />
          <Sidebar side="right" expanded={rightExpanded} onToggle={toggleRight} />
        </div>
      </div>
    </>
  );
}
