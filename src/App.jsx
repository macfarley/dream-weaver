import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/landing.jsx';
import SignUp from './components/signup.jsx'; // import signup component
import Navbar from './components/navbar.jsx';// import navbar component
import About from './components/about.jsx';// import about component
import Footer from './components/footer.jsx'; // import footer component

function App() {
  const [formData, setFormData] = useState(defaultFormData);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
      <main>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/signup" 
          element={<SignUp
            formData={formData}
            onFormChange={handleFormChange}
            onFormSubmit={handleFormSubmit}
          />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
      </main>
  );
}

export default App;