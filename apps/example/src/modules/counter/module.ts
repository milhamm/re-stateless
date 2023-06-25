import { createModule } from "stateless";

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
