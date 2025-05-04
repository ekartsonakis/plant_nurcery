import React from 'react';
import Layout from '../components/layout/Layout';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const ForgotPasswordPage: React.FC = () => {
  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <ForgotPasswordForm />
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;