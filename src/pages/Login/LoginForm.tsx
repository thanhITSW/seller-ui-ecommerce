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
import { setLoginStatus } from "@/redux/slices/authSlice";
import { useDispatch } from "react-redux";


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

  const onSubmitLoginForm = useSubmitForm(async (values: LoginInformation) => {
    // Call API and handle logic
    const {ok, body} = await authApi.login(values);
    if (ok) {
      console.log('login success', body);
      dispatch(setLoginStatus(true))
      navigate('/my/error')
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
            Welcome To <span className="brand-name">Annakoot</span>
          </h1>
          <p className="login-description">
            Please sign-in to your account and start the adventure
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
                label={t("input.emailOrUsername.label")}
                id="emailOrUsername"
                name="emailOrUsername"
                placeholder="Enter Your Email Or User Name"
                size="large"
                maxLength={MAX_LENGTH.EMAIL}
                rules={[
                  {
                    required: true,
                    message: et("input.validation.email.required"),
                  },
                  {
                    pattern: EMAIL_REGEX,
                    message: et("input.validation.email.pattern"),
                  },
                ]}
              />

              <PasswordInputField
                className="input-primary"
                name="password"
                id="password"
                size="large"
                label={t("input.password.label")}
                placeholder={t("input.password.placeholder")}
                maxLength={MAX_LENGTH.PASSWORD}
                rules={[
                  {
                    required: true,
                    message: et("input.validation.password.required"),
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
