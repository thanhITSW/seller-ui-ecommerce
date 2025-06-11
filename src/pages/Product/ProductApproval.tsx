import React from 'react';
import ProductApprovalList from './components/ProductApprovalList';
import styles from '@/styles/Product/ProductApproval.module.scss';

const ProductApproval: React.FC = () => {
    return (
        <div className={styles['product-approval-page']}>
            <ProductApprovalList />
        </div>
    );
};

export default ProductApproval; 