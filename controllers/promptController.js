const { validationResult } = require('express-validator');
const { PromptPreset, ProjectTemplate } = require('../models');

function success(message, data = {}) {
  return { status: 'success', message, data };
}

function error(message, data = {}) {
  return { status: 'error', message, data };
}

function makeStackLines(stack, labels) {
  return Object.entries(stack)
    .filter(([, value]) => value && value !== '없음')
    .map(([key, value]) => `- ${labels[key]}: ${value}${key === 'alert' ? ' (alert() 사용 금지)' : ''}`)
    .join('\n');
}

function buildPrompt(payload) {
  const frontendLabels = {
    dashboard: '레이아웃',
    alert: '알림/모달',
    table: '테이블',
    chart: '차트',
    datepicker: '날짜선택',
    select: '드롭다운',
    editor: '에디터',
    uploader: '파일업로드'
  };
  const backendLabels = {
    framework: '런타임/프레임워크',
    database: '데이터베이스',
    orm: 'ORM',
    api: 'API 방식',
    auth: '인증방식',
    cache: '캐시',
    storage: '파일스토리지',
    queue: '큐/비동기'
  };

  if (payload.output_format === 'codex') {
    return [
      '[목표]',
      `${payload.project_type} 개발`,
      '',
      '[UI 스택]',
      Object.entries(payload.frontend_stack).map(([key, value]) => `${frontendLabels[key]}: ${value}`).join(' | '),
      '',
      '[Backend 스택]',
      Object.entries(payload.backend_stack).map(([key, value]) => `${backendLabels[key]}: ${value}`).join(' | '),
      '',
      '[제약 조건]',
      `- alert() 사용 금지, ${payload.frontend_stack.alert}만 사용`,
      '- 인라인 스타일 금지',
      '- 주석은 한국어로 작성',
      '- 반응형 레이아웃과 모바일 UI 필수',
      '- API 응답: { status, message, data } 형식 통일',
      '',
      '[완료 조건]',
      '- 선택한 모든 라이브러리 초기화 코드 포함',
      '- PC/태블릿/모바일 화면에서 레이아웃과 사용성 확인',
      `- CRUD 전체 ${payload.frontend_stack.alert} 연동`,
      `- ${payload.frontend_stack.table} Ajax 서버사이드 작동`
    ].join('\n');
  }

  if (payload.output_format === 'chatgpt') {
    return [
      `다음 스택으로 ${payload.project_type}을 개발해줘.`,
      '',
      '**UI 스택**',
      Object.entries(payload.frontend_stack).map(([key, value]) => `${frontendLabels[key]}은 ${value}`).join(', '),
      '',
      '**Backend 스택**',
      Object.entries(payload.backend_stack).map(([key, value]) => `${backendLabels[key]}은 ${value}`).join(', '),
      '',
      '**반드시 지킬 규칙**',
      `- alert() 대신 ${payload.frontend_stack.alert} 사용`,
      '- 주석은 한국어로 작성',
      '- 반응형 레이아웃과 모바일 UI를 반드시 적용',
      '- API 응답은 { status, message, data } 형식 통일'
    ].join('\n');
  }

  return [
    '# AGENTS.md - 프로젝트 개발 지침',
    '',
    '## 프로젝트 유형',
    payload.project_type,
    '',
    '## UI 스택 (반드시 준수)',
    makeStackLines(payload.frontend_stack, frontendLabels),
    '',
    '## Backend 스택',
    makeStackLines(payload.backend_stack, backendLabels),
    '',
    '## 공통 API 응답 형식',
    '```json',
    '{',
    '  "status": "success | error",',
    '  "message": "처리 결과 메시지",',
    '  "data": { }',
    '}',
    '```',
    '',
    '## 금지 사항',
    '- 순수 JS alert() / confirm() 사용 금지',
    '- 인라인 스타일 금지',
    '- 하드코딩된 경로 금지',
    '- 주석은 반드시 한국어로 작성',
    '- 모든 화면은 반응형으로 구현',
    '- 모바일 UI에서 입력폼, 버튼, 테이블, 업로드 영역이 깨지지 않게 구성',
    '',
    '## 완료 조건',
    '- 선택한 모든 UI 라이브러리 초기화 코드 포함',
    '- PC/태블릿/모바일 화면에서 레이아웃 확인',
    `- 모든 CRUD에 ${payload.frontend_stack.alert} confirm/toast 연동`,
    `- ${payload.frontend_stack.table} 초기화 및 Ajax 연동 완료`
  ].join('\n');
}

async function index(req, res, next) {
  try {
    let initialPreset = null;
    let initialTemplate = null;

    if (req.query.preset_id) {
      initialPreset = await PromptPreset.findByPk(req.query.preset_id);
    }

    if (req.query.template_id) {
      initialTemplate = await ProjectTemplate.findByPk(req.query.template_id);
    }

    return res.render('layouts/main', {
      title: '프롬프트 생성기',
      activeMenu: 'prompt',
      viewPath: 'prompt/index',
      initialPreset,
      initialTemplate
    });
  } catch (err) {
    return next(err);
  }
}

async function generate(req, res) {
  return res.json(success('프롬프트가 생성되었습니다.', { prompt: buildPrompt(req.body) }));
}

async function presetList(req, res, next) {
  try {
    const items = await PromptPreset.findAll({ order: [['created_at', 'DESC']] });
    return res.json(success('프리셋 목록을 불러왔습니다.', { items }));
  } catch (err) {
    return next(err);
  }
}

async function showPreset(req, res, next) {
  try {
    const preset = await PromptPreset.findByPk(req.params.id);
    if (!preset) {
      return res.status(404).json(error('프리셋을 찾을 수 없습니다.'));
    }

    await preset.increment('use_count');
    return res.json(success('프리셋을 불러왔습니다.', { item: preset }));
  } catch (err) {
    return next(err);
  }
}

async function storePreset(req, res, next) {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(422).json(error('입력값을 확인하세요.', { errors: result.array() }));
    }

    const preset = await PromptPreset.create(req.body);
    return res.status(201).json(success('프리셋이 저장되었습니다.', { item: preset }));
  } catch (err) {
    return next(err);
  }
}

async function deletePreset(req, res, next) {
  try {
    const preset = await PromptPreset.findByPk(req.params.id);
    if (!preset) {
      return res.status(404).json(error('프리셋을 찾을 수 없습니다.'));
    }

    await preset.destroy();
    return res.json(success('프리셋이 삭제되었습니다.'));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  index,
  generate,
  presetList,
  showPreset,
  storePreset,
  deletePreset,
  buildPrompt
};
