const axios = require('axios');
const client = axios.create({ baseURL: 'http://localhost:3001' });
client.interceptors.request.use((config) => {
  config.headers.Authorization = 'Bearer test-token';
  return config;
});
client.get('/health').then(res => console.log("OK", res.config.headers)).catch(e => console.log(e.message));
