
# 📚 Class Management System

**학생 출결 관리와 알림 발송을 위한 Node.js 기반 웹 어플리케이션**

---

## ✨ 주요 기능

- 학생 출결 체크 및 기록
- 학부모 가입 및 자녀 연동 기능
- 알림(Firebase FCM) 발송
- 소셜 로그인 (Google, Kakao, Local)
- QR코드를 통한 출결 처리
- 관리자 및 학부모 대시보드 제공

---

## 🏗️ 기술 스택

- **백엔드:** Node.js, Express
- **데이터베이스:** MySQL, Sequelize ORM
- **인증:** Passport.js (Google, Kakao, Local Strategy)
- **알림:** Firebase Cloud Messaging (FCM)
- **배포 및 환경 구성:** Docker, Docker Compose
- **API 문서화:** Swagger

---


## 🗂️ 프로젝트 구조

```plaintext
├── config/         # 환경 설정 (DB, Firebase 등)
├── controllers/    # 각 기능별 비즈니스 로직 처리
├── models/         # Sequelize 모델 정의
├── routers/        # API 라우터 정의
├── service/        # 서비스 로직 (알림, 출결 등)
├── middleware/     # 인증 미들웨어
├── passport/       # 소셜 로그인 전략
├── public/         # 정적 파일 (JS, CSS, 이미지)
├── views/          # HTML 템플릿
├── swagger/        # Swagger API 문서 설정
├── Dockerfile      # Docker 환경설정 파일
├── docker-compose.yml  # Docker Compose 설정
├── server.js       # 서버 엔트리 포인트
└── package.json    # 프로젝트 메타정보 및 의존성
```

