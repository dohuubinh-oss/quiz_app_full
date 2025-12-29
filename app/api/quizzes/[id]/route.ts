
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/mongodb';
import { Quiz } from '@/models/Quiz';

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await dbConnect();
    const { id } = await context.params;
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

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await context.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.authorId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const updatePayload: { [key: string]: any } = {};
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.coverImage !== undefined) updatePayload.coverImage = body.coverImage;
    if (body.isPublished !== undefined) updatePayload.isPublished = body.isPublished;

    if (Object.keys(updatePayload).length === 0) {
        return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }

    const updatedQuizFromDb = await Quiz.findByIdAndUpdate(
        id, 
        { $set: updatePayload },
        { new: true, runValidators: true }
    ).lean();
    
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
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const { id } = await context.params;
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
