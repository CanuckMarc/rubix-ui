import { useEffect } from "react";

export const useCtrlPressKey = (
  key: string,
  callback: (e: KeyboardEvent) => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // delete nodes and edges selected
      if ((e.target as HTMLInputElement)?.tagName?.toUpperCase() !== 'INPUT' &&
        (e.code === 'Delete' || e.code === 'Backspace') && key === 'Backspace') {
        e.preventDefault();
        callback(e);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.code === key) {
        if (e.code !== "KeyC" && e.code !== "KeyV") {
          e.preventDefault();
          e.stopPropagation();
        }
        callback(e);
      };
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [key, callback]);
};
