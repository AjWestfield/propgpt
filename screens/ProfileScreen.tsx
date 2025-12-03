import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useMyPicks } from '../contexts/MyPicksContext';
import type { PlayerProp } from '../types/playerProp';

export function ProfileScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);
  const { picks, removePick, clearPicks } = useMyPicks();

  const pickCount = picks.length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <BlurView intensity={80} tint="dark" style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </BlurView>
          <Text style={styles.name}>Guest User</Text>
          <Text style={styles.subtitle}>PropGPT Member</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{pickCount}</Text>
            <Text style={styles.statLabel}>Picks Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Total ROI</Text>
          </View>
        </View>

        {/* Picks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 My Picks</Text>
            {pickCount > 0 && (
              <TouchableOpacity
                onPress={clearPicks}
                style={styles.clearButton}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={14} color="#F87171" />
                <Text style={styles.clearButtonText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>

          {pickCount === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyTitle}>No picks saved yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap the + button on any prop card to build your slip.
              </Text>
            </View>
          ) : (
            picks.map((pick) => (
              <MyPickCard key={pick.id} pick={pick} onRemove={removePick} />
            ))
          )}
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>

          <SettingItem
            icon="🔔"
            label="Notifications"
            value={notifications}
            onToggle={setNotifications}
            hasToggle={true}
          />

          <SettingItem
            icon="🌙"
            label="Dark Mode"
            value={darkMode}
            onToggle={setDarkMode}
            hasToggle={true}
          />

          <SettingItem
            icon="⭐"
            label="Favorite Sports"
            subtitle="Customize your preferences"
          />

          <SettingItem
            icon="📊"
            label="Data & Analytics"
            subtitle="Manage your tracking"
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Account</Text>

          <SettingItem
            icon="🔐"
            label="Privacy & Security"
            subtitle="Manage your privacy"
          />

          <SettingItem
            icon="💳"
            label="Subscription"
            subtitle="Free Plan"
            badge="Upgrade"
          />

          <SettingItem
            icon="📝"
            label="Terms of Service"
          />

          <SettingItem
            icon="📄"
            label="Privacy Policy"
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Support</Text>

          <SettingItem
            icon="❓"
            label="Help Center"
            subtitle="Get answers to common questions"
          />

          <SettingItem
            icon="📧"
            label="Contact Us"
            subtitle="Send us a message"
          />

          <SettingItem
            icon="⭐"
            label="Rate PropGPT"
            subtitle="Share your feedback"
          />
        </View>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>PropGPT v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 PropGPT. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function MyPickCard({ pick, onRemove }: { pick: PlayerProp; onRemove: (id: string) => void }) {
  return (
    <BlurView intensity={60} tint="dark" style={styles.pickCard}>
      <View style={styles.pickHeader}>
        <View style={styles.pickPlayerInfo}>
          <Image source={{ uri: pick.playerImage }} style={styles.pickAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pickPlayerName}>{pick.playerName}</Text>
            <Text style={styles.pickSubtext}>
              {pick.team} vs {pick.opponent} • {pick.sport}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(pick.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.pickDetailsRow}>
        <View>
          <Text style={styles.pickPropType}>{pick.propType}</Text>
          <Text style={styles.pickLine}>
            Line: <Text style={styles.pickLineValue}>{pick.line}</Text>
          </Text>
        </View>
        <View style={styles.pickBadgeRow}>
          <View style={[styles.pickBadge, pick.over ? styles.pickBadgeOver : styles.pickBadgeUnder]}>
            <Text
              style={[
                styles.pickBadgeText,
                pick.over ? styles.pickBadgeTextOver : styles.pickBadgeTextUnder,
              ]}
            >
              {pick.over ? 'OVER' : 'UNDER'}
            </Text>
          </View>
          <View style={styles.confidencePill}>
            <Ionicons name="sparkles-outline" size={12} color="#FBBF24" />
            <Text style={styles.confidenceText}>{pick.confidence}%</Text>
          </View>
        </View>
      </View>

      <View style={styles.pickFooter}>
        <View style={styles.pickMeta}>
          <Ionicons name="time-outline" size={14} color="#9CA3AF" />
          <Text style={styles.pickMetaText}>{pick.gameTime}</Text>
        </View>
        <View style={styles.pickMeta}>
          <Ionicons name="stats-chart-outline" size={14} color="#9CA3AF" />
          <Text style={styles.pickMetaText}>Hit Rate {Math.round(pick.hitRate)}%</Text>
        </View>
      </View>
    </BlurView>
  );
}

function SettingItem({
  icon,
  label,
  subtitle,
  badge,
  value,
  onToggle,
  hasToggle = false,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  badge?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  hasToggle?: boolean;
}) {
  return (
    <TouchableOpacity activeOpacity={hasToggle ? 1 : 0.8}>
      <BlurView intensity={60} tint="dark" style={styles.settingItem}>
        <View style={styles.settingIcon}>
          <Text style={styles.settingIconText}>{icon}</Text>
        </View>
        <View style={styles.settingContent}>
          <View style={styles.settingHeader}>
            <Text style={styles.settingLabel}>{label}</Text>
            {badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {hasToggle ? (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: '#767577', true: '#10B981' }}
            thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
          />
        ) : (
          <Text style={styles.arrow}>›</Text>
        )}
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    marginBottom: 16,
  },
  avatar: {
    fontSize: 36,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 24,
    marginBottom: 32,
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#AEAEB2',
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  clearButtonText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#AEAEB2',
    textAlign: 'center',
  },
  pickCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
  },
  pickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  pickPlayerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickPlayerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  pickSubtext: {
    fontSize: 12,
    color: '#AEAEB2',
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  pickDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickPropType: {
    fontSize: 14,
    color: '#AEAEB2',
    marginBottom: 4,
  },
  pickLine: {
    fontSize: 16,
    color: '#F3F4F6',
  },
  pickLineValue: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pickBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pickBadgeOver: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  pickBadgeUnder: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  pickBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pickBadgeTextOver: {
    color: '#10B981',
  },
  pickBadgeTextUnder: {
    color: '#EF4444',
  },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FBBF24',
  },
  pickFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  pickMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pickMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    marginBottom: 12,
    gap: 16,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconText: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  badge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#AEAEB2',
    marginTop: 2,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 24,
    color: '#AEAEB2',
    fontWeight: '300',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 13,
    color: '#AEAEB2',
    marginBottom: 4,
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: 12,
    color: '#6E6E73',
    fontWeight: '400',
  },
});
