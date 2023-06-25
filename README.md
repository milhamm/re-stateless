# Redux-like State Management using Observables
An attempt to reverse-engineered state manager library with full typing support using TypeScript.

## Progress

- [x] `createModule()`
- [x] `state$`
- [ ] `effectState$`
- [x] `select()`
- [x] `connect()`

## Background Context
So I've been diving into this undocumented state-management library written in good ol' plain JavaScript. Let me tell you, it's been quite the adventure trying to figure out what the heck is going on in there! Back then, after a week of relentless exploration, I finally understand the code and got a handle on how this thing actually works.

Then I noticed:
> It's Redux but using Observable 

This library is basically Redux, but with a twist - it's using Observables! It brought back memories from four years ago using Redux. I can say that it was an unpleasent experience — so much boilerplate code.

Enough with the backstory. Now, I've decided to try reverse-engineer it. I'm also going to add some much-needed typing support to it while training my TypeScript skills.

## Usage

### Creating a module

To start using the library, we can utilize the `createModule` factory function. This function allows us to create a module by providing the module's name, initial state object, and decorator functions. The decorator functions play a crucial role in updating the state, and they can be used to handle asynchronous tasks.

```tsx
import { createModule } from "restate-rx";

export type Counter = {
  count: number;
};

const INITIAL_STATE: Counter = {
  count: 0,
};

const counterModule = createModule({
  name: "counter",
  initialState: INITIAL_STATE,
  decorators: {
    addCount(module) {
      return () => {
        module.setState((prev) => ({
          count: prev.count + 1,
        }));
      };
    },
  },
});

export { counterModule };
```

### Deriving state with selectors

To derive data from the state, the library provides `select` function that operate on the state observable. These functions allow us to define selectors, which are functions responsible for performing the data derivation. It always return an Observable

```ts
import { select } from "restate-rx";
import { counterModule } from "./module";

const { state$ } = counterModule;

const count$ = select(state$, (state) => state.count);

export { count$ };
```

### Binding to a React component via props
To bind the observables to your React components, the library provides a connect function, which is a higher-order component (HOC) similar to the connect function in Redux. The connect function allows you to map the observable values into props for your components.

```tsx
import { connect } from "restate-rx";

import { Counter, counterModule } from "./modules/counter/module";
import { count$ } from "./modules/counter/selectors";

const App: React.FC<Counter> = ({ count }) => {
  return (
      <button onClick={() => counterModule.addCount()}>
        count is {count}
      </button>
  );
};

const ConnectedApp = connect(() => ({
  count: count$,
}))(App);

export default ConnectedApp;
```

## Behind the scene
This library uses [RxJS](https://rxjs.dev/)

When it comes to managing state in React, one common challenge is ensuring that all components stay in sync with the latest state updates. This is where `BehaviorSubject` comes to play.

I assume that they choose `BehaviorSubject` because it is well-suited for state management since it acts as a single source of truth that holds the current state value. It's a specialized implementation of the `Subject` class within RxJS. It emits the current value to any new subscribers, making it ideal for keeping components updated with the latest state information.

