import React from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import SearchUserRow from "./SearchUserRow";

const SearchUserListItem = ({ user }) => {
  const navigation = useNavigation();

  const handlePress = (selectedUser) => {
    if (!selectedUser?.userId) {
      return;
    }

    navigation.navigate("Main", {
      screen: "Profile",
      params: {
        screen: "ProfileMain",
        params: { userId: selectedUser.userId },
      },
    });
  };

  return (
    <View style={styles.container}>
      <SearchUserRow onPress={handlePress} user={user} />
    </View>
  );
};

export default SearchUserListItem;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
});
