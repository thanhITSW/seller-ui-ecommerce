import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  message,
  Upload,
  Row,
  Col,
  DatePicker,
  Collapse,
  Select,
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProvinces, getDistricts, getWards } from '../../api/ghnApi';
import userApi from '../../api/userApi';
import storeApi from '../../api/storeApi';

const { Title } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const licenseFields = [
  {
    key: 'business_registration_license',
    label: 'Giấy phép đăng ký kinh doanh',
    number: 'business_registration_license_number',
    issued: 'business_registration_license_issued_date',
    expired: 'business_registration_license_expired_date',
  },
  {
    key: 'pharmacist_certificate_license',
    label: 'Chứng chỉ hành nghề dược',
    number: 'pharmacist_certificate_license_number',
    issued: 'pharmacist_certificate_license_issued_date',
    expired: 'pharmacist_certificate_license_expired_date',
  },
  {
    key: 'pharmacy_operation_certificate_license',
    label: 'Giấy chứng nhận đủ điều kiện kinh doanh thuốc',
    number: 'pharmacy_operation_certificate_license_number',
    issued: 'pharmacy_operation_certificate_license_issued_date',
    expired: 'pharmacy_operation_certificate_license_expired_date',
  },
  {
    key: 'gpp_certificate_license',
    label: 'Giấy chứng nhận GPP',
    number: 'gpp_certificate_license_number',
    issued: 'gpp_certificate_license_issued_date',
    expired: 'gpp_certificate_license_expired_date',
  },
];

const RegisterPharmacy: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [provinceList, setProvinceList] = useState<any[]>([]);
  const [districtList, setDistrictList] = useState<any[]>([]);
  const [wardList, setWardList] = useState<any[]>([]);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingWard, setLoadingWard] = useState(false);

  useEffect(() => {
    getProvinces().then((res) => {
      const data = (res as any).body ? (res as any).body.data : res.data.data;
      if (data) {
        setProvinceList(data);
      }
    });
  }, []);

  const handleProvinceChange = (provinceId: number, option: any) => {
    const provinceName = option?.children;
    form.setFieldsValue({
      province_id: provinceId,
      province_name: provinceName,
      district_id: undefined,
      district_name: undefined,
      ward_code: undefined,
      ward_name: undefined,
    });
    setDistrictList([]);
    setWardList([]);
    setLoadingDistrict(true);
    getDistricts(provinceId).then((res) => {
      setLoadingDistrict(false);
      const data = (res as any).body ? (res as any).body.data : res.data.data;
      if (data) {
        setDistrictList(data);
      }
    });
  };

  const handleDistrictChange = (districtId: number, option: any) => {
    const districtName = option?.children;
    form.setFieldsValue({
      district_id: districtId,
      district_name: districtName,
      ward_code: undefined,
      ward_name: undefined,
    });
    setWardList([]);
    setLoadingWard(true);
    getWards(districtId).then((res) => {
      setLoadingWard(false);
      const data = (res as any).body ? (res as any).body.data : res.data.data;
      if (data) {
        setWardList(data);
      }
    });
  };

  const handleWardChange = (wardCode: string, option: any) => {
    const wardName = option?.children;
    form.setFieldsValue({
      ward_code: wardCode,
      ward_name: wardName,
    });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Validation failed:', errorInfo);
    message.error('Vui lòng kiểm tra lại các trường bắt buộc!');
  };

  const onFinish = async (values: any) => {

    try {
      // Đăng ký tài khoản user
      const userRes = await userApi.registerSeller({
        email: values.email,
        password: values.password,
        fullname: values.owner_name,
        phone: values.phone,
        role: "admin_seller"
      });

      const userId = (userRes as any).body?.data?.id || (userRes as any).data?.data?.id;
      if (!userId) throw new Error('Không lấy được ID user');

      // Chuẩn bị dữ liệu gửi đi
      const formData = new FormData();

      // Các trường text
      formData.append('owner_id', userId);
      formData.append('owner_name', values.owner_name);
      formData.append('name', values.name);
      formData.append('phone', values.phone);
      formData.append('email', values.email);
      formData.append('address_detail', values.address_detail);
      formData.append('photo_descriptions', values.photo_descriptions || '');

      // Địa chỉ hành chính
      formData.append('province_id', values.province_id);
      formData.append('province_name', values.province_name);
      formData.append('district_id', values.district_id);
      formData.append('district_name', values.district_name);
      formData.append('ward_code', values.ward_code);
      formData.append('ward_name', values.ward_name);

      // Ảnh đại diện
      if (values.avatar && values.avatar.fileList && values.avatar.fileList[0]?.originFileObj) {
        formData.append('avatar', values.avatar.fileList[0].originFileObj);
      }

      // Banner
      if (values.banner && values.banner.fileList && values.banner.fileList[0]?.originFileObj) {
        formData.append('banner', values.banner.fileList[0].originFileObj);
      }

      // Ảnh cửa hàng (nhiều ảnh)
      if (values.store_photos && values.store_photos.fileList) {
        values.store_photos.fileList.forEach((fileObj: any) => {
          if (fileObj.originFileObj) {
            formData.append('store_photos', fileObj.originFileObj);
          }
        });
      }

      // 4 loại giấy phép
      for (const field of licenseFields) {
        // Ảnh giấy phép
        if (values[field.key] && values[field.key].fileList && values[field.key].fileList[0]?.originFileObj) {
          console.log(field.key);
          console.log(values[field.key].fileList[0].originFileObj);
          formData.append(field.key, values[field.key].fileList[0].originFileObj);
        }
        // Số giấy phép
        if (values[field.number]) formData.append(field.number, values[field.number]);
        // Ngày cấp
        if (values[field.issued]) formData.append(field.issued, values[field.issued]?.format ? values[field.issued].format('YYYY-MM-DD') : values[field.issued]);
        // Ngày hết hạn
        if (values[field.expired]) formData.append(field.expired, values[field.expired]?.format ? values[field.expired].format('YYYY-MM-DD') : values[field.expired]);
      }

      // Gửi API tạo cửa hàng
      // Debug FormData trước khi gửi
      console.log("FormData keys:");
      // Dùng cách này để tránh lỗi TypeScript với iterator
      const formDataKeys = Array.from(formData.keys());
      formDataKeys.forEach(key => {
        console.log(`${key}:`, formData.get(key));
      });

      const storeRes = await storeApi.createStore(formData);
      console.log(storeRes);
      if (!(storeRes as any).body?.data && !(storeRes as any).data?.data) throw new Error('Tạo cửa hàng thất bại!');

      message.success('Đăng ký thành công!');
      navigate('/login');
    } catch (err: any) {
      console.error('Chi tiết lỗi:', err);
      message.error(err?.message || 'Đăng ký thất bại!');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 700, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Đăng ký nhà bán thuốc</Title>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          {/* Hidden fields for administrative names */}
          <Form.Item name="province_name" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item name="district_name" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item name="ward_name" style={{ display: 'none' }}>
            <Input />
          </Form.Item>

          {/* Thông tin nhà thuốc */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="owner_name"
                label="Tên chủ sở hữu"
                rules={[{ required: true, message: 'Vui lòng nhập tên chủ sở hữu!' }]}
              >
                <Input placeholder="Nhập tên chủ sở hữu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên nhà thuốc"
                rules={[{ required: true, message: 'Vui lòng nhập tên nhà thuốc!' }]}
              >
                <Input placeholder="Nhập tên nhà thuốc" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không đúng định dạng!' }
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                ]}
                hasFeedback
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                dependencies={["password"]}
                hasFeedback
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Xác nhận mật khẩu" />
              </Form.Item>
            </Col>
          </Row>

          {/* Địa chỉ */}
          <Title level={5} style={{ marginTop: 24 }}>Địa chỉ nhà thuốc</Title>
          <Row gutter={16}>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="province_id"
                label="Tỉnh/Thành phố"
                rules={[{ required: true, message: 'Chọn tỉnh/thành!' }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn tỉnh/thành phố"
                  optionFilterProp="children"
                  onChange={handleProvinceChange}
                  filterOption={(input, option) => ((option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase()))}
                >
                  {provinceList.map((item) => (
                    <Option key={item.ProvinceID} value={item.ProvinceID}>{item.ProvinceName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="district_id"
                label="Quận/Huyện"
                rules={[{ required: true, message: 'Chọn quận/huyện!' }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn quận/huyện"
                  optionFilterProp="children"
                  onChange={handleDistrictChange}
                  loading={loadingDistrict}
                  disabled={!form.getFieldValue('province_id')}
                  filterOption={(input, option) => ((option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase()))}
                >
                  {districtList.map((item) => (
                    <Option key={item.DistrictID} value={item.DistrictID}>{item.DistrictName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="ward_code"
                label="Phường/Xã"
                rules={[{ required: true, message: 'Chọn phường/xã!' }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn phường/xã"
                  optionFilterProp="children"
                  onChange={handleWardChange}
                  loading={loadingWard}
                  disabled={!form.getFieldValue('district_id')}
                  filterOption={(input, option) => ((option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase()))}
                >
                  {wardList.map((item) => (
                    <Option key={item.WardCode} value={item.WardCode}>{item.WardName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="address_detail"
                label="Địa chỉ chi tiết"
                rules={[{ required: true, message: 'Nhập địa chỉ chi tiết!' }]}
              >
                <Input placeholder="Số nhà, tên đường..." />
              </Form.Item>
            </Col>
          </Row>

          {/* Ảnh đại diện & banner */}
          <Title level={5} style={{ marginTop: 24 }}>Ảnh đại diện & Banner (không bắt buộc)</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="avatar" label="Ảnh đại diện">
                <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
                  <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="banner" label="Banner">
                <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
                  <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          {/* Ảnh cửa hàng */}
          <Title level={5} style={{ marginTop: 24 }}>Ảnh cửa hàng (bắt buộc)</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="store_photos"
                label="Ảnh cửa hàng"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || !value.fileList || value.fileList.length === 0) {
                        return Promise.reject(new Error('Vui lòng chọn ít nhất 1 ảnh cửa hàng!'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Upload listType="picture-card" multiple beforeUpload={() => false}>
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="photo_descriptions" label="Mô tả ảnh (cách nhau bằng dấu phẩy)">
                <Input placeholder="Ảnh mặt tiền, Ảnh bên trong..." />
              </Form.Item>
            </Col>
          </Row>

          {/* Giấy phép */}
          <Title level={5} style={{ marginTop: 24 }}>Thông tin giấy phép (bắt buộc)</Title>
          <Collapse accordion>
            {licenseFields.map((field) => (
              <Panel header={field.label} key={field.key}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      name={field.key}
                      label="Ảnh giấy phép"
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value || !value.fileList || value.fileList.length === 0) {
                              return Promise.reject(new Error('Vui lòng chọn ảnh giấy phép!'));
                            }
                            return Promise.resolve();
                          }
                        }
                      ]}
                    >
                      <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
                        <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                      </Upload>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name={field.number}
                      label="Số giấy phép"
                      rules={[{ required: true, message: 'Vui lòng nhập số giấy phép!' }]}
                    >
                      <Input placeholder="Số giấy phép" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name={field.issued}
                      label="Ngày cấp"
                      rules={[
                        { required: true, message: 'Vui lòng chọn ngày cấp!' },
                        {
                          validator: (_, value) => {
                            if (value && !value.isValid()) {
                              return Promise.reject(new Error('Ngày không hợp lệ!'));
                            }
                            return Promise.resolve();
                          }
                        }
                      ]}
                    >
                      <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name={field.expired}
                      label="Ngày hết hạn"
                      rules={[
                        { required: true, message: 'Vui lòng chọn ngày hết hạn!' },
                        {
                          validator: (_, value) => {
                            if (value && !value.isValid()) {
                              return Promise.reject(new Error('Ngày không hợp lệ!'));
                            }
                            return Promise.resolve();
                          }
                        }
                      ]}
                    >
                      <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
            ))}
          </Collapse>

          <Form.Item style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" size="large" block>
              Đăng ký
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPharmacy;