'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Typography, Button, Tag } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  MenuOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { IQuestion } from '@/models/Quiz';

const { Title, Text } = Typography;

interface SortableQuestionProps {
  question: IQuestion & { id: string };
  index: number;
  onEdit: (question: IQuestion & { id: string }) => void;
  onDelete: (questionId: string) => void;
}

export function SortableQuestion({
  question,
  index,
  onEdit,
  onDelete,
}: SortableQuestionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'two_choices': return <Tag color="blue">Two Choices</Tag>;
      case 'four_choices': return <Tag color="purple">Four Choices</Tag>;
      case 'input': return <Tag color="green">Text Input</Tag>;
      default: return <Tag>Unknown</Tag>;
    }
  };

  // The getSortedOptions function is no longer needed because the `question.options` array 
  // from the API is already in the correct A, B, C, D order.

  return (
    <div ref={setNodeRef} style={style} className="mb-6">
      <Card
        className={`
        border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden
        ${isDragging ? "shadow-2xl scale-105 rotate-2" : "hover:-translate-y-1"}
        bg-white
      `}
      >
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <Button type="text" icon={<MenuOutlined />} className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 rounded-xl mt-1" {...attributes} {...listeners} />
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Title level={5} className="mb-0 text-gray-800 line-clamp-2">
                      {question.questionText}
                    </Title>
                    {getQuestionTypeLabel(question.questionType)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(question)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 rounded-xl" />
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(question.id)} className="hover:bg-red-50 transition-all duration-200 rounded-xl" />
                </div>
              </div>

              {(question.questionType === 'two_choices' || question.questionType === 'four_choices') && question.options && (
                <div className="space-y-3">
                  <Text className="text-sm text-gray-500 font-medium">Answer Options:</Text>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {question.options.map((option, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border-2 transition-all duration-200 ${option.isCorrect ? "bg-green-50 border-green-200 shadow-sm" : "bg-gray-50 border-gray-200"}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${option.isCorrect ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"}`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className={`flex-1 ${option.isCorrect ? "font-medium text-green-800" : "text-gray-700"}`}>{option.optionText}</span>
                          {option.isCorrect && <CheckCircleOutlined className="text-green-500 text-lg" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.questionType === 'input' && (
                <div className="space-y-3">
                  <Text className="text-sm text-gray-500 font-medium">Correct Answer:</Text>
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <CheckCircleOutlined className="text-green-500 text-lg" />
                      <span className="font-medium text-green-800">{question.correctAnswer}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
