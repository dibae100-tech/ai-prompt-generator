const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 업로드된 프로젝트 템플릿 파일과 메타 정보를 관리합니다.
const ProjectTemplate = sequelize.define('ProjectTemplate', {
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
    allowNull: true
  },
  framework: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ui_stack: {
    type: DataTypes.JSON,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  },
  version: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'project_templates'
});

module.exports = ProjectTemplate;
