import React, { useEffect, useState } from 'react';
import { Table, Input, Spin, message, Card, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import productApi from '../../api/productApi';
import './Product.scss';

const { Title } = Typography;

interface BrandData {
    key: string;
    name: string;
}

const BrandPage: React.FC = () => {
    const [brands, setBrands] = useState<BrandData[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const fetchBrands = async () => {
        setLoading(true);
        try {
            const response = await productApi.getBrands();
            if (!response.body) return;
            if (response.ok && response.body.code === 0) {
                const brandData = response.body.data.map((brand, index) => ({
                    key: index.toString(),
                    name: brand
                }));
                setBrands(brandData);
            } else {
                message.error('Không thể tải danh sách thương hiệu');
            }
        } catch (error) {
            message.error('Không thể tải danh sách thương hiệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const columns: ColumnsType<BrandData> = [
        {
            title: 'Tên thương hiệu',
            dataIndex: 'name',
            key: 'name',
            filteredValue: [searchText],
            onFilter: (value, record) => {
                return record.name.toLowerCase().includes(value.toString().toLowerCase());
            },
            className: 'brand-name-column'
        }
    ];

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    return (
        <div className="brand-page">
            <Card className="brand-card">
                <div className="brand-header">
                    <div className="brand-title">
                        <Title level={2}>Quản lý thương hiệu</Title>
                        <p className="subtitle">Danh sách các thương hiệu trong hệ thống</p>
                    </div>
                    <div className="brand-search">
                        <Input
                            placeholder="Tìm kiếm thương hiệu..."
                            prefix={<SearchOutlined />}
                            onChange={handleSearch}
                            allowClear
                            className="search-input"
                        />
                    </div>
                </div>
                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={brands}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thương hiệu`,
                            className: 'brand-pagination'
                        }}
                        className="brand-table"
                    />
                </Spin>
            </Card>
        </div>
    );
};

export default BrandPage; 