// src/features/auth/hooks/useCheckedField.js
import {useMemo, useState} from "react";

export const useCheckedField = ({
  initialValue = "",
  validate,
  checkAvailability,
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleChange = (text) => {
    const next = text.trimStart();
    setValue(next);
    setIsAvailable(false);

    if (touched) {
      setError(validate(next));
    } else {
      setError("");
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const trimmed = value.trim();
    setValue(trimmed);
    setError(validate(trimmed));
  };

  const handleCheck = async () => {
    const trimmed = value.trim();
    setTouched(true);
    const validationError = validate(trimmed);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsChecking(true);
      setError("");

      const available = await checkAvailability(trimmed); // boolean 기대
      console.log("after checkAvailability", available);
      if (available) {
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
        setError("이미 사용 중인 값이에요.");
      }
    } catch (e) {
      setIsAvailable(false);
      setError("중복 확인에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsChecking(false);
    }
  };

  const status = useMemo(() => {
    if (isChecking) return "checking";
    if (touched && !error && isAvailable) return "success";
    if (touched && !!error) return "error";
    return "idle";
  }, [isChecking, touched, error, isAvailable]);

  return {
    value,
    error,
    touched,
    isAvailable,
    isChecking,
    status,
    setValue,
    handleChange,
    handleBlur,
    handleCheck,
  };
};
