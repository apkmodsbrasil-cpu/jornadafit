import type { Personal } from '../types.ts';

export const PERSONAL_USER_MOCK: Personal = {
  id: 'personal-1',
  name: 'João Treinador',
  email: 'personal@trainer.com',
  password: 'password', // For demo purposes
  role: 'personal',
  settings: {
    whatsapp: '5511999998888',
  },
};