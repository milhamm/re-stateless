import { isNotNil } from "ramda-adjunct";
import { Observable } from "rxjs";
import hyperid from "hyperid";

import { getUniqueId } from "../../utils/utils";

function attachUniqueId<T>(state: Observable<T>, id?: hyperid.Instance) {
  state["@id"] = isNotNil(id) ? id : getUniqueId();
}

export { attachUniqueId };
