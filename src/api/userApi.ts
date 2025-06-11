import axiosClient, { handleRequest } from './axiosClient';
import { HttpResponse } from '../types/http';
import { User, UserFormData } from '../types/user';

const userApi = {
  getUsers: (params?: { search?: string; status?: string }): Promise<HttpResponse<{ code: number; message: string; data: User[] }>> => {
    const url = '/user/users/';
    return handleRequest(axiosClient.get(url, { params }));
  },

  getUserById: (id: string): Promise<HttpResponse<{ code: number; message: string; data: User }>> => {
    const url = `/user/users/${id}`;
    return handleRequest(axiosClient.get(url));
  },

  updateUser: (id: string, data: UserFormData): Promise<HttpResponse<{ code: number; message: string; data: User }>> => {
    const url = `/user/users/editCustomer/${id}`;
    return handleRequest(axiosClient.put(url, data));
  },

  activateUser: (id: string): Promise<HttpResponse<any>> => {
    const url = `/user/users/${id}/activate`;
    return handleRequest(axiosClient.post(url));
  },

  deactivateUser: (id: string): Promise<HttpResponse<any>> => {
    const url = `/user/users/${id}/deactivate`;
    return handleRequest(axiosClient.post(url));
  },

  deleteUser: (id: string): Promise<HttpResponse<any>> => {
    const url = `/user/users/${id}`;
    return handleRequest(axiosClient.delete(url));
  },
};

export default userApi;
