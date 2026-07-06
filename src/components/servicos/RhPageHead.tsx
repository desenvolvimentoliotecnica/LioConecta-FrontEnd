import type { ComponentProps } from "react";
import { SectionPageHead } from "../layout/SectionPageHead";

export function RhPageHead(props: Omit<ComponentProps<typeof SectionPageHead>, "section">) {
  return <SectionPageHead section="rh" {...props} />;
}
