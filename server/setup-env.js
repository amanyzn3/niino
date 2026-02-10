import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `MONGODB_URI=mongodb+srv://NINO:NiNo321@cluster0.wijuqkr.mongodb.net/nino-care
JWT_SECRET=your-secret-key-change-in-production-${Date.now()}
PORT=3000
`;

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('⚠️  .env file already exists. Skipping...');
}
