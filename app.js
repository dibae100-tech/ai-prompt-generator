const path = require('path');
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { sequelize } = require('./models');

const app = express();
const host = process.env.APP_HOST || '0.0.0.0';
const port = Number(process.env.APP_PORT || 8000);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: process.env.APP_SESSION_SECRET || 'prompt-generator-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(routes);
app.use(errorHandler);

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    app.listen(port, host, () => {
      console.log(`AI Prompt Generator: http://${host}:${port}`);
    });
  } catch (err) {
    console.error('서버 시작 실패:', err.message);
    process.exit(1);
  }
}

start();
