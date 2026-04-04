/**
 * AsyncStorage 操作ユーティリティ
 * ================================
 * カルモンのセーブデータを保存・読み込みします。
 * AsyncStorage のキー名もここで管理しています。
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalmonSaveData } from '../types';
import { HUNGER, INITIAL_FEED_STOCK } from '../constants/calmon';

/** AsyncStorage のキー */
const STORAGE_KEY = '@calmon/save_data';

/** 初回起動時に使うデフォルトデータ */
const createDefaultSaveData = (): CalmonSaveData => ({
  hungerGauge: HUNGER.INITIAL,
  feedStock: INITIAL_FEED_STOCK,
  state: 'normal',
  lastUpdatedAt: new Date().toISOString(),
  zeroHungerSince: null,
  lastCalorieDate: null,
  todayCalories: 0,
});

/**
 * セーブデータを AsyncStorage から読み込みます。
 * データがない場合やパースに失敗した場合はデフォルトデータを返します。
 */
export async function loadCalmonData(): Promise<CalmonSaveData> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json !== null) {
      return JSON.parse(json) as CalmonSaveData;
    }
  } catch (e) {
    console.error('[Storage] 読み込みエラー:', e);
  }
  // データが存在しない場合はデフォルト値を返す
  return createDefaultSaveData();
}

/**
 * セーブデータを AsyncStorage に保存します。
 * 書き込みエラーはログに残しますが、アプリはクラッシュしません。
 */
export async function saveCalmonData(data: CalmonSaveData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[Storage] 保存エラー:', e);
  }
}

/**
 * セーブデータを削除します (デバッグ・リセット用)。
 * 実際の画面には繋ぎません。将来の設定画面で使用予定。
 */
export async function clearCalmonData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('[Storage] 削除エラー:', e);
  }
}
