
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/mongodb';
import { Quiz } from '@/models/Quiz';
import mongoose from 'mongoose';

// POST: Create a new question for a quiz
export async function POST(req: NextRequest, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid Quiz ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { questionText, options, correctOptionIndex } = body;

    if (!questionText || !options || !Array.isArray(options) || options.length < 2 || correctOptionIndex === undefined) {
      return NextResponse.json({ message: 'Missing or invalid required question fields' }, { status: 400 });
    }

    await dbConnect();
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.authorId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const formattedOptions = options.map((optionText: string, index: number) => ({
      optionText,
      isCorrect: index === correctOptionIndex,
    }));

    const newQuestion = {
      _id: new mongoose.Types.ObjectId(),
      questionText: questionText, // Use camelCase
      options: formattedOptions,
    };

    quiz.questions.push(newQuestion as any);
    await quiz.save();
    
    const createdQuestion = quiz.questions[quiz.questions.length - 1];
    const questionObj = createdQuestion.toObject();

    const result = { 
      ...questionObj, 
      id: questionObj._id.toString(),
    };

    return NextResponse.json({ message: 'Question added successfully', question: result }, { status: 201 });

  } catch (error) {
    console.error('Failed to create question', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Reorder questions for a quiz
export async function PUT(req: NextRequest, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
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

        quiz.questions = reorderedQuestions as any;
        await quiz.save();
        
        return NextResponse.json({ message: 'Questions reordered successfully' }, { status: 200 });

    } catch (error) {
        console.error('Failed to reorder questions', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
