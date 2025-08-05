import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, FileText, Zap, ArrowRight, Users, Award, Globe } from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "AI-Powered Intelligence",
      description: "Dynamic follow-up questions powered by advanced AI to ensure comprehensive product analysis"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Full Transparency",
      description: "Complete visibility into product ingredients, sourcing, manufacturing, and ethical practices"
    },
    {
      icon: <FileText className="w-6 h-6 text-purple-600" />,
      title: "Detailed Reports",
      description: "Professional PDF reports with actionable insights and transparency scores"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
      title: "Verified Data",
      description: "Rigorous validation processes ensure accuracy and reliability of all information"
    }
  ];

  const stats = [
    { number: "1000+", label: "Products Analyzed" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "50+", label: "Partner Companies" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Build Trust Through
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Product Transparency</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Empower consumers with complete product information through our AI-powered transparency platform. 
              Make informed decisions that align with your values of health, wisdom, and virtue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/submit"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                to="/dashboard"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive approach to product transparency combines cutting-edge AI with rigorous validation 
              to provide the most accurate and actionable insights.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="mb-6 p-3 bg-gray-50 rounded-xl w-fit group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">Built on Core Values</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Every feature is designed with our commitment to Health, Wisdom, and Virtue at its foundation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mb-6 mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Health</h3>
              <p className="text-blue-100 leading-relaxed">
                Building systems that promote wellbeing and informed choices for better health outcomes.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-6 mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Wisdom</h3>
              <p className="text-blue-100 leading-relaxed">
                Applying knowledge intelligently through thoughtful design and evidence-based insights.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-6 mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Virtue</h3>
              <p className="text-blue-100 leading-relaxed">
                Creating ethical systems that build trust and transparency in every interaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to Build Transparency?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of companies creating trust through radical transparency.
          </p>
          <Link 
            to="/submit"
            className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-4 rounded-xl font-semibold text-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-3"
          >
            Get Started Today
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;