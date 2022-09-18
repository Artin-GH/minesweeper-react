export function range(
  start: number = 0,
  end?: number,
  step: number = 1
): number[] {
  const result: number[] = [];
  if (end === undefined) {
    end = start;
    start = 0;
  }
  for (let i = start ?? 0; i < end; i += step ?? 1) result.push(i);
  return result;
}
