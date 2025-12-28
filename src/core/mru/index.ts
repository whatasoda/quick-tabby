export {
  addTabToMRU,
  getMRUList,
  getPreviousTabId,
  getTabPosition,
  isTabInMRU,
  removeTabFromMRU,
  removeWindowFromMRU,
} from "./mru-operations.ts";
export type { MRUConfig, MRUState } from "./mru-state.ts";
export { DEFAULT_MRU_CONFIG, EMPTY_MRU_STATE } from "./mru-state.ts";
