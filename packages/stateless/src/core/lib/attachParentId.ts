import hyperid from "hyperid";
import { Observable } from "rxjs";

function attachParentId<T>(state: Observable<T>, id: hyperid.Instance) {
  state["@parentId"] = id;
}

export { attachParentId };
