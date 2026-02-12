import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import healthLogRoutes from './routes/healthLogRoutes.js';
import vaccinationRoutes from './routes/vaccinationRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import babyRoutes from './routes/babyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import globalVaccineRoutes from './routes/globalVaccineRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health-logs', healthLogRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/babies', babyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/global-vaccines', globalVaccineRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
