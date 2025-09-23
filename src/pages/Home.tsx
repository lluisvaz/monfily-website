import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import SolutionsSection from '../components/SolutionsSection';
import GradualBlur from '../components/GradualBlur';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#020507' }}>
      <Header />
      <HeroSection />
      <SolutionsSection />
      <GradualBlur
        position="bottom"
        target="page"
        exponential={true}
        strength={1}
        divCount={10}
        opacity={1}
        height="10rem"
      />
    </div>
  );
}