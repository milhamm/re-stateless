import hyperid from "hyperid";
import { BehaviorSubject } from "rxjs";

function attachParentId<T>(state: BehaviorSubject<T>, id: hyperid.Instance) {
  state["@parentId"] = id;
}

export { attachParentId };
