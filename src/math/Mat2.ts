import type { Vec2 } from "@fishley/wwwgraphics/math";

export class Mat2 extends Array {
  constructor(m00 = 1, m01 = 0, m10 = 0, m11 = 1, m20 = 0, m21 = 0) {
    // @ts-ignore
    super(m00, m01, m10, m11, m20, m21);
    return this;
  }


  set(m00: number, m01: number, m10: number, m11: number, m20: number, m21: number) {
    Mat2.set(this, m00, m01, m10, m11, m20, m21);
    return this;
  }

  translate(v: Vec2, m = this) {
    Mat2.translate(this, m, v);
    return this;
  }

  rotate(v: number, m = this) {
    Mat2.rotate(this, m, v);
    return this;
  }

  scale(v: Vec2, m = this) {
    Mat2.scale(this, m, v);
    return this;
  }

  multiply(ma: Mat2, mb?: Mat2) {
    if (mb) {
      Mat2.multiply(this, ma, mb);
    } else {
      Mat2.multiply(this, this, ma);
    }
    return this;
  }

  identity() {
    Mat2.identity(this);
    return this;
  }

  copy(m: Mat2) {
    Mat2.copy(this, m);
    return this;
  }

  inverse(m = this) {
    Mat2.invert(this, m);
    return this;
  }

  /**
   * Copy the values from one mat2d to another
   */
  public static copy(out: Mat2, a: Mat2) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
  }

  /**
   * Set the components of a mat2d to the given values
   */
  public static set(out: Mat2, m00: number, m01: number, m10: number, m11: number, m20: number, m21: number) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m10;
    out[3] = m11;
    out[4] = m20;
    out[5] = m21;
    return out;
  }

  /**
   * Set a mat2d to the identity matrix
   */
  public static identity(out: Mat2) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
  }

  /**
   * Inverts a mat2d
   */
  public static invert(out: Mat2, a: Mat2) {
    let aa = a[0],
      ab = a[1],
      ac = a[2],
      ad = a[3],
      atx = a[4],
      aty = a[5];

    let det = aa * ad - ab * ac;
    if (!det) {
      return null;
    }
    det = 1.0 / det;

    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
  }

  /**
   * Calculates the determinant of a mat2d
   */
  public static determinant(a: Mat2) {
    return a[0] * a[3] - a[1] * a[2];
  }

  /**
   * Multiplies two mat2d's
   */
  public static multiply(out: Mat2, a: Mat2, b: Mat2) {
    let a00 = a[0],
      a01 = a[1],
      a10 = a[2],
      a11 = a[3],
      a20 = a[4],
      a21 = a[5];

    let b00 = b[0],
      b01 = b[1],
      b10 = b[2],
      b11 = b[3],
      b20 = b[4],
      b21 = b[5];

    out[0] = a00 * b00 + a10 * b01;
    out[1] = a01 * b00 + a11 * b01;
    out[2] = a00 * b10 + a10 * b11;
    out[3] = a01 * b10 + a11 * b11;
    out[4] = a00 * b20 + a10 * b21 + a20;
    out[5] = a01 * b20 + a11 * b21 + a21;
    return out;
  }

  /**
   * Translate a mat2d by the given vector
   */
  public static translate(out: Mat2, a: Mat2, v: Vec2) {
    let a00 = a[0],
      a01 = a[1],
      a10 = a[2],
      a11 = a[3],
      a20 = a[4],
      a21 = a[5],
      x = v.x,
      y = v.y;

    out[0] = a00;
    out[1] = a01;
    out[2] = a10;
    out[3] = a11;
    out[4] = a00 * x + a10 * y + a20;
    out[5] = a01 * x + a11 * y + a21;
    return out;
  }

  /**
   * Rotates a mat2d by the given angle (in radians)
   */
  public static rotate(out: Mat2, a: Mat2, rad: number) {
    let a00 = a[0],
      a01 = a[1],
      a10 = a[2],
      a11 = a[3],
      a20 = a[4],
      a21 = a[5],
      s = Math.sin(rad),
      c = Math.cos(rad);

    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a00 * -s + a10 * c;
    out[3] = a01 * -s + a11 * c;
    out[4] = a20;
    out[5] = a21;
    return out;
  }

  /**
   * Scales the mat2d by the dimensions in the given vec2
   */
  public static scale(out: Mat2, a: Mat2, v: Vec2) {
    let a00 = a[0],
      a01 = a[1],
      a10 = a[2],
      a11 = a[3],
      a20 = a[4],
      a21 = a[5],
      x = v.x,
      y = v.y;

    out[0] = a00 * x;
    out[1] = a01 * x;
    out[2] = a10 * y;
    out[3] = a11 * y;
    out[4] = a20;
    out[5] = a21;
    return out;
  }

  /**
   * Generates a 2D orthographic projection matrix that corrects for aspect ratio.
   * Maps logical coordinates to normalized device coordinates [-1, 1].
   * * @param {Mat2} out mat2d frustum matrix will be written into
   * @param {number} width Width of your gl context/canvas
   * @param {number} height Height of gl context/canvas
   * @param {number} viewSize The vertical logical size of the camera view (default is 2, mapping y from -1 to 1)
   */
  public static orthographic(out: Mat2, width: number, height: number, viewSize: number = 2) {
    const aspect = width / height;

    // By incorporating the aspect ratio into the X scale, shapes remain 
    // strictly proportionate (e.g. circles won't stretch into ovals)
    const zoomX = 2 / (viewSize * aspect);
    const zoomY = 2 / viewSize;

    out[0] = zoomX;
    out[1] = 0;
    out[2] = 0;
    out[3] = zoomY;

    // Translation is 0, 0 to keep the origin (0,0) exactly in the center of the screen.
    // To originate from top-left, you would modify these translation components.
    out[4] = 0;
    out[5] = 0;

    return out;
  }

  /**
   * Adds two mat2d's
   */
  public static add(out: Mat2, a: Mat2, b: Mat2) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    return out;
  }

  /**
   * Subtracts matrix b from matrix a
   */
  public static subtract(out: Mat2, a: Mat2, b: Mat2) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    return out;
  }

  /**
   * Multiply each element of the matrix by a scalar.
   */
  public static multiplyScalar(out: Mat2, a: Mat2, b: number) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    return out;
  }
}

export default Mat2