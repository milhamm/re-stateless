import { pathOr } from "ramda";
import { isNotNil, isPromise } from "ramda-adjunct";
import invariant from "invariant";

import { EFFECT } from "./constants";
import { Module } from "./types";

const { PENDING, FULFILLED, REJECTED } = EFFECT.STATUS;

function createManagedDecorator<T>(instance: Module<T>, effectKey, effect) {
  return function managedDecorator(id: string, ...args: unknown[]) {
    if (isNotNil(id)) {
      invariant(
        typeof id === "string",
        "Invalid first parameter passed to `%s.%s`. Expected a `string`, but got a `%s` instead." +
          " If you do not require uniquely managed decorators, then omit usage of the first parameter.",
        instance.name,
        effectKey,
        typeof id
      );
    }

    const setStatus = (status) => {
      instance.setState({
        [EFFECT.STATE_NAMESPACE]: {
          [effectKey]: isNotNil(id)
            ? {
                [id]: {
                  status,
                },
              }
            : { status },
        },
      });
    };

    const didHandleError = () => {
      const flagPath = [
        EFFECT.STATE_NAMESPACE,
        effectKey,
        id,
        "__handled",
      ].filter(isNotNil);
      return pathOr(false, flagPath, instance.getState());
    };

    setStatus(PENDING);

    let result;

    try {
      result = effect(id, ...args);
      if (!isPromise(result)) {
        if (didHandleError()) {
          setStatus(REJECTED);
        } else {
          setStatus(FULFILLED);
        }
        return result;
      }
    } catch (error) {
      setStatus(REJECTED);
      throw error;
    }

    // At this point we know that the effect is async.
    const promise = result;
    return promise
      .then((value) => {
        if (didHandleError()) {
          setStatus(REJECTED);
        } else {
          setStatus(FULFILLED);
        }
        return Promise.resolve(value);
      })
      .catch((error) => {
        setStatus(REJECTED);
        throw error;
      });
  };
}

export { createManagedDecorator };
