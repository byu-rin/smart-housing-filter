export interface AnsimType {
  key: string;
  label: string;
  path: string;
}

export const ANSIM_TYPES: AnsimType[] = [
  { key: "public", label: "공공임대", path: "public" },
  { key: "private", label: "민간임대", path: "private" },
];
