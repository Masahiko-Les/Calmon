/**
 * HungerGauge コンポーネント
 * ================================
 * カルモンの空腹ゲージをプログレスバーで表示します。
 * ゲージの色は状態に応じて変化します。
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { CalmonState } from '../types';
import { STATE_COLORS, STATE_LABELS } from '../constants/calmon';
import { gaugeToPercent } from '../utils/calmonLogic';

// ----------------------------------------------------------------
// Props
// ----------------------------------------------------------------

interface Props {
  /** 空腹ゲージ値 (0〜100) */
  gauge: number;
  /** カルモンの現在状態 */
  state: CalmonState;
}

// ----------------------------------------------------------------
// コンポーネント
// ----------------------------------------------------------------

export default function HungerGauge({ gauge, state }: Props) {
  const percent = gaugeToPercent(gauge); // 0〜1
  const barColor = STATE_COLORS[state];
  const label = STATE_LABELS[state];

  return (
    <View style={styles.container}>
      {/* ラベル行 */}
      <View style={styles.labelRow}>
        <Text style={styles.labelText}>空腹ゲージ</Text>
        <View style={[styles.stateBadge, { backgroundColor: barColor }]}>
          <Text style={styles.stateText}>{label}</Text>
        </View>
      </View>

      {/* プログレスバー */}
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.round(percent * 100)}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      {/* 数値 */}
      <Text style={styles.gaugeValue}>{Math.round(gauge)} / 100</Text>
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
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A5A',
  },
  stateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  stateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  barBackground: {
    height: 18,
    backgroundColor: '#E8E8F0',
    borderRadius: 9,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 9,
    minWidth: 4, // ゲージがほぼ 0 でも少しだけ見える
  },
  gaugeValue: {
    fontSize: 12,
    color: '#8888A0',
    textAlign: 'right',
  },
});
