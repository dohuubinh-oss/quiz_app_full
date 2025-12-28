'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Typography, Radio } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import type { IQuestion } from '@/models/Quiz';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface QuestionFormProps {
  initialData?: IQuestion & { _id?: string };
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const transformDataForForm = (question?: IQuestion & { _id?: string }) => {
  if (!question) {
    return {
      questionText: '',
      questionType: 'four_choices',
      option_a: '', option_b: '', option_c: '', option_d: '',
      correctAnswer: '',
    };
  }

  let optionsData = {};
  let correctAnswerValue = '';

  if (question.questionType === 'two_choices' || question.questionType === 'four_choices') {
    optionsData = {
      option_a: question.options?.[0]?.optionText || '',
      option_b: question.options?.[1]?.optionText || '',
      option_c: question.options?.[2]?.optionText || '',
      option_d: question.options?.[3]?.optionText || '',
    };
    const correctIndex = question.options?.findIndex(opt => opt.isCorrect) ?? -1;
    correctAnswerValue = ['a', 'b', 'c', 'd'][correctIndex] || '';
  } else if (question.questionType === 'input') {
    correctAnswerValue = question.correctAnswer || '';
  }

  return {
    questionText: question.questionText,
    questionType: question.questionType,
    ...optionsData,
    correctAnswer: correctAnswerValue,
  };
};


const QuestionForm: React.FC<QuestionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {

  const formDefaultValues = transformDataForForm(initialData);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: formDefaultValues });

  const questionType = watch('questionType');
  const [correctRadio, setCorrectRadio] = useState(formDefaultValues.correctAnswer);

  useEffect(() => {
    const newDefaultValues = transformDataForForm(initialData);
    reset(newDefaultValues);
    setCorrectRadio(newDefaultValues.correctAnswer);
  }, [initialData, reset]);

  useEffect(() => {
    if (questionType !== 'input') {
        setValue('correctAnswer', correctRadio);
    }
  }, [correctRadio, questionType, setValue]);

  // --- EXPLANATION: THIS IS THE FINAL, CORRECT FIX. ---
  // The client-side form now creates a payload that perfectly matches what the
  // server-side API endpoint expects, resolving the 'CastError' permanently.
  const handleFormSubmit = (data: any) => {
    const { questionText, questionType, correctAnswer } = data;
    let apiPayload: Partial<IQuestion> & { correctOptionIndex?: number } = { questionText, questionType };

    if (questionType === 'two_choices' || questionType === 'four_choices') {
        const options = (questionType === 'two_choices')
            ? [data.option_a, data.option_b]
            : [data.option_a, data.option_b, data.option_c, data.option_d];
        
        // The API now expects an array of simple strings for the options.
        apiPayload.options = options;
        
        // The API also expects the index of the correct option.
        apiPayload.correctOptionIndex = ['a', 'b', 'c', 'd'].indexOf(data.correctAnswer);

    } else if (questionType === 'input') {
        apiPayload.correctAnswer = correctAnswer;
    }
    onSubmit(apiPayload);
  };

  return (
    <Card className="shadow-xl border-0 rounded-3xl overflow-hidden bg-white animate-fade-in-up">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 border-b border-gray-100">
        <Title level={3} className="mb-3 text-gray-800">
          {initialData?._id ? '✏️ Edit Question' : '➕ Add New Question'}
        </Title>
        <Paragraph className="text-gray-600 mb-0 text-lg">
          Create engaging questions for your quiz
        </Paragraph>
      </div>

      <div className="p-8">
        <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
          <div className="space-y-8">
            {/* Question Text */}
            <Controller
              name="questionText"
              control={control}
              rules={{ required: 'Question text is required' }}
              render={({ field, fieldState }) => (
                <Form.Item
                  label={<span className="text-gray-700 font-semibold text-lg">📝 Question Text</span>}
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <TextArea
                    {...field}
                    rows={3}
                    placeholder="Enter your question here..."
                    className="text-lg border-2 border-gray-200 rounded-2xl hover:border-blue-400 focus:border-blue-500 transition-all duration-300 shadow-sm focus:shadow-lg"
                  />
                </Form.Item>
              )}
            />

            {/* Question Type */}
            <Controller
              name="questionType"
              control={control}
              rules={{ required: 'Question type is required' }}
              render={({ field, fieldState }) => (
                <Form.Item
                  label={<span className="text-gray-700 font-semibold text-lg">🎯 Question Type</span>}
                  validateStatus={fieldState.error ? 'error' : ''}
                  help={fieldState.error?.message}
                >
                  <Select
                    {...field}
                    placeholder="Select question type"
                    size="large"
                    className="rounded-2xl"
                    onChange={value => {
                      field.onChange(value);
                      setCorrectRadio(''); 
                    }}
                  >
                    <Option value="two_choices"><div className="flex items-center space-x-3 py-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="font-medium">Two Choices (Binary Choice)</span></div></Option>
                    <Option value="four_choices"><div className="flex items-center space-x-3 py-2"><div className="w-3 h-3 bg-purple-500 rounded-full"></div><span className="font-medium">Four Choices (Multiple Choice)</span></div></Option>
                    <Option value="input"><div className="flex items-center space-x-3 py-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span className="font-medium">Text Input</span></div></Option>
                  </Select>
                </Form.Item>
              )}
            />

            {/* Answer Options */}
            {(questionType === 'two_choices' || questionType === 'four_choices') && (
              <div className="space-y-6">
                <div className="flex justify-between items-center"><Title level={4} className="mb-0 text-gray-700">🎨 Answer Options</Title><Paragraph className="text-sm text-gray-500 mb-0">Select the correct answer below</Paragraph></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Controller name="option_a" control={control} rules={{ required: 'Option A is required' }} render={({ field, fieldState }) => (<Form.Item validateStatus={fieldState.error ? 'error' : ''} help={fieldState.error?.message}><div className="space-y-3"><div className="flex items-center space-x-3"><Radio checked={correctRadio === 'a'} onChange={() => setCorrectRadio('a')} className="text-lg" /><span className="font-semibold text-gray-700">Option A</span></div><Input {...field} placeholder="Enter option A" size="large" className="border-2 border-gray-200 rounded-xl hover:border-blue-400 focus:border-blue-500 transition-all duration-300" /></div></Form.Item>)} />
                  <Controller name="option_b" control={control} rules={{ required: 'Option B is required' }} render={({ field, fieldState }) => (<Form.Item validateStatus={fieldState.error ? 'error' : ''} help={fieldState.error?.message}><div className="space-y-3"><div className="flex items-center space-x-3"><Radio checked={correctRadio === 'b'} onChange={() => setCorrectRadio('b')} className="text-lg" /><span className="font-semibold text-gray-700">Option B</span></div><Input {...field} placeholder="Enter option B" size="large" className="border-2 border-gray-200 rounded-xl hover:border-blue-400 focus:border-blue-500 transition-all duration-300" /></div></Form.Item>)} />
                  {questionType === 'four_choices' && (<>
                    <Controller name="option_c" control={control} rules={{ required: 'Option C is required' }} render={({ field, fieldState }) => (<Form.Item validateStatus={fieldState.error ? 'error' : ''} help={fieldState.error?.message}><div className="space-y-3"><div className="flex items-center space-x-3"><Radio checked={correctRadio === 'c'} onChange={() => setCorrectRadio('c')} className="text-lg" /><span className="font-semibold text-gray-700">Option C</span></div><Input {...field} placeholder="Enter option C" size="large" className="border-2 border-gray-200 rounded-xl hover:border-blue-400 focus:border-blue-500 transition-all duration-300" /></div></Form.Item>)} />
                    <Controller name="option_d" control={control} rules={{ required: 'Option D is required' }} render={({ field, fieldState }) => (<Form.Item validateStatus={fieldState.error ? 'error' : ''} help={fieldState.error?.message}><div className="space-y-3"><div className="flex items-center space-x-3"><Radio checked={correctRadio === 'd'} onChange={() => setCorrectRadio('d')} className="text-lg" /><span className="font-semibold text-gray-700">Option D</span></div><Input {...field} placeholder="Enter option D" size="large" className="border-2 border-gray-200 rounded-xl hover:border-blue-400 focus:border-blue-500 transition-all duration-300" /></div></Form.Item>)} />
                  </>)}
                </div>
                {/* Correct Answer Validation */}
                <Controller
                  name="correctAnswer"
                  control={control}
                  rules={{ required: 'Please select the correct answer' }}
                  render={({ fieldState }) => (<Form.Item validateStatus={fieldState.error ? 'error' : ''} help={fieldState.error?.message}><input type="hidden" value={correctRadio} /></Form.Item>)}
                />
              </div>
            )}

            {/* Text Input Answer */}
            {questionType === 'input' && (
              <Controller
                name="correctAnswer"
                control={control}
                rules={{ required: 'Correct answer is required for text input questions'}}
                render={({ field, fieldState }) => (
                  <Form.Item
                    label={<span className="text-gray-700 font-semibold text-lg">✅ Correct Answer</span>}
                    validateStatus={fieldState.error ? 'error' : ''}
                    help={fieldState.error?.message}
                  >
                    <Input {...field} placeholder="Enter the correct answer" size="large" className="border-2 border-gray-200 rounded-xl hover:border-blue-400 focus:border-blue-500 transition-all duration-300 shadow-sm focus:shadow-lg" />
                  </Form.Item>
                )}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-100 mt-8">
            <Button onClick={onCancel} size="large" className="h-12 px-8 border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 rounded-xl font-medium">Cancel</Button>
            <Button type="primary" htmlType="submit" size="large" className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl font-medium">
              {initialData?._id ? '✏️ Update Question' : '➕ Add Question'}
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );
};

export default QuestionForm;
