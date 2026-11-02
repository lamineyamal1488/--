module.exports = (req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInMs = (duration[0] * 1000 + duration[1] / 1e6).toFixed(2);
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${durationInMs}ms`);
  });
  next();
};
