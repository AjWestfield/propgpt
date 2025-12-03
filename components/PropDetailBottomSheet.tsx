/**
 * PropDetailBottomSheet Component
 *
 * Bottom sheet that displays detailed odds comparison, bet calculator,
 * and recent form when user taps on an OutlierEVCard
 */

import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { OutlierOpportunity } from '../types/outlierEV';
import { formatAmericanOdds } from '../services/oddsApiIO';
import { calculateKellyStake } from '../services/evCalculator';
import { EVRating } from './EVRating';
import { createSportsbookDeepLink } from '../constants/sportsbookLogos';

interface PropDetailBottomSheetProps {
  opportunity: OutlierOpportunity | null;
  onClose: () => void;
}

export function PropDetailBottomSheet({
  opportunity,
  onClose,
}: PropDetailBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['85%'], []);

  const [bankroll, setBankroll] = useState('1000');
  const [kellyFraction, setKellyFraction] = useState('0.25');

  // Close sheet when opportunity becomes null
  React.useEffect(() => {
    if (opportunity) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [opportunity]);

  if (!opportunity) return null;

  const { player, propType, game, allBooks } = opportunity;
  const isArbitrage = opportunity.opportunityType === 'arbitrage';

  // Calculate Kelly stakes for best odds
  const calculateStakes = () => {
    if (!opportunity.ev) return null;

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

  const stakes = calculateStakes();

  // Render backdrop
  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
      pressBehavior="close"
    />
  );

  // Open sportsbook deep link
  const openSportsbook = (bookKey: string) => {
    const url = createSportsbookDeepLink(bookKey, opportunity.sport, game.homeTeam);
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error('Failed to open sportsbook:', err)
      );
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.playerName}>{player}</Text>
            <Text style={styles.propType}>{propType}</Text>
            <Text style={styles.matchup}>
              {game.homeTeam} vs {game.awayTeam}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Opportunity Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Ionicons
              name={isArbitrage ? 'checkmark-circle' : 'star'}
              size={24}
              color={isArbitrage ? '#10B981' : '#F59E0B'}
            />
            <Text style={styles.summaryTitle}>{opportunity.highlight}</Text>
          </View>
          <Text style={styles.summarySubtitle}>{opportunity.bestPlay}</Text>
        </View>

        {/* All Sportsbook Odds */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Sportsbooks</Text>
          {allBooks.map((book, index) => (
            <TouchableOpacity
              key={`${book.sportsbookKey}-${index}`}
              style={styles.bookRow}
              onPress={() => openSportsbook(book.sportsbookKey)}
              activeOpacity={0.7}
            >
              <View style={styles.bookInfo}>
                {book.logoUrl ? (
                  <Image
                    source={{ uri: book.logoUrl }}
                    style={styles.bookLogo}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.bookLogoPlaceholder}>
                    <Text style={styles.bookLogoText}>
                      {book.sportsbook.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.bookNameSection}>
                  <Text style={styles.bookName}>{book.sportsbook}</Text>
                  <Text style={styles.bookLine}>Line: {book.line}</Text>
                </View>
              </View>

              <View style={styles.bookOdds}>
                <View style={styles.oddsColumn}>
                  <Text style={styles.oddsLabel}>OVER</Text>
                  <Text style={styles.oddsValue}>
                    {formatAmericanOdds(book.overOdds)}
                  </Text>
                  {opportunity.ev && (
                    <EVRating
                      evPercentage={opportunity.ev.bestOver.ev}
                      size="small"
                      showStars={false}
                    />
                  )}
                </View>
                <View style={styles.oddsColumn}>
                  <Text style={styles.oddsLabel}>UNDER</Text>
                  <Text style={styles.oddsValue}>
                    {formatAmericanOdds(book.underOdds)}
                  </Text>
                  {opportunity.ev && (
                    <EVRating
                      evPercentage={opportunity.ev.bestUnder.ev}
                      size="small"
                      showStars={false}
                    />
                  )}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#6E6E73" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Bet Calculator (EV opportunities only) */}
        {opportunity.ev && stakes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bet Calculator (Kelly Criterion)</Text>
            <View style={styles.calculatorCard}>
              {/* Inputs */}
              <View style={styles.calculatorRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bankroll ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={bankroll}
                    onChangeText={setBankroll}
                    keyboardType="numeric"
                    placeholderTextColor="#6E6E73"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Kelly % (0.25 = 1/4)</Text>
                  <TextInput
                    style={styles.input}
                    value={kellyFraction}
                    onChangeText={setKellyFraction}
                    keyboardType="numeric"
                    placeholderTextColor="#6E6E73"
                  />
                </View>
              </View>

              {/* Results */}
              <View style={styles.resultsSection}>
                <Text style={styles.resultsTitle}>Recommended Stakes:</Text>
                <View style={styles.resultRow}>
                  <View style={styles.resultColumn}>
                    <Text style={styles.resultLabel}>Over Bet</Text>
                    <Text style={styles.resultValue}>${stakes.overStake.toFixed(2)}</Text>
                    <Text style={styles.resultBook}>
                      {opportunity.ev.bestOver.sportsbook}
                    </Text>
                  </View>
                  <View style={styles.resultColumn}>
                    <Text style={styles.resultLabel}>Under Bet</Text>
                    <Text style={styles.resultValue}>${stakes.underStake.toFixed(2)}</Text>
                    <Text style={styles.resultBook}>
                      {opportunity.ev.bestUnder.sportsbook}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.warningBox}>
                <Ionicons name="information-circle" size={16} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Kelly Criterion is aggressive. Consider using 1/4 or 1/8 Kelly for better
                  risk management.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Arbitrage Calculator */}
        {opportunity.arbitrage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Arbitrage Calculator</Text>
            <View style={styles.arbitrageCard}>
              <View style={styles.arbRow}>
                <Text style={styles.arbLabel}>Guaranteed Profit:</Text>
                <Text style={styles.arbValue}>
                  {opportunity.arbitrage.guaranteedProfit.toFixed(2)}%
                </Text>
              </View>
              <View style={styles.arbRow}>
                <Text style={styles.arbLabel}>Total Stake:</Text>
                <Text style={styles.arbValue}>
                  ${opportunity.arbitrage.totalStake.toFixed(2)}
                </Text>
              </View>
              <View style={styles.arbRow}>
                <Text style={styles.arbLabel}>Profit Amount:</Text>
                <Text style={[styles.arbValue, styles.profitHighlight]}>
                  ${opportunity.arbitrage.profitAmount.toFixed(2)}
                </Text>
              </View>

              <View style={styles.arbStakes}>
                <View style={styles.stakeColumn}>
                  <Text style={styles.stakeLabel}>Bet Over</Text>
                  <Text style={styles.stakeValue}>
                    ${opportunity.arbitrage.overStake.toFixed(2)}
                  </Text>
                  <Text style={styles.stakeBook}>
                    {opportunity.arbitrage.overBook.sportsbook}
                  </Text>
                  <Text style={styles.stakeOdds}>
                    {formatAmericanOdds(opportunity.arbitrage.overBook.odds)}
                  </Text>
                </View>
                <View style={styles.stakeColumn}>
                  <Text style={styles.stakeLabel}>Bet Under</Text>
                  <Text style={styles.stakeValue}>
                    ${opportunity.arbitrage.underStake.toFixed(2)}
                  </Text>
                  <Text style={styles.stakeBook}>
                    {opportunity.arbitrage.underBook.sportsbook}
                  </Text>
                  <Text style={styles.stakeOdds}>
                    {formatAmericanOdds(opportunity.arbitrage.underBook.odds)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#1C1C1E',
  },
  handleIndicator: {
    backgroundColor: '#6E6E73',
    width: 40,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  propType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E5E7',
    marginBottom: 2,
  },
  matchup: {
    fontSize: 14,
    fontWeight: '500',
    color: '#AEAEB2',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Summary
  summaryCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  summarySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E5E7',
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E5E5E7',
    marginBottom: 12,
  },

  // Book Row
  bookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  bookLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  bookLogoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookLogoText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookNameSection: {
    flex: 1,
  },
  bookName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E5E7',
    marginBottom: 2,
  },
  bookLine: {
    fontSize: 12,
    fontWeight: '500',
    color: '#AEAEB2',
  },
  bookOdds: {
    flexDirection: 'row',
    gap: 16,
    marginRight: 8,
  },
  oddsColumn: {
    alignItems: 'center',
  },
  oddsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#AEAEB2',
    marginBottom: 4,
  },
  oddsValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },

  // Calculator
  calculatorCard: {
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  calculatorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AEAEB2',
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultsSection: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E5E7',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 16,
  },
  resultColumn: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#AEAEB2',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  resultBook: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E5E7',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#F59E0B',
  },

  // Arbitrage
  arbitrageCard: {
    backgroundColor: 'rgba(28, 28, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  arbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  arbLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#AEAEB2',
  },
  arbValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profitHighlight: {
    color: '#10B981',
  },
  arbStakes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  stakeColumn: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  stakeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#AEAEB2',
    marginBottom: 6,
  },
  stakeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 6,
  },
  stakeBook: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E5E5E7',
    marginBottom: 4,
  },
  stakeOdds: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
