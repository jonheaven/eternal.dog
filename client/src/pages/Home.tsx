import { Link } from 'react-router-dom';
import wizardDog from '../assets/wizard-dog.svg';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-dogecoin">
      <img src={wizardDog} alt="Wizard Dog" className="w-32 mb-4" />
      <h1 className="text-3xl md:text-4xl font-bold text-center">
        Immortalize Your Dog for $14.20!
      </h1>
      <p className="text-lg md:text-xl text-center mt-4 max-w-2xl">
        Save your dog&#39;s memory forever on the Dogecoin blockchain. Your pup
        becomes eternal.
      </p>
      <Link
        to="/upload"
        className="mt-6 w-full max-w-xs bg-green-500 hover:bg-green-600 text-white p-3 rounded text-lg md:text-xl text-center font-bold transition"
      >
        Start Now
      </Link>
    </div>
  );
}
