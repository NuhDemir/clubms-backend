import { app } from './app';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

const bootstrap = async () => {
  try {
    app.listen(PORT, () => {
      console.log(` ClubMS Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap();