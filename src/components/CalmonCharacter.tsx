/**
 * CalmonCharacter コンポーネント
 * ================================
 * カルモンのキャラクター画像を表示します。
 * 状態 (normal / hungry / weak / ghost / happy) に応じて画像を切り替えます。
 *
 * 画像ファイルは assets/images/ に配置してください:
 *   calmon_normal.png / calmon_hungry.png / calmon_weak.png
 *   calmon_ghost.png  / calmon_happy.png
 *
 * 画像がない場合や読み込みに失敗した場合は、絵文字のプレースホルダーを表示します。
 */

import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import type { CalmonState } from '../types';
import { STATE_COLORS } from '../constants/calmon';

// ----------------------------------------------------------------
// 画像マッピング (静的 require — Metro バンドラーの制約)
// ----------------------------------------------------------------
// ※ React Native では変数を使った動的 require はできません。
//   すべての画像を静的にここで宣言してください。
// ----------------------------------------------------------------

const IMAGES = {
  normal: require('../../assets/images/calmon_normal.png'),
  hungry: require('../../assets/images/calmon_hungry.png'),
  weak: require('../../assets/images/calmon_weak.png'),
  ghost: require('../../assets/images/calmon_ghost.png'),
  happy: require('../../assets/images/calmon_happy.png'),
} as const;

/** 画像がない場合のフォールバック絵文字 */
const STATE_EMOJI: Record<CalmonState | 'happy', string> = {
  normal: '😊',
  hungry: '😟',
  weak: '😵',
  ghost: '👻',
  happy: '🥰',
};

// ----------------------------------------------------------------
// Props
// ----------------------------------------------------------------

interface Props {
  /** 表示するキャラクター状態 */
  state: CalmonState | 'happy';
  /** キャラクターの表示サイズ (デフォルト 200) */
  size?: number;
}

// ----------------------------------------------------------------
// コンポーネント
// ----------------------------------------------------------------

export default function CalmonCharacter({ state, size = 200 }: Props) {
  const [imageError, setImageError] = useState(false);

  const imageSource = IMAGES[state];
  const bgColor = state === 'happy' ? '#FFD6E7' : STATE_COLORS[state as CalmonState];

  if (imageError) {
    // 画像読み込みエラー時のプレースホルダー
    return (
      <View
        style={[
          styles.placeholder,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
        ]}
      >
        <Text style={[styles.emoji, { fontSize: size * 0.45 }]}>
          {STATE_EMOJI[state]}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={imageSource}
      style={{ width: size, height: size }}
      resizeMode="contain"
      onError={() => setImageError(true)}
      accessibilityLabel={`カルモン (${state})`}
    />
  );
}

// ----------------------------------------------------------------
// スタイル
// ----------------------------------------------------------------

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});
