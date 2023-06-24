import { BehaviorSubject } from "rxjs";

import { getUniqueId } from "../../utils";

import { attachParentId } from "./attachParentId";
import { attachUniqueId } from "./attachUniqueId";

function createState<T>(initialState: T) {
  const state$ = new BehaviorSubject(initialState);
  attachUniqueId(state$);
  attachParentId(state$, getUniqueId());
  return state$;
}

export { createState };
