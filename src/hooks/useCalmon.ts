/**
 * useCalmon カスタムフック
 * ================================
 * カルモンの状態管理をまとめたカスタムフックです。
 * ホーム画面はこのフックを呼び出すだけで状態を扱えます。
 *
 * 担当する処理:
 * - アプリ起動時のデータ読み込み
 * - 時間経過による空腹ゲージ減少の適用
 * - 今日の消費カロリーからのエサ補充 (1日1回)
 * - エサをあげる操作
 * - リアクションメッセージの管理
 * - AsyncStorage への自動保存
 */

import { useState, useEffect, useCallback } from 'react';
import type { CalmonSaveData } from '../types';
import { loadCalmonData, saveCalmonData } from '../utils/storage';
import { applyHungerDecay, feedCalmon } from '../utils/calmonLogic';
import { getTodayActiveCalories } from '../services/health';
import {
  CALORIE_TO_FEED_RATE,
  CAN_REVIVE_FROM_GHOST,
  REACTION_MESSAGES,
} from '../constants/calmon';

// ----------------------------------------------------------------
// 型定義
// ----------------------------------------------------------------

export interface UseCalmonReturn {
  /** カルモンのセーブデータ (null はロード中) */
  data: CalmonSaveData | null;
  /** エサをあげた時に表示するリアクションメッセージ */
  reactionMessage: string | null;
  /** 初期化処理中かどうか */
  isLoading: boolean;
  /**
   * カルモンにエサをあげます。
   * @param amount  与えるエサ量。'all' を指定すると所持エサを全部あげます
   */
  feed: (amount: number | 'all') => void;
  /** リアクションメッセージを閉じます */
  dismissReaction: () => void;
}

// ----------------------------------------------------------------
// フック本体
// ----------------------------------------------------------------

export function useCalmon(): UseCalmonReturn {
  const [data, setData] = useState<CalmonSaveData | null>(null);
  const [reactionMessage, setReactionMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------------
  // 初期化 (アプリ起動時に一度だけ実行)
  // ---------------------------------------------------------------
  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. 保存データを読み込む
        const saved = await loadCalmonData();

        // 2. 前回起動から経過した時間分だけ空腹ゲージを減少させる
        const afterDecay = applyHungerDecay(saved);

        // 3. 今日のカロリー補充 (1日1回のみ)
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        let finalData: CalmonSaveData;

        if (afterDecay.lastCalorieDate !== today) {
          // 今日はまだカロリーを補充していない
          const calories = await getTodayActiveCalories();
          const newFeed = Math.floor(calories * CALORIE_TO_FEED_RATE);

          finalData = {
            ...afterDecay,
            feedStock: afterDecay.feedStock + newFeed,
            lastCalorieDate: today,
            todayCalories: calories,
          };
        } else {
          // 今日分は補充済み → データをそのまま使う
          finalData = afterDecay;
        }

        // 4. 更新データを保存 & state にセット
        await saveCalmonData(finalData);
        setData(finalData);
      } catch (e) {
        console.error('[useCalmon] 初期化エラー:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------
  // エサをあげる
  // ---------------------------------------------------------------
  const feed = useCallback((amount: number | 'all') => {
    setData((prev) => {
      if (!prev) return prev;

      // ghost 状態で復活不可の設定なら何もしない
      if (prev.state === 'ghost' && !CAN_REVIVE_FROM_GHOST) {
        return prev;
      }

      // 与えるエサ量を決定 ('all' なら所持全量)
      const feedAmount = amount === 'all' ? prev.feedStock : amount;

      // カルモンにエサをあげる
      const updated = feedCalmon(prev, feedAmount);

      // エサをあげる前の状態に応じたリアクションメッセージを表示
      const messages = REACTION_MESSAGES[prev.state] ?? [];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setReactionMessage(msg ?? null);

      // 非同期で保存 (state 更新はすぐ反映させるため await しない)
      saveCalmonData(updated);

      return updated;
    });
  }, []); // 依存なし (constants は変わらないため)

  const dismissReaction = useCallback(() => {
    setReactionMessage(null);
  }, []);

  return { data, reactionMessage, isLoading, feed, dismissReaction };
}
