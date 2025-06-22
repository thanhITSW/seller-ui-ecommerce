import React, { use, useEffect, useState } from "react";
import { Input, Button, Form, Col, notification } from "antd";
import { GoogleOutlined, TwitterOutlined } from "@ant-design/icons";
import image from "../../assets/Image-login-page.svg";
import * as yup from "yup";
import { useFormik } from "formik";
import VerticalForm from "@/components/Forms/VerticalForm";
import TextInputField from "@/components/FormField/TextInputField";
import { EMAIL_REGEX, MAX_LENGTH } from "@/constants/common";
import { useAppTranslation, useErrTranslation } from "@/hooks/common";
import { useNavigate } from "react-router-dom";
import PasswordInputField from "@/components/FormField/PasswordInputField";
import SubmitButton from "@/components/Forms/SubmitButton";
import useSubmitForm from "@/hooks/useSubmitForm";
import authApi from "@/api/authApi";
import { LoginInformation } from "@/types";
import { setLoginStatus, setStoreInfo } from "@/redux/slices/authSlice";
import { useDispatch } from "react-redux";
import storeApi from "@/api/storeApi";


interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  handleLogin: (email: string, password: string, remember: boolean) => void;
  handleGoogleLogin: () => void;
  handleFacebookLogin: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ handleLogin }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useDispatch();

  const t = useAppTranslation();
  const et = useErrTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loginInfo, setLoginInfo] = useState<LoginFormValues>({
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    // handleLogin(
    //   loginInfo.emailOrUsername,  
    //   loginInfo.password,
    //   false
    // );
    setTimeout(() => {
      notification.success({
        message: 'Login Successful',
        description: 'You have successfully logged in.'
      });
      setLoading(false);
    }, 5000);
  };

  const onFieldsChange = () => {
    setLoginInfo({
      email: form.getFieldValue("emailOrUsername"),
      password: form.getFieldValue("password"),
    });

  };

  const onSubmitLoginForm = useSubmitForm(async (values: any) => {
    setLoading(true);
    try {
      // Map lại giá trị form sang LoginInformation
      const loginPayload: LoginInformation = {
        email: values.emailOrUsername,
        password: values.password,
      };
      // Call API login
      const { ok, body } = await authApi.login(loginPayload);
      if (ok && body?.data) {
        const { user, accessToken, refreshToken } = body.data;
        // Call API get store info by user_id
        const storeRes = await storeApi.getStoreByUserId(user.id);
        if (storeRes.ok && storeRes.body?.data) {
          const store_id = storeRes.body.data.store_id;

          // Get store details to check status
          const storeDetailsRes = await storeApi.getById(store_id);
          if (storeDetailsRes.ok && storeDetailsRes.body?.data) {
            const storeStatus = storeDetailsRes.body.data.status;

            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('store_id', store_id);
            localStorage.setItem('store', JSON.stringify(storeDetailsRes.body.data));
            localStorage.setItem('store_status', storeStatus);

            // Save to Redux
            dispatch(setLoginStatus(true));
            dispatch(setStoreInfo({ storeId: store_id, storeStatus }));

            notification.success({
              message: t('Đăng nhập thành công'),
              description: t('Bạn đã đăng nhập thành công!'),
            });

            // Redirect based on store status
            if (storeStatus === 'active') {
              navigate('/'); // Chuyển hướng sang trang chính
            } else {
              navigate('/stores'); // Chuyển hướng sang trang store settings
              notification.warning({
                message: t('Cửa hàng chưa được kích hoạt'),
                description: t('Cửa hàng của bạn đang chờ xét duyệt hoặc bị từ chối. Vui lòng kiểm tra thông tin cửa hàng.'),
              });
            }
          } else {
            notification.error({
              message: t('Lỗi lấy thông tin cửa hàng'),
              description: storeDetailsRes.body?.message || t('Không thể lấy thông tin cửa hàng'),
            });
          }
        } else {
          notification.error({
            message: t('Lỗi lấy thông tin cửa hàng'),
            description: storeRes.body?.message || t('Không thể lấy thông tin cửa hàng'),
          });
        }
      } else {
        notification.error({
          message: t('Đăng nhập thất bại'),
          description: body?.message || t('Sai thông tin đăng nhập'),
        });
      }
    } catch (error) {
      notification.error({
        message: t('Đăng nhập thất bại'),
        description: t('Có lỗi xảy ra, vui lòng thử lại sau'),
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-illustration hide-on-tablet">
          <img
            src={image}
            alt="Login illustration"
            className="illustration-image"
          />
        </div>

        <div className="login-form-container">
          <h1 className="welcome-text">
            Welcome To <span className="brand-name">Seller</span>
          </h1>
          <p className="login-description">
            Please sign-in to your account
          </p>
          <Col span={24}>
            <VerticalForm
              name="basic"
              autoComplete="off"
              layout="vertical"
              onFinish={onSubmitLoginForm}
              form={form}
              onFieldsChange={onFieldsChange}
              className="login-form"
            >
              <TextInputField
                label={t("Email")}
                id="emailOrUsername"
                name="emailOrUsername"
                placeholder="Enter Your Email Or User Name"
                size="large"
                maxLength={MAX_LENGTH.EMAIL}
                rules={[
                  {
                    required: true,
                    message: et("Yêu cầu nhập email"),
                  },
                  {
                    pattern: EMAIL_REGEX,
                    message: et("Email không hợp lệ"),
                  },
                ]}
              />

              <PasswordInputField
                className="input-primary"
                name="password"
                id="password"
                size="large"
                label={t("Password")}
                placeholder={t("input.password.placeholder")}
                maxLength={MAX_LENGTH.PASSWORD}
                rules={[
                  {
                    required: true,
                    message: et("Yêu cầu nhập mật khẩu"),
                  },
                ]}
              />

              <SubmitButton
                name="Sign In"
                buttonClassName="sign-in-button"
                loading={loading}
              >
              </SubmitButton>

              <div className="account-options">
                <p>
                  New on our platform? <a href="/signup">Create an account</a>
                </p>
                <p className="or-divider">or</p>

                <div className="social-login">
                  <Button
                    shape="circle"
                    className="social-button fa-brands fa-facebook-f facebook"
                  />
                  <Button
                    icon={<GoogleOutlined />}
                    shape="circle"
                    className="social-button google"
                  />
                  <Button
                    icon={<TwitterOutlined />}
                    shape="circle"
                    className="social-button twitter"
                  />
                </div>
              </div>
            </VerticalForm>
          </Col>

          {/* <Form
            className="login-form"
            onFinish={formik.handleSubmit}
            layout="vertical"
          >
            <Form.Item
              label="Email Or Username"
              validateStatus={
                formik.touched.emailOrUsername && formik.errors.emailOrUsername
                  ? "error"
                  : ""
              }
              help={
                formik.touched.emailOrUsername && formik.errors.emailOrUsername
              }
            >
              <Input
                id="emailOrUsername"
                name="emailOrUsername"
                placeholder="Enter Your Email Or User Name"
                size="large"
                value={formik.values.emailOrUsername}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              validateStatus={
                formik.touched.password && formik.errors.password ? "error" : ""
              }
              help={formik.touched.password && formik.errors.password}
            >
              <Input.Password
                id="password"
                name="password"
                placeholder="Enter Your Password"
                size="large"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                size="large"
                block
                className="sign-in-button"
                htmlType="submit"
                loading={loading}
              >
                Sign In
              </Button>
            </Form.Item>

            <div className="account-options">
              <p>
                New on our platform? <a href="/signup">Create an account</a>
              </p>
              <p className="or-divider">or</p>

              <div className="social-login">
                <Button
                  shape="circle"
                  className="social-button fa-brands fa-facebook-f facebook"
                />
                <Button
                  icon={<GoogleOutlined />}
                  shape="circle"
                  className="social-button google"
                />
                <Button
                  icon={<TwitterOutlined />}
                  shape="circle"
                  className="social-button twitter"
                />
              </div>
            </div>
          </Form> */}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
