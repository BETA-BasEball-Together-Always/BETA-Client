## 📝 Introduction

**BETA-Client**는 BETA 서비스의 **사용자용 모바일 앱(React Native)** 클라이언트입니다.

- Expo 기반으로 개발/빌드되며, `expo-dev-client`를 사용해 네이티브 모듈(Firebase, Vision Camera, 소셜 로그인 등)을 포함한 개발 흐름을 지원합니다.
- 화면 전환은 React Navigation으로 구성되어 있고, 서버 상태는 TanStack Query, 앱 상태는 Zustand를 중심으로 관리합니다.
- API Base URL 및 소셜 로그인 설정은 **환경변수 → `app.config.js`의 `expo.extra`**로 주입됩니다.


## 🛠️ Tech Stack

| Category | Stack |
| --- | --- |
| **Core** | <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React Native" /> <img src="https://img.shields.io/badge/Expo-SDK_54-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo" /> <img src="https://img.shields.io/badge/Expo_Updates-OTA-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo Updates" /> |
| **Navigation / State** | <img src="https://img.shields.io/badge/React_Navigation-v7-6B52AE?style=flat-square" alt="React Navigation" /> <img src="https://img.shields.io/badge/TanStack_Query-v5-FF4154?style=flat-square&logo=reactquery&logoColor=white" alt="TanStack Query" /> <img src="https://img.shields.io/badge/Zustand-000000?style=flat-square" alt="Zustand" /> |
| **Styling** | <img src="https://img.shields.io/badge/NativeWind-Tailwind-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white" alt="NativeWind" /> |
| **Networking** | <img src="https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white" alt="Axios" /> <img src="https://img.shields.io/badge/NetInfo-Connectivity-6C757D?style=flat-square" alt="NetInfo" /> |
| **Push / Native** | <img src="https://img.shields.io/badge/Firebase-Cloud_Messaging-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="FCM" /> <img src="https://img.shields.io/badge/Vision_Camera-4.7-111827?style=flat-square" alt="Vision Camera" /> |
| **Social Login** | <img src="https://img.shields.io/badge/Kakao_Login-FFCD00?style=flat-square" alt="Kakao" /> <img src="https://img.shields.io/badge/Naver_Login-03C75A?style=flat-square" alt="Naver" /> <img src="https://img.shields.io/badge/Apple_Sign--In-000000?style=flat-square&logo=apple&logoColor=white" alt="Apple" /> |


## 🧩 Project Structure

주요 디렉터리는 아래 구조로 관리합니다.

| Path | Description |
| --- | --- |
| `src/app/` | 앱 엔트리, Provider 구성, 네비게이션 루트 |
| `src/features/` | 도메인/화면 단위 기능 모듈 (auth, home, community, search, profile, photoBooth 등) |
| `src/shared/` | 공통 컴포넌트/유틸/스토어/서비스(API, 세션, 푸시 등) |
| `assets/` | 앱 아이콘/스플래시 등 정적 리소스 |


## 🏛️ Architecture

### App Bootstrap Flow

앱 시작 시 세션을 준비한 뒤, 스플래시 종료 시점에 `Auth` 또는 `Main`으로 분기합니다.

```mermaid
flowchart TD
  A[App 시작] --> B[bootstrapSession]
  B --> C[SplashScreen]
  C -->|exit complete| D{destination}
  D -->|main| E[MainTabNavigator]
  D -->|auth| F[AuthStack]
```


### API Base URL Resolution

API baseURL은 TestFlight/런타임 환경 차이를 고려해 아래 우선순위로 결정됩니다.

1) `Constants.expoConfig.extra.backendUrl` (권장)  
2) `process.env.EXPO_PUBLIC_BACKEND_URL`  
3) fallback: `https://beta-app.kr`

관련 구현은 `src/shared/libs/api.js`에서 관리합니다.


## 🔐 Environment Variables

로컬 개발은 `.env.local`을 사용합니다. (레포에는 커밋하지 않는 것을 권장)

`.env.local`을 생성한 뒤 값을 채웁니다.

| Key | Description |
| --- | --- |
| `EXPO_PUBLIC_BACKEND_URL` | 백엔드 API Base URL |
| `NAVER_CLIENT_ID` | 네이버 로그인 Client ID |
| `NAVER_CLIENT_SECRET` | 네이버 로그인 Client Secret |
| `NAVER_APP_NAME` | 네이버 앱 이름 |
| `NAVER_IOS_URL_SCHEME` | iOS URL Scheme (네이버 로그인) |

`app.config.js`가 `.env`와 `.env.local`을 병합 로드하고, `expo.extra`로 주입합니다.


## ▶️ Getting Started

### Install

```bash
npm install
```

### Run (Expo)

```bash
npm run start
```

### Run (Dev Client)

네이티브 모듈이 포함되어 있으므로, 디바이스/시뮬레이터에서 dev-client로 실행합니다.

```bash
npm run ios
npm run android
```


## 🚀 Build & Release (EAS)

본 프로젝트는 `eas.json` 기준으로 `development / preview / production` 프로파일을 운영합니다.

| Profile | Purpose | Channel |
| --- | --- | --- |
| `development` | 내부 개발 빌드 (dev-client) | `development` |
| `preview` | QA/검증용 내부 배포 | `preview` |
| `production` | 프로덕션 배포 | `production` |

예시:

```bash
eas build --profile development --platform ios
eas build --profile preview --platform android
eas build --profile production --platform ios
```


## 📌 Notes

- iOS Push/FCM 관련해서 `aps-environment` 값은 `EAS_BUILD_PROFILE`에 따라 자동 설정되며, 네이티브 설정 변경이 필요한 경우 prebuild 후 재빌드가 필요합니다. (`app.config.js` 참고)

