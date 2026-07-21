import type { ReactNode } from "react";
import MaeipPage from "./maeip/MaeipPage";
import AnsimPage from "./ansim/AnsimPage";

export interface CategoryDef {
  key: string;
  label: string;
  path: string;
  element: ReactNode;
}

export const CATEGORIES: CategoryDef[] = [
  { key: "maeip", label: "청년매입임대", path: "maeip", element: <MaeipPage /> },
  { key: "ansim", label: "청년안심주택", path: "ansim", element: <AnsimPage /> },
];
