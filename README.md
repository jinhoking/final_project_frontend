# 🛡️ ECP SYSTEM - Frontend Technical Specification

사내 통합 관리 시스템(Enterprise Control Platform)의 프론트엔드는 **React 18**과 **Vite**를 기반으로 구축되었으며, 사용자 경험(UX) 최적화와 효율적인 상태 관리를 최우선으로 설계되었습니다.

---

## 🛠️ 기술 스택 (Technical Stack)

* **Framework:** React 18 (Vite)
* **Routing:** React Router v6 (SPA)
* **State & Logic:** React Hooks (useState, useEffect, useMemo)
* **Security:** JWT (JSON Web Token), Axios Interceptor
* **UI Framework:** React Bootstrap 5, React Icons
* **Communication:** WebSocket (STOMP), Axios (REST API)
* **Visualization:** FullCalendar, Chart.js

---

## 📂 프로젝트 구조 (Project Structure)

```text
src/
 ├── api/              # API 인스턴스 및 Axios 인터셉터 설정
 ├── components/       # 도메인별 재사용 컴포넌트
 │    ├── approval/    # 전자결재 상세 및 작성 모달
 │    ├── asset/       # 자산 등록 및 상세 정보 모달
 │    ├── dev/         # 개발 현황 및 시스템 모니터링
 │    ├── hr/          # 인사 관리 및 실시간 채팅 드로어
 │    └── main/        # 공통 헤더 및 푸터
 ├── pages/            # 라우트 경로별 메인 페이지 레이아웃
 ├── styles/           # 글로벌 테마 및 CSS 커스텀 설정
 ├── utils/            # 데이터 가공 유틸리티 (날짜, 포맷 등)
 ├── App.jsx           # 앱 진입점 및 전역 라우팅 설정
 └── main.jsx          # 앱 초기화 및 렌더링
```

---

## 🔑 핵심 구현 상세 (Key Implementations)

### 1. 보안 및 인증 (Security & JWT)
* **Stateless Auth:** 모든 API 요청 전 \`Axios Interceptor\`를 통해 \`localStorage\`의 JWT 토큰을 헤더에 자동 첨부합니다.
* **Token Lifecycle:** 토큰 만료(401 Error) 시 자동 로그아웃 및 리다이렉션을 처리합니다.

### 2. 권한 기반 UI 제어 (RBAC)
* **Role Filtering:** ADMIN, MANAGER, USER 역할에 따라 메뉴를 제어합니다.

---

## 🌐 외부 서비스 연동 (External APIs)

| 서비스 | 활용 내용 | 연동 기술 |
| :--- | :--- | :--- |
| **Hugging Face** | AI 모델/데이터셋 트렌드 수집 | REST API |
| **GitHub** | 실시간 커밋 히스토리 관리 | REST API |
| **Weather/Meal** | 실시간 날씨 및 식단 정보 연동 | REST API |
| **AbuseIPDB** | 보안 위협 IP 필터링 | REST API |

---

## 🚀 시작하기 (Getting Started)

### 1. 환경 변수 설정 (.env)
루트 폴더에 `.env` 파일을 생성하고 아래 변수를 설정하세요.
```text
VITE_API_URL=[http://ecpsystem.site:8080](http://ecpsystem.site:8080)
VITE_GITHUB_TOKEN=your_personal_access_token_here
```

### 2. 설치 및 실행
```bash
npm install
npm run dev
```

---

## 🆘 Troubleshooting (에러 발생 시 조치 방법)

### Q1. `npm install` 중 에러가 발생합니다.
* **해결:** 아래 명령어를 순서대로 입력하여 클린 설치를 진행하세요.
  ```bash
  rm -rf node_modules package-lock.json
  npm cache clean --force
  npm install
  ```

### Q2. 화면이 백색(White Screen)으로 나오고 API 호출이 안 됩니다.
* **해결:** 루트 폴더에 `.env` 파일이 있는지, `VITE_API_URL` 주소가 정확한지 확인하세요.

### Q3. "Vite command not found" 에러가 뜹니다.
* **해결:** `npm install`을 다시 실행하거나, `npx vite` 명령어로 실행해 보세요.
* 
본 문서는 ECP SYSTEM 프론트엔드 기술 명세서입니다.
