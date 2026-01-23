import { ShieldCheck, Truck, Clock, Award } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
      title: "Secure Shopping",
      description: "Your security is our priority. We use industry-standard encryption to protect your data."
    },
    {
      icon: <Truck className="w-8 h-8 text-blue-500" />,
      title: "Fast Delivery",
      description: "Enjoy free, reliable shipping on all orders, ensuring your tech reaches you safely."
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-500" />,
      title: "24/7 Support",
      description: "Our dedicated support team is always available to help you with any technical queries."
    },
    {
      icon: <Award className="w-8 h-8 text-blue-500" />,
      title: "Quality Guaranteed",
      description: "We source only the best products from trusted global brands to ensure high performance."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About ONIUM</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Your premier destination for high-performance networking, server, and security infrastructure.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Founded with a vision to provide professional-grade technology to businesses and enthusiasts alike, ONIUM has grown into a trusted full-stack e-commerce platform. We specialize in hardware that powers the modern world.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We believe that high-quality infrastructure should be accessible, reliable, and backed by expert support. Whether you are building a home lab or scaling a data center, we are here to provide the tools you need.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img 
              src="https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=1200" 
              alt="Data Center" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}