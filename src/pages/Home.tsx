import Header from '../components/Header';
import HeroSection from '../components/HeroSection';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#020507' }}>
      <Header />
      <HeroSection />
    </div>
  );
}