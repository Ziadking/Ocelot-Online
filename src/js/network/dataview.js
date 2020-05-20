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

  putByte(byte) {
    this.data.setUint8(this.offset, byte);
    this.offset = this.offset + 1;
  }

  putShort(short) {
    this.data.setUint16(this.offset, short);
    this.offset = this.offset + 2;
  }

  putInt(int) {
    this.data.setUint32(this.offset, int);
    this.offset = this.offset + 4;
  }

  // TODO: test it
  putString(string, withLen = false) {
    let encoded = encodeString(string);
    if (withLen) {
      this.putShort(encoded.length);
    }
    this.data.set(encoded, this.offset);
    this.offset = this.offset + encoded.length;
  }
}
