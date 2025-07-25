import { ReactNode } from "react";

export function IconButton({
  onClick,
  selectedTool,
  icon,
  theme
}: {
  onClick: () => void,
  selectedTool: string,
  icon: ReactNode,
  theme: string
}) {
  return <button
    onClick={onClick}
    className={`p-2 rounded-md ${theme} hover:cursor-pointer font-medium `}
  >
    {icon}
  </button>;
}
