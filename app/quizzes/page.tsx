'use client';

import { useState } from 'react';
import { Typography, Row, Col, Spin, Pagination, Button, Input } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import QuizCard from '@/components/quiz/QuizCard';
import { useQuizzes } from '@/api/hooks/useQuizzes';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

export default function QuizzesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 9; // 3 quizzes per row, 3 rows
  const { user } = useAuth();

  // Use the React Query hook to fetch quizzes with pagination
  const {
    data: paginatedQuizzes,
    isLoading,
    error,
    isFetching,
  } = useQuizzes(currentPage, pageSize, true, searchTerm); // Pass true to indicate this can be a public route

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex justify-center items-center">
        <div className="text-center">
          <Title level={4} className="text-red-500 mb-4">
            Oops! Something went wrong
          </Title>
          <Paragraph className="text-gray-600">
            Please try again later.
          </Paragraph>
        </div>
      </div>
    );
  }

  const quizzes = paginatedQuizzes?.data || [];
  const total = paginatedQuizzes?.total || 0;

  if (!isLoading && quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center py-20">
            <div className="mb-8">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-6xl">📚</span>
              </div>
              <Title level={2} className="mb-4 text-gray-800">
                No quizzes found
              </Title>
              <Paragraph className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                {user
                  ? "Ready to create your first quiz? Let's get started!"
                  : 'Discover amazing quizzes created by our community!'}
              </Paragraph>
            </div>
            {user && (
              <Link href="/quizzes/new">
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  className="h-14 px-8 bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-2xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Create Your First Quiz
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <Title
            level={1}
            className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Discover Amazing Quizzes
          </Title>
          <Paragraph className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Test your knowledge, challenge your friends, and learn something new
            with our interactive quizzes
          </Paragraph>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <Input
              size="large"
              placeholder="Search quizzes..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 border-2 border-gray-200 rounded-2xl hover:border-blue-400 focus:border-blue-500 transition-all duration-300 shadow-sm focus:shadow-lg"
            />
          </div>
        </div>

        {isLoading && (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex justify-center items-center">
            <div className="text-center">
              <Spin size="large" className="mb-4" />
              <Paragraph className="text-gray-600">
                Loading amazing quizzes...
              </Paragraph>
            </div>
          </div>
        )}
        {/* Stats Bar */}
        <div className="flex justify-between items-center mb-8 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{total}</div>
              <div className="text-sm text-gray-600">Total Quizzes</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            {/* <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {quizzes.filter((q) => q.published).length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div> */}
          </div>

          <div className="flex items-center space-x-2">
            {isFetching && <Spin className="mr-2" />}
            <span className="text-sm text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, total)} of {total}
            </span>
          </div>
        </div>

        {/* Quiz Grid */}
        <div
          className={`transition-all duration-500 ${
            isFetching ? 'opacity-60' : 'opacity-100'
          }`}
        >
          <Row gutter={[32, 32]}>
            {quizzes.map((quiz, index) => (
              <Col xs={24} md={12} lg={8} key={quiz.id}>
                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <QuizCard quiz={quiz} />
                </div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex justify-center mt-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-sm">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                disabled={isFetching}
                className="custom-pagination"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
