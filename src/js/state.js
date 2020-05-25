/**
 * This structure serves as a singleton state object,
 * shared between pages and views of the Ocelot app
 */

var state = {
  debug: false,
  user: undefined,
  workspace: {
    list: {
      loading: true,
      value: []
    },
    current: {
      loading: true,
      value: undefined
    }
  }
};

export { state };
