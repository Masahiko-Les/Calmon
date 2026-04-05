/**
 * CalmonCharacter コンポーネント
 * ================================
 * カルモンのキャラクター画像を表示し、状態に応じてアニメーションします。
 *
 * React Native 標準の Animated API を使用しています。
 * Expo Go でそのまま動きます。追加パッケージは不要です。
 *
 * アニメーション仕様:
 *   normal  … ゆっくり上下にふわふわ浮く (translateY ループ)
 *   happy   … 嬉しそうに2回跳ねる (scale + translateY)
 *   hungry  … 弱々しく左右に小さく揺れる (rotate ループ)
 *   weak    … hungry と同様の揺れ
 *   ghost   … ゆっくり浮遊 + 透明度が揺れる
 *
 * 将来的に Development Build に移行したら
 * react-native-reanimated に差し替えることで
 * より滑らかなアニメーションにできます。
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, View, Text, StyleSheet } from 'react-native';
import type { CalmonState } from '../types';
import { STATE_COLORS } from '../constants/calmon';

// ----------------------------------------------------------------
// 画像マッピング (静的 require — Metro バンドラーの制約)
// ----------------------------------------------------------------
const IMAGES = {
  normal: require('../../assets/images/calmon_normal.png'),
  hungry: require('../../assets/images/calmon_hungry.png'),
  weak:   require('../../assets/images/calmon_hungry.png'), // weak は hungry 画像を使用
  ghost:  require('../../assets/images/calmon_ghost.png'),
  happy:  require('../../assets/images/calmon_happy.png'),
} as const;

/** 画像読み込み失敗時のフォールバック絵文字 */
const STATE_EMOJI: Record<CalmonState | 'happy', string> = {
  normal: '😊',
  hungry: '😟',
  weak:   '😵',
  ghost:  '👻',
  happy:  '🥰',
};

// ----------------------------------------------------------------
// Props
// ----------------------------------------------------------------
interface Props {
  state: CalmonState | 'happy';
  size?: number;
}

// ----------------------------------------------------------------
// コンポーネント
// ----------------------------------------------------------------
export default function CalmonCharacter({ state, size = 180 }: Props) {
  const [imageError, setImageError] = useState(false);

  // アニメーション用 Animated.Value
  const translateY = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(1)).current;
  const rotate     = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;

  // 実行中のアニメーションを保持して停止できるようにする
  const currentAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // 前のアニメーションを停止してから値をリセット
    currentAnim.current?.stop();
    translateY.setValue(0);
    scale.setValue(1);
    rotate.setValue(0);
    opacity.setValue(1);

    const easeInOut = Easing.inOut(Easing.sin);
    let anim: Animated.CompositeAnimation;

    if (state === 'normal') {
      // ふわふわ上下 (±6px、1800ms ループ)
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { toValue: -6, duration: 900, easing: easeInOut, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0,  duration: 900, easing: easeInOut, useNativeDriver: true }),
        ]),
      );

    } else if (state === 'happy') {
      // 2回跳ねてから normal のふわふわへ
      anim = Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, { toValue: -12, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(scale,      { toValue: 1.1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 0,  duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(scale,      { toValue: 1,  duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -10, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(scale,      { toValue: 1.07, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 0,  duration: 180, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.timing(scale,      { toValue: 1,  duration: 180, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
        // 跳ね終わったら normal のふわふわループへ
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, { toValue: -6, duration: 900, easing: easeInOut, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0,  duration: 900, easing: easeInOut, useNativeDriver: true }),
          ]),
        ),
      ]);

    } else if (state === 'hungry' || state === 'weak') {
      // 少し下がってから左右にふらふら (±2deg ループ)
      Animated.timing(translateY, { toValue: 4, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(rotate, { toValue: -2, duration: 600, easing: easeInOut, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 2,  duration: 600, easing: easeInOut, useNativeDriver: true }),
        ]),
      );

    } else {
      // ghost: ゆっくり浮遊 + 透明度がじわじわ変化
      anim = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateY, { toValue: -10, duration: 1200, easing: easeInOut, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0,   duration: 1200, easing: easeInOut, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.75, duration: 1600, easing: easeInOut, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1.0,  duration: 1600, easing: easeInOut, useNativeDriver: true }),
          ]),
        ]),
      );
    }

    currentAnim.current = anim;
    anim.start();

    return () => { anim.stop(); };
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // rotate の Animated.Value を degree 文字列に変換
  const rotateStr = rotate.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  // -----------------------------------------------------------------
  // プレースホルダー (画像エラー時)
  // -----------------------------------------------------------------
  if (imageError) {
    const bgColor = state === 'happy' ? '#FFD6E7' : STATE_COLORS[state as CalmonState];
    return (
      <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
        <Text style={{ fontSize: size * 0.45 }}>{STATE_EMOJI[state]}</Text>
      </View>
    );
  }

  // -----------------------------------------------------------------
  // メイン表示
  // -----------------------------------------------------------------
  return (
    <Animated.Image
      source={IMAGES[state]}
      style={{
        width: size,
        height: size,
        transform: [
          { translateY },
          { scale },
          { rotate: rotateStr },
        ],
        opacity,
      }}
      resizeMode="contain"
      onError={() => setImageError(true)}
      accessibilityLabel={`カルモン (${state})`}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
