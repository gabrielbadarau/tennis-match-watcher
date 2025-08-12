import axios from 'axios';
import env from '../config/env';

const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    [env.apiKeyHeader]: env.apiKey,
  },
});

export default apiClient;
