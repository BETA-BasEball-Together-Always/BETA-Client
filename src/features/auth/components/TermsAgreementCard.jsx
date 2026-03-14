// src/features/auth/components/TermsAgreementCard.jsx
import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import TermsAllOffIcon from "../assets/NativeSignup/svg/TermsAllOff.svg";
import TermsItemOffIcon from "../assets/NativeSignup/svg/TermsItemOff.svg";
import TermsCheckedIcon from "../assets/NativeSignup/svg/TermsChecked.svg";

const Checkbox = ({ checked, variant }) => {
  if (checked) {
    return (
      <View style={styles.termIconWrapper}>
        <TermsCheckedIcon width={20} height={20} />
      </View>
    );
  }

  return (
    <View style={styles.termIconWrapper}>
      {variant === "all" ? (
        <TermsAllOffIcon width={20} height={20} />
      ) : (
        <TermsItemOffIcon width={20} height={20} />
      )}
    </View>
  );
};

const TermItem = ({
  checked,
  label,
  onToggle,
  onPressChevron,
  showChevron,
}) => (
  <View style={styles.termRow}>
    {/* ✅ 왼쪽(체크+라벨) = 토글 */}
    <TouchableOpacity
      style={styles.termLeft}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      <Checkbox checked={checked} variant="item" />
      <Text style={styles.termText}>{label}</Text>
    </TouchableOpacity>

    {/* ✅ 오른쪽(chevron) = 상세 보기 */}
    {showChevron && (
      <TouchableOpacity
        onPress={onPressChevron}
        activeOpacity={0.8}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.chevron}>{">"}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const TermsAgreementCard = ({ value, onChange, onPressDetail }) => {
  const toggleAll = useCallback(() => {
    const nextValue = !value.all;
    onChange({
      all: nextValue,
      over14: nextValue,
      tos: nextValue,
      privacyRequired: nextValue,
      privacyMarketing: nextValue,
    });
  }, [value, onChange]);

  const toggleOne = useCallback(
    (key) => {
      const next = { ...value, [key]: !value[key] };
      const { over14, tos, privacyRequired, privacyMarketing } = next;
      next.all = over14 && tos && privacyRequired && privacyMarketing;
      onChange(next);
    },
    [value, onChange],
  );

  const canShowDetail = !!onPressDetail;

  return (
    <View style={styles.termsCard}>
      {/* 전체 동의 */}
      <TouchableOpacity
        style={[styles.termRow, styles.termRowHeader]}
        onPress={toggleAll}
        activeOpacity={0.8}
      >
        <View style={styles.termLeft}>
          <Checkbox checked={value.all} variant="all" />
          <Text style={[styles.termText, styles.termAllText]}>
            이용약관 전체 동의
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.termDivider} />

      {/* (필수) 만 14세 이상 확인: ✅ chevron 없음 */}
      <TermItem
        checked={value.over14}
        label="(필수) 만 14세 이상 확인"
        onToggle={() => toggleOne("over14")}
        showChevron={false}
      />

      {/* 이용약관 3종: ✅ chevron 있음 + chevron은 상세 */}
      <TermItem
        checked={value.tos}
        label="(필수) 이용약관 동의"
        onToggle={() => toggleOne("tos")}
        showChevron={canShowDetail}
        onPressChevron={() => onPressDetail?.("tos")}
      />
      <TermItem
        checked={value.privacyRequired}
        label="(필수) 개인정보 수집 및 이용 동의"
        onToggle={() => toggleOne("privacyRequired")}
        showChevron={canShowDetail}
        onPressChevron={() => onPressDetail?.("privacyRequired")}
      />
      <TermItem
        checked={value.privacyMarketing}
        label="(선택) 개인정보 마케팅 활용 동의"
        onToggle={() => toggleOne("privacyMarketing")}
        showChevron={canShowDetail}
        onPressChevron={() => onPressDetail?.("privacyMarketing")}
      />
    </View>
  );
};

export default TermsAgreementCard;

const styles = StyleSheet.create({
  termsCard: {
    marginTop: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  termRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  termRowHeader: { paddingBottom: 10 },
  termIconWrapper: {
    width: 18,
    height: 18,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  termLeft: { flexDirection: "row", alignItems: "center" },
  termText: { color: "#FFFFFF", fontSize: 12 },
  termAllText: { fontSize: 13, fontWeight: "600" },
  termDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 6,
  },
  chevron: { color: "#FFFFFF", fontSize: 14, opacity: 0.7 },
});
