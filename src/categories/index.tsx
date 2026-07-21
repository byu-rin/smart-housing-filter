import type { ReactNode } from "react";
import MaeipPage from "./maeip/MaeipPage";
import AnsimLayout from "./ansim/AnsimLayout";

export interface CategoryDef {
  key: string;
  label: string;
  path: string;
  element: ReactNode;
  isNested?: boolean;
}

export const CATEGORIES: CategoryDef[] = [
  { key: "maeip", label: "청년매입임대", path: "housing/maeip", element: <MaeipPage /> },
  { key: "ansim", label: "청년안심주택", path: "housing/ansim", element: <AnsimLayout />, isNested: true },
];
