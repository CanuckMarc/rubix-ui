import { memo, HTMLAttributes, useCallback, useRef } from "react";
import cc from "classnames";
import {
  Node,
  Rect,
  useStoreApi,
  getRectOfNodes,
  useReactFlow,
} from "reactflow";
import {
  createUseGesture,
  UserHandlers,
  wheelAction,
  dragAction,
} from "@use-gesture/react";

import MiniMapNode from "./MiniMapNode";
import { getBoundsOfRects } from "../../../../utils/graph";
import { NodeInterface } from "../../lib/Nodes/NodeInterface";

type StringFunc = (node: Node) => string;

export interface MiniMapProps extends HTMLAttributes<SVGSVGElement> {
  nodeColor?: string | StringFunc;
  nodeStrokeColor?: string | StringFunc;
  nodeClassName?: string | StringFunc;
  nodeBorderRadius?: number;
  nodeStrokeWidth?: number;
  maskColor?: string;
  nodes: NodeInterface[];
  shouldUpdate: boolean; // this used for re-render the mini map
}

// declare const window: any;
const defaultWidth = 200;
const defaultHeight = 150;

const useGesture = createUseGesture([dragAction, wheelAction]);

const MiniMap = ({
  style,
  className,
  nodeStrokeColor = "#555",
  nodeColor = "#fff",
  nodeClassName = "",
  nodeBorderRadius = 2,
  nodeStrokeWidth = 2,
  maskColor = "rgba(0,0,0,0.1)",
  nodes = [],
}: MiniMapProps) => {
  const store = useStoreApi().getState();
  const containerWidth = store.width;
  const containerHeight = store.height;
  const [tX, tY, tScale] = store.transform;
  const mapClasses = cc(["react-flow__minimap", className]);
  const elementWidth = (style?.width || defaultWidth)! as number;
  const elementHeight = (style?.height || defaultHeight)! as number;

  const nodeColorFunc = (
    nodeColor instanceof Function ? nodeColor : () => nodeColor
  ) as StringFunc;

  const nodeStrokeColorFunc = (
    nodeStrokeColor instanceof Function
      ? nodeStrokeColor
      : () => nodeStrokeColor
  ) as StringFunc;

  const nodeClassNameFunc = (
    nodeClassName instanceof Function ? nodeClassName : () => nodeClassName
  ) as StringFunc;

  const hasNodes = nodes && nodes.length;
  const bb = getRectOfNodes(nodes);
  const viewBB: Rect = {
    x: -tX / tScale,
    y: -tY / tScale,
    width: containerWidth / tScale,
    height: containerHeight / tScale,
  };
  const boundingRect = hasNodes ? getBoundsOfRects(bb, viewBB) : viewBB;
  const scaledWidth = boundingRect.width / elementWidth;
  const scaledHeight = boundingRect.height / elementHeight;
  const viewScale = Math.max(scaledWidth, scaledHeight);
  const viewWidth = viewScale * elementWidth;
  const viewHeight = viewScale * elementHeight;
  const offset = 5 * viewScale;
  const x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
  const y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;
  const width = viewWidth + offset * 2;
  const height = viewHeight + offset * 2;
  const shapeRendering =
    typeof window === "undefined" || !!(window as any).chrome
      ? "crispEdges"
      : "geometricPrecision";

  const minZoom = store.minZoom;
  const maxZoom = store.maxZoom;

  const rectRef = useRef<SVGRectElement>(null);

  const { setViewport } = useReactFlow();

  const onDrag = useCallback<UserHandlers["onDrag"]>(
    ({ delta: [x, y] }: any) => {
      setViewport(
        {
          x: tX + -x * tScale * scaledWidth,
          y: tY + -y * tScale * scaledHeight,
          zoom: tScale,
        },
        { duration: 100 }
      );
    },
    [scaledHeight, scaledWidth, tScale, tX, tY, setViewport]
  );

  const onWheel = useCallback<UserHandlers["onWheel"]>(
    ({ event: { clientX, clientY, deltaY }, active }: any) => {
      if (!active) return;
      const sign = Math.sign(deltaY);

      const { x, y } = rectRef.current?.getBoundingClientRect() || {
        x: clientX,
        y: clientY,
      };
      const pX = clientX - x;
      const pY = clientY - y;

      const multiplier = sign === -1 ? 1.2 : sign === 1 ? 1 / 1.2 : 1;
      const zoom = tScale * multiplier;
      if (zoom > maxZoom || zoom < minZoom) return;
      setViewport(
        {
          x: tX + sign * pX * zoom,
          y: tY + sign * pY * zoom,
          zoom,
        },
        { duration: 100 }
      );
    },
    [tScale, maxZoom, minZoom, setViewport, tX, tY]
  );

  const bind = useGesture({ onWheel, onDrag });

  return (
    <svg
      width={elementWidth}
      height={elementHeight}
      viewBox={`${x} ${y} ${width} ${height}`}
      style={style}
      className={mapClasses}
    >
      {nodes.map((node) => (
        <MiniMapNode
          key={node.id}
          x={node.position.x}
          y={node.position.y}
          width={node.width || 64}
          height={node.height || 32}
          style={node.style}
          className={nodeClassNameFunc(node)}
          color={nodeColorFunc(node)}
          borderRadius={nodeBorderRadius}
          strokeColor={nodeStrokeColorFunc(node)}
          strokeWidth={nodeStrokeWidth}
          shapeRendering={shapeRendering}
        />
      ))}
      <rect
        ref={rectRef}
        className="react-flow__minimap-mask"
        x={viewBB.x}
        y={viewBB.y}
        width={viewBB.width}
        height={viewBB.height}
        fill={maskColor}
        fillRule="evenodd"
        style={{ touchAction: "none" }}
        {...bind()}
      />
    </svg>
  );
};

MiniMap.displayName = "MiniMap";

export default memo(MiniMap);
