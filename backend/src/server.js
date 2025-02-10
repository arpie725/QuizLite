import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import studySetRoutes from './routes/studySetRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tagRoutes from './routes/tagRoutes.js';

// TODO: delete the filename, dirname stuff
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json()); // tells the app to expect json
const PORT = process.env.PORT || 1322;

// Routes
// send any /auth/. requests to the authRoutes.js file to handle
app.use('/auth', authRoutes);
// send any of the requests below to the authMiddleware FIRST to verify token BEFORE going to endpoint
app.use('/user', authMiddleware, userRoutes);
app.use('/studySet', authMiddleware, studySetRoutes);
app.use('/card', authMiddleware, cardRoutes);
app.use('/tag', authMiddleware, tagRoutes);

app.listen(PORT, () => {
});
