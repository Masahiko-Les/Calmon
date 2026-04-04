/**
 * カルモン 状態計算ロジック
 * ================================
 * 純粋な関数 (副作用なし) でカルモンの状態を計算します。
 * テストしやすいよう、React や AsyncStorage には依存しません。
 */

import type { CalmonState, CalmonSaveData } from '../types';
import {
  HUNGER,
  STATE_THRESHOLDS,
  GHOST_TIME_HOURS,
  HUNGER_PER_FEED,
} from '../constants/calmon';

// ----------------------------------------------------------------
// 状態計算
// ----------------------------------------------------------------

/**
 * 空腹ゲージ値と「0 になった日時」から、カルモンの現在状態を返します。
 *
 * @param gauge         空腹ゲージ (0〜100)
 * @param zeroHungerSince ゲージが 0 になった日時。ゲージ > 0 なら null
 */
export function calcState(
  gauge: number,
  zeroHungerSince: string | null,
): CalmonState {
  if (gauge >= STATE_THRESHOLDS.normal) return 'normal';
  if (gauge >= STATE_THRESHOLDS.hungry) return 'hungry';
  if (gauge >= STATE_THRESHOLDS.weak) return 'weak';

  // ゲージが 0 の場合 → ghost になるまでの時間をチェック
  if (zeroHungerSince) {
    const hoursSinceZero =
      (Date.now() - new Date(zeroHungerSince).getTime()) / 3_600_000;
    if (hoursSinceZero >= GHOST_TIME_HOURS) return 'ghost';
  }

  // まだ ghost 時間未満なら weak のまま
  return 'weak';
}

// ----------------------------------------------------------------
// 時間経過による空腹ゲージ減少
// ----------------------------------------------------------------

/**
 * 前回更新時刻からの経過時間に基づき、空腹ゲージを減少させます。
 * アプリ起動時に一度だけ呼び出してください。
 *
 * @param data セーブデータ (前回保存分)
 * @returns 空腹ゲージを更新した新しいセーブデータ
 */
export function applyHungerDecay(data: CalmonSaveData): CalmonSaveData {
  const now = new Date();
  const lastUpdated = new Date(data.lastUpdatedAt);

  // 経過時間 (時間単位)
  const elapsedHours = (now.getTime() - lastUpdated.getTime()) / 3_600_000;

  // 減少量を計算 (マイナスにはならない)
  const decayAmount = elapsedHours * HUNGER.DECAY_PER_HOUR;
  const newGauge = Math.max(0, data.hungerGauge - decayAmount);

  // 空腹ゲージが 0 になったタイミングを推定して記録
  let { zeroHungerSince } = data;

  if (newGauge === 0 && data.hungerGauge > 0) {
    // 今回の decay で初めて 0 になった → ゲージが 0 になった時刻を逆算
    const hoursToZero = data.hungerGauge / HUNGER.DECAY_PER_HOUR;
    const zeroTime = new Date(
      lastUpdated.getTime() + hoursToZero * 3_600_000,
    );
    zeroHungerSince = zeroTime.toISOString();
  } else if (newGauge > 0) {
    // ゲージが 0 でない場合はリセット
    zeroHungerSince = null;
  }
  // newGauge === 0 かつ 前回も 0 → zeroHungerSince はそのまま保持

  const newState = calcState(newGauge, zeroHungerSince);

  return {
    ...data,
    hungerGauge: newGauge,
    state: newState,
    lastUpdatedAt: now.toISOString(),
    zeroHungerSince,
  };
}

// ----------------------------------------------------------------
// エサを与える
// ----------------------------------------------------------------

/**
 * カルモンにエサを与えます。
 * - 所持エサ量を減らし、空腹ゲージを回復します。
 * - エサが不足している場合は所持分だけ与えます。
 *
 * @param data       現在のセーブデータ
 * @param feedAmount 与えるエサ量
 * @returns 更新後のセーブデータ
 */
export function feedCalmon(
  data: CalmonSaveData,
  feedAmount: number,
): CalmonSaveData {
  // 実際に与えられる量 (所持エサ量を超えない)
  const actualAmount = Math.min(feedAmount, data.feedStock);
  if (actualAmount <= 0) return data; // エサがない

  const newFeedStock = data.feedStock - actualAmount;
  const hungerRecovery = actualAmount * HUNGER_PER_FEED;
  const newGauge = Math.min(HUNGER.MAX, data.hungerGauge + hungerRecovery);

  // ゲージが回復して 0 でなくなったら zeroHungerSince をリセット
  const zeroHungerSince = newGauge > 0 ? null : data.zeroHungerSince;

  const newState = calcState(newGauge, zeroHungerSince);

  return {
    ...data,
    feedStock: newFeedStock,
    hungerGauge: newGauge,
    state: newState,
    lastUpdatedAt: new Date().toISOString(),
    zeroHungerSince,
  };
}

// ----------------------------------------------------------------
// ヘルパー
// ----------------------------------------------------------------

/**
 * 空腹ゲージを 0〜100 のパーセンテージ (0〜1) に変換します。
 * プログレスバーの幅計算などに使います。
 */
export function gaugeToPercent(gauge: number): number {
  return Math.min(1, Math.max(0, gauge / HUNGER.MAX));
}
