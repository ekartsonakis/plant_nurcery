import React from 'react';
import Layout from '../components/layout/Layout';
import SignupForm from '../components/auth/SignupForm';

const SignupPage: React.FC = () => {
  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <SignupForm />
      </div>
    </Layout>
  );
};

export default SignupPage;