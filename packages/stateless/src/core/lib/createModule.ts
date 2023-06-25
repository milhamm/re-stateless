import { mergeDeepRight } from "ramda";
import { isFunction } from "ramda-adjunct";
import invariant from "invariant";

import { createState } from "./createState";
import { bindDecorators } from "./bindDecorators";
import { Module, Config, State, Decorator } from "../../types";

function createModule<
  T extends State,
  D extends Record<string, Decorator<T, any[], any>>
>({ name, initialState, decorators }: Config<T, D>): Module<T, D> {
  invariant(
    typeof initialState === "object",
    "Initial state for a module must be an `object`, got a `%s` instead",
    typeof initialState
  );

  let state = initialState;
  const state$ = createState(initialState);

  const getState = () => {
    return state;
  };

  const setState = (stateModifier, mergeFunction = mergeDeepRight) => {
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
  bindDecorators(module, decorators);

  return module as Module<T, typeof decorators>;
}

export { createModule };
