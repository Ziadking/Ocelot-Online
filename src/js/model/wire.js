
let PATH_PADDING = 10;
let PATH_CONTROL_STRENGTH = 0.3;
let PATH_CONTROL_MINIMAL = 100;
let PATH_CONTROL_INTERPOLATION = 0.3;

// wire structure be like:
// {
//   a, b,            // references to the blocks this wire connects
//   x, y,            // coordinates of the left-upper corner of the bounding box
//   width, height,   // bounding box size
//   cx, cy, dx, dy,  // relative coordinates of control points for the spline (used for animated spline movement)
//   path,            // text value describing SVG spline
// }

export class Wire {
  constructor(id) {
    this.id = id; // the wire ID
    this.a = undefined; // ID of the `left side` block
    this.b = undefined; // ID of the `right side` block
  }

  /**
   * Allows to use both Block objects and just block IDs as argument.
   */
  getId(block) {
    if (typeof block == "number") return block;
    else return block.id;
  }

  /**
   * Try to connect the wire to the block.
   * Wire cannot be connected to the same block with both ends.
   *
   * NOTE: this method only modifies the Wire object!
   */
  connect(block) {
    let id = this.getId(block);

    // already connected to this block
    if (this.a == id || this.b == id) return true;

    // both ends are already attached to something
    if (this.a && this.b) return false;

    // success
    if (!this.a) this.a = id;
    else this.b = id;

    return true;
  }

  isConnected(block) {
    let id = this.getId(block);
    if (typeof block == "number") id = block;
    else id = block.id;
    return this.a == id || this.b == id;
  }

  isConnectedWithBothsEnds() {
    return this.a && this.b;
  }

  /**
   * Disconnects the block from this Wire.
   *
   * NOTE: This method only modifies the Wire object!
   */
  disconnect(block) {
    if (this.isConnected(block)) {
      let id = this.getId(block);
      if (this.a == id) this.a = undefined;
      if (this.b == id) this.b = undefined;
    }
  }

  update(nax, nay, nbx, nby, smooth = true) {
    // calculate new spline parameters
    // the spline will go like this:
    //
    // E-----------------+
    // | A               |--
    // | .\            D | |
    // | . '---------. . | delta y
    // | C            \. | |
    // |               B |--
    // +-----------------+
    //   |-- delta x --|
    //
    // where A and B are starting and ending points,
    //       C and D are control points for start and end of the spline,
    //       and E is the bounding box corner
    //
    // spline can begin at any corner, and go to the opposite one
    // the exact direction is determined by the quadrant the B block is located relative to the A block
    //
    //       \ 1 /
    //        \ /
    //       4 A 2
    //        / \
    //       / 3 \

    this.x = Math.min(nax, nbx) - PATH_PADDING;
    this.y = Math.min(nay, nby) - PATH_PADDING;
    let deltax = nbx - nax;
    let deltay = nby - nay;
    this.width = Math.abs(deltax) + PATH_PADDING * 2;
    this.height = Math.abs(deltay) + PATH_PADDING * 2;

    let ax, ay, bx, by, cx, cy, dx, dy;

    if (deltax >= 0) {
      ax = PATH_PADDING;
      bx = PATH_PADDING + Math.abs(deltax);
    } else {
      ax = PATH_PADDING + Math.abs(deltax);
      bx = PATH_PADDING;
    }

    if (deltay >= 0) {
      ay = PATH_PADDING;
      by = PATH_PADDING + Math.abs(deltay);
    } else {
      ay = PATH_PADDING + Math.abs(deltay);
      by = PATH_PADDING;
    }

    let distance = Math.max(PATH_CONTROL_MINIMAL, Math.max(Math.abs(deltax), Math.abs(deltay)) * PATH_CONTROL_STRENGTH);

    if (deltay >= deltax) {
      if (deltay >= -deltax) {
        // quadrant 1
        cx = ax;
        cy = ay + distance;
        dx = bx;
        dy = by - distance;
      } else {
        // quadrant 4
        cx = ax - distance;
        cy = ay;
        dx = bx + distance;
        dy = by;
      }
    } else {
      if (deltay >= -deltax) {
        // quadrant 2
        cx = ax + distance;
        cy = ay;
        dx = bx - distance;
        dy = by;
      } else {
        // quadrant 3
        cx = ax;
        cy = ay - distance;
        dx = bx;
        dy = by + distance;
      }
    }

    // interpolate between the old control point locations and the new desired ones
    let icx, icy, idx, idy;

    if (this.path && smooth) {
      icx = this.cx + (cx - this.cx) * PATH_CONTROL_INTERPOLATION;
      icy = this.cy + (cy - this.cy) * PATH_CONTROL_INTERPOLATION;
      idx = this.dx + (dx - this.dx) * PATH_CONTROL_INTERPOLATION;
      idy = this.dy + (dy - this.dy) * PATH_CONTROL_INTERPOLATION;
    } else {
      icx = cx;
      icy = cy;
      idx = dx;
      idy = dy;
    }

    // generate new path
    this.path = "M " + ax + " " + ay + " " +
                "C " + icx + " " + icy +
                ", " + idx + " " + idy +
                ", " + bx + " " + by;

    this.cx = icx;
    this.cy = icy;
    this.dx = idx;
    this.dy = idy;
  }
}
