import React from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet } from 'react-native';

const CARD_BG = '#1A1A1A';

const TeamCard = ({ item, isSelected, onPress }) => {
  return (
    <View style={styles.itemWrap}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(item)}
        style={[
          styles.teamCard,
          isSelected && { backgroundColor: '#fff'},
        ]}
      >
        <Image source={item.logo} style={styles.teamLogo} resizeMode="contain" />
      </TouchableOpacity>
      <Text style={styles.itemLabel} numberOfLines={1}>{item.name}</Text>
    </View>
  );
};

export default TeamCard;

const styles = StyleSheet.create({
  itemWrap: {
    alignItems: 'center',
    marginRight: 12,
  },
  teamCard: {
    width: 128,
    height: 128,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLogo: { width: 100, height: 100 },
  itemLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#fff',
    maxWidth: 96,
    textAlign: 'center',
  },
});
