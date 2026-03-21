import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText } from "../../../shared/theme/components/AppText";
import { LinearGradient } from "expo-linear-gradient";
import { TEAM_DATA } from "../../../shared/constants/teams";
import TeamLabel from "./communityMain/TeamLabel";
import { getRelativeTimeForPostBody } from "../screens/PostDetail/utils/relativeTime";
import MenuIcon from "../assets/svg/TopBar/menuIcon.svg";

/**
 * 본인 게시글일 때만 전달. 수정/삭제만 제공합니다.
 * @typedef {object} PostMenuConfig
 * @property {() => void} onEdit
 * @property {() => void} onDelete
 */

const CommunityUserProfile = ({
  nickname,
  teamCode,
  createdAt,
  showTeam = false,
  onPress,
  postMenu,
}) => {
  const team = TEAM_DATA[teamCode];
  const ProfileIcon = team?.ProfileIcon;
  const [menuPosition, setMenuPosition] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const ContainerTag = onPress ? Pressable : View;

  const closeMenu = () => setMenuOpen(false);

  const runThenClose = (fn) => {
    closeMenu();
    requestAnimationFrame(() => fn?.());
  };

  return (
    <View style={styles.row}>
      <ContainerTag
        style={[styles.container, postMenu && styles.containerFlex]}
        onPress={onPress}
        disabled={!onPress}
      >
        <LinearGradient
          colors={team?.gradient?.colors || ["#3A3D44", "#3A3D44"]}
          locations={team?.gradient?.locations}
          start={team?.gradient?.start}
          end={team?.gradient?.end}
          style={styles.avatarCircle}
        >
          {ProfileIcon ? (
            <ProfileIcon width={28} height={28} />
          ) : (
            <AppText style={{ color: "#FFF" }}>{nickname?.[0]}</AppText>
          )}
        </LinearGradient>

        <View style={styles.textWrapper}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AppText variant="caption" style={styles.nickname}>
              {nickname}
            </AppText>

            {showTeam && teamCode && <TeamLabel teamCode={teamCode} />}
          </View>

          {createdAt && (
            <AppText style={styles.timeAgo}>
              {getRelativeTimeForPostBody(createdAt)}
            </AppText>
          )}
        </View>
      </ContainerTag>

      {postMenu && (
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={(e) => {
            e.target.measure((x, y, width, height, pageX, pageY) => {
              setMenuPosition({ x: pageX, y: pageY, width, height });
              setMenuOpen(true);
            });
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="게시글 메뉴"
        >
          <MenuIcon width={20} height={20} />
        </TouchableOpacity>
      )}

      {postMenu && (
        <Modal
          transparent
          visible={menuOpen}
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <View style={styles.modalRoot}>
            <Pressable style={styles.modalBackdrop} onPress={closeMenu} />
            <View
              style={[
                styles.postMoreMenu,
                menuPosition && {
                  position: "absolute",
                  top: menuPosition.y + menuPosition.height,
                  right: 16,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.postMoreButton}
                onPress={() => runThenClose(postMenu.onEdit)}
              >
                <AppText variant="semi16" style={styles.postMoreText}>
                  수정
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.postMoreButton}
                onPress={() => runThenClose(postMenu.onDelete)}
              >
                <AppText variant="semi16" style={styles.postMoreText}>
                  삭제
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default CommunityUserProfile;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  containerFlex: {
    flex: 1,
    marginRight: 8,
  },
  menuBtn: {
    padding: 4,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  textWrapper: {
    justifyContent: "center",
    flexShrink: 1,
  },
  nickname: {
    color: "#D4D4D4",
    lineHeight: 19,
    marginRight: 6,
  },
  timeAgo: {
    color: "#A1A1AA",
    fontSize: 11,
    marginTop: 2,
    lineHeight: 12,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  postMoreMenu: {
    position: "absolute",
    backgroundColor: "#27272A",
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 170,
  },
  postMoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: "center",
  },
  postMoreText: {
    color: "#F9F9F9",
    lineHeight: 22,
  },
});
