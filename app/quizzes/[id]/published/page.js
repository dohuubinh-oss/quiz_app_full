
import PublishedQuizPage from './PublishedQuizPage.tsx';

export default async function Page({ params }) {
  const { id } = await params;
  return <PublishedQuizPage quizId={id} />;
}
