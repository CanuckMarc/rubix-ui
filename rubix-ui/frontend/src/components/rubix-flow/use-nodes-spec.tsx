import { useEffect, useState } from "react";
import { FlowFactory } from "./factory";
import { InputSocketSpecJSON, NodeJSON, NodeSpecJSON } from "./lib";

export const SPEC_JSON = "spec-json";
export const NODES_JSON = "nodes-json";
const _nodesSpec = JSON.parse("" + localStorage.getItem(SPEC_JSON)) || [];
const _nodesJson = JSON.parse("" + localStorage.getItem(NODES_JSON)) || [];

export let getSpecJson = (): NodeSpecJSON[] => _nodesSpec;

export const useNodesSpec = () => {
  const [nodesSpec, setNodesSpec] = useState(getSpecJson);
  const factory = new FlowFactory();

  useEffect(() => {
    fetch();
  }, [nodesSpec.length]);

  const setDefaultInputValue = (inputs: InputSocketSpecJSON[]) => {
    return inputs.map((input) => {
      let defaultValue = null;
      switch (input?.valueType) {
        case "number":
          defaultValue = null;
          break;
        case "string":
          defaultValue = null;
          break;
        case "boolean":
          defaultValue = false;
          break;
      }
      return {
        name: input.name,
        defaultValue: input?.defaultValue ? input.defaultValue : defaultValue,
        valueType: input.valueType,
      };
    });
  };

  const fetch = async () => {
    let specJSON = ((await factory.NodePallet()) || []) as NodeSpecJSON[];
    specJSON = specJSON.map((node: NodeSpecJSON) => {
      if (node.inputs && node.inputs.length > 0) {
        node.inputs = setDefaultInputValue(node.inputs);
      }
      return node;
    });
    setNodesSpec(specJSON);
    getSpecJson = () => specJSON;
    localStorage.setItem(SPEC_JSON, JSON.stringify(specJSON));
  };

  return [nodesSpec, setNodesSpec];
};
