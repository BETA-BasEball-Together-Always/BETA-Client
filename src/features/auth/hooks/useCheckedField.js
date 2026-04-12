// src/features/auth/hooks/useCheckedField.js
import { useMemo, useState, useRef, useEffect } from "react";

export const useCheckedField = ({
  initialValue = "",
  initialTouched = false,
  initialError = "",
  initialIsAvailable = false,
  validate,
  checkAvailability,
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(initialError);
  const [touched, setTouched] = useState(initialTouched);
  const [isAvailable, setIsAvailable] = useState(initialIsAvailable);
  const [isChecking, setIsChecking] = useState(false);
  const mountedRef = useRef(true);
  const valueRef = useRef(value);

  valueRef.current = value;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleChange = (text) => {
    const next = text.trimStart();
    setValue(next);
    setIsAvailable(false);
    setError("");

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
      if (!mountedRef.current) return;
      // 요청 중 닉네임이 바뀌면 오래된 응답으로 성공 처리하지 않음
      if (valueRef.current.trim() !== trimmed) {
        setIsAvailable(false);
        return;
      }
      console.log("after checkAvailability", available);
      if (available) {
        setIsAvailable(true);
      } else {
        setIsAvailable(false);
        setError("이미 사용 중인 값이에요.");
      }
    } catch (e) {
      if (!mountedRef.current) return;
      setIsAvailable(false);
      setError("중복 확인에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      if (mountedRef.current) {
        setIsChecking(false);
      }
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
    /** 서버/draft 복원 시 값 동기화용 */
    setValue,
    setError,
    setTouched,
    setIsAvailable,
    handleChange,
    handleBlur,
    handleCheck,
  };
};
