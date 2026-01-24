import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Deal } from '../lib/supabase';

export default function DealSlider() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // NEW: Touch handling state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  // Reset timer on slide change to prevent auto-slide right after user interaction
  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [currentIndex, deals.length]);

  const startAutoSlide = () => {
    stopAutoSlide();
    if (deals.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % deals.length);
      }, 5000);
    }
  };

  const stopAutoSlide = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

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

  // Touch Event Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    stopAutoSlide();
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    // Resume auto-slide handled by useEffect
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto aspect-[16/9] bg-gray-200 animate-pulse rounded-lg" />
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto aspect-[16/9] overflow-hidden rounded-lg group bg-gray-100 shadow-lg touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {deals.map((deal) => (
          <div key={deal.id} className="min-w-full h-full relative flex items-center justify-center bg-slate-50">
            <img
              src={deal.image_url}
              alt="Deal"
              className="max-w-full max-h-full object-contain pointer-events-none select-none" // Prevent image drag behavior
            />
          </div>
        ))}
      </div>

      {deals.length > 1 && (
        <>
          {/* Desktop Navigation Buttons (Hidden on mobile) */}
          <button
            onClick={goToPrevious}
            className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {deals.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-6 md:w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}