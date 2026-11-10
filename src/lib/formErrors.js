/** Maps a failed form request to a translation key under form.server.* */
export function serverErrorKey(err) {
  const code = err?.response?.status;
  if (code === 429) return "rate";
  if (code === 422) return "invalid";
  if (code === 400) return "rejected";
  return "generic";
}
