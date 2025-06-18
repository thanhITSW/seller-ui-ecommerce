import axiosClient from './axiosClient';

const GHN_API_URL = import.meta.env.VITE_GHN_API_URL;
const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN;

export const getProvinces = () => {
    return axiosClient.get(`${GHN_API_URL}/master-data/province`, {
        headers: {
            Token: GHN_TOKEN,
        },
    });
};

export const getDistricts = (province_id: number) => {
    return axiosClient.post(
        `${GHN_API_URL}/master-data/district`,
        { province_id },
        {
            headers: {
                Token: GHN_TOKEN,
                'Content-Type': 'application/json',
            },
        }
    );
};

export const getWards = (district_id: number) => {
    return axiosClient.post(
        `${GHN_API_URL}/master-data/ward`,
        { district_id },
        {
            headers: {
                Token: GHN_TOKEN,
                'Content-Type': 'application/json',
            },
        }
    );
}; 