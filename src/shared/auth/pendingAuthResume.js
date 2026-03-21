let pending = {
  resume: null,
  errorMessage: null,
};

export function setPendingAuthResume(route) {
  pending = { ...pending, resume: route };
}

export function setPendingAuthErrorMessage(message) {
  pending = { ...pending, errorMessage: message };
}

export function consumePendingAuthResume() {
  const r = pending;
  pending = { resume: null, errorMessage: null };
  return r;
}
