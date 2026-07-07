import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useChatHubSync } from "../../api/hooks/useChatHubSync";
import { useNotificationHubSync } from "../../api/hooks/useNotifications";
import { ModuleFocusProvider, useModuleFocus } from "../../context/ModuleFocusContext";
import { useSidebar } from "../../hooks/useSidebar";
import { usePageViewTracking } from "../../telemetry";
import { ChatProvider, useChatWindowApi } from "../chat/ChatContext";
import { ChatWidget } from "../chat/ChatWidget";
import { Sidebar } from "./Sidebar";
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

function AppShellLayout() {
  const { leftExpanded, rightExpanded, toggleLeft, toggleRight, bodyClass } = useSidebar();
  const location = useLocation();
  const { focusMode } = useModuleFocus();
  useNotificationHubSync();
  useChatHubSync();
  usePageViewTracking();

  return (
    <div className={`app-shell${focusMode ? " app-shell--module-focus" : ""}`}>
      <Topbar />
      <div
        className={`body${bodyClass ? ` ${bodyClass}` : ""}${focusMode ? " body--module-focus" : ""}`}
        id="app-body"
      >
        <Sidebar side="left" expanded={leftExpanded} onToggle={toggleLeft} activePath={location.pathname} />
        <Outlet />
        <Sidebar side="right" expanded={rightExpanded} onToggle={toggleRight} activePath={location.pathname} />
      </div>
    </div>
  );
}

export function AppShell() {
  return (
    <ChatProvider>
      <ModuleFocusProvider>
        <AppShellLayout />
      </ModuleFocusProvider>
      <ChatWindowBridge />
    </ChatProvider>
  );
}
