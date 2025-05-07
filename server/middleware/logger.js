const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(
  path.join(__dirname, '../logs/requests.log'),
  { flags: 'a' }
);

const logger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, body } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method,
      endpoint: originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      fileSize: body.file ? `${Math.round(body.file.length / 1024)}KB` : 'N/A',
      ...(res.statusCode >= 400 && { 
        error: res.locals.errorMessage || 'Unknown error'
      })
    };
    
    logStream.write(JSON.stringify(logData) + '\n');
  });

  next();
};

module.exports = logger;