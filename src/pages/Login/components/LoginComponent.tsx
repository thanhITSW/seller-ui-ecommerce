import React from 'react';
import LoginForm from '../LoginForm';
import { notification } from 'antd';

const App: React.FC = () => {


  const handleLogin = (email: string, password: string, remember: boolean) => {
    console.log('Login attempt:', { email, password, remember });
    setTimeout(() => {
      notification.success({
        message: 'Login Successful',
        description: 'You have successfully logged in.'
      });
    }, 5000);
    
  };


  const handleGoogleLogin = () => {
    console.log('Google login attempt');
    // message.info('Google authentication initiated');
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login attempt');
    // message.info('Facebook authentication initiated');
  };

  return (
    <div className="app">
      <LoginForm
        handleLogin={handleLogin}
        handleGoogleLogin={handleGoogleLogin}
        handleFacebookLogin={handleFacebookLogin}
      />
    </div>
  );
};

export default App;