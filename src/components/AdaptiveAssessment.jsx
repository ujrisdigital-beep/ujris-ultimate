import React, { useState } from 'react';

export default function AdaptiveAssessment({ onComplete }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [aiFollowUp, setAiFollowUp] = useState(null);
  const [loading, setLoading] = useState(false);

  const baseQuestions = [
    {
      id: 'caseType',
      text: 'What type of legal issue are you facing?',
      type: 'select',
      options: ['Employment Discrimination', 'Unfair Dismissal', 'Police Misconduct', 'Housing Discrimination', 'Goods & Services Discrimination', 'Other']
    },
    {
      id: 'employer',
      text: 'Name of employer/organisation',
      type: 'text',
      placeholder: 'e.g., Fairwinds Health Care Ltd'
    },
    {
      id: 'incidentDate',
      text: 'Date of the incident',
      type: 'date',
      helpText: 'The last incident date is critical for your ET1 deadline (3 months minus 1 day)'
    },
    {
      id: 'description',
      text: 'Describe what happened',
      type: 'textarea',
      rows: 6,
      placeholder: 'Be specific: dates, names, what was said, who witnessed...'
    }
  ];

  const handleAnswer = async (id, value) => {
    const newAnswers = { ...answers, [id]: value };
    setAnswers(newAnswers);

    if (id === 'description' && value && value.length > 50) {
      setLoading(true);
      try {
        const res = await fetch('/api/adaptive-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseType: newAnswers.caseType,
            employer: newAnswers.employer,
            description: value
          })
        });
        const data = await res.json();
        setAiFollowUp(data.followUpQuestions);
      } catch (err) {
        console.error('Failed to get AI follow-up:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNext = () => {
    if (currentStage < baseQuestions.length - 1) {
      setCurrentStage(currentStage + 1);
    } else if (aiFollowUp && aiFollowUp.length > 0) {
      setCurrentStage(baseQuestions.length);
    } else {
      onComplete(answers);
    }
  };

  const totalSteps = baseQuestions.length + (aiFollowUp?.length || 0);
  const currentQ = baseQuestions[currentStage];
  const isFollowUpStage = currentStage >= baseQuestions.length;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Step {currentStage + 1} of {totalSteps}</span>
          <span>{Math.round(((currentStage + 1) / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-[#D4AF37] rounded-full transition-all" style={{ width: `${((currentStage + 1) / totalSteps) * 100}%` }}></div>
        </div>
      </div>

      {!isFollowUpStage ? (
        <div>
          <h3 className="text-xl font-bold mb-4">{currentQ.text}</h3>
          {currentQ.helpText && <p className="text-sm text-amber-600 mb-3">{currentQ.helpText}</p>}

          {currentQ.type === 'select' && (
            <select
              className="w-full p-3 border rounded-lg"
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              value={answers[currentQ.id] || ''}
            >
              <option value="">Select...</option>
              {currentQ.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )}

          {currentQ.type === 'text' && (
            <input
              type="text"
              className="w-full p-3 border rounded-lg"
              placeholder={currentQ.placeholder}
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              value={answers[currentQ.id] || ''}
            />
          )}

          {currentQ.type === 'date' && (
            <input
              type="date"
              className="w-full p-3 border rounded-lg"
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              value={answers[currentQ.id] || ''}
            />
          )}

          {currentQ.type === 'textarea' && (
            <textarea
              rows={currentQ.rows}
              className="w-full p-3 border rounded-lg"
              placeholder={currentQ.placeholder}
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              value={answers[currentQ.id] || ''}
            />
          )}
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-bold mb-4">AI Follow-up Questions</h3>
          <p className="text-gray-600 mb-4">Based on your description, here are important details we need:</p>

          {loading ? (
            <div className="text-center py-8">AI is analysing your case...</div>
          ) : (
            aiFollowUp?.map((q, idx) => (
              <div key={idx} className="mb-4">
                <label className="block font-medium mb-2">{q.question}</label>
                {q.type === 'select' ? (
                  <select
                    className="w-full p-3 border rounded-lg"
                    onChange={(e) => setAnswers({ ...answers, [`followup_${idx}`]: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {q.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <textarea
                    rows={3}
                    className="w-full p-3 border rounded-lg"
                    placeholder={q.placeholder}
                    onChange={(e) => setAnswers({ ...answers, [`followup_${idx}`]: e.target.value })}
                  />
                )}
                <p className="text-xs text-gray-400 mt-1">{q.whyImportant}</p>
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex justify-between mt-8">
        {currentStage > 0 && (
          <button onClick={() => setCurrentStage(currentStage - 1)} className="px-6 py-2 bg-gray-200 rounded-lg">
            Back
          </button>
        )}
        <button onClick={handleNext} className="px-6 py-2 bg-[#D4AF37] text-[#0F2C4A] rounded-lg font-bold ml-auto">
          {currentStage === baseQuestions.length - 1 && (!aiFollowUp || aiFollowUp.length === 0) ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}
