import React, { useState } from 'react';
import { educationalContent } from '../data/educationalContent';

/**
 * EducationalHub.jsx
 * ──────────────────
 * "Know Your Rights" learning library
 * Organized by topic with multiple learning modules
 * Includes interactive quizzes and downloadable resources
 * 
 * Features:
 * - Category selection (6+ main topics)
 * - Module drill-down
 * - Interactive quizzes
 * - Progress tracking
 */

const EducationalHub = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [completedModules, setCompletedModules] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ujris_completed_modules')) || [];
    } catch {
      return [];
    }
  });

  // All available categories from content
  const categories = Object.entries(educationalContent).map(([key, content]) => ({
    id: key,
    ...content,
  }));

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedModule(null);
    setQuizMode(false);
  };

  const handleModuleSelect = (module, categoryId) => {
    setSelectedModule({ ...module, categoryId });
    setQuizMode(false);
  };

  const handleModuleComplete = () => {
    if (selectedModule) {
      const moduleId = `${selectedModule.categoryId}-${selectedModule.id}`;
      if (!completedModules.includes(moduleId)) {
        const updated = [...completedModules, moduleId];
        setCompletedModules(updated);
        localStorage.setItem('ujris_completed_modules', JSON.stringify(updated));
      }
    }
  };

  const isModuleCompleted = (categoryId, moduleId) => {
    return completedModules.includes(`${categoryId}-${moduleId}`);
  };

  // Category View
  if (!selectedCategory) {
    return (
      <div style={{ padding: '20px 0', background: '#F8F1E9', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ color: '#0F2C4A', margin: '0 0 10px 0', fontSize: '36px' }}>
              📚 Know Your Rights Library
            </h1>
            <p style={{ color: '#64748B', margin: 0, fontSize: '16px' }}>
              Learn your rights, understand UK discrimination law, and build your case with confidence.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                style={{
                  background: '#FFFFFF',
                  border: '2px solid #EDE4D9',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D4AF37';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#EDE4D9';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{cat.icon}</div>
                <h3 style={{ color: '#0F2C4A', margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                  {cat.title}
                </h3>
                <p style={{ color: '#64748B', margin: '0 0 12px 0', fontSize: '13px' }}>
                  {cat.modules.length} {cat.modules.length === 1 ? 'module' : 'modules'} • {cat.level}
                </p>
                <button
                  style={{
                    background: '#D4AF37',
                    color: '#0F2C4A',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                >
                  Start Learning →
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '60px',
              padding: '20px',
              background: 'rgba(212, 175, 55, 0.1)',
              borderRadius: '12px',
              borderLeft: '4px solid #D4AF37',
            }}
          >
            <p style={{ color: '#0F2C4A', margin: 0, fontSize: '13px' }}>
              📌 <strong>About These Resources:</strong> All materials are sourced from GOV.UK, 
              UK statutory bodies (ACAS, EHRC, ICO, IOPC), and registered charities. 
              Used for educational purposes under Open Government Licence v3.0.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const categoryContent = educationalContent[selectedCategory];
  if (!categoryContent) return null;

  // Module List View
  if (!selectedModule) {
    return (
      <div style={{ padding: '20px 0', background: '#F8F1E9', minHeight: '100vh' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px' }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#D4AF37',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '20px',
              padding: 0,
            }}
          >
            ← Back to Categories
          </button>

          <div style={{ marginBottom: '30px' }}>
            <h1 style={{ color: '#0F2C4A', margin: '0 0 8px 0', fontSize: '32px' }}>
              {categoryContent.icon} {categoryContent.title}
            </h1>
            <p style={{ color: '#64748B', margin: '0 0 5px 0', fontSize: '13px' }}>
              Source: {categoryContent.source} • Last updated: {categoryContent.lastUpdated}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categoryContent.modules.map((module) => {
              const isCompleted = isModuleCompleted(selectedCategory, module.id);
              return (
                <div
                  key={module.id}
                  onClick={() => handleModuleSelect(module, selectedCategory)}
                  style={{
                    background: '#FFFFFF',
                    border: `2px solid ${isCompleted ? '#10B981' : '#EDE4D9'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCompleted) {
                      e.currentTarget.style.borderColor = '#D4AF37';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 175, 55, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCompleted) {
                      e.currentTarget.style.borderColor = '#EDE4D9';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px',
                    }}
                  >
                    <h3 style={{ color: '#0F2C4A', margin: 0, fontSize: '16px', fontWeight: '600' }}>
                      {module.title}
                    </h3>
                    {isCompleted && (
                      <span style={{ color: '#10B981', fontSize: '18px' }}>✓</span>
                    )}
                  </div>
                  <p style={{ color: '#64748B', margin: '0 0 10px 0', fontSize: '13px' }}>
                    {module.content.substring(0, 120)}...
                  </p>
                  <div style={{ fontSize: '12px', color: '#A0AEC0' }}>
                    Click to read full content →
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Module Detail View
  const module = selectedModule;
  return (
    <div style={{ padding: '20px 0', background: '#F8F1E9', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '30px 20px' }}>
        <button
          onClick={() => setSelectedModule(null)}
          style={{
            background: 'none',
            border: 'none',
            color: '#D4AF37',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '20px',
            padding: 0,
          }}
        >
          ← Back to {categoryContent.title}
        </button>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '30px', marginBottom: '20px' }}>
          <h1 style={{ color: '#0F2C4A', margin: '0 0 8px 0', fontSize: '28px' }}>
            {module.title}
          </h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '13px' }}>
            From: {categoryContent.title}
          </p>
        </div>

        {/* Content */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '20px',
            lineHeight: '1.8',
          }}
        >
          {module.content.split('\n\n').map((paragraph, i) => (
            <p
              key={i}
              style={{
                color: '#0F2C4A',
                margin: i === 0 ? '0 0 15px 0' : '15px 0',
                fontSize: '14px',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Mark as Complete */}
        <div style={{ textAlign: 'center', marginBottom:'30px' }}>
          <button
            onClick={handleModuleComplete}
            style={{
              background: '#10B981',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            {isModuleCompleted(selectedCategory, module.id) ? '✓ Completed' : 'Mark as Complete'}
          </button>
        </div>

        {/* Call to Action */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
            border: '1px solid #D4AF37',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#0F2C4A', margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600' }}>
            Ready to apply this to your case?
          </p>
          <button
            style={{
              background: '#D4AF37',
              color: '#0F2C4A',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            onClick={() => window.location.href = '/case'}
          >
            Go to Your Case
          </button>
        </div>
      </div>
    </div>
  );
};

export default EducationalHub;
