import React, { useState } from 'react';
import { Tabs } from 'antd';
import { ShopOutlined, AuditOutlined } from '@ant-design/icons';
import ProductList from './components/ProductList';
import ProductApprovalList from './components/ProductApprovalList';
import CategoryManagement from './components/CategoryManagement';
import styles from '../../styles/Product/Product.module.scss';

const { TabPane } = Tabs;

const Product: React.FC = () => {
    const [theme] = useState<'light' | 'dark'>('light');

    return (
        <div className={styles['product-page']} data-theme={theme}>
            <div className={styles['page-header']}>
                <h1>Quản lý sản phẩm</h1>
            </div>

            <ProductList />
        </div>
    );
};

export default Product; 