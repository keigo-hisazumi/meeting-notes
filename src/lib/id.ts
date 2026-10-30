/** ランダムな ID を生成する */
export function generateId(): string {
  return crypto.randomUUID();
}
