export async function retry(fn, tries = 2) {
    try {
        return await fn();
    }
    catch (err) {
        if (tries <= 0)
            throw err;
        return retry(fn, tries - 1);
    }
}
