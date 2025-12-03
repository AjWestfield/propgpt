/**
 * PropDetailModal Component
 *
 * Full-screen modal displaying detailed prop information
 * with all sportsbook odds, EV calculations, and bet calculators
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { OutlierOpportunity } from '../types/outlierEV';
import { EVRating } from './EVRating';
import { formatAmericanOdds } from '../services/oddsApiIO';
import { calculateKellyStake } from '../services/evCalculator';

interface PropDetailModalProps {
  opportunity: OutlierOpportunity | null;
  onClose: () => void;
}

export function PropDetailModal({ opportunity, onClose }: PropDetailModalProps) {
  const [bankroll, setBankroll] = useState('1000');
  const [kellyFraction, setKellyFraction] = useState('0.25');

  if (!opportunity) return null;

  const isArbitrage = opportunity.opportunityType === 'arbitrage';

  // Calculate recommended stakes
  const calculateStakes = () => {
    if (!opportunity.ev) return { overStake: 0, underStake: 0 };

    const bankrollNum = parseFloat(bankroll) || 1000;
    const kellyFrac = parseFloat(kellyFraction) || 0.25;

    const overStake = calculateKellyStake(
      bankrollNum,
      opportunity.ev.estimatedTrueProbability,
      opportunity.ev.bestOver.odds,
      kellyFrac
    );

    const underStake = calculateKellyStake(
      bankrollNum,
      1 - opportunity.ev.estimatedTrueProbability,
      opportunity.ev.bestUnder.odds,
      kellyFrac
    );

    return { overStake, underStake };
  };

  const { overStake, underStake } = opportunity.ev ? calculateStakes() : { overStake: 0, underStake: 0 };

  return (
    <Modal
      visible={!!opportunity}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <BlurView intensity={80} tint="dark" style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{opportunity.player}</Text>
            <Text style={styles.headerSubtitle}>{opportunity.propType}</Text>
          </View>
        </BlurView>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Highlight Section */}
          <View style={styles.highlightSection}>
            <View style={styles.highlightRow}>
              <Ionicons
                name={isArbitrage ? 'checkmark-circle' : 'star'}
                size={24}
                color={isArbitrage ? '#10B981' : '#F59E0B'}
              />
              <Text style={[styles.highlightText, { color: isArbitrage ? '#10B981' : '#F59E0B' }]}>
                {opportunity.highlight}
              </Text>
            </View>
            <Text style={styles.bestPlayText}>{opportunity.bestPlay}</Text>
          </View>

          {/* All Sportsbooks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Sportsbooks ({opportunity.allBooks.length})</Text>
            {opportunity.allBooks.map((book, index) => (
              <View key={`${book.sportsbookKey}-${index}`} style={styles.bookRow}>
                <View style={styles.bookHeader}>
                  <Text style={styles.bookName}>{book.sportsbook}</Text>
                  <Text style={styles.lineText}>Line: {book.line}</Text>
                </View>
                <View style={styles.oddsRow}>
                  <View style={styles.oddsColumn}>
                    <Text style={styles.oddsLabel}>OVER</Text>
                    <Text style={styles.oddsValue}>{formatAmericanOdds(book.overOdds)}</Text>
                    {opportunity.ev && (
                      <EVRating
                        evPercentage={
                          opportunity.ev.bestOver.sportsbookKey === book.sportsbookKey
                            ? opportunity.ev.bestOver.ev
                            : 0
                        }
                        size="small"
                        showStars={false}
                      />
                    )}
                  </View>
                  <View style={styles.oddsDivider} />
                  <View style={styles.oddsColumn}>
                    <Text style={styles.oddsLabel}>UNDER</Text>
                    <Text style={styles.oddsValue}>{formatAmericanOdds(book.underOdds)}</Text>
                    {opportunity.ev && (
                      <EVRating
                        evPercentage={
                          opportunity.ev.bestUnder.sportsbookKey === book.sportsbookKey
                            ? opportunity.ev.bestUnder.ev
                            : 0
                        }
                        size="small"
                        showStars={false}
                      />
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Kelly Calculator (for EV opportunities) */}
          {opportunity.ev && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kelly Criterion Calculator</Text>
              <View style={styles.calculatorCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bankroll ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={bankroll}
                    onChangeText={setBankroll}
                    keyboardType="decimal-pad"
                    placeholder="1000"
                    placeholderTextColor="#6E6E73"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Kelly Fraction</Text>
                  <TextInput
                    style={styles.input}
                    value={kellyFraction}
                    onChangeText={setKellyFraction}
                    keyboardType="decimal-pad"
                    placeholder="0.25"
                    placeholderTextColor="#6E6E73"
                  />
                </View>

                <View style={styles.resultsSection}>
                  <Text style={styles.resultsTitle}>Recommended Stakes</Text>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>
                      Over ({opportunity.ev.bestOver.sportsbook})
                    </Text>
                    <Text style={styles.resultValue}>${overStake.toFixed(2)}</Text>
                  </View>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>
                      Under ({opportunity.ev.bestUnder.sportsbook})
                    </Text>
                    <Text style={styles.resultValue}>${underStake.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Arbitrage Calculator */}
          {opportunity.arbitrage && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Arbitrage Calculator</Text>
              <View style={styles.calculatorCard}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Total Stake</Text>
                  <Text style={styles.resultValue}>${opportunity.arbitrage.totalStake.toFixed(2)}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>
                    Over Stake ({opportunity.arbitrage.overBook.sportsbook})
                  </Text>
                  <Text style={styles.resultValue}>${opportunity.arbitrage.overStake.toFixed(2)}</Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>
                    Under Stake ({opportunity.arbitrage.underBook.sportsbook})
                  </Text>
                  <Text style={styles.resultValue}>${opportunity.arbitrage.underStake.toFixed(2)}</Text>
                </View>
                <View style={[styles.resultRow, styles.profitRow]}>
                  <Text style={[styles.resultLabel, styles.profitLabel]}>Guaranteed Profit</Text>
                  <Text style={[styles.resultValue, styles.profitValue]}>
                    ${opportunity.arbitrage.profitAmount.toFixed(2)} (
                    {opportunity.arbitrage.guaranteedProfit.toFixed(2)}%)
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E5E7',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  highlightSection: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  bestPlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E5E7',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  bookRow: {
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lineText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#AEAEB2',
  },
  oddsRow: {
    flexDirection: 'row',
  },
  oddsColumn: {
    flex: 1,
    alignItems: 'center',
  },
  oddsDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  oddsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AEAEB2',
    marginBottom: 6,
  },
  oddsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  calculatorCard: {
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E5E7',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(58, 58, 60, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultsSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#AEAEB2',
    flex: 1,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profitRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
  },
  profitLabel: {
    color: '#10B981',
  },
  profitValue: {
    fontSize: 18,
    color: '#10B981',
  },
});
