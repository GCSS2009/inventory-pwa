export async function safeQuery(promise: Promise<any>) {
  const { error, data } = await promise;
  if (error) throw new Error(error.message);
  return data;
}
