import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Category } from '../../../types/Product';

const CategoryManagement: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const showModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            form.setFieldsValue(category);
        } else {
            setEditingCategory(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingCategory(null);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingCategory) {
                // Update existing category
                setCategories(categories?.map(cat =>
                    cat.id === editingCategory.id ? { ...cat, ...values } : cat
                ));
                message.success('Category updated successfully');
            } else {
                // Add new category
                const newCategory: Category = {
                    id: Date.now().toString(),
                    ...values,
                    productCount: 0,
                };
                if (!categories) {
                    setCategories([newCategory]);
                } else {
                    setCategories([...categories, newCategory]);
                }
                message.success('Category added successfully');
            }
            handleCancel();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleDelete = (category: Category) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this category?',
            content: `This will delete the category "${category.name}" and all associated products.`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                if (categories) {
                    setCategories(categories.filter(cat => cat.id !== category.id));
                    message.success('Category deleted successfully');
                }
            },
        });
    };

    const columns: ColumnsType<Category> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: Category, b: Category) => a.name.localeCompare(b.name),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Products',
            dataIndex: 'productCount',
            key: 'productCount',
            sorter: (a: Category, b: Category) => a.productCount - b.productCount,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: Category) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    >
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="category-management">
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
                style={{ marginBottom: 16 }}
            >
                Add Category
            </Button>

            <Table
                columns={columns}
                dataSource={categories}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingCategory ? 'Edit Category' : 'Add Category'}
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                okText={editingCategory ? 'Update' : 'Add'}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter category name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter category description' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryManagement; 