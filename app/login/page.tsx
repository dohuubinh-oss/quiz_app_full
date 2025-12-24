'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, Form, Input, Button, Typography, Divider, App } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function LoginPage() {
  const { message } = App.useApp();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);

    try {
      if (isSignUp) {
        const result = await signUp(values.email, values.password);
        if (result?.error) {
          message.error(result.error);
        } else {
          message.success('Account created! Please sign in.');
          setIsSignUp(false); // Switch to sign-in form
        }
      } else {
        const result = await signIn(values.email, values.password);
        if (result?.error) {
          message.error('Invalid email or password'); // Generic message for security
        } else {
          message.success('Login successful!');
          router.push('/quizzes');
        }
      }
    } catch (error: any) {
      message.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <Title level={2}>{isSignUp ? 'Create an Account' : 'Welcome Back'}</Title>
          <Text type="secondary">
            {isSignUp ? 'Sign up to create and take quizzes' : 'Sign in to access your quizzes'}
          </Text>
        </div>

        <Form name="login" layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>Or</Divider>

        <div className="text-center">
          <Button type="link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
