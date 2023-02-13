import { CSSProperties, MouseEvent as ReactMouseEvent } from "react";
import {
  XYPosition,
  Position,
  CoordinateExtent,
  internalsSymbol,
  NodeHandleBounds,
} from "react-flow-renderer";

export type NodeInterfaceInfo = {
  nodeName?: string;
};

export interface NodeInterface<T = any> {
  id: string;
  position: XYPosition;
  oldId?: string;
  data: T;
  type?: string;
  style?: CSSProperties;
  className?: string;
  targetPosition?: Position;
  sourcePosition?: Position;
  hidden?: boolean;
  selected?: boolean;
  dragging?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  connectable?: boolean;
  dragHandle?: string;
  orderInput?: any;
  hiddenInput?: any;
  width?: number | null;
  height?: number | null;
  originalHeight?: number | null;
  parentNode?: string;
  zIndex?: number;
  extent?: "parent" | CoordinateExtent;
  expandParent?: boolean;
  positionAbsolute?: XYPosition;
  [internalsSymbol]?: {
    z?: number;
    handleBounds?: NodeHandleBounds;
    isParent?: boolean;
  };
  settings?: any; // Interface Setting cannot be determined
  isParent?: boolean;
  parentId?: string;
  status?: any;
  info?: NodeInterfaceInfo;
}

export type OutputNodeValueType = {
  pin: string;
  dataType: string;
  value: any
}
