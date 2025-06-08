import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-3 text-center">
      <p className="mb-1">© {new Date().getFullYear()} DreamWeaver. All rights reserved.</p>
      <p className="mb-1 small">
        Not medical advice. For sleep disorders, consult a healthcare professional.
      </p>
      <p className="mb-0 small">
        Built by <a href="https://www.linkedin.com/in/travis-mccoy-630775b9/" target="_blank" rel="noopener noreferrer" className="text-info">Macfarley (Mac McCoy)</a>
      </p>
    </footer>
  );
};

export default Footer;
