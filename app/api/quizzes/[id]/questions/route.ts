
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/mongodb';
import { Quiz, IQuestion } from '@/models/Quiz';
import mongoose from 'mongoose';

// Define a context type for clarity and type safety
interface RouteContext {
  params: {
    id: string;
  };
}

// POST: Create a new question for a quiz
export async function POST(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid Quiz ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { questionText, questionType, options, correctOptionIndex, correctAnswer } = body;

    await dbConnect();
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.authorId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // EXPLANATION: This is the fix. We now create a complete and consistent
    // object shape for the new question, explicitly clearing unused fields.
    // This prevents the 'Cast to string failed' error.
    let newQuestion: Partial<IQuestion> = {
        _id: new mongoose.Types.ObjectId(),
        questionText,
        questionType,
    };

    if (questionType === 'two_choices' || questionType === 'four_choices') {
      if (!questionText || !options || !Array.isArray(options) || options.length < 2 || correctOptionIndex === undefined) {
        return NextResponse.json({ message: 'Missing required fields for multiple-choice question' }, { status: 400 });
      }
      const formattedOptions = options.map((optionText: string, index: number) => ({
        optionText,
        isCorrect: index === correctOptionIndex,
      }));
      newQuestion.options = formattedOptions;
      newQuestion.correctAnswer = undefined; // Explicitly clear unused field

    } else if (questionType === 'input') {
      if (!questionText || !correctAnswer) {
        return NextResponse.json({ message: 'Missing required fields for text-input question' }, { status: 400 });
      }
      newQuestion.correctAnswer = correctAnswer;
      newQuestion.options = []; // Explicitly clear unused field

    } else {
      return NextResponse.json({ message: 'Invalid question type' }, { status: 400 });
    }

    quiz.questions.push(newQuestion as any);
    await quiz.save();
    
    const createdQuestion = quiz.questions[quiz.questions.length - 1];

    return NextResponse.json({
      message: 'Question added successfully',
      question: createdQuestion.toObject(),
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create question', error);
    if (error instanceof Error) {
      return NextResponse.json({ message: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Reorder questions for a quiz
export async function PUT(req: NextRequest, context: RouteContext) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = context.params;
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
