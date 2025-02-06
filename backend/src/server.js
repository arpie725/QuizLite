import express from 'express';
import next from 'next';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import studySetRoutes from './routes/studySetRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json()); // tells the app to expect json
const PORT = process.env.PORT || 1322;

// Routes
// send any /auth/. requests to the authRoutes.js file to handle
app.use('/auth', authRoutes);
// send any /studySet/ requests to the authMiddleware FIRST to verify token BEFORE going to endpoint
app.use('/studySet', authMiddleware, studySetRoutes);

app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`);
});
