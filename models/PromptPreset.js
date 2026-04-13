const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 프롬프트 생성 화면에서 저장하고 불러오는 스택 프리셋 모델입니다.
const PromptPreset = sequelize.define('PromptPreset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  project_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  frontend_stack: {
    type: DataTypes.JSON,
    allowNull: false
  },
  backend_stack: {
    type: DataTypes.JSON,
    allowNull: false
  },
  output_format: {
    type: DataTypes.ENUM('agents_md', 'codex', 'chatgpt'),
    defaultValue: 'agents_md'
  },
  use_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'prompt_presets'
});

module.exports = PromptPreset;
