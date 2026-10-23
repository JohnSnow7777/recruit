# 마이파크 스크린파크골프 비즈니스 딜러 모집 랜딩페이지

- 배포 라이브 URL: https://recruit-pi-one.vercel.app/
- 공식 깃허브 저장소: https://github.com/JohnSnow7777/recruit
- 공식 본사: 주식회사 스마일스퀘어 (마이파크 스크린파크골프 본사)

## 구글 스프레드시트 및 앱스 스크립트(Google Apps Script) 연동 가이드

신청자가 이름과 연락처를 남기면 구글 스프레드시트에 실시간으로 기록되고, `maxmook@naver.com` 메일로 알림이 자동 전송됩니다.

### 1단계: 구글 스프레드시트 생성 및 스크립트 편집기 열기
1. [Google 스프레드시트](https://sheets.google.com)에서 새로운 스프레드시트를 생성합니다.
2. 상단 메뉴에서 **[확장 프로그램] → [Apps Script]**를 클릭합니다.

### 2단계: 앱스 스크립트 코드 붙여넣기
1. 기존 `function myFunction() {}` 내용을 모두 지웁니다.
2. 저장소의 `google_apps_script.js` 파일 내용을 전체 복사하여 붙여넣고 저장(Ctrl + S)합니다.

### 3단계: 웹앱으로 배포하기
1. 우측 상단의 **[배포] → [새 배포]**를 클릭합니다.
2. 좌측 톱니바퀴 아이콘을 누르고 **[웹 앱]** 유형을 선택합니다.
3. 설정값을 다음과 같이 지정합니다:
   - **설명**: 마이파크 딜러 모집 신청 접수
   - **다음 사용자로 실행**: **나(내 계정)**
   - **액세스 권한이 있는 사용자**: **모든 사용자(Anyone)**
4. **[배포]** 버튼을 클릭하고, 구글 계정 접근 권한 요청 시 승인합니다.
5. 배포 완료 후 화면에 표시되는 **「웹 앱 URL (https://script.google.com/macros/s/.../exec)」**을 복사합니다.

### 4단계: 상세페이지 URL 연결
1. `index.html` 파일 262번째 줄 부근의 `GOOGLE_SCRIPT_URL` 변수에 복사한 웹 앱 URL을 따옴표 안에 붙여넣습니다:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/여기에_복사한_URL_입력/exec';
   ```
2. 저장 후 git commit & push 하면 Vercel에 즉시 실시간 반영됩니다.
