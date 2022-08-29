import axios, { AxiosInstance } from 'axios';
import { User } from '../user';
import userApi from './user';

export default class APIAccess {
  private _token: string;
  get token() { return this._token; }
  
  private _localUser: User;
  get localUser() { return this._localUser; }

  readonly http: AxiosInstance = axios.create();

  constructor() {
    this.http.defaults.baseURL =
      location.hostname == 'localhost' ? 'http://localhost:8888' : '/pong-api';
    this.http.defaults.headers.post['Content-Type']
      = 'application/x-www-form-urlencoded';
    // 请求拦截器
    this.http.interceptors.request.use((config) => {
      return config;
    }, function (error) {
      return Promise.reject(error);
    });
    // 响应拦截器
    this.http.interceptors.response.use(function (response) {
      // 2xx 范围内的状态码都会触发该函数。
      return response;
    }, function (error) {
      // 超出 2xx 范围的状态码都会触发该函数。
      if (error.response.status == 401) {
        this.token = null;
        return this.auth();
      } else {
        return Promise.reject(error);
      }
    });

    this.setToken(localStorage.getItem('token'));
  }

  async auth() {
    if (this._token) {
      try {
        const ret = await userApi.get(this);
        this._localUser = ret.data;
      } catch {
        return this.login();
      }
    } else {
      return this.login();
    }
  }

  resetToken() {
    this._token = null;
  }

  private async login(): Promise<User> {
    const res = await userApi.login(this);
    const ret = res.data;
    this.setToken(ret.token, true);
    this._localUser = ret.user;
    return this._localUser;
  }

  private setToken(token: string, save = false) {
    this._token = token;
    this.http.defaults.headers.common['Authorization']
      = 'Bearer ' + this._token;
    if (save) {
      localStorage.setItem('token', token);
    }
  }
}