const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize 연결 설정은 환경변수만 사용해 배포 환경 변경에 대응합니다.
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    timezone: '+09:00',
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

module.exports = sequelize;
