// src/Components/Quiz/QuizCard.tsx
import React, { useState } from "react";

interface QuizCardProps {
  question: string;
  options: string[];
  answer: string;
}

const QuizCard: React.FC<QuizCardProps> = ({ question, options, answer }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleClick = (option: string) => {
    setSelected(option);
  };

  return (
    <div className="p-4 m-4 border rounded-xl shadow bg-white">
      <h2 className="font-semibold text-lg mb-3">{question}</h2>
      <ul>
        {options.map((opt, idx) => (
          <li
            key={idx}
            className={`p-2 my-1 rounded cursor-pointer ${
              selected === opt
                ? opt === answer
                  ? "bg-green-300"
                  : "bg-red-300"
                : "bg-gray-100"
            }`}
            onClick={() => handleClick(opt)}
          >
            {opt}
          </li>
        ))}
      </ul>
      {selected && (
        <p className="mt-2 font-medium">
          {selected === answer
            ? "✅ Doğru!"
            : `❌ Yanlış. Doğru cevap: ${answer}`}
        </p>
      )}
    </div>
  );
};

export default QuizCard;
