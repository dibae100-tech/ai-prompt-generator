require('dotenv').config();
const { sequelize, PromptPreset } = require('../models');

const presets = [
  {
    name: 'Express 관리자 대시보드 표준',
    project_type: '관리자 대시보드',
    frontend_stack: {
      dashboard: 'AdminLTE 3',
      alert: 'SweetAlert2',
      table: 'DataTables',
      chart: '없음',
      datepicker: 'Flatpickr',
      select: 'Select2',
      editor: 'Summernote',
      uploader: 'Dropzone.js'
    },
    backend_stack: {
      framework: 'Node.js + Express',
      database: 'MySQL',
      orm: 'Sequelize',
      api: 'REST API',
      auth: 'Session',
      cache: 'Redis',
      storage: '로컬',
      queue: 'Bull Queue'
    },
    output_format: 'agents_md'
  },
  {
    name: 'REST API 서버 표준',
    project_type: 'REST API 서버',
    frontend_stack: {
      dashboard: '없음',
      alert: 'SweetAlert2',
      table: '없음',
      chart: '없음',
      datepicker: '없음',
      select: '없음',
      editor: '없음',
      uploader: '없음'
    },
    backend_stack: {
      framework: 'Node.js + Express',
      database: 'MySQL',
      orm: 'Sequelize',
      api: 'REST API',
      auth: 'JWT',
      cache: 'Redis',
      storage: '로컬',
      queue: 'Bull Queue'
    },
    output_format: 'codex'
  },
  {
    name: '쇼핑몰 운영툴 표준',
    project_type: '쇼핑몰',
    frontend_stack: {
      dashboard: 'AdminLTE 3',
      alert: 'SweetAlert2',
      table: 'DataTables',
      chart: 'ApexCharts',
      datepicker: 'Flatpickr',
      select: 'Select2',
      editor: 'Summernote',
      uploader: 'Dropzone.js'
    },
    backend_stack: {
      framework: 'Node.js + Express',
      database: 'MySQL',
      orm: 'Sequelize',
      api: 'REST API',
      auth: 'Session',
      cache: 'Redis',
      storage: 'AWS S3',
      queue: 'Bull Queue'
    },
    output_format: 'chatgpt'
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });

    for (const preset of presets) {
      await PromptPreset.findOrCreate({
        where: { name: preset.name },
        defaults: preset
      });
    }

    console.log('기본 프리셋 시드 데이터가 생성되었습니다.');
    process.exit(0);
  } catch (err) {
    console.error('시드 실행 실패:', err.message);
    process.exit(1);
  }
}

seed();
