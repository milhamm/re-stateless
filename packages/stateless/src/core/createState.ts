import { BehaviorSubject } from "rxjs";

function createState<T>(initialState: T) {
  const state$ = new BehaviorSubject(initialState);
  return state$;
}

export { createState };
