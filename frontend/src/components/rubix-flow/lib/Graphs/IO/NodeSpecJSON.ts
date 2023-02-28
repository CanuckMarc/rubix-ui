import { CSSProperties } from "react";
import { NodeCategory } from "../../Nodes/NodeCategory";

export type InputSocketSpecJSON = {
  name: string;
  valueType: string;
  defaultValue?: any;
  dataType?: string;
  nodeId?: string;
  value?: any;
  hideInput?: boolean;
};

export type OutputSocketSpecJSON = {
  name: string;
  valueType: string;
  dataType?: string;
  nodeId?: string;
  hideOutput?: boolean;
};

export type InfoSpecJson = {
  icon: string;
};

export type MetadataSpecJSON = {
  dynamicInputs: boolean;
  dynamicOutputs: boolean;
}

export type NodeSpecJSON = {
  id?: string;
  allowSettings: boolean;
  type: string;
  category: NodeCategory;
  inputs?: InputSocketSpecJSON[];
  outputs?: OutputSocketSpecJSON[];
  info?: InfoSpecJson;
  style?: CSSProperties;
  isParent?: boolean;
  payloadType?: string;
  allowPayload?: boolean;
  metadata?: MetadataSpecJSON;
};
