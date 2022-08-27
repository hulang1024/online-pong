import APIAccess from "./api";

function login(api: APIAccess) {
  return api.http.post('/user/login', { username: 'guest' });
}

function get(api: APIAccess) {
  return api.http.get('/user');
}

export default {
  login,
  get
};