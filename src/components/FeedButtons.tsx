/**
 * FeedButtons コンポーネント
 * ================================
 * エサをあげるボタン群を表示します。
 * - 10エサあげる
 * - 50エサあげる
 * - 全部あげる
 *
 * エサが足りない場合はボタンを無効化します。
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FEED_OPTIONS } from '../constants/calmon';

// ----------------------------------------------------------------
// Props
// ----------------------------------------------------------------

interface Props {
  /** 所持エサ量 */
  feedStock: number;
  /**
   * エサをあげる処理。
   * @param amount 与えるエサ量、または 'all' (全部あげる)
   */
  onFeed: (amount: number | 'all') => void;
}

// ----------------------------------------------------------------
// コンポーネント
// ----------------------------------------------------------------

export default function FeedButtons({ feedStock, onFeed }: Props) {
  const hasNoFeed = feedStock <= 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>エサをあげる</Text>
      <View style={styles.buttonRow}>
        {/* 固定量ボタン (10, 50) */}
        {FEED_OPTIONS.map((amount) => {
          const disabled = hasNoFeed || feedStock < amount;
          return (
            <TouchableOpacity
              key={amount}
              style={[styles.button, disabled && styles.buttonDisabled]}
              onPress={() => onFeed(amount)}
              disabled={disabled}
              activeOpacity={0.75}
              accessibilityLabel={`${amount}エサあげる`}
            >
              <Text style={[styles.buttonLabel, disabled && styles.buttonLabelDisabled]}>
                {amount} エサ
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* 全部あげるボタン */}
        <TouchableOpacity
          style={[styles.button, styles.buttonAll, hasNoFeed && styles.buttonDisabled]}
          onPress={() => onFeed('all')}
          disabled={hasNoFeed}
          activeOpacity={0.75}
          accessibilityLabel="エサを全部あげる"
        >
          <Text style={[styles.buttonLabel, styles.buttonLabelAll, hasNoFeed && styles.buttonLabelDisabled]}>
            全部あげる
          </Text>
        </TouchableOpacity>
      </View>

      {/* エサ不足の注意書き */}
      {hasNoFeed && (
        <Text style={styles.noFeedNote}>エサがありません。もっと歩いてエサを集めましょう！</Text>
      )}
    </View>
  );
}

// ----------------------------------------------------------------
// スタイル
// ----------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4A4A5A',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FF89B5',
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#FF89B5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonAll: {
    backgroundColor: '#FFB347',
  },
  buttonDisabled: {
    backgroundColor: '#E0E0E8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  buttonLabelAll: {
    color: '#fff',
  },
  buttonLabelDisabled: {
    color: '#AAAABC',
  },
  noFeedNote: {
    fontSize: 12,
    color: '#AAAABC',
    textAlign: 'center',
    marginTop: 4,
  },
});
