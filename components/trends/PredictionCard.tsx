import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Prediction } from '../../types/trends';

interface PredictionCardProps {
  prediction: Prediction;
  onPress?: () => void;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, onPress }) => {
  const { consensus, homeTeam, awayTeam, homeTeamLogo, awayTeamLogo } = prediction;
  const favoredIsHome = consensus.favoredTeam === 'home';
  const winProb = consensus.winProbability;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <BlurView intensity={60} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.2)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.header}>
          <Text style={styles.confidence}>Confidence: {consensus.confidence}%</Text>
          <Text style={styles.sport}>{prediction.sport}</Text>
        </View>

        <View style={styles.matchup}>
          <View style={[styles.team, favoredIsHome && styles.favored]}>
            {awayTeamLogo && <Image source={{ uri: awayTeamLogo }} style={styles.logo} />}
            <Text style={styles.teamName}>{awayTeam}</Text>
            {!favoredIsHome && <Text style={styles.winProb}>{winProb}%</Text>}
          </View>

          <Text style={styles.vs}>@</Text>

          <View style={[styles.team, !favoredIsHome && styles.favored]}>
            {homeTeamLogo && <Image source={{ uri: homeTeamLogo }} style={styles.logo} />}
            <Text style={styles.teamName}>{homeTeam}</Text>
            {favoredIsHome && <Text style={styles.winProb}>{winProb}%</Text>}
          </View>
        </View>

        {prediction.currentOdds && (
          <View style={styles.odds}>
            <Text style={styles.oddsText}>Spread: {prediction.currentOdds.spread > 0 ? '+' : ''}{prediction.currentOdds.spread}</Text>
            <Text style={styles.oddsText}>O/U: {prediction.currentOdds.total}</Text>
          </View>
        )}

        {prediction.keyFactors && prediction.keyFactors.length > 0 && (
          <View style={styles.factors}>
            <Text style={styles.factorLabel}>Key Factors:</Text>
            {prediction.keyFactors.slice(0, 2).map((factor, idx) => (
              <Text key={idx} style={styles.factorText}>• {factor}</Text>
            ))}
          </View>
        )}
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 12 },
  blurContainer: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  confidence: { fontSize: 13, fontWeight: '700', color: '#10B981' },
  sport: { fontSize: 12, color: '#9CA3AF' },
  matchup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  team: { flex: 1, alignItems: 'center', gap: 8 },
  favored: { opacity: 1 },
  logo: { width: 40, height: 40, borderRadius: 20 },
  teamName: { fontSize: 14, fontWeight: '600', color: '#FFF', textAlign: 'center' },
  winProb: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  vs: { fontSize: 14, color: '#6B7280', marginHorizontal: 8 },
  odds: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: 10, borderRadius: 8, marginBottom: 12 },
  oddsText: { fontSize: 13, color: '#9CA3AF' },
  factors: { gap: 6 },
  factorLabel: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', marginBottom: 4 },
  factorText: { fontSize: 12, color: '#9CA3AF' },
});
