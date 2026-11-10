import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'lpg-tracker-nepal-super-secret-key-2083-moics-noc',
  jwtExpiresIn: '24h',
  databaseUrl: process.env.DATABASE_URL || null,
  corsOrigins: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  standardTareWeightToleranceGrams: 100, // NBSM NS:533 standard
  gazettedDomesticPriceNpr: 1895.00,
};
