// TODO: add limit to the total amount of pointers

// existing pointers
let storage = [];

// after how much time being not used we can recycle the pointer (milliseconds)
const OLD_AGE = 10000;

/**
 * If there already is a pointer assigned to this user - update it.
 * If there is not - search for one that was not used a long time.
 * If no such pointers - create a new one.
 */
export function awakePointer(userId, x, y, nickname) {
  let existing;
  let old;
  let time = Date.now();

  for (let i = 0; i < storage.length; i++) {
    if (storage[i].id == userId) {
      existing = storage[i];
      break;
    }
    if (storage[i].time - time > OLD_AGE) {
      old = storage[i];
    }
  }

  let pointer = existing || old;
  let element;

  if (pointer) {
    element = document.getElementById("pointer-" + pointer.id);
  } else {
    pointer = {};
    storage.push(pointer);
  }

  if (!element) {
    element = document.createElement("div");
    element.setAttribute("id", "pointer-" + userId);
    element.setAttribute("class", "pointer");

    let img = document.createElement("img");
    img.setAttribute("class", "pointer-img");
    img.src = "images/mouse.png";
    element.appendChild(img);

    let label = document.createElement("div");
    label.setAttribute("class", "pointer-label");
    element.appendChild(label);

    document.body.appendChild(element);
    element.classList.add("pointer-fade-out");
  } else {
    element.classList.remove("pointer-fade-out");
    void element.offsetWidth; // magic: trigger reflow
    element.classList.add("pointer-fade-out");
  }

  // 10 pixels are removed to compensate the image paddings
  element.style.opacity = 0;
  element.style.left = (x - 10) + "px";
  element.style.top = (y - 10) + "px";
  element.childNodes[1].innerHTML = nickname;

  pointer.id = userId;
  pointer.x = x;
  pointer.y = y;
  pointer.nickname = nickname;
}
