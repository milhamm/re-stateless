export const EFFECT = {
  STATUS: {
    PENDING: "pending",
    FULFILLED: "fulfilled",
    REJECTED: "rejected",
  },
  STATE_NAMESPACE: "@effectState",
  STATUS_KEY: "status",
  ERROR_KEY: "error",
} as const;
