const config = require('../config');
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Размер файла превышает допустимый лимит в 2 МБ' });
  }
  if (err.message === 'Разрешены только изображения форматов JPEG и PNG') {
    return res.status(400).json({ error: err.message });
  }
  res.status(err.status || 500).json({
    error: err.message || 'Внутренняя ошибка сервера',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};
