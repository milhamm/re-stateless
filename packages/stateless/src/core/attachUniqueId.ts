import { isNotNil } from "ramda-adjunct";
import { BehaviorSubject } from "rxjs";
import hyperid from "hyperid";

import { getUniqueId } from "./utils";

function attachUniqueId<T>(state: BehaviorSubject<T>, id?: hyperid.Instance) {
  state["@id"] = isNotNil(id) ? id : getUniqueId();
}

export { attachUniqueId };
