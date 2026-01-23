import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Tag, Clock, Zap } from 'lucide-react';
import { supabase, Deal } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function DealSlider() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (deals.length > 1 && !isHovering) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % deals.length);
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [deals.length, isHovering]);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + deals.length) % deals.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % deals.length);
  };

  const getTimeLeft = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (isLoading) {
    return (
      <div className="relative w-full max-w-6xl mx-auto aspect-[21/9] lg:aspect-[24/9] bg-gradient-to-r from-blue-100 to-cyan-100 animate-pulse rounded-2xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="relative w-full max-w-6xl mx-auto aspect-[21/9] lg:aspect-[24/9] bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl overflow-hidden border-2 border-dashed border-blue-200 flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <Tag className="w-16 h-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-blue-800 mb-2">No Active Deals</h3>
          <p className="text-blue-600 max-w-md">Check back soon for amazing offers on our cleaning products!</p>
        </div>
      </div>
    );
  }

  const currentDeal = deals[currentIndex];

  return (
    <div 
      className="relative w-full max-w-6xl mx-auto aspect-[21/9] lg:aspect-[24/9] overflow-hidden rounded-2xl shadow-2xl group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-blue-600/20 to-cyan-500/30 z-10"></div>
      
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {deals.map((deal) => (
          <div key={deal.id} className="min-w-full h-full relative flex items-center">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={deal.image_url || "https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&w=1600"}
                alt={deal.title || "Special Deal"}
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/50 to-transparent"></div>
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-20 flex flex-col lg:flex-row items-center justify-between w-full h-full p-6 lg:p-12">
              {/* Left Content */}
              <div className="flex-1 text-white max-w-xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full mb-6 shadow-lg">
                  <Zap className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-wide">Limited Time Offer</span>
                </div>
                
                {/* Title */}
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 leading-tight">
                  {deal.title || "Special Cleaning Bundle"}
                </h2>
                
                {/* Description */}
                <p className="text-lg lg:text-xl text-blue-100 mb-6 max-w-2xl">
                  {deal.description || "Get premium cleaning products at unbeatable prices. Make your home spotless today!"}
                </p>
                
                {/* Deal Info */}
                <div className="flex flex-wrap gap-4 mb-8">
                  {deal.discount_percentage && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Tag className="w-5 h-5" />
                      <span className="font-bold text-2xl">{deal.discount_percentage}% OFF</span>
                    </div>
                  )}
                  
                  {deal.expires_at && (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <Clock className="w-5 h-5" />
                      <div>
                        <div className="text-xs uppercase tracking-wide">Ends in</div>
                        <div className="font-bold">{getTimeLeft(deal.expires_at)}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* CTA Button */}
                <Link
                  to={deal.product_link || "/products"}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-white to-blue-100 text-blue-700 hover:from-blue-100 hover:to-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Shop Now
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              
              {/* Right Content - Product Image */}
              <div className="hidden lg:block flex-1 relative">
                <div className="relative w-64 h-64 xl:w-80 xl:h-80 mx-auto">
                  {/* Floating bubble effect */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 bg-blue-400/20 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-400/20 rounded-full animate-pulse delay-1000"></div>
                  
                  {/* Main product image */}
                  <div className="relative w-full h-full">
                    <img
                      src={deal.product_image || "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800"}
                      alt={deal.title || "Product"}
                      className="w-full h-full object-contain drop-shadow-2xl"
                    />
                  </div>
                  
                  {/* Price Tag */}
                  {deal.original_price && deal.discounted_price && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl shadow-2xl">
                      <div className="flex items-center gap-2">
                        <span className="line-through text-sm opacity-75">₹{deal.original_price}</span>
                        <span className="text-2xl font-bold">₹{deal.discounted_price}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {deals.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-blue-700 p-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 opacity-0 lg:group-hover:opacity-100 z-30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-blue-700 p-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 opacity-0 lg:group-hover:opacity-100 z-30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Progress Dots */}
      {deals.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {deals.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 flex flex-col items-center group ${
                index === currentIndex ? 'scale-125' : 'hover:scale-110'
              }`}
            >
              <div className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-10'
                  : 'bg-white/50 hover:bg-white/75'
              }`} />
              {index === currentIndex && deals.length > 1 && (
                <span className="text-xs text-white mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Slide {index + 1}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Navigation */}
      {deals.length > 1 && (
        <div className="lg:hidden absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm rounded-full p-2 flex gap-2 z-30">
          <button
            onClick={goToPrevious}
            className="bg-white/80 hover:bg-white text-blue-700 p-2 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="bg-white/80 hover:bg-white text-blue-700 p-2 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Timer for current deal */}
      {currentDeal?.expires_at && (
        <div className="absolute top-6 right-6 bg-gradient-to-r from-red-500/90 to-orange-500/90 text-white px-4 py-2 rounded-lg shadow-lg z-30 hidden lg:block">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <div className="text-sm font-bold">
              {getTimeLeft(currentDeal.expires_at)} left
            </div>
          </div>
        </div>
      )}
    </div>
  );
}