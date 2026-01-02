/**
 * Fuse.js configuration for tab search
 */
import type { IFuseOptions } from "fuse.js";
import type { TabInfo } from "../../shared/types.ts";

export const FUSE_OPTIONS: IFuseOptions<TabInfo> = {
  keys: [
    { name: "title", weight: 0.7 },
    { name: "url", weight: 0.3 },
  ],
  threshold: 0.4,
  includeMatches: true,
  ignoreLocation: true,
  findAllMatches: true,
};
