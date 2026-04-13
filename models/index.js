const sequelize = require('../config/database');
const PromptPreset = require('./PromptPreset');
const ProjectTemplate = require('./ProjectTemplate');

// 모델을 한 곳에서 내보내 라우터와 시더가 같은 연결을 사용하게 합니다.
module.exports = {
  sequelize,
  PromptPreset,
  ProjectTemplate
};
