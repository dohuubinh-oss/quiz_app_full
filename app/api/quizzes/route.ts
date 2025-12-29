
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import dbConnect from '@/lib/mongodb';
import { Quiz } from '@/models/Quiz';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();

    const { title, description, coverImage } = body;

    if (!title || !description || !coverImage) {
      return NextResponse.json({ message: 'Title, description, and a cover image are required' }, { status: 400 });
    }

    const newQuizData = {
      title,
      description,
      coverImage,
      questions: [],
      isPublished: false,
      authorId: new mongoose.Types.ObjectId(session.user.id),
    };

    const newQuiz = new Quiz(newQuizData);

    await newQuiz.save();
    
    const quizObj = newQuiz.toObject();
    const result = {
      id: quizObj._id.toString(),
      title: quizObj.title,
      description: quizObj.description,
      published: quizObj.isPublished,
      coverImage: quizObj.coverImage || null,
      authorId: quizObj.authorId.toString(),
      createdAt: quizObj.createdAt.toISOString(),
      updatedAt: quizObj.updatedAt.toISOString(),
      questions: quizObj.questions,
    };

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Error creating quiz:', error);
    const errorMessage = process.env.NODE_ENV === 'development'
      ? (error as Error).message
      : 'Internal Server Error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "9", 10);
    const searchTerm = searchParams.get("search") || "";

    const query = searchTerm ? { title: { $regex: searchTerm, $options: "i" } } : {};

    const total = await Quiz.countDocuments(query);
    const quizzesFromDb = await Quiz.find(query)
      .select('_id title description isPublished coverImage createdAt authorId') // Select specific fields
      .sort({ _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const quizzes = quizzesFromDb.map(quiz => ({
      id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      published: quiz.isPublished,
      coverImage: quiz.coverImage,
      createdAt: (quiz.createdAt as Date).toISOString(),
      authorId: quiz.authorId.toString(),
    }));

    return NextResponse.json({ data: quizzes, total }, { status: 200 });

  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
