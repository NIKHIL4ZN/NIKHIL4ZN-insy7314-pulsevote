export function getErrorMessage(error) {
  const validationMessage = error.response?.data?.errors?.[0]?.msg;

  return (
    validationMessage ||
    error.response?.data?.message ||
    error.response?.data?.error ||
    "The request could not be completed."
  );
}