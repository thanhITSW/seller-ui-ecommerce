import React from 'react';
import { Button, Typography, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import './styles.scss';

const { Title, Text } = Typography;

const Error404: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="error-404">
      <div className="error-content">
        <div className="error-image">
          <svg viewBox="0 0 600 200" className="error-numbers">
            <text x="50%" y="50%" dy=".35em" textAnchor="middle">
              404
            </text>
          </svg>
        </div>

        <Title level={2}>Oops! Trang không tồn tại</Title>

        <Text className="error-path">
          Đường dẫn không hợp lệ: <Text code>{location.pathname}</Text>
        </Text>

        <Text className="error-message">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
        </Text>

        <Space size="middle" className="error-actions">
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={handleGoHome}
          >
            Về trang chủ
          </Button>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
          >
            Quay lại
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default Error404;