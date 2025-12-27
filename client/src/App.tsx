import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Preview from './pages/Preview';
import Confirmation from './pages/Confirmation';
import Gallery from './pages/Gallery';
import Cancel from './pages/Cancel';
import Claim from './pages/Claim';
import Header from './components/Header';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/cancel" element={<Cancel />} />
            <Route path="/claim/:uuid" element={<Claim />} />
          </Routes>
        </main>
        <Footer />
        <InstallPrompt />
      </div>
    </BrowserRouter>
  );
}
