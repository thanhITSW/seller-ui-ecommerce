import React from 'react';
import ProductList from './components/ProductList';
import './Product.scss';

const ProductManagementPage: React.FC = () => {
    return (
        <div className="product-page">
            <div className="page-header">
                <h1>Product Management</h1>
            </div>
            <ProductList />
        </div>
    );
};

export default ProductManagementPage; 