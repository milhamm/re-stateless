import hyperId from "hyperid";

function getUniqueId() {
  return hyperId();
}

export { getUniqueId };
