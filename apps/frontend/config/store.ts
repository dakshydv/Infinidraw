import { create } from "zustand";

type ToolProps = {
  tool: "rect" | "circle" | "pointer" | "line";
  update: (tool: ToolProps["tool"]) => void;
};

export const useToolStore = create<ToolProps>((set) => ({
  tool: "rect",
  update: (tool) => set(() => ({ tool })),
}));
