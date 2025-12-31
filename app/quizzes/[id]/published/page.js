
import PublishedQuizPage from './PublishedQuizPage.tsx';
import dbConnect from '@/lib/mongodb';
import { Quiz } from '@/models/Quiz';
import { notFound } from 'next/navigation';

async function getQuiz(quizId) {
  await dbConnect();
  // Use .lean() for performance and to get plain JS objects
  const quizFromDb = await Quiz.findById(quizId).populate('questions').lean();

  if (!quizFromDb) {
    return null;
  }

  const serializedQuiz = {
    id: quizFromDb._id.toString(),
    title: quizFromDb.title,
    description: quizFromDb.description,
    coverImage: quizFromDb.coverImage,
    isPublished: quizFromDb.isPublished,
    createdAt: quizFromDb.createdAt ? quizFromDb.createdAt.toISOString() : null,
    updatedAt: quizFromDb.updatedAt ? quizFromDb.updatedAt.toISOString() : null,
    authorId: quizFromDb.authorId ? quizFromDb.authorId.toString() : null,
    questions: (quizFromDb.questions || []).map((q) => {
      if (!q) return null;

      let correctOptionIdentifier = null;

      const serializedOptions = (q.options || []).map((opt, index) => {
        if (!opt) return null;
        
        const optionId = opt._id ? opt._id.toString() : `${q._id.toString()}_option_${index}`;
        
        // The database stores the option text under `optionText`.
        // We map it to `text` for the client component.
        const optionTextValue = opt.optionText; // THE FIX: Read from `optionText`

        if (opt.isCorrect) {
          correctOptionIdentifier = optionId;
        }

        return {
          id: optionId,
          text: optionTextValue, // THE FIX: Assign the correct value here.
        };
      }).filter(Boolean);

      const finalCorrectAnswer = q.questionType === 'input' ? q.correctAnswer : correctOptionIdentifier;

      return {
        id: q._id.toString(),
        questionText: q.questionText,
        questionType: q.questionType,
        correctAnswer: finalCorrectAnswer,
        options: serializedOptions, 
        explanation: q.explanation, // THE FIX: Include the explanation field
      };
    }).filter(Boolean),
  };

  return serializedQuiz;
}

export default async function Page({ params }) {
  const { id } = await params;
  const quizData = await getQuiz(id);

  if (!quizData) {
    notFound();
  }

  return <PublishedQuizPage quiz={quizData} />;
}
