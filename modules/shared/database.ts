import axios from 'axios';
import { ES_AUTHORIZATION, ES_BACKEND_URL } from './config';

export const Elastic = axios.create({
  baseURL: ES_BACKEND_URL,
  headers: {
    Authorization: ES_AUTHORIZATION,
  },
});
