export type { MRUState, MRUConfig } from "./mru-state.ts";
export { EMPTY_MRU_STATE, DEFAULT_MRU_CONFIG } from "./mru-state.ts";

export {
  addTabToMRU,
  removeTabFromMRU,
  removeWindowFromMRU,
  getMRUList,
  getPreviousTabId,
  isTabInMRU,
  getTabPosition,
} from "./mru-operations.ts";
