
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/mongodb';
import { Quiz } from '@/models/Quiz';

// Define a context type for clarity and type safety
interface RouteContext {
  params: {
    id: string;
  };
}

// GET: Retrieve a single quiz
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await dbConnect();
    // EXPLANATION: Switched to the consistent 'context.params' method.
    // No 'await' is needed here, making the code cleaner and more modern.
    const { id } = context.params;
    const quizFromDb = await Quiz.findById(id).populate('questions').lean();

    if (!quizFromDb) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const quiz = {
      ...quizFromDb,
      id: quizFromDb._id.toString(),
      questions: quizFromDb.questions.map((q: any) => ({
        ...q,
        id: q._id.toString(),
      })),
    };

    return NextResponse.json(quiz, { status: 200 });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update quiz details (e.g., title, description)
export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    // EXPLANATION: Applying the same modern pattern to the PUT method.
    const { id } = context.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.authorId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    // Sanitize input to prevent unwanted updates
    delete body.authorId;
    delete body.questions;
    delete body._id;
    delete body.id;

    const updatedQuizFromDb = await Quiz.findByIdAndUpdate(id, body, { new: true }).lean();
    
    if (!updatedQuizFromDb) {
      return NextResponse.json({ message: 'Quiz not found after update' }, { status: 404 });
    }

    const updatedQuiz = {
      ...updatedQuizFromDb,
      id: updatedQuizFromDb._id.toString(),
    };

    return NextResponse.json(updatedQuiz, { status: 200 });
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete a quiz
export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    // EXPLANATION: Finalizing the pattern for the DELETE method.
    const { id } = context.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.authorId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await Quiz.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Quiz deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
