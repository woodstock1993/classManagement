# Node.js 기반 이미지 선택
FROM node:22.14

# 작업 디렉토리 설정
WORKDIR /app

# package.json, package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 전체 앱 소스 복사
COPY . .

# 포트 노출
EXPOSE 8080

# 애플리케이션 실행
CMD ["node", "server.js"]
