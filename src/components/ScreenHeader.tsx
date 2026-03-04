import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

interface ScreenHeaderProps {
  title?: string
  /** Overrides title — use for custom center content (e.g. dropdown) */
  centerElement?: React.ReactNode
  /** Overrides the home button — pass null to hide right side entirely */
  rightElement?: React.ReactNode
  showBack?: boolean  // default true
  showHome?: boolean  // default true; ignored when rightElement is provided
  onBack?: () => void // default router.back()
}

export default function ScreenHeader({
  title,
  centerElement,
  rightElement,
  showBack = true,
  showHome = true,
  onBack,
}: ScreenHeaderProps) {
  const router = useRouter()
  const handleBack = onBack ?? (() => router.back())

  const rightContent =
    rightElement !== undefined
      ? rightElement
      : showHome
        ? (
          <TouchableOpacity
            onPress={() => router.navigate('/')}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="home" size={20} color="#6b7280" />
          </TouchableOpacity>
        )
        : null

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="chevron-left" size={22} color="#2D2D2D" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        {centerElement ?? (
          title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null
        )}
      </View>

      <View style={styles.side}>
        {rightContent}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#faf5f0',
    height: 50,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  side: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
