import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BackIcon from "@shared/assets/svg/chevrons/back.svg";
import SearchIcon from "@features/community/assets/svg/TopBar/searchIcon.svg";

const SearchInputHeader = ({
  value,
  autoFocus = true,
  onBackPress,
  onChangeText,
  onClearPress,
  onSubmitEditing,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onBackPress}
        style={styles.backButton}
      >
        <BackIcon width={12} height={21} />
      </TouchableOpacity>

      <View style={styles.searchBar}>
        <SearchIcon width={18} height={18} />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={autoFocus}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder="검색어 입력하기"
          placeholderTextColor="#7A7A80"
          returnKeyType="search"
          selectionColor="#FFFFFF"
          style={styles.input}
          value={value}
        />

        {value?.length > 0 ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onClearPress}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default SearchInputHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: "#09090A",
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#2C2C2F",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 14,
    paddingRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "NotoSansKR_Medium",
    paddingVertical: 0,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#D7D7DA",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#2C2C2F",
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "700",
    marginTop: -1,
  },
});
