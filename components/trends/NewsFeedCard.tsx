import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface NewsArticle {
  id: string;
  headline: string;
  description?: string;
  published: string;
  link: string;
  image?: string;
  sport: string;
}

interface NewsFeedCardProps {
  article: NewsArticle;
  onPress?: (article: NewsArticle) => void;
}

export const NewsFeedCard: React.FC<NewsFeedCardProps> = ({ article, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(article);
      return;
    }
    if (article.link) {
      Linking.openURL(article.link);
    }
  };

  const getTimeAgo = (published: string) => {
    const now = new Date();
    const publishedDate = new Date(published);
    const diffMs = now.getTime() - publishedDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
        <View style={styles.content}>
          {article.image && (
            <Image
              source={{ uri: article.image }}
              style={styles.newsImage}
              resizeMode="cover"
            />
          )}

          <View style={styles.textContent}>
            <View style={styles.header}>
              <View style={styles.sportBadge}>
                <Ionicons name="newspaper-outline" size={12} color="#10B981" />
                <Text style={styles.sportText}>{article.sport}</Text>
              </View>
              <Text style={styles.timestamp}>{getTimeAgo(article.published)}</Text>
            </View>

            <Text style={styles.headline} numberOfLines={3}>{article.headline}</Text>

            {article.description && (
              <Text style={styles.description} numberOfLines={2}>
                {article.description}
              </Text>
            )}

            <View style={styles.footer}>
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceText}>ESPN</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  newsImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  textContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  sportText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  headline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
});
