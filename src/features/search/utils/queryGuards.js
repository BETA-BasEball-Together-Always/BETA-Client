export const isPureChoseongQuery = (value) => {
  if (!value) {
    return false;
  }

  const compactValue = value.replace(/\s+/g, "");

  if (!compactValue) {
    return false;
  }

  return /^[ㄱ-ㅎ]+$/.test(compactValue);
};
