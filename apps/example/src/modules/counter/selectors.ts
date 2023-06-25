import { select } from "stateless";
import { counterModule } from "./module";

const { state$ } = counterModule;

const count$ = select(state$, (state) => state.count);

export { count$ };
