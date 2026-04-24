import React from 'react';
import './CopyrightModal.css';

const COPYRIGHT_LINES = [
  'The character library used in this project is sourced from the',
  'PolyU MSc IME course: AI Tools for Creative Process and Transmedia (SD5976).',
  '',
  'The original copyright and authorship of the characters belong to their respective creators.',
  'Our use of these characters in this project constitutes derivative creation / secondary creation based on the course character library, and is intended solely for academic, learning, and presentation purposes.',
  '',
  'This project does not claim ownership of the original character designs or narratives,',
  'and fully respects the creative rights and intellectual property of the original authors.'
];

const CopyrightModal = ({ onClose }) => {
  return (
    <div className="copyright-modal-overlay">
      <div className="copyright-modal">
        <button className="copyright-close" onClick={onClose} aria-label="Close copyright notice">
          ×
        </button>

        <div className="copyright-badge">©</div>
        <h2 className="copyright-title">Copyright Notice</h2>

        <div className="copyright-content">
          {COPYRIGHT_LINES.map((line, index) => (
            line ? (
              <p key={index} className="copyright-paragraph">{line}</p>
            ) : (
              <div key={index} className="copyright-spacer" aria-hidden="true" />
            )
          ))}
        </div>

        <button className="copyright-confirm" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default CopyrightModal;
