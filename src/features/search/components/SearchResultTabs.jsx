import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DropDownIcon from "@features/community/assets/svg/CommunityPost/dropDown.svg";

const RESULT_TABS = [
  { key: "posts", label: "게시글" },
  { key: "users", label: "계정" },
  { key: "hashtags", label: "태그" },
];

const POST_CHANNELS = [
  { key: "ALL", label: "전체" },
  { key: "TEAM", label: "내 팀" },
];

const POST_SORTS = [
  { key: "RECOMMENDED", label: "추천순" },
  { key: "POPULAR", label: "인기순" },
  { key: "LATEST", label: "최신순" },
];

const SearchResultTabs = ({
  activeTab,
  activePostChannel,
  activePostSort,
  onTabChange,
  onPostChannelChange,
  onPostSortChange,
}) => {
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const activeSortLabel =
    POST_SORTS.find((sort) => sort.key === activePostSort)?.label ?? "추천순";

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {RESULT_TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              activeOpacity={0.86}
              key={tab.key}
              onPress={() => onTabChange(tab.key)}
              style={styles.tabButton}
            >
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
              <View
                style={[
                  styles.tabIndicator,
                  isActive && styles.activeTabIndicator,
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === "posts" ? (
        <View style={styles.postsFilterSection}>
          <View style={styles.filterRow}>
            <View style={styles.channelRow}>
              {POST_CHANNELS.map((channel) => {
                const isActive = activePostChannel === channel.key;

                return (
                  <TouchableOpacity
                    activeOpacity={0.86}
                    key={channel.key}
                    onPress={() => onPostChannelChange(channel.key)}
                    style={[
                      styles.channelButton,
                      isActive && styles.activeChannelButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.channelLabel,
                        isActive && styles.activeChannelLabel,
                      ]}
                    >
                      {channel.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sortBoxWrap}>
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={() => setIsSortMenuOpen((prev) => !prev)}
                style={[
                  styles.sortSelectButton,
                  isSortMenuOpen && styles.sortSelectButtonOpen,
                ]}
              >
                <Text style={styles.sortSelectLabel}>{activeSortLabel}</Text>
                <View
                  style={[
                    styles.sortIconWrap,
                    isSortMenuOpen && styles.sortIconWrapOpen,
                  ]}
                >
                  <DropDownIcon width={12} height={8} />
                </View>
              </TouchableOpacity>

              {isSortMenuOpen ? (
                <View style={styles.sortMenu}>
                  {POST_SORTS.map((sort, index) => {
                    const isActive = activePostSort === sort.key;

                    return (
                      <TouchableOpacity
                        activeOpacity={0.86}
                        key={sort.key}
                        onPress={() => {
                          onPostSortChange(sort.key);
                          setIsSortMenuOpen(false);
                        }}
                        style={[
                          styles.sortMenuItem,
                          index < POST_SORTS.length - 1 && styles.sortMenuDivider,
                        ]}
                      >
                        <Text
                          style={[
                            styles.sortMenuLabel,
                            isActive && styles.activeSortMenuLabel,
                          ]}
                        >
                          {sort.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default SearchResultTabs;

const styles = StyleSheet.create({
  container: {
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: "#09090A",
    gap: 14,
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#1F2230",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 14,
    paddingTop: 6,
  },
  tabLabel: {
    color: "#8F95A7",
    fontSize: 15,
    fontFamily: "NotoSansKR_Medium",
  },
  activeTabLabel: {
    color: "#F6F7FB",
  },
  tabIndicator: {
    width: "100%",
    height: 3,
    backgroundColor: "transparent",
    borderRadius: 999,
  },
  activeTabIndicator: {
    backgroundColor: "#F9F9F9",
  },
  postsFilterSection: {
    paddingHorizontal: 20,
    zIndex: 20,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  channelButton: {
    minWidth: 72,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  activeChannelButton: {
    backgroundColor: "#F9F9F9",
  },
  channelLabel: {
    color: "rgba(228, 228, 228, 0.5)",
    fontSize: 14,
    fontFamily: "NotoSansKR_Medium",
  },
  activeChannelLabel: {
    color: "#1E1E1E",
  },
  channelRow: {
    flexDirection: "row",
    borderRadius: 999,
    backgroundColor: "#252823",
    height: 42,
    overflow: "hidden",
  },
  sortBoxWrap: {
    position: "relative",
    width: 102,
    zIndex: 30,
  },
  sortSelectButton: {
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: "#252823",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sortSelectButtonOpen: {},
  sortSelectLabel: {
    color: "#F9F9F9",
    fontSize: 12,
    fontFamily: "NotoSansKR_Medium",
  },
  sortIconWrap: {
    opacity: 0.7,
  },
  sortIconWrapOpen: {
    transform: [{ rotate: "180deg" }],
  },
  sortMenu: {
    position: "absolute",
    top: 42,
    left: 0,
    right: 0,
    borderRadius: 12,
    backgroundColor: "#252823",
    overflow: "hidden",
  },
  sortMenuItem: {
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  sortMenuDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(249, 249, 249, 0.12)",
  },
  sortMenuLabel: {
    color: "rgba(228, 228, 228, 0.5)",
    fontSize: 13,
    fontFamily: "NotoSansKR_Medium",
  },
  activeSortMenuLabel: {
    color: "#F9F9F9",
  },
});
