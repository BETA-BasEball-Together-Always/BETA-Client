import React from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet } from 'react-native';

const CARD_BG = '#1A1A1A';

const FrameCard = ({ item, source, isSelected, onPress }) => {
  return (
    <View style={[styles.itemWrap, { width: '48%' }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(item)}
        style={[
          styles.frameCard,
          isSelected && { backgroundColor: '#fff' },
        ]}
      >
        <Image source={source} style={styles.frameImage} resizeMode="contain" />
      </TouchableOpacity>
      <Text style={styles.itemLabel}>{item.name}</Text>
    </View>
  );
};

export default FrameCard;

const styles = StyleSheet.create({
  itemWrap: { alignItems: 'center' },
  frameCard: {
    width: '100%',
    height: 209,
    borderRadius: 18,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameImage: { width: 110, height: 156 },
  itemLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
});
