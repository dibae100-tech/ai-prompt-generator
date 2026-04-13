# AI Prompt Generator

개발자가 웹 UI에서 프론트엔드/백엔드 스택을 선택하면 Codex에 바로 붙여넣을 수 있는 프롬프트를 자동 생성하는 Express 기반 웹앱입니다.

기본 출력은 `AGENTS.md` 형식이며, Codex 프롬프트와 ChatGPT 프롬프트 형식도 함께 지원합니다. 프로젝트 템플릿 파일을 업로드하고 관리하는 기능도 포함되어 있습니다.

## 개발사

fth korea

Copyright since 2017 fth-korea.

## 주요 기능

- 스택 선택 기반 프롬프트 자동 생성
- `AGENTS.md`, Codex 프롬프트, ChatGPT 프롬프트 출력 지원
- 프롬프트 실시간 미리보기
- highlight.js 기반 코드 하이라이트
- 클립보드 복사
- `.md` 파일 다운로드
- 프리셋 저장 및 불러오기
- 프로젝트 템플릿 업로드 및 관리
- ZIP 파일 내부 목록 미리보기
- DataTables 서버사이드 Ajax 목록
- Dropzone.js 파일 업로드
- Select2 드롭다운 및 태그 입력
- Summernote 설명 입력
- SweetAlert2 알림/확인창
- 반응형 레이아웃 및 모바일 UI 기준 프롬프트 포함
- systemd 서비스 상주 실행 지원

## 기술 스택

### Backend

- Node.js v20+
- Express.js
- EJS
- MySQL 8.0
- Sequelize
- Multer
- express-session
- express-validator
- dotenv
- adm-zip
- method-override
- morgan
- cors

### Frontend

- AdminLTE 3
- Bootstrap 4
- SweetAlert2
- DataTables
- Select2
- Dropzone.js
- Font Awesome 5
- highlight.js
- Summernote

## 프로젝트 구조

```text
ai-prompt-generator/
├── app.js
├── .env.example
├── package.json
├── config/
│   └── database.js
├── models/
│   ├── index.js
│   ├── PromptPreset.js
│   └── ProjectTemplate.js
├── controllers/
│   ├── promptController.js
│   └── templateController.js
├── routes/
│   ├── index.js
│   ├── prompt.js
│   └── template.js
├── views/
│   ├── partials/
│   ├── layouts/
│   ├── prompt/
│   └── template/
├── public/
│   ├── css/
│   ├── fonts/
│   └── js/
├── uploads/
│   └── templates/
├── seeders/
│   └── defaultPresets.js
├── middlewares/
│   └── errorHandler.js
└── prompt-generater.service
```

## 설치

```bash
git clone <repository-url>
cd ai-prompt-generator
npm install
cp .env.example .env
```

## 환경변수

`.env` 파일을 환경에 맞게 수정합니다.

```env
APP_NAME="AI Prompt Generator"
APP_HOST=0.0.0.0
APP_PORT=8000
APP_SESSION_SECRET=change-this-secret

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ai_prompt_generator
DB_USER=root
DB_PASSWORD=

UPLOAD_DIR=uploads/templates
```

공개 저장소에는 `.env`를 올리지 마세요. `.env.example`만 공유합니다.

## MySQL 준비

MySQL에 앱용 데이터베이스를 생성합니다.

```sql
CREATE DATABASE ai_prompt_generator
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

전용 계정을 사용할 경우 예시는 다음과 같습니다.

```sql
CREATE USER 'ai_prompt_user'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON ai_prompt_generator.* TO 'ai_prompt_user'@'localhost';
FLUSH PRIVILEGES;
```

그 다음 `.env`에 계정 정보를 반영합니다.

```env
DB_USER=ai_prompt_user
DB_PASSWORD=your-password
```

## 시드 데이터 생성

기본 프리셋 3개를 생성합니다.

```bash
npm run seed
```

Sequelize는 앱 시작 시 `sync({ force: false })`로 필요한 테이블을 자동 생성합니다.

## 실행

```bash
node app.js
```

브라우저 접속:

```text
http://localhost:8000
```

내부망 다른 기기에서 접속:

```text
http://서버내부IP:8000
```

내부 IP 접속을 허용하려면 `.env`의 `APP_HOST=0.0.0.0`을 유지하세요.

## 주요 화면

| 경로 | 설명 |
| --- | --- |
| `/` | `/prompt`로 이동 |
| `/prompt` | 프롬프트 생성기 |
| `/template` | 템플릿 목록 |
| `/template/create` | 템플릿 등록 |
| `/template/:id` | 템플릿 상세 |

## API

### Prompt

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/prompt` | 프롬프트 생성기 화면 |
| `POST` | `/prompt/generate` | 프롬프트 텍스트 생성 |
| `GET` | `/prompt/preset/list` | 프리셋 목록 조회 |
| `GET` | `/prompt/preset/:id` | 프리셋 상세 조회 |
| `POST` | `/prompt/preset` | 프리셋 저장 |
| `DELETE` | `/prompt/preset/:id` | 프리셋 삭제 |

### Template

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/template` | 템플릿 목록 화면 |
| `GET` | `/template/create` | 템플릿 등록 화면 |
| `GET` | `/template/list` | DataTables Ajax 목록 |
| `POST` | `/template/upload` | 파일 업로드 |
| `POST` | `/template` | 템플릿 등록 |
| `GET` | `/template/:id` | 템플릿 상세 |
| `GET` | `/template/:id/download` | 템플릿 다운로드 |
| `DELETE` | `/template/:id` | 템플릿 삭제 |

## API 응답 형식

일반 Ajax/API 응답은 아래 형식을 사용합니다.

```json
{
  "status": "success",
  "message": "처리 결과 메시지",
  "data": {}
}
```

오류 응답 예시:

```json
{
  "status": "error",
  "message": "입력값을 확인하세요.",
  "data": {
    "errors": []
  }
}
```

DataTables 서버사이드 응답은 DataTables 규격에 맞춰 `draw`, `recordsTotal`, `recordsFiltered`, `data`를 반환합니다.

## 업로드

템플릿 파일 업로드는 Multer로 처리합니다.

허용 확장자:

- `.zip`
- `.tar.gz`
- `.md`
- `.json`

최대 파일 크기:

```text
50MB
```

업로드 경로:

```text
uploads/templates/
```

ZIP 파일은 `adm-zip`으로 내부 파일 목록을 일부 미리 보여줍니다.

## 폰트

커스텀 폰트는 아래 경로에 둡니다.

```text
public/fonts/
```

현재 `custom.css`는 `ONE Mobile` 폰트를 적용하도록 구성되어 있습니다.

```css
body {
  font-family: "ONE Mobile", "Noto Sans KR", "Apple SD Gothic Neo", Arial, sans-serif;
}
```

프롬프트 미리보기 영역은 코드 가독성을 위해 monospace 폰트를 유지합니다.

## systemd 서비스 등록

서비스 파일 예시는 프로젝트 루트의 `prompt-generater.service`에 포함되어 있습니다.

```ini
[Unit]
Description=AI Prompt Generator Express Service
After=network.target mysql.service mariadb.service
Wants=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/ai-prompt-generator
Environment=NODE_ENV=production
ExecStart=/usr/bin/node app.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

등록:

```bash
sudo cp prompt-generater.service /etc/systemd/system/prompt-generater.service
sudo systemctl daemon-reload
sudo systemctl enable --now prompt-generater.service
```

관리:

```bash
sudo systemctl status prompt-generater.service
sudo systemctl restart prompt-generater.service
sudo systemctl stop prompt-generater.service
sudo journalctl -u prompt-generater.service -f
```

환경에 따라 `User`, `WorkingDirectory`, `ExecStart` 경로를 수정해야 합니다.

## UFW 방화벽

내부망 또는 외부에서 8000번 포트로 접근하려면 방화벽을 허용합니다.

```bash
sudo ufw allow 8000/tcp
sudo ufw status
```

## 개발 규칙

- 브라우저 기본 `alert()`와 `confirm()`은 사용하지 않습니다.
- 알림과 확인창은 SweetAlert2만 사용합니다.
- 인라인 스타일을 사용하지 않습니다.
- 정적 파일 경로는 Express static 경로를 기준으로 관리합니다.
- 파일 경로 처리는 `path.join()`을 사용합니다.
- 서버 파일 처리는 비동기 API를 우선 사용합니다.
- 모든 주석은 한국어로 작성합니다.
- 반응형 레이아웃과 모바일 UI를 고려합니다.

## 공개 배포 체크리스트

- `.env`가 저장소에 포함되지 않았는지 확인
- `node_modules/`가 저장소에 포함되지 않았는지 확인
- 업로드된 실제 템플릿 파일이 저장소에 포함되지 않았는지 확인
- `.env.example`에 예시 값만 남겼는지 확인
- MySQL 비밀번호, 세션 시크릿 등 민감 정보 제거
- `prompt-generater.service`의 사용자/경로가 배포 서버에 맞는지 확인

## 라이선스

공개 배포 시 원하는 라이선스를 추가하세요. 예: MIT License.
