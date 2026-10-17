/** Turns any axios error into a predictable shape the UI can render. */
export function normalizeError(error) {
  if (error && error.isNormalized) return error;

  const response = error?.response;
  if (!response) {
    return {
      isNormalized: true,
      status: 0,
      isNetwork: true,
      message: 'Unable to reach the server. Check your connection and try again.',
      fieldErrors: {},
    };
  }

  const data = response.data && typeof response.data === 'object' ? response.data : {};
  const fieldErrors = {};
  if (Array.isArray(data.fieldErrors)) {
    data.fieldErrors.forEach((fe) => {
      if (fe?.field && !fieldErrors[fe.field]) fieldErrors[fe.field] = fe.message;
    });
  }

  return {
    isNormalized: true,
    status: response.status,
    isNetwork: false,
    message: data.message || 'Something went wrong. Please try again.',
    fieldErrors,
  };
}
