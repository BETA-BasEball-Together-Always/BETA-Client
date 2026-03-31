import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  InteractionManager,
  Platform,
} from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";
import { useUserStore } from "../../../../../shared/store/userStore";

const BORDER_DISABLED = "rgba(106, 106, 106, 0.34)";

export default function CommentInput({
  onSubmit,
  replyTarget,
  cancelReply,
  editTarget,
  cancelEdit,
  /** 목록·인기 카드에서 댓글 아이콘으로 진입 시 키보드와 함께 포커스 */
  autoFocusOnMount = false,
}) {
  const inputRef = useRef(null);
  const [text, setText] = useState("");

  //피그마 기준 입력창 포커스 시 ui 변경 위함!! 구분선 + 등록 버튼 표시
  const [isFocused, setIsFocused] = useState(false);

  const favoriteTeamName = useUserStore((s) => s.user?.favoriteTeamName);
  const defaultPlaceholder = useMemo(() => {
    const name = favoriteTeamName?.trim();
    return name
      ? `${name} 팬으로서 한 마디 남겨보세요 :)`
      : "팬으로서 한 마디 남겨보세요 :)";
  }, [favoriteTeamName]);

  const isEditing = !!editTarget?.commentId;
  const submitLabel = isEditing ? "수정" : "등록";

  useEffect(() => {
    if (editTarget?.content != null) {
      setText(editTarget.content);
      setIsFocused(true); // 편집 버튼 누르면 바로 제출 버튼이 보이게
      return;
    }
    setText("");
    setIsFocused(false);
  }, [editTarget?.commentId]);

  useEffect(() => {
    if (!autoFocusOnMount || editTarget?.commentId) return;

    let cancelled = false;
    InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      const delay = Platform.OS === "ios" ? 400 : 450;
      setTimeout(() => {
        if (!cancelled) inputRef.current?.focus();
      }, delay);
    });

    return () => {
      cancelled = true;
    };
  }, [autoFocusOnMount, editTarget?.commentId]);

  const isSubmitEnabled = text.trim().length > 0;

  const handleSubmit = () => {
    if (!isSubmitEnabled) return;
    onSubmit(text);
    setText("");
    setIsFocused(false);
  };

  return (
    <View style={[styles.wrapper, isFocused && styles.wrapperWithBorder]}>
      {isEditing ? (
        <TouchableOpacity onPress={cancelEdit}>
          <View>
            <AppText style={styles.replyInfo}>
              댓글 수정 중... (취소하려면 터치)
            </AppText>
          </View>
        </TouchableOpacity>
      ) : replyTarget ? (
        <TouchableOpacity onPress={cancelReply}>
          <View>
            <AppText style={styles.replyInfo}>
              답글 작성 중... (취소하려면 터치)
            </AppText>
          </View>
        </TouchableOpacity>
      ) : null}

      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={
            isEditing ? "수정할 댓글을 입력하세요" : defaultPlaceholder
          }
          placeholderTextColor="#666"
          style={[styles.input, isFocused && styles.inputWithButton]}
          multiline
        />

        {(isFocused || isEditing) && (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isSubmitEnabled}
            style={styles.submitButtonWrapper}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.submitButton,
                isSubmitEnabled
                  ? styles.submitButtonEnabled
                  : styles.submitButtonDisabled,
              ]}
            >
              <AppText
                variant="middle"
                style={[
                  styles.submitLabel,
                  isSubmitEnabled
                    ? styles.submitTextEnabled
                    : styles.submitTextDisabled,
                ]}
              >
                {submitLabel}
              </AppText>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: "#121212",
    // transform: [{ translateY: -6 }],
  },
  wrapperWithBorder: {
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  replyInfo: {
    color: "#888",
    marginBottom: 6,
    fontSize: 12,
    lineHeight: 19,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 10,
    paddingRight: 8,
    paddingVertical: 6,
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#fff",
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontSize: 14,
    lineHeight: 19,
    maxHeight: 80,
  },
  inputWithButton: {
    paddingRight: 8,
  },
  submitButtonWrapper: {
    marginLeft: 4,
  },
  submitButton: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    borderWidth: 1,
    borderColor: BORDER_DISABLED,
    backgroundColor: "transparent",
  },
  submitButtonEnabled: {
    borderWidth: 1,
    borderColor: BORDER_DISABLED,
    backgroundColor: "#F9F9F9",
  },
  submitLabel: {
    lineHeight: 19,
  },
  submitTextDisabled: {
    color: "#6A6A6A",
  },
  submitTextEnabled: {
    color: "#666",
  },
});
