# busan-parking2

부산시설공단 공영주차장 Open API와 카카오맵을 이용한 실시간 주차정보 서비스입니다.

## 폴더 구조

```text
busan-parking2/
├─ index.html
├─ functions/
│  └─ api/
│     ├─ parking-list.js
│     └─ parking-info.js
└─ .gitignore
```

## 보안 구조

- 공공데이터포털 Decoding 인증키는 `index.html`에 넣지 않습니다.
- Cloudflare Pages Secret `DATA_GO_KR_SERVICE_KEY`로 저장합니다.
- 카카오 JavaScript 키는 웹 SDK 특성상 브라우저에 포함됩니다.
- 배포 후 카카오디벨로퍼스에서 실제 `https://<프로젝트>.pages.dev` 주소를 JavaScript SDK 도메인에 추가하세요.

## Cloudflare Pages

- Production branch: `main`
- Build command: `exit 0`
- Build output directory: `.`
- Secret name: `DATA_GO_KR_SERVICE_KEY`
- Secret value: 공공데이터포털의 Decoding 인증키

## 로컬 테스트(선택)

Live Server만으로는 `functions/`가 실행되지 않습니다.

```bash
npx wrangler pages dev . --binding=DATA_GO_KR_SERVICE_KEY="본인의_Decoding_인증키"
```
