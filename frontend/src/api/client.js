import axios from 'axios';

// Ensure this matches your backend port
export const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  withCredentials: true
});


