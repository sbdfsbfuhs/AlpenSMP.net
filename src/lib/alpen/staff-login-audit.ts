export async function captureStaffLoginSideEffect(
  operation: () => Promise<unknown>,
  warning: string,
  timeoutMs = 1500,
): Promise<string | undefined> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("side effect timeout")), timeoutMs);
      }),
    ]);
    return undefined;
  } catch {
    return warning;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
