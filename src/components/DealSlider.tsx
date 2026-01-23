import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Deal } from '../lib/supabase';

export default function DealSlider() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    if (deals.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % deals.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [deals.length]);

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

  if (isLoading) {
    return (
      /* Constrained width on desktop for the loader */
      <div className="w-full max-w-4xl mx-auto aspect-[16/9] bg-gray-200 animate-pulse rounded-lg" />
    );
  }

  if (deals.length === 0) {
    return null;
  }

  return (
    /* 1. mx-auto: Centers the slider.
       2. max-w-4xl: Limits the size on desktop (you can adjust this to 3xl or 5xl).
       3. aspect-[16/9]: Keeps the mobile ratio consistent.
    */
    <div className="relative w-full max-w-4xl mx-auto aspect-[16/9] overflow-hidden rounded-lg group bg-gray-100 shadow-lg">
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {deals.map((deal) => (
          <div key={deal.id} className="min-w-full h-full relative flex items-center justify-center bg-slate-50">
            <img
              src={deal.image_url}
              alt="Deal"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}
      </div>

      {deals.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

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