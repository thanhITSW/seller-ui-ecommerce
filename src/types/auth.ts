export interface AuthResponse {
    code: number;
    message: string;
    data: {
        user: {
            id: string;
            email: string;
            fullname: string;
            phone: string;
            avatar: string | null;
            role: string;
            status: string;
            createdAt: string;
            updatedAt: string;
        };
        accessToken: string;
        refreshToken: string;
    };
}