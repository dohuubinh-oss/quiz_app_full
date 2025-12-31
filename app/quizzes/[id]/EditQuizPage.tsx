
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Spin,
  Input,
  Form,
  Card,
  Modal,
  Upload,
  Tooltip,
  App,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  CheckOutlined,
  InboxOutlined,
  StopOutlined,
  LinkOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useQuiz } from '@/api/hooks/useQuiz';
import {
  useUpdateQuiz,
  useTogglePublishQuiz,
  useDeleteQuiz,
} from '@/api/hooks/useQuizzes';
import {
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useReorderQuestions,
} from '@/api/hooks/useQuestions';
import QuestionForm from '@/components/quiz/QuestionForm';
import SortableQuestionList from '@/components/quiz/SortableQuestionList';
import WordQuestionImporter from '@/components/quiz/WordQuestionImporter';
import type { IQuestion } from '@/models/Quiz';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import axios from 'axios';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post("/api/upload", formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.imageUrl;
  } catch (error) {
    console.error("Image upload failed", error);
    return null;
  }
};

function EditQuizPage({ quizId }: { quizId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { message } = App.useApp();

  const { data: quiz, isLoading: isLoadingQuiz, refetch: refetchQuiz } = useQuiz(quizId);

  const updateQuizMutation = useUpdateQuiz();
  const togglePublishMutation = useTogglePublishQuiz();
  const deleteQuizMutation = useDeleteQuiz();

  const createQuestionMutation = useCreateQuestion(quizId);
  const updateQuestionMutation = useUpdateQuestion(quizId);
  const deleteQuestionMutation = useDeleteQuestion(quizId);
  const reorderQuestionsMutation = useReorderQuestions(quizId);

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<IQuestion | null>(null);
  const [form] = Form.useForm();
  const [newCoverImageFile, setNewCoverImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const [deleteQuestionModalVisible, setDeleteQuestionModalVisible] =
    useState(false);
  const [deleteQuizModalVisible, setDeleteQuizModalVisible] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (quiz?.coverImage) {
      setPreviewImage(quiz.coverImage);
    }
    if (quiz) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/quizzes/${quizId}/published`);
      form.setFieldsValue({ title: quiz.title, description: quiz.description });
    }
  }, [quiz, quizId, form]);

  useEffect(() => {
    if (quiz && user && quiz.authorId.toString() !== user.id) {
      message.error("You don't have permission to edit this quiz");
      router.push('/quizzes');
    }
  }, [quiz, user, router, message]);

  const handleUpdateQuiz = async (values: any) => {
    try {
      setSubmitting(true);
      let coverImageUrl = quiz?.coverImage || null;

      if (newCoverImageFile) {
        const newUrl = await uploadImage(newCoverImageFile);
        if (newUrl) {
          coverImageUrl = newUrl;
        } else {
          message.error('Failed to upload new cover image');
          setSubmitting(false);
          return;
        }
      }

      await updateQuizMutation.mutateAsync({
        id: quizId,
        updates: {
          ...values,
          coverImage: coverImageUrl,
        },
      });

      message.success('Quiz updated successfully');
      setNewCoverImageFile(null);
      router.push('/quizzes');
    } catch (error) {
      message.error('Failed to update quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async () => {
    const currentQuestions = quiz?.questions || [];
    if (!quiz?.isPublished && currentQuestions.length === 0) {
      message.error('Cannot publish a quiz with no questions');
      return;
    }

    try {
      await togglePublishMutation.mutateAsync({
        id: quizId,
        isPublished: !quiz?.isPublished,
      });

      message.success(
        quiz?.isPublished
          ? 'Quiz unpublished successfully'
          : 'Quiz published successfully'
      );

      if (!quiz?.isPublished) {
        router.push(`/quizzes/${quizId}/published`);
      }
    } catch (error) {
      message.error(
        quiz?.isPublished ? 'Failed to unpublish quiz' : 'Failed to publish quiz'
      );
    }
  };

  const handleImageChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    setNewCoverImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: () => false,
    onChange: handleImageChange,
  };

  const handleDeleteQuizClick = () => {
    setDeleteQuizModalVisible(true);
  };

  const handleDeleteQuizConfirm = async () => {
    try {
      await deleteQuizMutation.mutateAsync(quizId);
      message.success('Quiz deleted successfully');
      setDeleteQuizModalVisible(false);
      router.push('/quizzes');
    } catch (error) {
      message.error('Failed to delete quiz');
    }
  };

  const handleDeleteQuizCancel = () => {
    setDeleteQuizModalVisible(false);
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionForm(true);
  };

  const handleEditQuestion = (question: IQuestion) => {
    setEditingQuestion(question);
    setShowQuestionForm(true);
  };

  const handleDeleteQuestionClick = (questionId: string) => {
    setQuestionToDelete(questionId);
    setDeleteQuestionModalVisible(true);
  };

  const handleDeleteQuestionConfirm = async () => {
    if (!questionToDelete) return;
    try {
      await deleteQuestionMutation.mutateAsync(questionToDelete);
      message.success('Question deleted successfully');
    } catch (error) {
      message.error('Failed to delete question');
    } finally {
      setDeleteQuestionModalVisible(false);
      setQuestionToDelete(null);
    }
  };

  const handleDeleteQuestionCancel = () => {
    setDeleteQuestionModalVisible(false);
    setQuestionToDelete(null);
  };

  const handleQuestionSubmit = async (data: any) => {
    try {
      if (editingQuestion) {
        await updateQuestionMutation.mutateAsync({
          questionId: editingQuestion._id.toString(),
          updates: data,
        });
        message.success('Question updated successfully');
      } else {
        await createQuestionMutation.mutateAsync(data);
        message.success('Question added successfully');
      }
      setShowQuestionForm(false);
      setEditingQuestion(null);
    } catch (error) {
      message.error('Failed to save question');
    }
  };

  const handleReorderQuestions = async (reorderedQuestions: IQuestion[]) => {
    try {
      const questionIds = reorderedQuestions.map((q) => q._id.toString());
      await reorderQuestionsMutation.mutateAsync({ questionIds });
    } catch (error) {
      message.error('Failed to reorder questions');
    }
  };

  const handleImportSuccess = () => {
    refetchQuiz();
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

  const questions = quiz.questions || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <Title
                level={1}
                className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                Edit Quiz
              </Title>
              <Paragraph className="text-gray-600 text-lg">
                Customize your quiz and manage questions
              </Paragraph>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {quiz.isPublished && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm text-green-700 font-medium">
                    Share:
                  </span>
                  <CopyToClipboard
                    text={shareUrl}
                    onCopy={() => message.success('Link copied to clipboard!')}
                  >
                    <Tooltip title="Copy link">
                      <Button
                        icon={<LinkOutlined />}
                        size="small"
                        className="border-green-300 text-green-600 hover:bg-green-100"
                      />
                    </Tooltip>
                  </CopyToClipboard>
                </div>
              )}

              <Button
                icon={<EyeOutlined />}
                onClick={() =>
                  router.push(
                    `/quizzes/${quizId}/${quiz.isPublished ? 'published' : 'preview'}`
                  )
                }
                className="bg-gray-50 border-gray-200 hover:bg-gray-100 transition-all duration-200"
                size="large"
              >
                {quiz.isPublished ? 'View Live' : 'Preview'}
              </Button>

              <Button
                type={quiz.isPublished ? 'default' : 'primary'}
                icon={quiz.isPublished ? <StopOutlined /> : <CheckOutlined />}
                danger={quiz.isPublished}
                onClick={handleTogglePublish}
                disabled={!quiz.isPublished && questions.length === 0}
                size="large"
                className={`transition-all duration-200 ${
                  quiz.isPublished
                    ? 'hover:shadow-lg'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:shadow-lg hover:scale-105'
                }`}
              >
                {quiz.isPublished ? 'Unpublish' : 'Publish Quiz'}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteQuizClick}
                size="large"
                className="hover:shadow-lg transition-all duration-200"
              >
                Delete Quiz
              </Button>
            </div>
          </div>
        </div>

        <Card variant="borderless" className="mb-8 shadow-sm rounded-2xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
            <Title level={3} className="mb-2 text-gray-800">
              Quiz Details
            </Title>
            <Paragraph className="text-gray-600 mb-0">
              Update your quiz information and cover image
            </Paragraph>
          </div>

          <div className="p-6">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                title: quiz.title,
                description: quiz.description,
              }}
              onFinish={handleUpdateQuiz}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Quiz Title</span>}
                    name="title"
                    rules={[{ required: true, message: 'Please enter a title' }]}
                  >
                    <Input
                      placeholder="Enter an engaging quiz title"
                      className="h-12 text-lg border-gray-200 rounded-lg hover:border-blue-400 focus:border-blue-500 transition-colors"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Description</span>}
                    name="description"
                    rules={[{ required: true, message: 'Please enter a description' }]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Describe what this quiz is about..."
                      className="border-gray-200 rounded-lg hover:border-blue-400 focus:border-blue-500 transition-colors"
                    />
                  </Form.Item>
                </div>

                <div>
                  <Form.Item label={<span className="text-gray-700 font-medium">Cover Image</span>}>
                    {previewImage ? (
                      <div className="relative group">
                        <div
                          className="relative w-full h-48 cursor-pointer rounded-xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors"
                          onClick={() => setPreviewVisible(true)}
                        >
                          <Image
                            src={previewImage || '/placeholder.svg'}
                            alt="Cover preview"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <EyeOutlined className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => { setNewCoverImageFile(null); setPreviewImage(null); }}
                          className="mt-3 border-gray-300 hover:border-blue-400 transition-colors"
                        >
                          Change Image
                        </Button>
                      </div>
                    ) : (
                      <Dragger
                        {...uploadProps}
                        className="rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors"
                      >
                        <p className="ant-upload-drag-icon"><InboxOutlined className="text-4xl text-blue-500" /></p>
                        <p className="ant-upload-text text-gray-700 font-medium">Click or drag file to upload</p>
                        <p className="ant-upload-hint text-gray-500">Support for single image upload. Max size: 2MB</p>
                      </Dragger>
                    )}
                  </Form.Item>
                </div>
              </div>

              <Form.Item className="mb-0 pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Update Quiz Details
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Card>

        <Card variant="borderless" className="shadow-sm rounded-2xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Title level={3} className="mb-2 text-gray-800">Questions ({questions.length})</Title>
                <Paragraph className="text-gray-600 mb-0">Drag questions to reorder them</Paragraph>
              </div>
              <div className="flex items-center gap-3">
                <WordQuestionImporter quizId={quizId} onImportSuccess={handleImportSuccess} />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddQuestion}
                  size="large"
                  className="bg-gradient-to-r from-green-500 to-blue-500 border-0 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Add Question
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {showQuestionForm && (
              <div className="mb-8">
                <QuestionForm
                  initialData={editingQuestion ? { ...editingQuestion, id: editingQuestion._id.toString() } : undefined}
                  onSubmit={handleQuestionSubmit}
                  onCancel={() => { setShowQuestionForm(false); setEditingQuestion(null); }}
                />
              </div>
            )}

            <SortableQuestionList
              questions={questions.map(q => ({ ...q, id: q._id.toString() }))}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestionClick}
              onReorder={handleReorderQuestions}
            />
          </div>
        </Card>

        <Modal open={previewVisible} title="Cover Image Preview" footer={null} onCancel={() => setPreviewVisible(false)} className="rounded-2xl overflow-hidden">
          {previewImage && <img alt="Cover preview" style={{ width: '100%' }} src={previewImage || '/placeholder.svg'} className="rounded-lg" />}
        </Modal>

        <Modal
          title={<div className="flex items-center gap-2"><ExclamationCircleOutlined className="text-red-500" /><span>Delete Question</span></div>}
          open={deleteQuestionModalVisible}
          onOk={handleDeleteQuestionConfirm}
          onCancel={handleDeleteQuestionCancel}
          okText="Delete"
          cancelText="Cancel"
          okType="danger"
          confirmLoading={deleteQuestionMutation.isPending}
        >
          <p>Are you sure you want to delete this question?</p>
          <p className="text-gray-500">This action cannot be undone.</p>
        </Modal>

        <Modal
          title={<div className="flex items-center gap-2"><DeleteOutlined className="text-red-500" /><span>Delete Quiz</span></div>}
          open={deleteQuizModalVisible}
          onOk={handleDeleteQuizConfirm}
          onCancel={handleDeleteQuizCancel}
          okText="Delete Quiz"
          cancelText="Cancel"
          okType="danger"
          confirmLoading={deleteQuizMutation.isPending}
        >
          <p>Are you sure you want to delete <strong>"{quiz?.title}"</strong>?</p>
          <p className="text-gray-500">This action cannot be undone and will remove all questions.</p>
        </Modal>
      </div>
    </div>
  );
}

export default function EditQuizPageWrapper({ quizId }: { quizId: string }) {
  return (
    <App>
      <EditQuizPage quizId={quizId} />
    </App>
  );
}
