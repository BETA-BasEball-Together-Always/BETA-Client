import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

import { AppText } from "../theme/components/AppText";

/**
 * 작성/편집 중 이탈 확인용 공통 모달 (게시글 작성, 한줄소개 수정, 야구네컷 등)
 */
export default function LeaveConfirmModal({
  visible,
  onClose,
  title,
  description,
  onLeave,
  confirmLabel = "나가기",
  cancelLabel = "취소",
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <AppText variant="displayTitle" style={styles.title}>
            {title}
          </AppText>
          <AppText variant="middle" style={styles.desc}>
            {description}
          </AppText>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => {
              onClose();
              onLeave?.();
            }}
          >
            <AppText variant="medium" style={styles.confirmText}>
              {confirmLabel}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <AppText variant="medium" style={styles.cancelText}>
              {cancelLabel}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#202325",
    paddingTop: 28,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    color: "#E5E5E5",
    marginBottom: 8,
    textAlign: "center",
    lineHeight: 32.7,
  },
  desc: {
    color: "rgba(228, 228, 228, 0.50)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 17.7,
  },
  confirmBtn: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 4,
  },
  confirmText: {
    color: "#1E1E1E",
    lineHeight: 21.8,
  },
  cancelBtn: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelText: {
    color: "#9B9B9B",
    lineHeight: 21.8,
  },
});
