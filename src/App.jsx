
import { BrowserRouter as Routes, Route } from 'react-router-dom';
import LandingPage from './components/landing.jsx';
import SignUp from './components/signup.jsx'; // import signup component
import Navbar from './components/navbar.jsx';// import navbar component
import About from './components/about.jsx';// import about component
import Footer from './components/footer.jsx'; // import footer component

function App() {
  return (
      <main>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
      </main>
  );
}

export default App;