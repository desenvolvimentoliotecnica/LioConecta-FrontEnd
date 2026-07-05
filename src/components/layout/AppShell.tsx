import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import { ChatProvider, useChatWindowApi } from "../chat/ChatContext";
import { ChatWidget } from "../chat/ChatWidget";
import { ChevronSymbol, Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

function ChatWindowBridge() {
  const api = useChatWindowApi();

  useEffect(() => {
    window.LioChat = api;
    return () => {
      delete window.LioChat;
    };
  }, [api]);

  return <ChatWidget />;
}

export function AppShell() {
  const { leftExpanded, rightExpanded, toggleLeft, toggleRight, bodyClass } = useSidebar();
  const location = useLocation();

  return (
    <ChatProvider>
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
          <Sidebar
            side="right"
            expanded={rightExpanded}
            onToggle={toggleRight}
            activePath={location.pathname}
          />
        </div>
      </div>
      <ChatWindowBridge />
    </ChatProvider>
  );
}
