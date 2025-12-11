import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Preview from './pages/Preview';
import Confirmation from './pages/Confirmation';
import Gallery from './pages/Gallery';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  );
}
