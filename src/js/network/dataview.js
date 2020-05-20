let utf8encoder = new TextEncoder('utf-8');
let utf8decoder = new TextDecoder('utf-8');

function encodeString(str) {
  return utf8encoder.encode(str);
}

function decodeString(buffer) {
  return utf8decoder.decode(buffer);
}

export class AdvancedDataView {
  constructor(arrayBuffer) {
    this.buffer = arrayBuffer;
    this.data = new DataView(arrayBuffer);
    this.offset = 0;
  }

  reset() { this.offset = 0; }

  getLength() { return this.buffer.byteLength }

  getOffset() { return this.offset; }

  getRemaining() { return this.buffer.byteLength - this.offset; }

  getByte() {
    let byte = this.data.getUint8(this.offset);
    this.offset = this.offset + 1;
    return byte;
  }

  getShort() {
    let short = this.data.getUint16(this.offset);
    this.offset = this.offset + 2;
    return short;
  }

  getInt() {
    let int = this.data.getUint32(this.offset);
    this.offset = this.offset + 4;
    return int;
  }

  getString(withLen = false) {
    let len = withLen ? this.getShort() : this.buffer.byteLength - this.offset;
    let string = decodeString(new DataView(this.buffer, this.offset, len));
    this.offset = this.offset + len;
    return string;
  }
}
