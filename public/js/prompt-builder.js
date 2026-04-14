(function ($) {
  // 토스트 안내는 모든 성공 액션에서 공통으로 사용합니다.
  const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1800
  });

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
    queue: '큐/비동기/메시징'
  };

  function collectStack(group) {
    const stack = {};
    $(`[data-stack-group="${group}"]`).each(function () {
      stack[$(this).data('stack-key')] = $(this).val();
    });
    return stack;
  }

  function collectState() {
    return {
      project_type: $('[name="project_type"]:checked').val(),
      frontend_stack: collectStack('frontend'),
      backend_stack: collectStack('backend'),
      output_format: $('[name="output_format"]:checked').val()
    };
  }

  function stackLines(stack, labels) {
    return Object.keys(stack)
      .filter((key) => stack[key] && stack[key] !== '없음')
      .map((key) => `- ${labels[key]}: ${stack[key]}${key === 'alert' ? ' (alert() 사용 금지)' : ''}`)
      .join('\n');
  }

  function enabled(value) {
    return value && value !== '없음';
  }

  function completionLines(frontendStack) {
    const lines = [
      '- 선택한 모든 UI 라이브러리 초기화 코드 포함',
      '- PC/태블릿/모바일 화면에서 레이아웃 확인'
    ];

    if (enabled(frontendStack.alert)) {
      lines.push(`- 모든 CRUD에 ${frontendStack.alert} confirm/toast 연동`);
    }

    if (enabled(frontendStack.table)) {
      lines.push(`- ${frontendStack.table} 초기화 및 Ajax 연동 완료`);
    }

    return lines;
  }

  function buildAgents(state) {
    return [
      '# AGENTS.md - 프로젝트 개발 지침',
      '',
      '## 프로젝트 유형',
      state.project_type,
      '',
      '## UI 스택 (반드시 준수)',
      stackLines(state.frontend_stack, frontendLabels),
      '',
      '## Backend 스택',
      stackLines(state.backend_stack, backendLabels),
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
      '## 선택 모듈 사용 원칙',
      '- 선택한 라이브러리만 설치하고 초기화한다',
      '- 값이 "없음"인 항목은 설치, import, CDN 로드, 초기화 코드를 작성하지 않는다',
      '- 실제 화면과 기능에서 사용하지 않는 라이브러리는 선택되어 있더라도 도입하지 않는다',
      '- 단순 화면에 DataTables, Dropzone.js, Summernote 같은 무거운 라이브러리를 불필요하게 넣지 않는다',
      '- 프로젝트 요구사항이 바뀌어 모듈이 필요해질 때만 추가한다',
      '',
      '## 완료 조건',
      ...completionLines(state.frontend_stack)
    ].join('\n');
  }

  function buildCodex(state) {
    return [
      '[목표]',
      `${state.project_type} 개발`,
      '',
      '[UI 스택]',
      Object.keys(state.frontend_stack).map((key) => `${frontendLabels[key]}: ${state.frontend_stack[key]}`).join(' | '),
      '',
      '[Backend 스택]',
      Object.keys(state.backend_stack).map((key) => `${backendLabels[key]}: ${state.backend_stack[key]}`).join(' | '),
      '',
      '[제약 조건]',
      `- alert() 사용 금지, ${state.frontend_stack.alert}만 사용`,
      '- 인라인 스타일 금지',
      '- 주석은 한국어로 작성',
      '- 반응형 레이아웃과 모바일 UI 필수',
      '- 선택한 라이브러리만 설치하고 초기화',
      '- "없음"으로 선택된 항목은 설치, import, CDN 로드, 초기화 금지',
      '- 실제 기능에 필요 없는 라이브러리는 선택되어 있더라도 도입 금지',
      '- API 응답: { status, message, data } 형식 통일',
      '',
      '[완료 조건]',
      '- 선택한 모든 라이브러리 초기화 코드 포함',
      '- PC/태블릿/모바일 화면에서 레이아웃과 사용성 확인',
      ...(enabled(state.frontend_stack.alert) ? [`- CRUD 전체 ${state.frontend_stack.alert} 연동`] : []),
      ...(enabled(state.frontend_stack.table) ? [`- ${state.frontend_stack.table} Ajax 서버사이드 작동`] : [])
    ].join('\n');
  }

  function buildChatGpt(state) {
    return [
      `다음 스택으로 ${state.project_type}을 개발해줘.`,
      '',
      '**UI 스택**',
      Object.keys(state.frontend_stack).map((key) => `${frontendLabels[key]}은 ${state.frontend_stack[key]}`).join(', '),
      '',
      '**Backend 스택**',
      Object.keys(state.backend_stack).map((key) => `${backendLabels[key]}은 ${state.backend_stack[key]}`).join(', '),
      '',
      '**반드시 지킬 규칙**',
      `- alert() 대신 ${state.frontend_stack.alert} 사용`,
      '- 주석은 한국어로 작성',
      '- 반응형 레이아웃과 모바일 UI를 반드시 적용',
      '- 선택한 라이브러리만 설치하고 초기화',
      '- "없음"으로 선택된 항목은 사용하지 않음',
      '- 실제 기능에 필요 없는 라이브러리는 추가하지 않음',
      '- API 응답은 { status, message, data } 형식 통일'
    ].join('\n');
  }

  function renderPrompt() {
    const state = collectState();
    const builders = { agents_md: buildAgents, codex: buildCodex, chatgpt: buildChatGpt };
    const prompt = builders[state.output_format](state);

    $('#prompt-output').val(prompt);
    $('#prompt-highlight').text(prompt);

    // CDN 로드가 실패해도 프롬프트 생성 기능은 계속 동작하게 합니다.
    if (window.hljs) {
      window.hljs.highlightElement(document.getElementById('prompt-highlight'));
    }
  }

  async function loadPresets() {
    const response = await $.getJSON('/prompt/preset/list');
    const $select = $('#preset-select');
    $select.empty().append(new Option('프리셋 선택', '', true, false));

    response.data.items.forEach((preset) => {
      $select.append(new Option(preset.name, preset.id, false, false));
    });
  }

  async function applyPresetById(id) {
    if (!id) {
      return;
    }

    const response = await $.getJSON(`/prompt/preset/${id}`);
    applyPreset(response.data.item);
    toast.fire({ icon: 'success', title: '프리셋이 적용되었습니다.' });
  }

  function applyPreset(preset) {
    $(`[name="project_type"][value="${preset.project_type}"]`).prop('checked', true);
    $(`[name="output_format"][value="${preset.output_format}"]`).prop('checked', true);

    Object.entries(preset.frontend_stack || {}).forEach(([key, value]) => {
      $(`[data-stack-group="frontend"][data-stack-key="${key}"]`).val(value).trigger('change.select2');
    });

    Object.entries(preset.backend_stack || {}).forEach(([key, value]) => {
      $(`[data-stack-group="backend"][data-stack-key="${key}"]`).val(value).trigger('change.select2');
    });

    renderPrompt();
  }

  function applyTemplate(template) {
    if (!template) {
      return;
    }

    $(`[name="project_type"][value="${template.project_type}"]`).prop('checked', true);

    const frameworks = Array.isArray(template.framework) ? template.framework : [];
    const uiStacks = Array.isArray(template.ui_stack) ? template.ui_stack : [];

    if (frameworks[0]) {
      $('[data-stack-group="backend"][data-stack-key="framework"]').val(frameworks[0]).trigger('change.select2');
    }

    const uiMap = {
      'AdminLTE 3': ['dashboard', 'AdminLTE 3'],
      SweetAlert2: ['alert', 'SweetAlert2'],
      DataTables: ['table', 'DataTables'],
      Select2: ['select', 'Select2'],
      'Dropzone.js': ['uploader', 'Dropzone.js']
    };

    uiStacks.forEach((stack) => {
      const target = uiMap[stack];
      if (target) {
        $(`[data-stack-group="frontend"][data-stack-key="${target[0]}"]`).val(target[1]).trigger('change.select2');
      }
    });

    toast.fire({ icon: 'success', title: '템플릿 설정이 적용되었습니다.' });
  }

  function downloadMarkdown() {
    const blob = new Blob([$('#prompt-output').val()], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AGENTS.md';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function savePreset() {
    const result = await Swal.fire({
      title: '프리셋 이름',
      input: 'text',
      inputPlaceholder: '예: Express 관리자 표준',
      showCancelButton: true,
      confirmButtonText: '저장',
      cancelButtonText: '취소',
      inputValidator: (value) => value ? null : '프리셋 이름을 입력하세요.'
    });

    if (!result.isConfirmed) {
      return;
    }

    const state = collectState();
    await $.ajax({
      url: '/prompt/preset',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ ...state, name: result.value })
    });

    await loadPresets();
    toast.fire({ icon: 'success', title: '프리셋이 저장되었습니다.' });
  }

  $(async function () {
    $('.select2').select2({ theme: 'bootstrap4', width: '100%' });
    await loadPresets();

    if (window.initialPreset) {
      applyPreset(window.initialPreset);
    }

    if (window.initialTemplate) {
      applyTemplate(window.initialTemplate);
    }

    renderPrompt();

    $('.prompt-input').on('change input', renderPrompt);
    $('#generate-button').on('click', renderPrompt);
    $('#preset-select').on('change', function () { applyPresetById($(this).val()); });
    $('#copy-button').on('click', async function () {
      await navigator.clipboard.writeText($('#prompt-output').val());
      toast.fire({ icon: 'success', title: '클립보드에 복사되었습니다.' });
    });
    $('#download-button').on('click', downloadMarkdown);
    $('#save-preset-button').on('click', savePreset);
    $('#reset-button').on('click', async function () {
      const result = await Swal.fire({
        title: '초기화하시겠습니까?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '초기화',
        cancelButtonText: '취소'
      });

      if (result.isConfirmed) {
        document.getElementById('prompt-form').reset();
        $('.select2').trigger('change.select2');
        renderPrompt();
      }
    });
  });
})(jQuery);
