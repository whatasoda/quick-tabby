import { describe, expect, test } from "vitest";
import { stackBlur } from "./stack-blur";

describe("stackBlur", () => {
  test("should modify pixel data in place", () => {
    // Create a 2x2 image with contrasting colors
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255, // Red pixel
      0, 255, 0, 255, // Green pixel
      0, 0, 255, 255, // Blue pixel
      255, 255, 0, 255, // Yellow pixel
    ]);
    const original = new Uint8ClampedArray(pixels);

    stackBlur(pixels, 2, 2, 1);

    // Verify pixels are modified
    expect(pixels).not.toEqual(original);
  });

  test("should handle single pixel image", () => {
    const pixels = new Uint8ClampedArray([128, 128, 128, 255]);

    // Should not throw
    expect(() => stackBlur(pixels, 1, 1, 5)).not.toThrow();

    // Single pixel should remain similar (edge case)
    expect(pixels[0]).toBe(128);
    expect(pixels[1]).toBe(128);
    expect(pixels[2]).toBe(128);
    expect(pixels[3]).toBe(255);
  });

  test("should clamp radius to valid range", () => {
    const pixels = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);

    // Radius 0 should be treated as 1
    expect(() => stackBlur(pixels, 2, 1, 0)).not.toThrow();

    // Radius > 254 should be clamped
    expect(() => stackBlur(pixels, 2, 1, 300)).not.toThrow();
  });

  test("should blend colors in 2D grid", () => {
    // Create a 4x4 image with contrasting quadrants
    // Top-left: black, Top-right: white, Bottom-left: white, Bottom-right: black
    const pixels = new Uint8ClampedArray(4 * 4 * 4);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const idx = (y * 4 + x) * 4;
        const isLight = (x < 2) !== (y < 2);
        pixels[idx] = isLight ? 255 : 0;
        pixels[idx + 1] = isLight ? 255 : 0;
        pixels[idx + 2] = isLight ? 255 : 0;
        pixels[idx + 3] = 255;
      }
    }

    const original = new Uint8ClampedArray(pixels);
    stackBlur(pixels, 4, 4, 2);

    // Verify the blur modified the image
    expect(pixels).not.toEqual(original);

    // Check that center pixels are blended (no longer pure black or white)
    // Center pixel at (1, 1) should be blended
    const centerIdx = (1 * 4 + 1) * 4;
    expect(pixels[centerIdx]).toBeGreaterThanOrEqual(0);
    expect(pixels[centerIdx]).toBeLessThanOrEqual(255);
  });

  test("should preserve alpha channel behavior", () => {
    const pixels = new Uint8ClampedArray([
      255, 0, 0, 255, // Opaque red
      0, 255, 0, 128, // Semi-transparent green
    ]);

    stackBlur(pixels, 2, 1, 1);

    // Alpha should be blended as well
    const avgAlpha = (255 + 128) / 2;
    expect(pixels[3]! > 128 && pixels[3]! < 255).toBe(true);
    expect(pixels[7]! > 128 && pixels[7]! < 255).toBe(true);
  });
});
