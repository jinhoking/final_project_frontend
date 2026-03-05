```{=html}
<p align="center">
```
`<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:203a43,100:2c5364&height=220&section=header&text=ECP%20SYSTEM&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=38" />`{=html}
```{=html}
</p>
```
```{=html}
<h1 align="center">
```
Enterprise Corporate Platform
```{=html}
</h1>
```
```{=html}
<p align="center">
```
HR · Asset · Development · Security · Approval · Notice`<br/>`{=html}
`<b>`{=html}기업 통합 관리 시스템 (React SPA 기반)`</b>`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white"/>`{=html}
`<img src="https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white"/>`{=html}
`<img src="https://img.shields.io/badge/Auth-JWT-success"/>`{=html}
`<img src="https://img.shields.io/badge/Architecture-SPA-blue"/>`{=html}
`<img src="https://img.shields.io/badge/Status-Production--Ready-brightgreen"/>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

# 📌 Project Overview

**ECP SYSTEM**은 기업 내부 업무 프로세스를 하나의 플랫폼으로 통합한\
React 기반 Single Page Application 입니다.

> ✔ 인사 · 자산 · 개발 · 보안 · 전자결재 · 공지 도메인 통합\
> ✔ JWT 기반 인증 처리\
> ✔ 실시간 데이터 폴링 및 외부 API 연동\
> ✔ 권한(Role) 기반 UI 분기 처리

------------------------------------------------------------------------

# 🏗 System Architecture

    React (SPA)
       │
       │ Axios + JWT
       ▼
    Spring Boot REST API
       │
       ▼
    Database

### 🔄 Data Flow

1.  로그인 → JWT 발급
2.  localStorage 저장
3.  Axios 요청 시 Bearer Token 자동 첨부
4.  API 응답 → 상태 업데이트 → UI 렌더링

------------------------------------------------------------------------

# 🧭 Core Domains

| Domain \| 주요 기능 \|

\|--------\|-----------\| 👥 HR \| 직원 상태 관리, 휴가 처리, 출근
모니터링 \| \| 🏢 Asset \| 자산 등록, 예산 집행률 계산, 비품 신청 연동
\| \| 🖥 Development \| 프로젝트/이슈 CRUD, GitHub 연동 \| \| 🛡 Security
\| 실시간 CVE, 악성 IP 모니터링, 감사 로그 \| \| 📝 Approval \| 전자결재
문서 작성/승인/반려 \| \| 📢 Notice \| 공지 게시판, 필터 및 정렬 \|

------------------------------------------------------------------------

# 🛠 Tech Stack

## Frontend

-   React 18 (Hooks 기반)
-   React Router v6
-   Axios (JWT Bearer 인증)
-   React Bootstrap
-   FullCalendar
-   SVG Custom UI Components

## External APIs

-   Weather API
-   GitHub REST API
-   CVE CIRCL API
-   AbuseIPDB API

------------------------------------------------------------------------

# 🔐 Authentication Strategy

-   JWT 기반 인증
-   localStorage 저장
-   모든 요청에 Authorization 헤더 자동 포함
-   만료 시 자동 로그아웃 처리

------------------------------------------------------------------------

# ✨ Key Highlights

### 📊 Integrated Dashboard

-   공지 / 결재 / 일정 통합 UI
-   FullCalendar 일정 관리
-   실시간 데이터 반영

### 📝 Smart Approval System

-   문서 ID 자동 생성
-   상태별 필터링
-   검색 및 정렬 로직 구현

### 👥 HR Management

-   권한 기반 직원 상태 변경
-   출근 로그 모니터링
-   휴가 문서 자동 파싱

### 🏢 Asset Control

-   예산 집행률 계산 로직
-   자산 CRUD
-   결재 시스템 연동

### 🖥 Dev Status Board

-   프로젝트 & 이슈 관리
-   GitHub API 연동
-   SVG 도넛 차트 진행률

### 🛡 Security Monitoring

-   3초 단위 감사 로그 폴링
-   5분 단위 CVE 피드 갱신
-   악성 IP 블랙리스트 조회

------------------------------------------------------------------------

# 🧩 Role-Based Access Control

| Role \| 권한 \|

\|------\|------\| 🔴 ROLE_ADMIN \| 전체 시스템 관리 \| \| 🟡
ROLE_MANAGER \| 부서 데이터 관리 \| \| 🔵 MEMBER \| 일반 사용자 \|

UI 레벨에서 Role 기반 분기 처리 적용

------------------------------------------------------------------------

# 📂 Project Structure

    src/
    ├── App.jsx
    ├── main.jsx
    ├── pages/
    ├── components/
    │   ├── approval/
    │   ├── asset/
    │   ├── dev/
    │   ├── hr/
    │   ├── main/
    │   └── notice/

------------------------------------------------------------------------

# 🚀 Getting Started

``` bash
npm install
npm run dev
```

------------------------------------------------------------------------

# ⚠ Future Improvements

-   API Key 환경 변수 분리 (.env)
-   GitHub Token 보안 강화
-   XSS 방어 로직 강화 (Sanitizing)
-   HttpOnly Cookie 기반 인증 개선
-   전역 상태관리 도입 (Context / Zustand)

------------------------------------------------------------------------

```{=html}
<p align="center">
```
`<b>`{=html}ECP SYSTEM`</b>`{=html}`<br/>`{=html} Enterprise Integrated
Management Platform`<br/>`{=html}`<br/>`{=html} © 2026 Portfolio Project
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2c5364,50:203a43,100:0f2027&height=120&section=footer"/>`{=html}
```{=html}
</p>
```
