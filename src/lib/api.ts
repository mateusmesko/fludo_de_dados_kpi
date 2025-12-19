import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3000', // Adjust if backend runs on different port
})
