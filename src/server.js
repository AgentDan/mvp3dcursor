require('dotenv').config();

const express = require('express');
const path = require('path');
const connectDB = require('./services/db');
const { authRouter } = require('./features/auth');
const { adminRouter } = require('./features/admin');
const { modelsRouter } = require('./features/models');
const { s3Router } = require('./features/cloudR2');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// CORS для клиента (Vite на другом порту в dev)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Статика GLTF-моделей (папка gltf/)
app.use('/gltf', express.static(path.join(__dirname, '..', 'gltf')));
// API авторизации (регистрация, вход)
app.use('/api/auth', authRouter);
// API для админки
app.use('/api/admin', adminRouter);
// API для списка 3D-моделей (папка gltf/)
app.use('/api/models', modelsRouter);
// API S3/R2 (Cloudflare R2)
app.use('/api/s3', s3Router);

// В продакшене раздаём собранный фронтенд (Vite) из client/dist
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(clientDistPath, 'index.html'))
  );
} else {
  app.get('/', (req, res) => res.send('Please set to production'));
}

async function start() {
  await connectDB();
  app.listen(port);
}

start().catch((err) => {
  process.exit(1);
});

