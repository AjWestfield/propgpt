# PropGPT Design Examples

## Common Customization Examples

### 1. Creating a Glass Button

```tsx
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
}

function GlassButton({ title, onPress }: GlassButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.buttonContainer}
      activeOpacity={0.8}
    >
      <BlurView intensity={60} tint="light" style={styles.buttonBlur}>
        <Text style={styles.buttonText}>{title}</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonBlur: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});
```

### 2. Glass Input Field

```tsx
import { TextInput, View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

function GlassInput({ placeholder, value, onChangeText }: GlassInputProps) {
  return (
    <View style={styles.inputContainer}>
      <BlurView intensity={50} tint="light" style={styles.inputBlur}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#86868B"
          value={value}
          onChangeText={onChangeText}
        />
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 17,
    color: '#000000',
    letterSpacing: -0.2,
  },
});
```

### 3. Glass Modal Overlay

```tsx
import { Modal, View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function GlassModal({ visible, onClose, title, children }: GlassModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={40} tint="dark" style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <View style={styles.modalContainer}>
          <BlurView intensity={80} tint="light" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{title}</Text>
              {children}

              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 16,
  },
  modalBlur: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  modalContent: {
    padding: 32,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
  },
});
```

### 4. Glass Navigation Bar

```tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface GlassNavBarProps {
  title: string;
  onBackPress?: () => void;
}

function GlassNavBar({ title, onBackPress }: GlassNavBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.navContainer, { paddingTop: insets.top }]}>
      <BlurView intensity={80} tint="extraLight" style={styles.navBlur}>
        <View style={styles.navContent}>
          {onBackPress && (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.navTitle}>{title}</Text>

          <View style={styles.navSpacer} />
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  navBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 28,
    color: '#000000',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
    flex: 1,
    textAlign: 'center',
  },
  navSpacer: {
    width: 44,
  },
});
```

### 5. Glass List Item

```tsx
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassListItemProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress: () => void;
}

function GlassListItem({ title, subtitle, icon, onPress }: GlassListItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.itemContainer}
      activeOpacity={0.7}
    >
      <BlurView intensity={50} tint="light" style={styles.itemBlur}>
        <View style={styles.itemContent}>
          {icon && (
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
          )}

          <View style={styles.textContainer}>
            <Text style={styles.itemTitle}>{title}</Text>
            {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
          </View>

          <Text style={styles.chevron}>›</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  itemBlur: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  itemSubtitle: {
    fontSize: 15,
    color: '#6E6E73',
    letterSpacing: -0.1,
  },
  chevron: {
    fontSize: 24,
    color: '#86868B',
    marginLeft: 12,
  },
});
```

### 6. Glass Tab Bar

```tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

interface GlassTabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
}

function GlassTabBar({ tabs, activeTab, onTabPress }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={80} tint="extraLight" style={styles.tabBarBlur}>
        <View style={styles.tabBarContent}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabPress(tab.id)}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabIcon,
                activeTab === tab.id && styles.tabIconActive
              ]}>
                {tab.icon}
              </Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  tabBarContent: {
    flexDirection: 'row',
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  tabLabelActive: {
    color: '#000000',
    fontWeight: '600',
  },
});
```

## Animation Examples

### 7. Press Animation

```tsx
import { useRef } from 'react';
import { Animated, TouchableWithoutFeedback } from 'react-native';

function AnimatedGlassButton({ children, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
```

### 8. Sliding Panel Animation

```tsx
import { useRef, useEffect } from 'react';
import { Animated, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

function SlidingGlassPanel({ visible, children }) {
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : height,
      useNativeDriver: true,
      friction: 10,
      tension: 60,
    }).start();
  }, [visible]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      {children}
    </Animated.View>
  );
}
```

## Usage in Your App

Simply copy the component you need and adjust styling to match your specific requirements. All components follow the same design principles:

1. BlurView for glass effect
2. White with low opacity backgrounds
3. Black text for high contrast
4. Subtle shadows (iOS) or elevation (Android)
5. Rounded corners (16-28pt)
6. Proper spacing and typography
