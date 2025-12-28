
import PreviewQuizPage from './PreviewQuizPage.tsx';

export default async function Page({ params }) {
  const { id } = await params;
  return <PreviewQuizPage quizId={id} />;
}
