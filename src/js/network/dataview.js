import { encodeString, decodeString } from "../util/helpers.js";

export class AdvancedDataView {
  constructor(arrayBuffer) {
    this.buffer = arrayBuffer;
    this.data = new DataView(arrayBuffer);
    this.byteView = new Uint8Array(arrayBuffer);
    this.offset = 0;
  }

  reset() { this.offset = 0; }

  getLength() { return this.buffer.byteLength }

  getOffset() { return this.offset; }

  setOffset(value) { this.offset = value; }

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
    let int = this.data.getInt32(this.offset);
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

  putString(string, withLen = false) {
    let encoded = encodeString(string);
    this.putEncodedString(encoded, withLen);
  }

  putEncodedString(encoded, withLen = false) {
    if (withLen) {
      this.putShort(encoded.length);
    }
    this.byteView.set(encoded, this.offset);
    this.offset = this.offset + encoded.length;
  }
}
