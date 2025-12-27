
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import mongoose from 'mongoose';

// PUT: Cập nhật một câu hỏi cụ thể
export async function PUT(req: NextRequest, { params }: { params: { id: string, questionId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id, questionId } = params;
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(questionId)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }

  try {
    const body = await req.json();

    await dbConnect();
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.authorId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const question = quiz.questions.id(questionId);
    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // Cập nhật các trường
    question.text = body.text ?? question.text;
    question.options = body.options ?? question.options;
    question.correctOption = body.correctOption ?? question.correctOption;
    
    await quiz.save();
    
    return NextResponse.json({ message: 'Question updated successfully', question }, { status: 200 });

  } catch (error) {
    console.error('Failed to update question', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Xóa một câu hỏi cụ thể
export async function DELETE(req: NextRequest, { params }: { params: { id: string, questionId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id, questionId } = params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(questionId)) {
        return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    try {
        await dbConnect();
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
        }

        if (quiz.authorId.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const question = quiz.questions.id(questionId);
        if (!question) {
            // Nếu câu hỏi không tồn tại, coi như đã xóa thành công
            return NextResponse.json({ message: 'Question already deleted or not found' }, { status: 200 });
        }

        question.deleteOne();

        await quiz.save();
        
        return NextResponse.json({ message: 'Question deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Failed to delete question', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
