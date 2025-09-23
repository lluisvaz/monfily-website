import React from 'react';
import { Code, Zap, Shield, Globe } from 'lucide-react';

interface SolutionsSectionProps {
  className?: string;
}

const solutions = [
  {
    icon: Code,
    title: 'Desenvolvimento Ágil',
    description: 'Produtos digitais de alta performance desenvolvidos com as melhores práticas e tecnologias modernas.',
    features: ['React & TypeScript', 'Arquitetura Escalável', 'Clean Code']
  },
  {
    icon: Shield,
    title: 'Testes Abrangentes',
    description: 'Cobertura completa de testes para garantir qualidade e confiabilidade em cada entrega.',
    features: ['Testes Unitários', 'Testes E2E', 'Quality Assurance']
  },
  {
    icon: Zap,
    title: 'Entregas Automatizadas',
    description: 'Pipeline de CI/CD otimizado para entregas rápidas e seguras em produção.',
    features: ['Deploy Automático', 'Monitoramento', 'Rollback Seguro']
  },
  {
    icon: Globe,
    title: 'Soluções Globais',
    description: 'Aplicações preparadas para escala global com performance e disponibilidade garantidas.',
    features: ['CDN Global', 'Multi-região', 'Alta Disponibilidade']
  }
];

const SolutionsSection: React.FC<SolutionsSectionProps> = ({ className = '' }) => {
  return (
    <section className={`bg-white py-20 ${className}`}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <div className="max-w-4xl">
            {/* Pré-título */}
            <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-4">
              Nossas Especialidades
            </p>
            
            {/* Título Principal */}
            <h2 className="font-heading tracking-tighter text-[46px] md:text-[50px] lg:text-[60px] leading-none text-gray-900 mb-6">
              Soluções <span className="text-red-500">Inovadoras</span>
            </h2>
            
            {/* Subtítulo */}
            <p className="text-xl text-gray-600 max-w-2xl leading-tight">
              Transformamos ideias em realidade digital através de soluções inovadoras 
              e tecnologias de ponta, sempre focados na excelência e resultados.
            </p>
          </div>
        </div>

        {/* Solutions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => {
            const IconComponent = solution.icon;
            return (
              <div 
                key={index}
                className="group bg-gray-50 hover:bg-white p-8 rounded-2xl transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-red-100"
              >
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-red-500 group-hover:bg-red-600 rounded-xl flex items-center justify-center transition-colors duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-500 transition-colors duration-300">
                    {solution.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {solution.description}
                  </p>
                  
                  {/* Features */}
                  <ul className="space-y-2">
                    {solution.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
              Começar Projeto
            </button>
            <button className="border border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-500 px-8 py-3 rounded-lg font-semibold transition-all duration-200">
              Ver Portfólio
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;