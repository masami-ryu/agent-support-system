// 現在時刻を ISO8601 文字列で返すツール。
// 副作用なし・引数不要なのでシグネチャは単純。
export async function timeNow() {
  return { iso: new Date().toISOString() };
}
