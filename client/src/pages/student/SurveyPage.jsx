import React, { useState, useEffect } from 'react';

// --- Spline 3D Model Components for Survey ---
const SurveySplineAnimation1 = () => (
  <iframe src='https://my.spline.design/aidatamodelinteraction-ZUDIftctyJRacubRrQkGDoIA/' frameBorder='0' width='100%' height='100%'></iframe>
);

const SurveySplineAnimation2 = () => (
  <iframe src='https://my.spline.design/aidatamodelinteraction-ZUDIftctyJRacubRrQkGDoIA/' frameBorder='0' width='100%' height='100%'></iframe>
);

// --- Main Survey Page Component ---
const SurveyPage = ({ user, onSurveyComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: user?.age || '',
    collegeName: user?.collegeName || '',
    domain: user?.domain || '',
    howDidYouKnow: user?.howDidYouKnow || '',
  });

  // Animation state to handle transitions
  const [isExiting, setIsExiting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const goToNextStep = (e) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      setStep(2);
      setIsExiting(false);
    }, 500); // Match this with animation duration
  };

  const goToPrevStep = () => {
    setIsExiting(true);
    setTimeout(() => {
      setStep(1);
      setIsExiting(false);
    }, 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSurveyComplete(formData);
  };

  return (
    <>
      <style>{`
        .survey-container {
          background-color: #000000;
          color: #FFFFFF;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-x: hidden; /* Prevent horizontal scroll on mobile */
          padding: 1rem;
          box-sizing: border-box;
        }
        .survey-grid {
          display: grid;
          /* --- RESPONSIVE CORRECTION 1: Default to single column --- */
          grid-template-columns: 1fr;
          width: 100%;
          max-width: 1400px;
          align-items: center; /* Changed back for better mobile centering */
          gap: 2rem;
        }
        /* --- RESPONSIVE CORRECTION 2: Apply 2-column layout only on larger screens --- */
        @media (min-width: 992px) {
          .survey-grid {
            grid-template-columns: 1fr 1fr;
            min-height: 80vh;
            align-items: stretch;
            gap: 4rem;
            padding: 2rem;
          }
        }
        .form-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 1.5rem;
          opacity: 0;
          transform: translateY(30px);
          animation: ${isExiting ? 'fadeOutUp 0.5s ease-in forwards' : 'fadeInUp 0.8s ease-out 0.3s forwards'};
        }
        .spline-content {
          /* --- RESPONSIVE CORRECTION 3: Set a sensible height for mobile --- */
          width: 100%;
          height: 300px;
          opacity: 0;
          transform: translateY(30px);
          animation: ${isExiting ? 'fadeOutUp 0.5s ease-in forwards' : 'fadeInUp 0.8s ease-out 0.5s forwards'};
        }
        @media (min-width: 992px) {
          .spline-content {
            height: 100%; /* Full height on desktop */
          }
          /* --- RESPONSIVE CORRECTION 4: Order reversal for step 2 on desktop --- */
          .survey-grid.step-2 .spline-content {
             order: 1;
          }
          .survey-grid.step-2 .form-content {
             order: 2;
          }
        }
        
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOutUp { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-30px); } }

        .progress-bar {
          height: 4px;
          background-color: #333;
          border-radius: 2px;
          margin-bottom: 2rem;
          overflow: hidden;
        }
        .progress {
          height: 100%;
          background-color: #22C55E;
          width: ${step === 1 ? '50%' : '100%'};
          transition: width 0.5s ease-in-out;
          border-radius: 2px;
        }
        .survey-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .survey-subtitle {
          color: #A1A1AA;
          margin-bottom: 2.5rem;
        }
        .survey-form .form-group {
          margin-bottom: 1.5rem;
        }
        .survey-form label {
          display: block;
          font-size: 0.9rem;
          color: #A1A1AA;
          margin-bottom: 0.5rem;
        }
        .survey-input {
          width: 100%;
          background-color: #1A1A1A;
          border: 1px solid #333;
          color: #FFFFFF;
          padding: 0.8rem 1rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.3s, box-shadow 0.3s;
          box-sizing: border-box;
        }
        .survey-input:focus {
          outline: none;
          border-color: var(--brand-blue);
          box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.3);
        }
        .survey-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        .survey-btn {
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .back-btn {
          background-color: #27272A;
          color: #A1A1AA;
        }
        .back-btn:hover {
          background-color: #3f3f46;
        }
        .next-btn, .finish-btn {
          background-color: var(--brand-blue);
          color: white;
        }
        .next-btn:hover, .finish-btn:hover {
          background-color: #003ECC;
        }
      `}</style>
      <div className="survey-container">
        {step === 1 && (
          // On mobile, spline will be below the form
          <div className="survey-grid">
            <div className="form-content">
              <div className="progress-bar"><div className="progress"></div></div>
              <h1 className="survey-title">Tell Us About Yourself</h1>
              <p className="survey-subtitle">This helps us personalize your experience.</p>
              <form onSubmit={goToNextStep} className="survey-form">
                <div className="form-group">
                  <label htmlFor="age">Your Age</label>
                  <input type="number" id="age" name="age" className="survey-input" placeholder="e.g., 21" value={formData.age} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="collegeName">College Name</label>
                  <input type="text" id="collegeName" name="collegeName" className="survey-input" placeholder="e.g., Anjac College" value={formData.collegeName} onChange={handleChange} required />
                </div>
                <div className="survey-actions">
                  <button type="submit" className="survey-btn next-btn">Next &rarr;</button>
                </div>
              </form>
            </div>
            <div className="spline-content">
              <SurveySplineAnimation1 />
            </div>
          </div>
        )}

        {step === 2 && (
          // On mobile, spline will be below form. On desktop, spline will be on the left.
          <div className="survey-grid step-2">
             <div className="spline-content">
              <SurveySplineAnimation2 />
            </div>
            <div className="form-content">
              <div className="progress-bar"><div className="progress"></div></div>
              <h1 className="survey-title">Your Internship Interests</h1>
              <p className="survey-subtitle">Let us know what you're passionate about.</p>
              <form onSubmit={handleSubmit} className="survey-form">
                <div className="form-group">
                  <label htmlFor="domain">Which domain are you interested in?</label>
                  <input type="text" id="domain" name="domain" className="survey-input" placeholder="e.g., Web Development, UI/UX Design" value={formData.domain} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="howDidYouKnow">How did you hear about Skenetic?</label>
                  <input type="text" id="howDidYouKnow" name="howDidYouKnow" className="survey-input" placeholder="e.g., College, Friends, Social Media" value={formData.howDidYouKnow} onChange={handleChange} required />
                </div>
                <div className="survey-actions">
                  <button type="button" onClick={goToPrevStep} className="survey-btn back-btn">&larr; Back</button>
                  <button type="submit" className="survey-btn finish-btn">Finish Setup</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SurveyPage;

