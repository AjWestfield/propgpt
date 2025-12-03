import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { mockPlayerProps } from '../data/mockProps';

const { height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! I'm your AI prop assistant. Ask me about any player props, or try one of these:",
      isUser: false,
      timestamp: new Date(),
      suggestions: [
        "Show me NBA props tonight",
        "Best high-confidence picks",
        "What's trending in NFL?",
        "LeBron James props"
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (inputText.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText);
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();

    // NBA props
    if (lowerQuery.includes('nba') || lowerQuery.includes('basketball')) {
      const nbaProps = mockPlayerProps.filter(p => p.sport === 'NBA').slice(0, 3);
      return {
        id: Date.now().toString(),
        text: `Here are the top NBA props for tonight:\n\n${nbaProps.map(p =>
          `${p.playerName} - ${p.propType}\nLine: ${p.line} | Projection: ${p.projection} (${p.confidence}% confidence)\n${p.over ? 'OVER' : 'UNDER'}`
        ).join('\n\n')}`,
        isUser: false,
        timestamp: new Date(),
        suggestions: ['Tell me more about LeBron', 'Show me NFL props', 'What about MLB?'],
      };
    }

    // High confidence
    if (lowerQuery.includes('high confidence') || lowerQuery.includes('best')) {
      const highConf = mockPlayerProps.filter(p => p.confidence >= 85).slice(0, 3);
      return {
        id: Date.now().toString(),
        text: `Here are the highest confidence props (85%+):\n\n${highConf.map(p =>
          `${getSportEmoji(p.sport)} ${p.playerName} - ${p.propType}\n${p.projection} (${p.confidence}% confidence) ${p.over ? 'OVER' : 'UNDER'} ${p.line}`
        ).join('\n\n')}`,
        isUser: false,
        timestamp: new Date(),
        suggestions: ['More details', 'Show trending props', 'NFL picks'],
      };
    }

    // Trending
    if (lowerQuery.includes('trending') || lowerQuery.includes('hot')) {
      const trending = mockPlayerProps.filter(p => p.trend === 'up').slice(0, 3);
      return {
        id: Date.now().toString(),
        text: `📈 Trending props (players on hot streaks):\n\n${trending.map(p =>
          `${getSportEmoji(p.sport)} ${p.playerName} - ${p.propType}\nProjection: ${p.projection} | Line: ${p.line}\nRecent L5: ${p.recentGames.join(', ')}`
        ).join('\n\n')}`,
        isUser: false,
        timestamp: new Date(),
        suggestions: ['NBA only', 'Show all sports', 'High confidence picks'],
      };
    }

    // Player specific
    const player = mockPlayerProps.find(p =>
      p.playerName.toLowerCase().includes(lowerQuery) ||
      lowerQuery.includes(p.playerName.toLowerCase())
    );

    if (player) {
      return {
        id: Date.now().toString(),
        text: `${getSportEmoji(player.sport)} ${player.playerName} Analysis:\n\n📊 ${player.propType}: ${player.line}\n🎯 Projection: ${player.projection}\n✨ Confidence: ${player.confidence}%\n📈 Pick: ${player.over ? 'OVER' : 'UNDER'}\n\n💡 Why: ${player.reasoning}\n\nRecent form (L5): ${player.recentGames.join(', ')}\nSeason avg: ${player.seasonAverage}\nVs ${player.opponent}: ${player.vsOpponentAverage}`,
        isUser: false,
        timestamp: new Date(),
        suggestions: ['Show similar props', 'Other high confidence picks', 'More NBA props'],
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      text: "I can help you find player props! Try asking about:\n\n• Specific sports (NBA, NFL, MLB, NHL)\n• Player names (LeBron, Mahomes, etc.)\n• High confidence picks\n• Trending props\n\nWhat would you like to know?",
      isUser: false,
      timestamp: new Date(),
      suggestions: ['Show me NBA props', 'Best picks tonight', 'What\'s trending?'],
    };
  };

  const getSportIcon = (sport: string): string => {
    switch (sport) {
      case 'NBA': return 'basketball';
      case 'NFL': return 'football';
      case 'MLB': return 'baseball';
      case 'NHL': return 'snow';
      default: return 'star';
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
    handleSend();
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Chat</Text>
        <Text style={styles.headerSubtitle}>Ask me anything about props</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View key={message.id}>
            <View style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}>
              <BlurView
                intensity={60}
                tint="dark"
                style={styles.bubbleBlur}
              >
                <Text style={styles.messageText}>{message.text}</Text>
                {!message.isUser && message.suggestions && (
                  <View style={styles.suggestionsContainer}>
                    {message.suggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleSuggestionPress(suggestion)}
                        activeOpacity={0.8}
                        style={styles.suggestionTouchable}
                      >
                        <BlurView intensity={40} tint="dark" style={styles.suggestionChip}>
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </BlurView>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </BlurView>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <BlurView intensity={80} tint="dark" style={styles.inputBlur}>
          <TextInput
            style={styles.input}
            placeholder="Ask about any player prop..."
            placeholderTextColor="#AEAEB2"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={inputText.trim() === ''}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>📤</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageBubble: {
    marginBottom: 16,
    maxWidth: '85%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  bubbleBlur: {
    padding: 16,
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderRadius: 20,
  },
  messageText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    fontWeight: '400',
  },
  suggestionsContainer: {
    marginTop: 12,
    gap: 8,
  },
  suggestionTouchable: {
    marginBottom: 4,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  suggestionText: {
    fontSize: 13,
    color: '#E5E5E7',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputBlur: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    gap: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    fontWeight: '400',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sendButtonDisabled: {
    opacity: 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sendIcon: {
    fontSize: 18,
  },
});
