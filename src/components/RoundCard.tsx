import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Round } from '../types'
import { getTotalStitchesInRound } from '../utils/patternUtils'

// ─── Props ────────────────────────────────────────────────────────────────────

interface RoundCardProps {
  round: Round
  /** 已由呼叫方加上 roundStartNumber offset 的顯示圈號 */
  roundNumber: number
  canMoveUp: boolean
  canMoveDown: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onDuplicate: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RoundCard({
  round,
  roundNumber,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
}: RoundCardProps) {
  const { t } = useTranslation()
  const totalStitches = getTotalStitchesInRound(round)

  function handleLongPress() {
    Alert.alert(
      t('roundCard.roundTitle', { number: roundNumber }),
      undefined,
      [
        {
          text: t('roundCard.duplicate'),
          onPress: onDuplicate,
        },
        {
          text: t('roundCard.deleteRound'),
          style: 'destructive',
          onPress: onDelete,
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
      ],
      { cancelable: true }
    )
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onLongPress={handleLongPress}
      activeOpacity={0.85}
      delayLongPress={400}
    >
      {/* Left: round number badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{roundNumber}</Text>
      </View>

      {/* Center: stitch summary */}
      <View style={styles.content}>
        <Text style={styles.stitchCount}>{t('roundCard.stitchCount', { count: totalStitches })}</Text>
        {round.notes ? (
          <Text style={styles.notes} numberOfLines={1}>
            {round.notes}
          </Text>
        ) : null}
      </View>

      {/* Right: up/down arrow buttons */}
      <View style={styles.arrowButtons}>
        <TouchableOpacity
          style={[styles.arrowButton, !canMoveUp && styles.arrowButtonDisabled]}
          onPress={canMoveUp ? onMoveUp : undefined}
          disabled={!canMoveUp}
          activeOpacity={0.6}
        >
          <Text style={[styles.arrowText, !canMoveUp && styles.arrowTextDisabled]}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.arrowButton, !canMoveDown && styles.arrowButtonDisabled]}
          onPress={canMoveDown ? onMoveDown : undefined}
          disabled={!canMoveDown}
          activeOpacity={0.6}
        >
          <Text style={[styles.arrowText, !canMoveDown && styles.arrowTextDisabled]}>↓</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D97398',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  stitchCount: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  notes: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  arrowButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 8,
    gap: 4,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  arrowText: {
    fontSize: 16,
    color: '#C4527F',
    fontWeight: '600',
  },
  arrowTextDisabled: {
    color: '#d1d5db',
  },
})
