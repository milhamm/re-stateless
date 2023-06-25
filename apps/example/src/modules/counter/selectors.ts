import { select } from "restate-rx";
import { counterModule } from "./module";

const { state$ } = counterModule;

const count$ = select(state$, (state) => state.count);

export { count$ };
