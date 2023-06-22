import { BehaviorSubject } from "rxjs";

import { attachParentId } from "./attachParentId";
import { attachUniqueId } from "./attachUniqueId";
import { getUniqueId } from "./utils";
import { BehaviorSubjectState } from "./types";

function createState<T>(initialState: T): BehaviorSubjectState<T> {
  const state$ = new BehaviorSubject(initialState);
  attachUniqueId(state$);
  attachParentId(state$, getUniqueId());
  return state$ as BehaviorSubjectState<T>;
}

export { createState };
