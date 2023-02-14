import { Metadata } from "../Metadata";
import { CSSProperties } from "react";

export type LinkJSON = { nodeId: string; socket: string };

export type InputJSON = {
  value?: string;
  links?: LinkJSON[];
};

export type NodeJSON = {
  label?: string;
  type: string;
  id: string;
  inputs?: {
    [key: string]: InputJSON;
  };
  metadata?: Metadata;
  settings?: { [key: string]: any };
  data?: { [key: string]: any };
  style?: CSSProperties;
  isParent?: boolean;
  parentTab?: string;
  childTab?: string;
  parentId?: string;
  nodeName?: string;
};

export type GraphJSON = {
  name?: string;
  nodes: NodeJSON[];
  metadata?: Metadata;
};
