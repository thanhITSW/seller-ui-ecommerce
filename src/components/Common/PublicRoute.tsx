import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute: React.FC = () => {
    const accessToken = localStorage.getItem("accessToken");
    return accessToken ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute; 