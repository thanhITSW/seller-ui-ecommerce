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

  registerSeller: (data: { email: string; password: string; fullname: string; phone: string; role: string }) => {
    const url = '/user/users/registerSeller';
    return handleRequest(axiosClient.post(url, data));
  },

  changePassword: (oldPassword: string, newPassword: string) => {
    const url = '/user/users/change-password';
    const accessToken = localStorage.getItem('accessToken');
    return handleRequest(
      axiosClient.post(
        url,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
    );
  },

  updateAvatar: (userId: string, file: File) => {
    const url = `/user/users/${userId}/update-avatar`;
    const accessToken = localStorage.getItem('accessToken');
    const formData = new FormData();
    formData.append('image', file);
    return handleRequest(
      axiosClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      })
    );
  },

  updateUserInfo: (data: { email: string; fullname: string; phone: string }) => {
    const url = '/user/users/';
    const accessToken = localStorage.getItem('accessToken');
    return handleRequest(
      axiosClient.put(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    );
  },
};

export default userApi;
