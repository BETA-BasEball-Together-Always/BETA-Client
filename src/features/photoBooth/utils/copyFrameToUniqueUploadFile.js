import * as FileSystem from "expo-file-system/legacy";
import { randomUploadKey } from "../../../shared/utils/randomUploadKey";

/** SDK 54에서 EncodingType이 비어 있는 경우가 있어 문자열 사용 */
export function getFileSystemBase64Encoding() {
  const t = FileSystem.EncodingType;
  if (t && t.Base64 != null) return t.Base64;
  return "base64";
}

/**
 * data:image URL → 캐시 파일 (게시글/저장용)
 * — 메인 expo-file-system API는 SDK 54에서 deprecated → legacy 사용
 */
export async function writeDataUrlPngToCache(dataUrl) {
  if (!dataUrl?.startsWith?.("data:image")) return null;
  const parts = dataUrl.split("base64,");
  if (parts.length < 2) return null;
  const base64 = parts[1];
  const dest = `${FileSystem.cacheDirectory}beta-share-${randomUploadKey()}.png`;
  await FileSystem.writeAsStringAsync(dest, base64, {
    encoding: getFileSystemBase64Encoding(),
  });
  return dest;
}

/**
 * 포토부스 프레임을 캐시 내 고유 경로로 복사 (게시글 첨부·경로 충돌 방지)
 * — copyAsync 우선 (바이너리 그대로, 빠름). 실패 시 legacy read/write 폴백.
 */
export async function copyFrameToUniqueUploadFile(sourceUri, uploadKey = null) {
  if (!sourceUri) return null;
  const keyPart = uploadKey != null ? String(uploadKey) : randomUploadKey();
  // 업로드 단위 키(예: photoBooth nonce)가 포함된 고유 파일명.
  // 서버/업로더가 multipart `name` 대신 uri base name을 참조하는 경우를 대비한다.
  const name = `beta-frame-${keyPart}-${randomUploadKey()}.png`;
  const dest = `${FileSystem.cacheDirectory}${name}`;
  const from = sourceUri.startsWith("file://")
    ? sourceUri
    : sourceUri.startsWith("/")
      ? `file://${sourceUri}`
      : sourceUri;

  const enc = getFileSystemBase64Encoding();

  try {
    await FileSystem.copyAsync({ from, to: dest });
    return dest;
  } catch (e) {
    console.warn("copyFrameToUniqueUploadFile copyAsync failed, fallback", e);
  }

  try {
    const b64 = await FileSystem.readAsStringAsync(from, { encoding: enc });
    await FileSystem.writeAsStringAsync(dest, b64, { encoding: enc });
    return dest;
  } catch (e) {
    console.warn("copyFrameToUniqueUploadFile failed", e);
    return null;
  }
}
