const SHELL_SELECTOR =
  /(?:^|[\s,>+~])(?:\.body(?:[.:\s[#,\[]|$)|\.sidebar(?:--|__|[\s.:\[#,\[]|$))/;

function findMatchingBrace(css: string, openIndex: number): number {
  let depth = 0;
  for (let index = openIndex; index < css.length; index += 1) {
    const char = css[index];
    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return css.length - 1;
}

function shouldStripSelectorList(selectorList: string): boolean {
  return selectorList.split(",").some((selector) => SHELL_SELECTOR.test(selector.trim()));
}

/** Legacy pages ship full-layout CSS; strip shell rules so AppShell layout stays consistent. */
export function stripShellLayoutCss(css: string): string {
  const out: string[] = [];
  let index = 0;

  while (index < css.length) {
    while (index < css.length && /\s/.test(css[index] ?? "")) index += 1;
    if (index >= css.length) break;

    if (css.startsWith("/*", index)) {
      const end = css.indexOf("*/", index + 2);
      if (end === -1) {
        out.push(css.slice(index));
        break;
      }
      out.push(css.slice(index, end + 2));
      index = end + 2;
      continue;
    }

    if (css[index] === "@") {
      const braceStart = css.indexOf("{", index);
      if (braceStart === -1) break;
      const header = css.slice(index, braceStart);
      const innerEnd = findMatchingBrace(css, braceStart);
      const inner = css.slice(braceStart + 1, innerEnd);

      if (/^@(?:media|supports|layer)\b/.test(header.trim())) {
        const cleanedInner = stripShellLayoutCss(inner);
        if (cleanedInner.trim()) {
          out.push(`${header}{${cleanedInner}}`);
        }
      } else {
        out.push(css.slice(index, innerEnd + 1));
      }

      index = innerEnd + 1;
      continue;
    }

    const braceStart = css.indexOf("{", index);
    if (braceStart === -1) break;
    const selectors = css.slice(index, braceStart);
    const innerEnd = findMatchingBrace(css, braceStart);
    const block = css.slice(index, innerEnd + 1);

    if (!shouldStripSelectorList(selectors)) {
      out.push(block);
    }

    index = innerEnd + 1;
  }

  return out.join("");
}

export function injectScopedPageStyle(styleId: string, css: string): () => void {
  const attr = `data-page-style="${styleId}"`;
  document.querySelector(`style[${attr}]`)?.remove();

  const sanitized = stripShellLayoutCss(css);
  if (!sanitized.trim()) return () => undefined;

  const el = document.createElement("style");
  el.setAttribute("data-page-style", styleId);
  el.textContent = sanitized;
  document.head.appendChild(el);

  return () => {
    document.querySelector(`style[${attr}]`)?.remove();
  };
}
