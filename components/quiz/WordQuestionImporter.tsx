
"use client";

import React, { useState, useRef } from "react";
import { App, Button, Modal } from "antd";
import { UploadOutlined, FileWordOutlined } from "@ant-design/icons";
import * as mammoth from "mammoth";

interface WordQuestionImporterProps {
  quizId: string;
  onImportSuccess: () => void;
}

interface ParsedQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

const WordQuestionImporter: React.FC<WordQuestionImporterProps> = ({ quizId, onImportSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { message } = App.useApp();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      message.error("Please upload a .docx file.");
      return;
    }

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const { value: text } = await mammoth.extractRawText({ arrayBuffer });
      const { parsedQuestions, totalQuestions } = parseQuestionsFromText(text);

      if (parsedQuestions.length === 0) {
        throw new Error("No valid questions found. Please check the file's format and content.");
      }

      const response = await fetch(`/api/quizzes/${quizId}/bulk-import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: parsedQuestions }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to import questions.");
      }

      const skippedCount = totalQuestions - parsedQuestions.length;
      let successMessage = `Successfully imported ${parsedQuestions.length} questions.`;
      if (skippedCount > 0) {
        successMessage += ` ${skippedCount} question(s) were skipped due to formatting errors.`;
      }

      message.success(successMessage, 10);
      onImportSuccess();
    } catch (err: any) {
      console.error("Import failed:", err);
      message.error(err.message || "An unexpected error occurred.", 10);
    } finally {
      setIsLoading(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const parseQuestionsFromText = (text: string): { parsedQuestions: ParsedQuestion[], totalQuestions: number } => {
    const questionBlocks = text.split(/(?=\d+\.\s)/).filter(b => b.trim() !== "");
    const parsedQuestions: ParsedQuestion[] = [];

    for (const block of questionBlocks) {
      try {
        const questionTextMatch = block.match(/^\d+\.\s(.*?)(?=A\.)/s);
        const questionText = questionTextMatch ? questionTextMatch[1].trim() : '';

        const correctAnswerMatch = block.match(/Correct Answer:\s*([A-Z])/);
        const correctLetter = correctAnswerMatch ? correctAnswerMatch[1] : null;

        const explanationMatch = block.match(/Explanation:\s*(.*)/s);
        const explanation = explanationMatch ? explanationMatch[1].trim() : undefined;

        const optionsBlockMatch = block.match(/A\..*?(?=Correct Answer:)/s);
        const optionsBlock = optionsBlockMatch ? optionsBlockMatch[0] : '';

        if (!questionText || !correctLetter || !optionsBlock) {
          console.warn("Skipping block due to missing parts:", block);
          continue;
        }

        const optionTokens = optionsBlock.split(/(?=[A-Z]\.)/).filter(opt => opt.trim() !== "");
        const options = optionTokens.map(opt => opt.replace(/^[A-Z]\.\s*/, '').trim());

        const correctOptionIndex = correctLetter.charCodeAt(0) - 65;

        if (options.length > 0 && correctOptionIndex >= 0 && correctOptionIndex < options.length) {
          parsedQuestions.push({ questionText, options, correctOptionIndex, explanation });
        } else {
          console.warn("Skipping block due to invalid correct answer index:", block);
        }
      } catch (e) {
        console.error("Error parsing a question block:", block, e);
      }
    }
    return { parsedQuestions, totalQuestions: questionBlocks.length };
  };


  const handleButtonClick = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const showFormattingGuide = () => {
    setIsModalVisible(true);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept=".docx"
        disabled={isLoading}
      />
      
      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={handleButtonClick}
        loading={isLoading}
        size="large"
        className="bg-gradient-to-r from-green-500 to-blue-500 border-0 hover:shadow-lg hover:scale-105 transition-all duration-200"
      >
        Import from Word
      </Button>

      <Button onClick={showFormattingGuide} icon={<FileWordOutlined />} size="large" className="ml-2">
          Format Guide
      </Button>

      <Modal
        title="Word File Formatting Guide"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={<Button key="back" onClick={() => setIsModalVisible(false)}>Got it</Button>}
      >
        <p className="font-semibold">To ensure a successful import, please format your .docx file as follows:</p>
        <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Each question block must be separated by <strong>one empty line</strong>.</li>
            <li>The first line of a block is the <strong>question text</strong>. You can start it with a number (e.g., "1.").</li>
            <li>The following lines are the <strong>answer options</strong>, each starting with an uppercase letter and a period (e.g., "A.", "B.").</li>
            <li>Specify the correct answer with a line starting with <strong>"Correct Answer:"</strong> followed by the option letter (e.g., "Correct Answer: B").</li>
            <li>Optionally, add an explanation with a line starting with <strong>"Explanation:"</strong>.</li>
        </ul>
        <pre className="bg-gray-100 p-4 rounded-md mt-4 text-sm">
            <code>
{`1. What is the capital of France?\nA. London\nB. Paris\nC. Berlin\nCorrect Answer: B\nExplanation: Paris is the capital city of France.\n\n2. Which planet is known as the Red Planet?\nA. Earth\nB. Mars\nC. Jupiter\nCorrect Answer: B`}
            </code>
        </pre>
      </Modal>
    </>
  );
};

export default WordQuestionImporter;
