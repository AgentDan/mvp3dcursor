// require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const http = require(`http`);
const connectDB = require('./services/db');
const { authRouter } = require('./features/auth');
const { adminRouter } = require('./features/admin');
const { modelsRouter } = require('./features/models');
const { s3Router } = require('./features/cloudR2');

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

// CORS for the client (Vite runs on a different port in dev)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Static GLTF models (gltf/ folder)
app.use('/gltf', express.static(path.join(__dirname, '..', 'gltf')));
// Auth API (register, login)
app.use('/api/auth', authRouter);
// Admin API
app.use('/api/admin', adminRouter);
// 3D model list API (gltf/ folder)
app.use('/api/models', modelsRouter);
// API S3/R2 (Cloudflare R2)
app.use('/api/s3', s3Router);

// In production, serve the built Vite app from client/dist
const clientDistPath = path.join(__dirname, '../client/dist');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDistPath));
  app.get('/{*splat}', (req, res) =>
    res.sendFile(path.join(clientDistPath, 'index.html'))
  );
} else {
  app.get('/{*splat}', (req, res) => res.send('Please set to production'));
}

async function start() {
  await connectDB();
  app.listen(PORT);
}

start().catch((err) => {
  process.exit(1);
});

