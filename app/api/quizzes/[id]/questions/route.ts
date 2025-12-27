
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import mongoose from 'mongoose';

// POST: Tạo một câu hỏi mới cho một quiz
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid Quiz ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { text, options, correctOption } = body;

    // Xác thực đầu vào cơ bản
    if (!text || !options || !Array.isArray(options) || options.length < 2 || correctOption === undefined) {
      return NextResponse.json({ message: 'Missing or invalid required question fields' }, { status: 400 });
    }

    await dbConnect();
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Kiểm tra quyền sở hữu
    if (quiz.authorId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const newQuestion = {
      _id: new mongoose.Types.ObjectId(), // Tạo ID mới cho sub-document
      text,
      options,
      correctOption,
    };

    quiz.questions.push(newQuestion);
    await quiz.save();
    
    // Câu hỏi vừa được tạo là phần tử cuối cùng trong mảng
    const createdQuestion = quiz.questions[quiz.questions.length - 1];
    return NextResponse.json({ message: 'Question added successfully', question: createdQuestion }, { status: 201 });

  } catch (error) {
    console.error('Failed to create question', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Sắp xếp lại các câu hỏi cho một quiz
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ message: 'Invalid Quiz ID' }, { status: 400 });
    }

    try {
        const { questionIds } = await req.json();

        if (!Array.isArray(questionIds)) {
            return NextResponse.json({ message: 'Invalid payload: questionIds must be an array' }, { status: 400 });
        }

        await dbConnect();
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
        }

        if (quiz.authorId.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const questionMap = new Map(quiz.questions.map(q => [q._id.toString(), q]));
        const reorderedQuestions = questionIds.map(id => questionMap.get(id)).filter(Boolean);
        
        if (reorderedQuestions.length !== quiz.questions.length) {
             return NextResponse.json({ message: 'Question list mismatch' }, { status: 400 });
        }

        quiz.questions = reorderedQuestions as any; // Ghi đè mảng cũ bằng mảng đã sắp xếp lại
        await quiz.save();
        
        return NextResponse.json({ message: 'Questions reordered successfully' }, { status: 200 });

    } catch (error) {
        console.error('Failed to reorder questions', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
