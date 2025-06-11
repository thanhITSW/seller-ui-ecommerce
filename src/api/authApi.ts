import {AuthResponse, HttpResponse, LoginInformation} from '@/types';

import axiosClient, {handleRequest} from './axiosClient';

const authApi = {
  login: (body: LoginInformation): Promise<HttpResponse<AuthResponse>> => {
    const url = `/api/public/auth`;
    return handleRequest(axiosClient.post(url, body));
  },
};

export default authApi;
