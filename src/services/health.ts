/**
 * ヘルスデータ取得サービス
 * ================================
 * iPhone の消費カロリー (activeEnergyBurned) を取得します。
 *
 * 現在はモックデータを返します。
 * 将来的には HealthKit に差し替えてください。
 *
 * ---- HealthKit への差し替え手順 ----
 * 1. `react-native-health` をインストール:
 *      npx expo install react-native-health
 *
 * 2. Development Build を作成 (Expo Go では HealthKit は使えません):
 *      npx expo run:ios
 *
 * 3. app.json の plugins に追加:
 *      "plugins": [["react-native-health", { "NSHealthShareUsageDescription": "..." }]]
 *
 * 4. 下記 getTodayActiveCalories() の実装を差し替えてください。
 * ------------------------------------
 */

// ----------------------------------------------------------------
// モック実装
// ----------------------------------------------------------------

/**
 * 今日の消費カロリー (アクティブエネルギー) を取得します。
 *
 * @returns 消費カロリー (kcal)
 *
 * @example
 * // HealthKit 実装例:
 * import AppleHealthKit, { HealthValue } from 'react-native-health';
 * const options = { startDate: startOfToday.toISOString(), endDate: now.toISOString() };
 * const result: HealthValue = await new Promise((resolve, reject) => {
 *   AppleHealthKit.getActiveEnergyBurned(options, (err, result) => {
 *     if (err) reject(err); else resolve(result);
 *   });
 * });
 * return result.value;
 */
export async function getTodayActiveCalories(): Promise<number> {
  // TODO: HealthKit 実装に差し替えるときはこの行を削除してください
  return MOCK_CALORIES;
}

// ----------------------------------------------------------------
// モック設定 (開発・テスト用)
// ----------------------------------------------------------------

/**
 * モックの消費カロリー値。
 * 実機テスト時にここを変えて挙動を確認できます。
 */
const MOCK_CALORIES = 230;
