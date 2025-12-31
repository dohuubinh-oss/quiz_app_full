
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Quiz, IQuestion, IOption } from "@/models/Quiz";

// Định nghĩa kiểu cho dữ liệu câu hỏi được client gửi lên
interface ImportedQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const quizId = params.id;

  try {
    await dbConnect(); // Kết nối tới cơ sở dữ liệu Mongoose - ĐÃ SỬA

    // 1. Tìm Quiz tồn tại bằng Mongoose
    const existingQuiz = await Quiz.findById(quizId);

    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // 2. Lấy dữ liệu câu hỏi từ body của request
    const body = await req.json();
    const questionsData: ImportedQuestion[] = body.questions;

    if (!questionsData || !Array.isArray(questionsData) || questionsData.length === 0) {
      return NextResponse.json({ error: "No questions provided" }, { status: 400 });
    }

    // 3. Chuyển đổi và thêm câu hỏi mới vào quiz
    const newQuestions: IQuestion[] = questionsData.map(qData => {
      // Tạo mảng các lựa chọn theo schema của Mongoose
      const options: IOption[] = qData.options.map((optionText, index) => ({
        optionText: optionText,
        isCorrect: index === qData.correctOptionIndex,
      }));

      // Tạo đối tượng câu hỏi mới theo schema của Mongoose
      const newQuestion: IQuestion = {
        questionText: qData.questionText,
        questionType: qData.options.length >= 4 ? "four_choices" : "two_choices",
        options: options,
        explanation: qData.explanation,
      };

      return newQuestion;
    });
    
    // Thêm mảng câu hỏi mới vào danh sách câu hỏi hiện có của quiz
    existingQuiz.questions.push(...newQuestions);

    // 4. Lưu lại toàn bộ quiz đã được cập nhật
    const updatedQuiz = await existingQuiz.save();

    return NextResponse.json({ 
        message: `Successfully imported ${newQuestions.length} questions.`,
        questions: updatedQuiz.questions
    }, { status: 201 });

  } catch (error) {
    console.error("Error in bulk import:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
