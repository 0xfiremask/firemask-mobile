// eslint-disable-next-line import/no-nodejs-modules, import/no-commonjs, @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const EventEmitter = require('events').EventEmitter;

class RemotePort extends EventEmitter {
  constructor(sendMessage: () => void) {
    super();
    this.sendMessage = sendMessage;
  }

  // TODO: Replace "any" with type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postMessage = (msg: any) => {
    this.sendMessage(msg);
  };
}

export default RemotePort;
