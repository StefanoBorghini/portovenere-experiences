/**
 * mapWithConcurrency — esegue fn su ogni item con al massimo `limit`
 * chiamate in volo contemporaneamente. Via di mezzo tra Promise.all
 * (tutto insieme, rischia rate limiting su API esterne come Lara) e un
 * ciclo sequenziale puro (affidabile ma lento, rischia di far scadere
 * il timeout di una funzione serverless quando gli item sono tanti).
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {

  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await fn(items[index]);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker()
  );

  await Promise.all(workers);

  return results;
}
