export async function safeQuery(promise) {
    const { error, data } = await promise;
    if (error)
        throw new Error(error.message);
    return data;
}
