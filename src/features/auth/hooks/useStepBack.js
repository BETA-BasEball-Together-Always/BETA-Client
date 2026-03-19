import { useNavigation } from "@react-navigation/native";

export const useStepBack = (prevStep) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace(prevStep);
    }
  };

  return handleBack;
};
