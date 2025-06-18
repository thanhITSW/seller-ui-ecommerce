/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse } from 'axios';
import AxiosResponseData from '../types/axios';
import { BadRequestFieldError, HttpResponse } from '../types/http';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  // @ts-expect-error: we want to return the different data type
  (response: AxiosResponse<AxiosResponseData>) => {
    const { status, data: responseData, headers } = response;
    const data: HttpResponse<object> = {
      status,
      ok: true,
      body: responseData,
    };

    if (headers.link) {
      data.pagination = {
        paging: 0,
        total: Number(headers['x-total-count']),
      };
    }

    return data;
  },
  ({ response }) => {
    const { status, data } = response as AxiosResponse<AxiosResponseData>;
    const fieldErrors: BadRequestFieldError = {};

    if (data?.fieldErrors?.length) {
      data.fieldErrors.forEach(({ field, messageCode }) => {
        if (fieldErrors[field]) {
          fieldErrors[field].push(messageCode);
        } else {
          fieldErrors[field] = [messageCode];
        }
      });
    }

    const error: HttpResponse = {
      status,
      ok: false,
      error: {
        unauthorized: status === 401,
        badRequest: status === 400,
        notFound: status === 404,
        clientError: status >= 400 && status <= 499,
        serverError: status >= 500 && status <= 599,
        message: data?.messageCode || data?.data?.messageCode || data?.message || data?.data?.message,
        title: `${data?.messageCode}-title`,
        errors: data?.errors,
        detail: data?.detail,
        data: data?.data,
      },
    };

    return Promise.reject(error);
  }
);

const handleRequest = (promise: Promise<HttpResponse>) =>
  promise.then((res) => res).catch((err) => err as HttpResponse<any>);

export default axiosClient;

export { handleRequest };
