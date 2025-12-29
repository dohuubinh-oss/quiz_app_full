'use client';

import type React from 'react';
import { Card, Typography, Badge, Button } from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import type { Quiz } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';

const { Title, Paragraph, Text } = Typography;

interface QuizCardProps {
  quiz: Quiz;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const { user } = useAuth();
  const isOwner = user?.id === quiz.authorId;
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    if (quiz.createdAt) {
      setDate(new Date(quiz.createdAt).toLocaleDateString());
    }
  }, [quiz.createdAt]);

  return (
    <div className="group">
      <Card
        hoverable
        className="h-full flex flex-col overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white"
        cover={
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={quiz.coverImage || '/placeholder.svg?height=200&width=400'}
              alt={quiz.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              {quiz.published ? (
                <Badge.Ribbon
                  text="Published"
                  color="green"
                  className="animate-pulse"
                />
              ) : (
                isOwner && <Badge.Ribbon text="Draft" color="orange" />
              )}
            </div>

            {/* Overlay Actions */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex space-x-3">
                {isOwner && (
                  <Link href={`/quizzes/${quiz.id}`}>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 rounded-xl"
                    >
                      Edit
                    </Button>
                  </Link>
                )}
                <Link
                  href={
                    quiz.published
                      ? `/quizzes/${quiz.id}/published`
                      : `/quizzes/${quiz.id}/preview`
                  }
                >
                  <Button
                    type="primary"
                    icon={
                      quiz.published ? <PlayCircleOutlined /> : <EyeOutlined />
                    }
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 rounded-xl"
                  >
                    {quiz.published ? 'Take Quiz' : 'Preview'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        }
        styles={{ body: { padding: 0 } }}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex-grow">
            <Title
              level={4}
              className="mb-3 line-clamp-2 text-gray-800 group-hover:text-blue-600 transition-colors duration-300"
            >
              {quiz.title}
            </Title>
            <Paragraph className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
              {quiz.description}
            </Paragraph>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-gray-500">
              <CalendarOutlined className="text-sm" />
              <Text className="text-sm">
                {date}
              </Text>
            </div>

            <div className="flex items-center space-x-2">
              {quiz.published && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizCard;
