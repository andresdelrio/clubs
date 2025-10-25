require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('multer');

const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const upload = fileUpload({
  dest: path.join(__dirname, '../uploads'),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

// inject upload middleware for routes that need it
app.use((req, res, next) => {
  req.upload = upload;
  next();
});

app.use('/api', routes);

// Serve frontend build when available
const clientDist = path.join(__dirname, '../client/dist');
const clientIndex = path.join(clientDist, 'index.html');
const basePathEnv = process.env.APP_BASE_PATH || '/';
const basePath = basePathEnv === '/' ? '/' : `/${basePathEnv.replace(/^\/|\/$/g, '')}`;

const serveIndex = (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(clientIndex, (err) => {
    if (err) {
      next(err);
    }
  });
};

if (fs.existsSync(clientIndex)) {
  if (basePath === '/') {
    app.use(express.static(clientDist));
    app.get('*', serveIndex);
  } else {
    app.use(basePath, express.static(clientDist));
    app.get([basePath, `${basePath}/*`], serveIndex);
  }
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
