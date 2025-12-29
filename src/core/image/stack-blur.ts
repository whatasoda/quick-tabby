/**
 * StackBlur Algorithm
 *
 * Fast gaussian-like blur using stack-based approach.
 * Based on Mario Klingemann's StackBlur algorithm.
 *
 * This is a pure function that operates on ImageData pixels directly.
 */

// Precomputed multiplication table for optimization
const MUL_TABLE = [
  512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364,
  328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364,
  345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323,
  312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364,
  354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465,
  456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323,
  318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475,
  468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364,
  359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287,
  284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465,
  460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385,
  381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323,
  320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275,
  273, 271, 269, 267, 265, 263, 261, 259,
];

// Precomputed shift table for optimization
const SHG_TABLE = [
  9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18,
  18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
  20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21,
  21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
  22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
  22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
  23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
  23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
  24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
];

/**
 * BlurStack node for the stack-based algorithm
 */
interface BlurStack {
  r: number;
  g: number;
  b: number;
  a: number;
  next: BlurStack | null;
}

/**
 * Create a circular linked list of BlurStack nodes
 */
function createBlurStack(size: number): BlurStack {
  const first: BlurStack = { r: 0, g: 0, b: 0, a: 0, next: null };
  let current = first;

  for (let i = 1; i < size; i++) {
    const node: BlurStack = { r: 0, g: 0, b: 0, a: 0, next: null };
    current.next = node;
    current = node;
  }

  current.next = first; // Make it circular
  return first;
}

/**
 * Apply stack blur to image data
 *
 * @param pixels - RGBA pixel data (Uint8ClampedArray)
 * @param width - Image width
 * @param height - Image height
 * @param radius - Blur radius (1-254)
 */
export function stackBlur(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
): void {
  // Clamp radius to valid range
  radius = Math.max(1, Math.min(254, Math.floor(radius)));

  const div = 2 * radius + 1;
  const widthMinus1 = width - 1;
  const heightMinus1 = height - 1;
  const radiusPlus1 = radius + 1;
  const sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

  const stackStart = createBlurStack(div);
  let stackEnd: BlurStack | null = null;
  let stack = stackStart;

  // Find the end of the circular list
  for (let i = 0; i < radius; i++) {
    stack = stack.next!;
  }
  stackEnd = stack;
  stack = stackStart;

  const mul_sum = MUL_TABLE[radius]!;
  const shg_sum = SHG_TABLE[radius]!;

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let sumA = 0;
    let sumInR = 0;
    let sumInG = 0;
    let sumInB = 0;
    let sumInA = 0;
    let sumOutR = 0;
    let sumOutG = 0;
    let sumOutB = 0;
    let sumOutA = 0;

    let yOffset = y * width;
    let pr = pixels[(yOffset << 2)]!;
    let pg = pixels[(yOffset << 2) + 1]!;
    let pb = pixels[(yOffset << 2) + 2]!;
    let pa = pixels[(yOffset << 2) + 3]!;

    // Initialize sums
    for (let i = 0; i <= radius; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;

      const weight = radiusPlus1 - i;
      sumR += pr * weight;
      sumG += pg * weight;
      sumB += pb * weight;
      sumA += pa * weight;

      if (i > 0) {
        sumInR += pr;
        sumInG += pg;
        sumInB += pb;
        sumInA += pa;
      } else {
        sumOutR += pr;
        sumOutG += pg;
        sumOutB += pb;
        sumOutA += pa;
      }

      stack = stack.next!;
    }

    for (let i = 1; i <= radius; i++) {
      const offset = Math.min(i, widthMinus1);
      const srcIndex = (yOffset + offset) << 2;

      pr = pixels[srcIndex]!;
      pg = pixels[srcIndex + 1]!;
      pb = pixels[srcIndex + 2]!;
      pa = pixels[srcIndex + 3]!;

      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;

      sumR += pr * (radiusPlus1 - i);
      sumG += pg * (radiusPlus1 - i);
      sumB += pb * (radiusPlus1 - i);
      sumA += pa * (radiusPlus1 - i);

      sumOutR += pr;
      sumOutG += pg;
      sumOutB += pb;
      sumOutA += pa;

      stack = stack.next!;
    }

    let stackIn = stackStart;
    let stackOut = stackEnd!;

    for (let x = 0; x < width; x++) {
      const dstIndex = (yOffset + x) << 2;

      pixels[dstIndex] = (sumR * mul_sum) >>> shg_sum;
      pixels[dstIndex + 1] = (sumG * mul_sum) >>> shg_sum;
      pixels[dstIndex + 2] = (sumB * mul_sum) >>> shg_sum;
      pixels[dstIndex + 3] = (sumA * mul_sum) >>> shg_sum;

      sumR -= sumOutR;
      sumG -= sumOutG;
      sumB -= sumOutB;
      sumA -= sumOutA;

      sumOutR -= stackIn.r;
      sumOutG -= stackIn.g;
      sumOutB -= stackIn.b;
      sumOutA -= stackIn.a;

      const srcOffset = Math.min(x + radiusPlus1, widthMinus1);
      const srcIndex = (yOffset + srcOffset) << 2;

      pr = pixels[srcIndex]!;
      pg = pixels[srcIndex + 1]!;
      pb = pixels[srcIndex + 2]!;
      pa = pixels[srcIndex + 3]!;

      stackIn.r = pr;
      stackIn.g = pg;
      stackIn.b = pb;
      stackIn.a = pa;

      sumInR += pr;
      sumInG += pg;
      sumInB += pb;
      sumInA += pa;

      sumR += sumInR;
      sumG += sumInG;
      sumB += sumInB;
      sumA += sumInA;

      stackIn = stackIn.next!;

      const stackOutNode = stackOut.next!;
      sumOutR += stackOutNode.r;
      sumOutG += stackOutNode.g;
      sumOutB += stackOutNode.b;
      sumOutA += stackOutNode.a;

      sumInR -= stackOutNode.r;
      sumInG -= stackOutNode.g;
      sumInB -= stackOutNode.b;
      sumInA -= stackOutNode.a;

      stackOut = stackOutNode;
    }
  }

  // Vertical pass
  for (let x = 0; x < width; x++) {
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let sumA = 0;
    let sumInR = 0;
    let sumInG = 0;
    let sumInB = 0;
    let sumInA = 0;
    let sumOutR = 0;
    let sumOutG = 0;
    let sumOutB = 0;
    let sumOutA = 0;

    let pr = pixels[x << 2]!;
    let pg = pixels[(x << 2) + 1]!;
    let pb = pixels[(x << 2) + 2]!;
    let pa = pixels[(x << 2) + 3]!;

    stack = stackStart;

    for (let i = 0; i <= radius; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;

      const weight = radiusPlus1 - i;
      sumR += pr * weight;
      sumG += pg * weight;
      sumB += pb * weight;
      sumA += pa * weight;

      if (i > 0) {
        sumInR += pr;
        sumInG += pg;
        sumInB += pb;
        sumInA += pa;
      } else {
        sumOutR += pr;
        sumOutG += pg;
        sumOutB += pb;
        sumOutA += pa;
      }

      stack = stack.next!;
    }

    for (let i = 1; i <= radius; i++) {
      const offset = Math.min(i, heightMinus1) * width;
      const srcIndex = (x + offset) << 2;

      pr = pixels[srcIndex]!;
      pg = pixels[srcIndex + 1]!;
      pb = pixels[srcIndex + 2]!;
      pa = pixels[srcIndex + 3]!;

      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;

      sumR += pr * (radiusPlus1 - i);
      sumG += pg * (radiusPlus1 - i);
      sumB += pb * (radiusPlus1 - i);
      sumA += pa * (radiusPlus1 - i);

      sumOutR += pr;
      sumOutG += pg;
      sumOutB += pb;
      sumOutA += pa;

      stack = stack.next!;
    }

    let stackIn = stackStart;
    let stackOut = stackEnd!;

    for (let y = 0; y < height; y++) {
      const dstIndex = (y * width + x) << 2;

      pixels[dstIndex] = (sumR * mul_sum) >>> shg_sum;
      pixels[dstIndex + 1] = (sumG * mul_sum) >>> shg_sum;
      pixels[dstIndex + 2] = (sumB * mul_sum) >>> shg_sum;
      pixels[dstIndex + 3] = (sumA * mul_sum) >>> shg_sum;

      sumR -= sumOutR;
      sumG -= sumOutG;
      sumB -= sumOutB;
      sumA -= sumOutA;

      sumOutR -= stackIn.r;
      sumOutG -= stackIn.g;
      sumOutB -= stackIn.b;
      sumOutA -= stackIn.a;

      const srcOffset = Math.min(y + radiusPlus1, heightMinus1) * width;
      const srcIndex = (x + srcOffset) << 2;

      pr = pixels[srcIndex]!;
      pg = pixels[srcIndex + 1]!;
      pb = pixels[srcIndex + 2]!;
      pa = pixels[srcIndex + 3]!;

      stackIn.r = pr;
      stackIn.g = pg;
      stackIn.b = pb;
      stackIn.a = pa;

      sumInR += pr;
      sumInG += pg;
      sumInB += pb;
      sumInA += pa;

      sumR += sumInR;
      sumG += sumInG;
      sumB += sumInB;
      sumA += sumInA;

      stackIn = stackIn.next!;

      const stackOutNode = stackOut.next!;
      sumOutR += stackOutNode.r;
      sumOutG += stackOutNode.g;
      sumOutB += stackOutNode.b;
      sumOutA += stackOutNode.a;

      sumInR -= stackOutNode.r;
      sumInG -= stackOutNode.g;
      sumInB -= stackOutNode.b;
      sumInA -= stackOutNode.a;

      stackOut = stackOutNode;
    }
  }
}
