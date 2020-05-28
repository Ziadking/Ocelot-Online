// A collection of texture URLs.

function texture(name) {
  return "images/textures/" + name + ".png";
}

let Textures = {
  CASE: [ texture("case-t1"), texture("case-t2"), texture("case-t3"), texture("case-t4") ],
  CASE_ON: texture("case-on"),
  CASE_ERROR: texture("case-error"),
  CASE_ACTIVITY: texture("case-activity"),

  DRIVE: texture("drive"),
  REDSTONE: texture("redstone"),

  SCREEN: [ texture("screen-t1"), texture("screen-t2"), texture("screen-t3") ],
  SCREEN_ON: texture("screen-on"),
};

export { Textures };
