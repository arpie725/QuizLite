import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';
import studySetRoutes from './routes/studySetRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tagRoutes from './routes/tagRoutes.js';


const app = express();
app.use(cors());
app.use(express.json()); // tells the app to expect json
const PORT = process.env.PORT || 1322;

// Routes
// send any /auth/. requests to the authRoutes.js file to handle
app.use('/auth', authRoutes);
// send any of the requests below to the authMiddleware FIRST to verify token BEFORE going to endpoint
app.use('/user', authMiddleware, userRoutes);
app.use('/study-set', authMiddleware, studySetRoutes);
app.use('/card', authMiddleware, cardRoutes);
app.use('/tag', authMiddleware, tagRoutes);

app.listen(PORT, () => {
  console.log(`Server has started on port: ${PORT}`);
});
