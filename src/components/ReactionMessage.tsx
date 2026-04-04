/**
 * ReactionMessage コンポーネント
 * ================================
 * エサをあげたときのカルモンのリアクションメッセージをポップアップ風に表示します。
 * メッセージをタップするか、一定時間後に自動で消えます。
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

// ----------------------------------------------------------------
// Props
// ----------------------------------------------------------------

interface Props {
  /** 表示するメッセージ (null の場合は非表示) */
  message: string | null;
  /** メッセージを閉じる処理 */
  onDismiss: () => void;
  /** 自動で閉じるまでの時間 (ms)。デフォルト 2500ms */
  autoDismissMs?: number;
}

// ----------------------------------------------------------------
// コンポーネント
// ----------------------------------------------------------------

export default function ReactionMessage({
  message,
  onDismiss,
  autoDismissMs = 2500,
}: Props) {
  // フェードインアニメーション用
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      // 表示 → フェードイン
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // 一定時間後に自動で閉じる
      const timer = setTimeout(() => {
        onDismiss();
      }, autoDismissMs);

      return () => clearTimeout(timer);
    } else {
      // 非表示 → 即座にリセット
      opacity.setValue(0);
    }
  }, [message]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!message) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <TouchableOpacity
        onPress={onDismiss}
        activeOpacity={0.85}
        accessibilityLabel="リアクションメッセージを閉じる"
      >
        <View style={styles.bubble}>
          {/* 吹き出しの三角 */}
          <View style={styles.triangle} />
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ----------------------------------------------------------------
// スタイル
// ----------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 8,
  },
  bubble: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#FF89B5',
    shadowColor: '#FF89B5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  triangle: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF89B5',
    left: '50%',
    marginLeft: -10,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A4A5A',
    textAlign: 'center',
  },
});
