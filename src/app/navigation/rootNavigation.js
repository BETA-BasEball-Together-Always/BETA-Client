import {
  CommonActions,
  createNavigationContainerRef,
} from "@react-navigation/native";

export const rootNavigationRef = createNavigationContainerRef();

export function navigateToPostDetail(postId, extraParams = {}) {
  if (!rootNavigationRef.isReady()) {
    return false;
  }

  rootNavigationRef.dispatch(
    CommonActions.navigate({
      name: "Community",
      params: {
        screen: "PostDetail",
        params: {
          postId,
          from: "push",
          ...extraParams,
        },
      },
    }),
  );

  return true;
}

export function getCurrentLeafRoute() {
  return rootNavigationRef.getCurrentRoute?.() ?? null;
}
