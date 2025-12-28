
import { Document, Schema, model, models } from 'mongoose';

// --- Interfaces for Type Safety ---
// These interfaces define the shape of our data, making the code easier to read and less prone to errors.

export interface IOption {
    optionText: string;
    isCorrect: boolean;
}

// This is the core interface for a single question.
export interface IQuestion {
    // Note: _id is added automatically by Mongoose
    questionText: string;
    // questionType helps the frontend decide how to display the question.
    questionType: 'two_choices' | 'four_choices' | 'input';
    // The `options` array is for multiple-choice questions.
    options?: IOption[];
    // `correctAnswer` is used exclusively for 'input' type questions.
    correctAnswer?: string;
}

// This interface represents the entire Quiz document.
export interface IQuiz extends Document {
    title: string;
    description: string;
    coverImage?: string;
    authorId: Schema.Types.ObjectId;
    isPublished: boolean;
    questions: IQuestion[];
}


// --- Mongoose Schemas ---
// These schemas define how the data is stored in MongoDB.

const OptionSchema = new Schema<IOption>({
    optionText: { type: String, required: true },
    isCorrect: { type: Boolean, required: true, default: false },
}, { _id: false }); // No separate ID needed for options

const QuestionSchema = new Schema<IQuestion>({
    questionText: { type: String, required: true },
    // EXPLANATION: Added `questionType` to differentiate between question formats.
    questionType: { type: String, required: true, enum: ['two_choices', 'four_choices', 'input'] },
    // EXPLANATION: `options` are not required for 'input' questions, so the array is optional.
    options: {
        type: [OptionSchema],
        required: false, // Not required for input type
    },
    // EXPLANATION: Added `correctAnswer` to store the text for input-based questions.
    correctAnswer: {
        type: String,
        required: false, // Only required if questionType is 'input'
    }
});

const QuizSchema = new Schema<IQuiz>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    coverImage: { type: String, required: false },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
    questions: [QuestionSchema], // Embed the updated QuestionSchema
}, { timestamps: true });

// Standard Mongoose model export
export const Quiz = models.Quiz || model<IQuiz>('Quiz', QuizSchema);
