/**
 * ホーム画面 (メイン画面)
 * ================================
 * カルモン MVP のすべての要素を 1 画面に表示します。
 *
 * 将来の拡張:
 * - Expo Router を追加して「図鑑」「履歴」「設定」タブを追加できます
 * - このコンポーネントを screens/HomeScreen.tsx に移動して
 *   App.tsx から <HomeScreen /> を呼ぶだけにするとさらに整理されます
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useCalmon } from './src/hooks/useCalmon';
import CalmonCharacter from './src/components/CalmonCharacter';
import HungerGauge from './src/components/HungerGauge';
import FeedButtons from './src/components/FeedButtons';
import ReactionMessage from './src/components/ReactionMessage';

// ----------------------------------------------------------------
// コンポーネント
// ----------------------------------------------------------------

export default function App() {
  const { data, reactionMessage, isLoading, feed, dismissReaction } = useCalmon();

  // ローディング中
  if (isLoading || !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF89B5" />
        <Text style={styles.loadingText}>カルモンを起こしています…</Text>
      </View>
    );
  }

  // リアクション表示中は happy 画像を使う (メッセージが消えたら元の状態に戻る)
  const displayState = reactionMessage ? 'happy' : data.state;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={{ backgroundColor: COLORS.background }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ======== ヘッダー ======== */}
        <Text style={styles.appTitle}>Calmon</Text>
        <Text style={styles.appSubtitle}>カルモンを育てよう</Text>

        {/* ======== キャラクター ======== */}
        <View style={styles.characterArea}>
          <CalmonCharacter state={displayState} size={200} />

          {/* リアクションメッセージ (キャラの下に表示) */}
          <ReactionMessage message={reactionMessage} onDismiss={dismissReaction} />
        </View>

        {/* ======== ステータスカード ======== */}
        <View style={styles.card}>
          {/* 空腹ゲージ */}
          <HungerGauge gauge={data.hungerGauge} state={data.state} />

          <View style={styles.divider} />

          {/* 所持エサ・消費カロリー */}
          <View style={styles.statsRow}>
            <StatItem
              icon="🍖"
              label="所持エサ"
              value={`${Math.floor(data.feedStock)} エサ`}
            />
            <View style={styles.statsDivider} />
            <StatItem
              icon="🔥"
              label="今日の消費"
              value={`${data.todayCalories} kcal`}
            />
          </View>
        </View>

        {/* ======== エサボタン ======== */}
        <View style={styles.card}>
          <FeedButtons feedStock={data.feedStock} onFeed={feed} />
        </View>

        {/* ======== フッター情報 ======== */}
        <Text style={styles.footerNote}>
          歩いたり動いたりするとエサが増えます
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ----------------------------------------------------------------
// 補助コンポーネント
// ----------------------------------------------------------------

interface StatItemProps {
  icon: string;
  label: string;
  value: string;
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// ----------------------------------------------------------------
// デザイントークン
// ----------------------------------------------------------------

const COLORS = {
  background: '#FFF0F5',  // 淡いピンク
  card: '#FFFFFF',
  title: '#4A4A5A',
  subtitle: '#9898B0',
  text: '#4A4A5A',
  note: '#AAAABC',
  divider: '#F0F0F8',
};

// ----------------------------------------------------------------
// スタイル
// ----------------------------------------------------------------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.subtitle,
  },
  scroll: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    gap: 16,
  },

  // ---- ヘッダー ----
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF89B5',
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 14,
    color: COLORS.subtitle,
    marginTop: -4,
  },

  // ---- キャラクター ----
  characterArea: {
    alignItems: 'center',
    marginVertical: 8,
    minHeight: 240,
    justifyContent: 'flex-start',
    backgroundColor: COLORS.background, // 透過 PNG の透明部分をアプリ背景色で統一
  },

  // ---- カード ----
  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 0,
    shadowColor: '#C0A8C8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 16,
  },

  // ---- ステータス行 ----
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statsDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.divider,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: {
    fontSize: 22,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.subtitle,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },

  // ---- フッター ----
  footerNote: {
    fontSize: 12,
    color: COLORS.note,
    textAlign: 'center',
    marginTop: 4,
  },
});
