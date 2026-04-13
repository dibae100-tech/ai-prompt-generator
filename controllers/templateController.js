const path = require('path');
const fs = require('fs').promises;
const AdmZip = require('adm-zip');
const { Op, Sequelize } = require('sequelize');
const { validationResult } = require('express-validator');
const { ProjectTemplate } = require('../models');

function success(message, data = {}) {
  return { status: 'success', message, data };
}

function error(message, data = {}) {
  return { status: 'error', message, data };
}

function parseArray(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function formatBytes(bytes) {
  if (!bytes || bytes < 1024) {
    return `${bytes || 0} B`;
  }

  if (bytes < 1048576) {
    return `${Math.round(bytes / 102.4) / 10} KB`;
  }

  return `${Math.round(bytes / 104857.6) / 10} MB`;
}

async function index(req, res) {
  return res.render('layouts/main', {
    title: '템플릿 목록',
    activeMenu: 'template',
    viewPath: 'template/index'
  });
}

async function create(req, res) {
  return res.render('layouts/main', {
    title: '템플릿 등록',
    activeMenu: 'template',
    viewPath: 'template/create'
  });
}

async function list(req, res, next) {
  try {
    const draw = Number(req.query.draw || 1);
    const start = Number(req.query.start || 0);
    const length = Number(req.query.length || 10);
    const search = req.query.search?.value || '';
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { project_type: { [Op.like]: `%${search}%` } },
        { version: { [Op.like]: `%${search}%` } }
      ];
    }

    if (req.query.project_type) {
      where.project_type = req.query.project_type;
    }

    if (req.query.framework) {
      where[Op.and] = [
        ...(where[Op.and] || []),
        Sequelize.where(Sequelize.cast(Sequelize.col('framework'), 'CHAR'), {
          [Op.like]: `%${req.query.framework}%`
        })
      ];
    }

    const total = await ProjectTemplate.count();
    const filtered = await ProjectTemplate.count({ where });
    const rows = await ProjectTemplate.findAll({
      where,
      offset: start,
      limit: length,
      order: [['created_at', 'DESC']]
    });

    return res.json({
      draw,
      recordsTotal: total,
      recordsFiltered: filtered,
      data: rows.map((item) => ({
        id: item.id,
        name: item.name,
        project_type: item.project_type,
        framework: (item.framework || []).join(', '),
        version: item.version,
        file_size: formatBytes(Number(item.file_size)),
        download_count: item.download_count,
        created_at: item.created_at,
        detail_url: `/template/${item.id}`,
        download_url: `/template/${item.id}/download`
      }))
    });
  } catch (err) {
    return next(err);
  }
}

async function upload(req, res) {
  if (!req.file) {
    return res.status(422).json(error('업로드 파일이 필요합니다.'));
  }

  const data = {
    file_path: req.file.path,
    file_name: req.file.originalname,
    file_size: req.file.size,
    zip_preview: []
  };

  if (req.file.originalname.toLowerCase().endsWith('.zip')) {
    const zip = new AdmZip(req.file.path);
    data.zip_preview = zip.getEntries().slice(0, 20).map((entry) => entry.entryName);
  }

  return res.json(success('파일이 업로드되었습니다.', data));
}

async function store(req, res, next) {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(422).json(error('입력값을 확인하세요.', { errors: result.array() }));
    }

    const template = await ProjectTemplate.create({
      name: req.body.name,
      project_type: req.body.project_type,
      framework: parseArray(req.body.framework),
      ui_stack: parseArray(req.body.ui_stack),
      description: req.body.description,
      version: req.body.version,
      file_path: req.body.file_path,
      file_name: req.body.file_name,
      file_size: req.body.file_size
    });

    return res.status(201).json(success('템플릿이 등록되었습니다.', { item: template, redirect_url: '/template' }));
  } catch (err) {
    return next(err);
  }
}

async function detail(req, res, next) {
  try {
    const template = await ProjectTemplate.findByPk(req.params.id);
    if (!template) {
      return res.status(404).send('템플릿을 찾을 수 없습니다.');
    }

    return res.render('layouts/main', {
      title: '템플릿 상세',
      activeMenu: 'template',
      viewPath: 'template/detail',
      template,
      formatBytes
    });
  } catch (err) {
    return next(err);
  }
}

async function download(req, res, next) {
  try {
    const template = await ProjectTemplate.findByPk(req.params.id);
    if (!template) {
      return res.status(404).send('템플릿을 찾을 수 없습니다.');
    }

    await template.increment('download_count');
    return res.download(path.join(__dirname, '..', template.file_path), template.file_name);
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const template = await ProjectTemplate.findByPk(req.params.id);
    if (!template) {
      return res.status(404).json(error('템플릿을 찾을 수 없습니다.'));
    }

    await fs.rm(path.join(__dirname, '..', template.file_path), { force: true });
    await template.destroy();

    return res.json(success('템플릿이 삭제되었습니다.'));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  index,
  create,
  list,
  upload,
  store,
  detail,
  download,
  remove
};
