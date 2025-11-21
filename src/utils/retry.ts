export async function retry<T>(fn: () => Promise<T>, tries = 2): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (tries <= 0) throw err;
    return retry(fn, tries - 1);
  }
}
