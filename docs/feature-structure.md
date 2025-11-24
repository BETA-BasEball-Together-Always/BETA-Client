## Feature-First 디렉터리 가이드

- `src/features/<domain>/`  
  - 하위에 `screens`, `components`, `hooks`, `store`, `constants`, `assets`를 필요에 따라 추가합니다.  
  - 예시: `src/features/photoBooth/screens/Select/SelectScreen.jsx`, `src/features/photoBooth/store/photoBoothStore.js`.
- `src/app/`  
  - 앱 엔트리(`App.js`), 글로벌 프로바이더, 내비게이션(`src/app/navigation/*`)을 보관합니다.
- `src/shared/`  
  - 전역적으로 재사용되는 자원(폰트·이미지, UI 컴포넌트, 훅, 스토어 등)을 둡니다.  
  - 새 `src/shared/utils`에는 공용 유틸을 배치하고, 필요한 경우 폴더를 추가로 만듭니다.

### 경로 Alias
`babel-plugin-module-resolver`가 활성화되어 있어 다음 별칭을 사용할 수 있습니다.

| Alias | Path |
| --- | --- |
| `@app` | `./src/app` |
| `@features` | `./src/features` |
| `@shared` | `./src/shared` |

> 신규 파일을 추가할 때도 alias를 사용하면 상대 경로 정리가 쉬워집니다.

### 마이그레이션 팁
1. 새 도메인 기능은 `src/features/<domain>`에서 시작합니다.
2. 화면 간 공유 요소는 도메인 내부 `components/`에, 앱 전역 공유 요소는 `src/shared/`로 승격합니다.
3. 상태/스토어는 가능하면 기능 단위(`src/features/<domain>/store`)로 유지하고, 전역 스토어만 `src/shared/stores`에 둡니다.
4. 내비게이션 스택에 새 화면을 연결할 때는 `@features/<domain>/screens/...` 경로를 사용합니다.


