import React, { useState, useEffect } from 'react';
import { Button, message, Tabs, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
    ProductTypeList,
    ProductTypeForm,
    AttributeList,
    AttributeForm,
    CategoryList,
    CategoryForm
} from '../../../components/ProductType';
import { ProductType, Attribute, Category } from '../../../types/ProductType';
import { useTheme } from '../../../contexts/ThemeContext';
import '@/styles/Product/ProductType/ProductType.scss';
import productTypeApi from '../../../api/productTypeApi';

const { Option } = Select;

const ProductTypePage: React.FC = () => {
    const { theme } = useTheme();
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
    const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [attributeFormVisible, setAttributeFormVisible] = useState(false);
    const [categoryFormVisible, setCategoryFormVisible] = useState(false);

    // Fetch product types
    const fetchProductTypes = async () => {
        try {
            setLoading(true);
            const response = await productTypeApi.getList();
            if (!response.body) return;
            if (response.ok && response.body.code === 0) {
                setProductTypes(response.body.data);
            } else {
                message.error('Failed to fetch product types');
            }
        } catch (error) {
            message.error('Failed to fetch product types');
        } finally {
            setLoading(false);
        }
    };

    // Fetch attributes
    const fetchAttributes = async (productTypeId: string) => {
        try {
            setLoading(true);
            const response = await productTypeApi.getAttributes(productTypeId);
            if (!response.body) return;
            if (response.ok && response.body.code === 0) {
                setAttributes(response.body.data);
            } else {
                message.error('Failed to fetch attributes');
            }
        } catch (error) {
            message.error('Failed to fetch attributes');
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async (productTypeId: string) => {
        try {
            setLoading(true);
            const response = await productTypeApi.getCategories(productTypeId);
            if (!response.body) return;
            if (response.ok && response.body.code === 0) {
                setCategories(response.body.data);
            } else {
                message.error('Failed to fetch categories');
            }
        } catch (error) {
            message.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductTypes();
    }, []);

    const handleProductTypeSelect = (productTypeId: string) => {
        const selected = productTypes.find(pt => pt.id === productTypeId);
        if (selected) {
            setSelectedProductType(selected);
            fetchAttributes(productTypeId);
            fetchCategories(productTypeId);
        }
    };

    // Product Type handlers
    const handleAddProductType = () => {
        setSelectedProductType(null);
        setFormVisible(true);
    };

    const handleEditProductType = (productType: ProductType) => {
        setSelectedProductType(productType);
        setFormVisible(true);
    };

    const handleDeleteProductType = async (id: string) => {
        try {
            setLoading(true);
            const response = await productTypeApi.deleteProductType(id);
            if (response.ok && response.body.code === 0) {
                message.success('Product type deleted successfully');
                fetchProductTypes();
            } else {
                message.error(response.body?.message || 'Failed to delete product type');
            }
        } catch (error) {
            message.error('Failed to delete product type');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitProductType = async (values: Partial<ProductType>) => {
        try {
            setLoading(true);
            let response;
            if (selectedProductType) {
                response = await productTypeApi.updateProductType(selectedProductType.id, { product_type_name: values.product_type_name! });
            } else {
                response = await productTypeApi.addProductType({ product_type_name: values.product_type_name! });
            }
            if (response.ok && response.body.code === 0) {
                message.success(selectedProductType ? 'Product type updated successfully' : 'Product type added successfully');
                setFormVisible(false);
                fetchProductTypes();
            } else {
                message.error(response.body?.message || 'Failed to save product type');
            }
        } catch (error) {
            message.error('Failed to save product type');
        } finally {
            setLoading(false);
        }
    };

    // Attribute handlers
    const handleAddAttribute = () => {
        setSelectedAttribute(null);
        setAttributeFormVisible(true);
    };

    const handleEditAttribute = (attribute: Attribute) => {
        setSelectedAttribute(attribute);
        setAttributeFormVisible(true);
    };

    const handleDeleteAttribute = async (id: string) => {
        try {
            setLoading(true);
            const response = await productTypeApi.deleteAttribute(id);
            if (response.ok && response.body.code === 0) {
                message.success('Attribute deleted successfully');
                if (selectedProductType) fetchAttributes(selectedProductType.id);
            } else {
                message.error(response.body?.message || 'Failed to delete attribute');
            }
        } catch (error) {
            message.error('Failed to delete attribute');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAttribute = async (values: Partial<Attribute>) => {
        try {
            setLoading(true);
            let response;
            if (selectedAttribute) {
                response = await productTypeApi.updateAttribute(selectedAttribute.id, { attribute_name: values.attribute_name! });
            } else {
                response = await productTypeApi.addAttributes(selectedProductType!.id, [{ attribute_name: values.attribute_name! }]);
            }
            if (response.ok && response.body.code === 0) {
                message.success(selectedAttribute ? 'Attribute updated successfully' : 'Attribute added successfully');
                setAttributeFormVisible(false);
                if (selectedProductType) fetchAttributes(selectedProductType.id);
            } else {
                message.error(response.body?.message || 'Failed to save attribute');
            }
        } catch (error) {
            message.error('Failed to save attribute');
        } finally {
            setLoading(false);
        }
    };

    // Category handlers
    const handleAddCategory = () => {
        setSelectedCategory(null);
        setCategoryFormVisible(true);
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setCategoryFormVisible(true);
    };

    const handleDeleteCategory = async (id: string) => {
        try {
            setLoading(true);
            const response = await productTypeApi.deleteCategory(id);
            if (response.ok && response.body.code === 0) {
                message.success('Category deleted successfully');
                if (selectedProductType) fetchCategories(selectedProductType.id);
            } else {
                message.error(response.body?.message || 'Failed to delete category');
            }
        } catch (error) {
            message.error('Failed to delete category');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitCategory = async (values: Partial<Category>) => {
        try {
            setLoading(true);
            let response;
            if (selectedCategory) {
                response = await productTypeApi.updateCategory(selectedCategory.id, { category_name: values.category_name! });
            } else {
                response = await productTypeApi.addCategories(selectedProductType!.id, [{ category_name: values.category_name! }]);
            }
            if (response.ok && response.body.code === 0) {
                message.success(selectedCategory ? 'Category updated successfully' : 'Category added successfully');
                setCategoryFormVisible(false);
                if (selectedProductType) fetchCategories(selectedProductType.id);
            } else {
                message.error(response.body?.message || 'Failed to save category');
            }
        } catch (error) {
            message.error('Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="product-type-page" data-theme={theme}>
            <div className="header">
                <h1>Product Type Management</h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddProductType}
                >
                    Add Product Type
                </Button>
            </div>

            <div className="product-type-selector">
                <Select
                    style={{ width: 200 }}
                    placeholder="Select a product type"
                    onChange={handleProductTypeSelect}
                    value={selectedProductType?.id}
                >
                    {productTypes.map(pt => (
                        <Option key={pt.id} value={pt.id}>{pt.product_type_name}</Option>
                    ))}
                </Select>
            </div>

            <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="Product Types" key="1">
                    <ProductTypeList
                        productTypes={productTypes}
                        onEdit={handleEditProductType}
                        onDelete={handleDeleteProductType}
                        loading={loading}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Attributes" key="2" disabled={!selectedProductType}>
                    {selectedProductType ? (
                        <>
                            <div className="tab-header">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddAttribute}
                                >
                                    Add Attribute
                                </Button>
                            </div>
                            <AttributeList
                                attributes={attributes}
                                onEdit={handleEditAttribute}
                                onDelete={handleDeleteAttribute}
                                loading={loading}
                            />
                        </>
                    ) : (
                        <div className="select-product-type-message">
                            Please select a product type to view attributes
                        </div>
                    )}
                </Tabs.TabPane>
                <Tabs.TabPane tab="Categories" key="3" disabled={!selectedProductType}>
                    {selectedProductType ? (
                        <>
                            <div className="tab-header">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddCategory}
                                >
                                    Add Category
                                </Button>
                            </div>
                            <CategoryList
                                categories={categories}
                                onEdit={handleEditCategory}
                                onDelete={handleDeleteCategory}
                                loading={loading}
                            />
                        </>
                    ) : (
                        <div className="select-product-type-message">
                            Please select a product type to view categories
                        </div>
                    )}
                </Tabs.TabPane>
            </Tabs>

            <ProductTypeForm
                visible={formVisible}
                onCancel={() => setFormVisible(false)}
                onSubmit={handleSubmitProductType}
                initialValues={selectedProductType || undefined}
                loading={loading}
            />

            <AttributeForm
                visible={attributeFormVisible}
                onCancel={() => setAttributeFormVisible(false)}
                onSubmit={handleSubmitAttribute}
                initialValues={selectedAttribute || undefined}
                loading={loading}
                productTypeId={selectedProductType?.id || ''}
            />

            <CategoryForm
                visible={categoryFormVisible}
                onCancel={() => setCategoryFormVisible(false)}
                onSubmit={handleSubmitCategory}
                initialValues={selectedCategory || undefined}
                loading={loading}
                productTypeId={selectedProductType?.id || ''}
            />
        </div>
    );
};

export default ProductTypePage; 