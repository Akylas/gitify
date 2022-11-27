import axios, { AxiosPromise, Method } from 'axios';
import axiosTauriApiAdapter from 'axios-tauri-api-adapter';

export function apiRequest(
  url: string,
  method: Method,
  data = {}
): AxiosPromise {
  const client = axios.create({ adapter: axiosTauriApiAdapter, headers:{
    'Accept':'application/json',
    'Content-Type':'application/json',
    'Cache-Control': 'no-cache'
  } });
  return client({ method, url, data });
}

export function apiRequestAuth(
  url: string,
  method: Method,
  token: string,
  data = {}
): AxiosPromise {
  const client = axios.create({ adapter: axiosTauriApiAdapter, headers:{
    'Authorization':`token ${token}`,
    'Accept':'application/json',
    'Content-Type':'application/json',
    'Cache-Control': 'no-cache'
  } });
  return client({ method, url, data });
}
