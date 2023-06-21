import { BehaviorSubject } from "rxjs";
import { mergeDeepRight } from "ramda";
import { isFunction } from "ramda-adjunct";
import invariant from "invariant";

import { createState } from "./createState.js";

type Config<T extends object> = {
  name: string;
  initialState: T;
  decorators: Record<string, unknown>;
};

type Module<T> = {
  name: string;
  getState: () => T;
  setState: (stateModifier: any, mergeFunction) => void;
  state$: BehaviorSubject<T>;
  subscribe: (cb: (incomingState: T) => void) => void;
};

function createModule<T extends object>({
  name,
  initialState,
  decorators,
}: Config<T>): Module<T> {
  invariant(
    typeof initialState !== "object",
    "Initial state for a module must be an `object`, got a `%s` instead",
    typeof initialState
  );

  let state = initialState;
  const state$ = createState(initialState);

  const getState = () => {
    return state;
  };

  const setState = (
    stateModifier: T | ((prevState: T) => T),
    mergeFunction = mergeDeepRight
  ) => {
    const incomingState: any = isFunction(stateModifier)
      ? stateModifier(state)
      : stateModifier;
    state = mergeFunction(state, incomingState);
    state$.next(state);
  };

  const subscribe = (cb: (incomingState: T) => void) => {
    state$.subscribe({
      next: (incomingState) => {
        cb(incomingState);
      },
    });
  };

  const module = { name, getState, setState, state$, subscribe };

  return module;
}

export { createModule };
