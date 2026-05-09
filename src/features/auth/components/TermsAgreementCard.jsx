// src/features/auth/components/TermsAgreementCard.jsx
import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import TermsAllOffIcon from "../assets/NativeSignup/svg/TermsAllOff.svg";
import TermsItemOffIcon from "../assets/NativeSignup/svg/TermsItemOff.svg";
import TermsCheckedIcon from "../assets/NativeSignup/svg/TermsChecked.svg";
import MoreArrowIcon from "../assets/common/svg/more_arrow.svg";
import { AppText } from "../../../shared/theme/components/AppText";

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
}) => {
  return (
    <View style={styles.termRow}>
      {/* ✅ 왼쪽(체크+라벨) = 토글 */}
      <TouchableOpacity
        style={styles.termLeft}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <Checkbox checked={checked} variant="item" />
        <AppText variant="caption" style={styles.termText}>
          {label}
        </AppText>
      </TouchableOpacity>

      {/* ✅ 오른쪽(chevron) = 상세 보기 */}
      {showChevron && (
        <TouchableOpacity
          onPress={onPressChevron}
          activeOpacity={0.8}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.chevronButton}
        >
          <MoreArrowIcon width={18} height={18} />
        </TouchableOpacity>
      )}
    </View>
  );
};

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
          <AppText
            variant="semi16"
            style={[styles.termText, styles.termAllText]}
          >
            이용약관 전체 동의
          </AppText>
        </View>
      </TouchableOpacity>

      <View style={styles.termDivider} />

      <TermItem
        checked={value.over14}
        label="(필수) 만 14세 이상 확인"
        onToggle={() => toggleOne("over14")}
        showChevron={false}
      />

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
        showChevron={false}
      />
    </View>
  );
};

export default TermsAgreementCard;

const styles = StyleSheet.create({
  termsCard: {
    marginTop: 10,
    paddingVertical: 13,
    paddingHorizontal: 30,
    borderRadius: 13,
    backgroundColor: "rgba(141, 141, 141, 0.07)",
  },
  termRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  termRowHeader: {
    paddingBottom: 10,
  },
  termIconWrapper: {
    width: 18,
    height: 18,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  termLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  termText: {
    color: "#F9F9F9",
    marginLeft: 6,
    lineHeight: 19,
  },
  termAllText: {
    fontWeight: "600",
    lineHeight: 19,
  },
  termDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 6,
  },
  chevron: { color: "#FFFFFF", fontSize: 14, opacity: 0.7 },
  chevronButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 28,
    height: 28,
  },
});
