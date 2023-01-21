import { useEffect, useState } from "react";

export const DARK_THEME = "dark";
export const LIGHT_THEME = "light";
export const SHOW_WIRES = "show_wires";

const BLOCK_MENU = "block_menu";
const MINI_MENU = "mini_menu";

const _blockMenu = JSON.parse("" + localStorage.getItem(BLOCK_MENU)) || false;
const _miniMenu = JSON.parse("" + localStorage.getItem(MINI_MENU)) || false;
const _showWires = localStorage.getItem(SHOW_WIRES) ? JSON.parse("" + localStorage.getItem(SHOW_WIRES)) : true;

export const getBlockMenu = () => _blockMenu;
export const getMinimenu = () => _miniMenu;
export const getShowWires = (): boolean => _showWires;

export const useTheme = () => {
  const [isBlockMenu, setIsBlockMenu] = useState(getBlockMenu);
  const [isMiniMenu, setIsMiniMenu] = useState(getMinimenu);

  useEffect(() => {
    const initBlockValue = getBlockMenu();
    const initMiniValue = getMinimenu();

    if (initBlockValue !== isBlockMenu) {
      localStorage.setItem(BLOCK_MENU, isBlockMenu.toString());
    }
    if (initMiniValue !== isMiniMenu) {
      localStorage.setItem(MINI_MENU, isMiniMenu.toString());
    }
  }, [isBlockMenu, isMiniMenu]);

  return [isBlockMenu, setIsBlockMenu, isMiniMenu, setIsMiniMenu];
};
