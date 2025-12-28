
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import mongoose from 'mongoose';

// Define a context type for clarity and type safety
interface RouteContext {
  params: {
    id: string;
    questionId: string;
  };
}

// PUT: Update a specific question
export async function PUT(req: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // EXPLANATION: Safely extracting IDs from the new context object.
  // This fixes the 'params should be awaited' error permanently.
  const { id, questionId } = context.params;
  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(questionId)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
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

    const question = quiz.questions.id(questionId);
    if (!question) {
      return NextResponse.json({ message: 'Question not found' }, { status: 404 });
    }

    // EXPLANATION: This logic is now complete and handles all question types.
    question.questionText = questionText;
    question.questionType = questionType;

    if (questionType === 'two_choices' || questionType === 'four_choices') {
      if (!options || !Array.isArray(options) || correctOptionIndex === undefined) {
        return NextResponse.json({ message: 'Missing fields for multiple-choice' }, { status: 400 });
      }
      const formattedOptions = options.map((optionText: string, index: number) => ({
        optionText,
        isCorrect: index === correctOptionIndex,
      }));
      question.options = formattedOptions;
      question.correctAnswer = undefined; // Clear unused field

    } else if (questionType === 'input') {
      if (correctAnswer === undefined) {
        return NextResponse.json({ message: 'Missing correctAnswer for input type' }, { status: 400 });
      }
      question.correctAnswer = correctAnswer;
      question.options = []; // Clear unused field

    } else {
      return NextResponse.json({ message: 'Invalid question type' }, { status: 400 });
    }

    await quiz.save();
    
    return NextResponse.json({ message: 'Question updated successfully', question: question.toObject() }, { status: 200 });

  } catch (error) {
    console.error('Failed to update question', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a specific question
export async function DELETE(req: NextRequest, context: RouteContext) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // EXPLANATION: Applying the same robust fix to the DELETE method.
    const { id, questionId } = context.params;
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
            // If the question is already gone, we can consider the job done.
            return NextResponse.json({ message: 'Question not found' }, { status: 404 });
        }

        question.deleteOne();

        await quiz.save();
        
        return NextResponse.json({ message: 'Question deleted successfully' }, { status: 200 });

    } catch (error) {
        console.error('Failed to delete question', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
