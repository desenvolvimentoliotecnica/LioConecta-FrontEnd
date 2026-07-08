import { useEffect, useState } from "react";

/** Breakpoints alinhados ao CSS do `.feed-grid`. */
export function getFeedColumnCount(width: number): number {
  if (width <= 1100) return 1;
  if (width >= 1400) return 3;
  return 2;
}

export function useFeedColumnCount(): number {
  const [count, setCount] = useState(() =>
    typeof window === "undefined" ? 2 : getFeedColumnCount(window.innerWidth),
  );

  useEffect(() => {
    const update = () => setCount(getFeedColumnCount(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

/** Distribui itens em round-robin: 1→col0, 2→col1, 3→col2… (leitura L→R no topo). */
export function distributeRoundRobin<T>(items: T[], columnCount: number): T[][] {
  const cols = Math.max(1, columnCount);
  const buckets: T[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, index) => {
    buckets[index % cols]!.push(item);
  });
  return buckets;
}
