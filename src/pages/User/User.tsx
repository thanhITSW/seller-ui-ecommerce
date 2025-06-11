import React from 'react';
import { Typography } from 'antd';
import UserList from './components/UserList';
import '@/styles/User/User.scss';

const { Title } = Typography;

const UserPage: React.FC = () => {
    return (
        <div className="user-page">
            <Title level={2}>Customer Management</Title>
            <UserList />
        </div>
    );
};

export default UserPage; 