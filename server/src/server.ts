import createApp from './app';
import mongoose from 'mongoose';
import { env } from './config/env';

const app = createApp();
const PORT = env.PORT;

mongoose
  .connect(env.MONGO_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Frontend: ${env.FRONTEND_URL}`);
    });
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });
