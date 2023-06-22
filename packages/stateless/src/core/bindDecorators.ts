import { isNotNil, toPairs } from "ramda";

import { EFFECT } from "./constants";
import { createManagedDecorator } from "./createManagedDecorator";
import type { Module } from "./types";

function bindDecorators<T>(instance: Module<T>, decorators) {
  for (const [key, decorator] of toPairs(decorators)) {
    const setError = (id: string, error) => {
      const errorBundle = {
        error,
        __handled: true,
      };

      instance.setState({
        [EFFECT.STATE_NAMESPACE]: {
          [key]: isNotNil(id) ? { [id]: errorBundle } : errorBundle,
        },
      });
    };

    const helpers = {
      setError,
    };

    const boundDecorator = decorator(instance, helpers);

    const managedDecorator = createManagedDecorator(
      instance,
      key,
      boundDecorator
    );

    instance[key] = managedDecorator;
  }
}

export { bindDecorators };
