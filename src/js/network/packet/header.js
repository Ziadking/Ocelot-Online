let Header = {
  SIZE: 5,
  encode: function(data, type, thread) {
    data.setUint8(0, type);
    data.setUint32(1, thread);
    return data;
  },
  decode: function(data) {
    return { type: data.getUint8(), thread: data.getUnit32() };
  }
};

export { Header };
