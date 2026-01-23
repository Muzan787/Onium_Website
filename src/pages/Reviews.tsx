import { useEffect, useState } from 'react';
import { Star, Image as ImageIcon, Send, User, Calendar, Upload, ThumbsUp } from 'lucide-react';
import { supabase, Review } from '../lib/supabase';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [formData, setFormData] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    setReviews(data || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let uploadedImageUrl = "";

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'OniumReviews'); 

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dztldh7o2/image/upload`,
          { method: 'POST', body: formData }
        );
        const data = await response.json();
        uploadedImageUrl = data.secure_url;
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
      }
    }

    const { error } = await supabase.from('reviews').insert([{
      customer_name: formData.name,
      rating: formData.rating,
      comment: formData.comment,
      image_url: uploadedImageUrl || null 
    }]);

    if (!error) {
      setMessage('🎉 Thank you! Your review will appear once approved.');
      setFormData({ name: '', rating: 5, comment: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
      setTimeout(() => fetchReviews(), 2000); // Refresh reviews after submission
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Customer Reviews
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Hear what our customers say about their Onium experience. Share your story too!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Review Form Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Send className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Share Your Experience</h2>
                </div>
                
                {message && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <p className="text-green-700 font-medium flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5" /> {message}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white/50"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="flex">
                        {[1,2,3,4,5].map(num => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setFormData({...formData, rating: num})}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star 
                              size={24}
                              fill={num <= formData.rating ? "#fbbf24" : "#e2e8f0"}
                              className={num <= formData.rating ? "text-yellow-400" : "text-slate-300"}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-lg font-bold text-slate-700">
                        {formData.rating}.0
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      placeholder="Tell us about your experience with Onium products..."
                      required
                      className="w-full p-4 border border-slate-300 rounded-xl h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white/50 resize-none"
                      value={formData.comment}
                      onChange={e => setFormData({...formData, comment: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Attach Product Photo
                      <span className="text-slate-400 font-normal ml-2">(Optional)</span>
                    </label>
                    <div className="relative group">
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-3">
                          <div className="inline-flex p-3 bg-blue-100 rounded-full">
                            <Upload className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-700">
                              {selectedFile ? selectedFile.name : 'Click to upload'}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {previewUrl && (
                        <div className="mt-4">
                          <div className="relative rounded-lg overflow-hidden">
                            <img 
                              src={previewUrl} 
                              alt="Preview" 
                              className="w-full h-48 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-slate-900 to-slate-700 text-white py-4 rounded-xl font-bold hover:from-slate-800 hover:to-slate-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Posting Review...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Post Review
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Reviews Display Section */}
          <div className="lg:col-span-2">
            {/* Stats Overview */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  Customer Feedback
                </h3>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">{reviews.length} Reviews</span>
                </div>
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div 
                      key={review.id} 
                      className="group bg-gradient-to-r from-white to-slate-50 rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                                  <span className="font-bold text-slate-700">
                                    {review.customer_name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-slate-900">
                                    {review.customer_name}
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(review.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Star Rating */}
                              <div className="flex items-center gap-2 mb-4">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={20}
                                      fill={i < review.rating ? "#fbbf24" : "#e2e8f0"}
                                      className={i < review.rating ? "text-yellow-400" : "text-slate-300"}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm font-bold text-slate-700">
                                  {review.rating}.0
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Review Comment */}
                          <div className="relative">
                            <div className="text-slate-700 leading-relaxed text-lg mb-4 italic">
                              "{review.comment}"
                            </div>
                            <div className="absolute -left-6 top-0 text-4xl text-slate-200 opacity-50">
                              "
                            </div>
                          </div>
                        </div>
                        
                        {/* Review Image */}
                        {review.image_url && (
                          <div className="md:w-64 w-full flex-shrink-0">
                            <div className="relative overflow-hidden rounded-lg group">
                              <img 
                                src={review.image_url} 
                                alt={`Product reviewed by ${review.customer_name}`}
                                className="w-full h-48 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="text-center py-12">
                  <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
                    <Star className="w-12 h-12 text-slate-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-700 mb-2">
                    No Reviews Yet
                  </h4>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Be the first to share your experience with Onium products. Your review helps others make informed decisions!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}