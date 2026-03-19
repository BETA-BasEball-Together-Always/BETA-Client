import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { AppText } from "../../../../../shared/theme/components/AppText";

const BORDER_DISABLED = "rgba(106, 106, 106, 0.34)";

export default function CommentInput({ onSubmit, replyTarget, cancelReply }) {
  const [text, setText] = useState("");

  //피그마 기준 입력창 포커스 시 ui 변경 위함!! 구분선 + 등록 버튼 표시
  const [isFocused, setIsFocused] = useState(false);

  const isSubmitEnabled = text.trim().length > 0;

  const handleSubmit = () => {
    if (!isSubmitEnabled) return;
    onSubmit(text);
    setText("");
  };

  return (
    <View style={[styles.wrapper, isFocused && styles.wrapperWithBorder]}>
      {replyTarget && (
        <TouchableOpacity onPress={cancelReply}>
          <View>
            <AppText style={styles.replyInfo}>
              답글 작성 중... (취소하려면 터치)
            </AppText>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="트윈스 팬으로서 한 마디 남겨보세요 :)"
          placeholderTextColor="#666"
          style={[styles.input, isFocused && styles.inputWithButton]}
          multiline
        />

        {isFocused && (
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
                style={
                  isSubmitEnabled
                    ? styles.submitTextEnabled
                    : styles.submitTextDisabled
                }
              >
                등록
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
  },
  wrapperWithBorder: {
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  replyInfo: {
    color: "#888",
    marginBottom: 6,
    fontSize: 12,
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
  submitTextDisabled: {
    color: "#6A6A6A",
  },
  submitTextEnabled: {
    color: "#666",
  },
});
