import { CSSProperties } from "react";
import { NodeCategory } from "../../Nodes/NodeCategory";

export type InputSocketSpecJSON = {
  name: string;
  valueType: string;
  valueOfChild?: any;
  defaultValue?: any;
  dataType?: string;
  nodeId?: string;
  hideInput?: boolean;
};

export type OutputSocketSpecJSON = {
  name: string;
  valueType: string;
  dataType?: string;
  valueOfChild?: any;
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
