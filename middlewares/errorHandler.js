function apiError(message, data = {}) {
  return { status: 'error', message, data };
}

// Ajax 요청은 통일된 JSON으로, 화면 요청은 기본 에러 화면으로 응답합니다.
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (req.xhr || req.path.includes('/list') || req.path.includes('/upload') || req.method !== 'GET') {
    return res.status(statusCode).json(apiError(err.message || '서버 오류가 발생했습니다.'));
  }

  return res.status(statusCode).send(err.message || '서버 오류가 발생했습니다.');
}

module.exports = errorHandler;
