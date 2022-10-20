import FlowSocket from '../../../Sockets/Typed/FlowSocket';
import Node from '../../Node';

export default class Tick extends Node {
  constructor() {
    super(
      'Event',
      'event/tick',
      [],
      [new FlowSocket()],
      () => {},
    );
  }
}
