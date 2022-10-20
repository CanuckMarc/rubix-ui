import { createTypedSocket } from "../../../Sockets/Typed/TypedSocketFactory";
import Node from "../../Node";
import NodeEvalContext from "../../NodeEvalContext";

export default class UnaryOp<Input, Output> extends Node {
  constructor(
    nodeName: string,
    inputValueType: string,
    outputValueType: string,
    public unaryEvalFunc: (a: Input) => Output
  ) {
    super(
      "Logic",
      nodeName,
      [createTypedSocket(inputValueType, "a")],
      [createTypedSocket(outputValueType, "result")],
      (context: NodeEvalContext) => {
        context.setOutputValue(
          "result",
          this.unaryEvalFunc(context.getInputValue("a"))
        );
      }
    );
  }
}
