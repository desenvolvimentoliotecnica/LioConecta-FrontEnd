import { useCallback, useState } from "react";

export function useSidebar() {
  const [leftExpanded, setLeftExpanded] = useState(false);
  const [rightExpanded, setRightExpanded] = useState(false);

  const toggleLeft = useCallback(() => {
    setLeftExpanded((v) => !v);
  }, []);

  const toggleRight = useCallback(() => {
    setRightExpanded((v) => !v);
  }, []);

  const bodyClass = [
    leftExpanded ? "is-left-expanded" : "",
    rightExpanded ? "is-right-expanded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return { leftExpanded, rightExpanded, toggleLeft, toggleRight, bodyClass };
}
