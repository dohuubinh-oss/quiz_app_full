
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Button, Spin, Space, App, Card } from 'antd';
import { EditOutlined, CheckOutlined } from '@ant-design/icons';
import { useQuiz } from '@/api/hooks/useQuiz';
import { useTogglePublishQuiz } from '@/api/hooks/useQuizzes';
import QuizPreview from '@/components/quiz/QuizPreview';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';

const { Title, Paragraph } = Typography;

function PreviewQuizPage({ quizId }: { quizId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { message } = App.useApp();

  const { data: quiz, isLoading: isLoadingQuiz } = useQuiz(quizId);
  const togglePublishMutation = useTogglePublishQuiz();

  useEffect(() => {
    if (quiz && user && quiz.authorId.toString() !== user.id) {
      message.error("You don't have permission to preview this quiz");
      router.push('/quizzes');
    }
  }, [quiz, user, router, message]);
  
  const questions = quiz?.questions || [];

  const handlePublish = async () => {
    if (questions.length === 0) {
      message.error('Cannot publish a quiz with no questions');
      return;
    }

    await togglePublishMutation.mutateAsync({
      id: quizId,
      isPublished: true,
    });
    message.success('Quiz published successfully');
    router.push(`/quizzes/${quizId}/published`);
  };

  if (isLoadingQuiz) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center">
        <Title level={4} className="text-red-500">
          Quiz not found
        </Title>
        <Paragraph>
          The quiz you're looking for doesn't exist or has been removed.
        </Paragraph>
        <Button type="primary" onClick={() => router.push('/quizzes')}>
          Back to Quizzes
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Preview Quiz</Title>
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/quizzes/${quizId}`)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handlePublish}
            disabled={questions.length === 0}
          >
            Publish
          </Button>
        </Space>
      </div>

      {quiz.coverImage && (
        <Card className="mb-6 overflow-hidden shadow-sm">
          <div className="relative h-48 w-full">
            <Image
              src={quiz.coverImage || '/placeholder.svg'}
              alt={quiz.title}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <div className="mt-4">
            <Title level={3}>{quiz.title}</Title>
            <Paragraph>{quiz.description}</Paragraph>
          </div>
        </Card>
      )}

      <QuizPreview quiz={quiz} questions={questions} readOnly={true} />
    </div>
  );
}

export default function PreviewQuizPageWrapper({ quizId }: { quizId: string }) {
  return (
    <App>
      <PreviewQuizPage quizId={quizId} />
    </App>
  );
}
