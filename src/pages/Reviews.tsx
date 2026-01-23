import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase, Review } from '../lib/supabase';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [formData, setFormData] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let uploadedImageUrl = "";

    // 1. Optional Cloudinary Upload
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', 'dztldh7o2OniumReviews'); // Create this in Cloudinary Settings

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

    // 2. Submit to Supabase
    const { error } = await supabase.from('reviews').insert([{
      customer_name: formData.name,
      rating: formData.rating,
      comment: formData.comment,
      image_url: uploadedImageUrl || null // Saves URL if exists, else null
    }]);

    if (!error) {
      setMessage('Thank you! Your review will appear once approved.');
      setFormData({ name: '', rating: 5, comment: '' });
      setSelectedFile(null); // Clear file input
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Customer Reviews</h1>
      
      {/* Review Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-12">
        <h2 className="text-xl font-bold mb-4">Leave a Review</h2>
        {message && <div className="bg-green-50 text-green-700 p-3 rounded mb-4">{message}</div>}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            required
            className="w-full p-2 border rounded"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <select 
            className="w-full p-2 border rounded"
            value={formData.rating}
            onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})}
          >
            {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
          </select>
          <textarea
            placeholder="Your thoughts..."
            required
            className="w-full p-2 border rounded h-24"
            value={formData.comment}
            onChange={e => setFormData({...formData, comment: e.target.value})}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Product Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>
          <button 
            disabled={isSubmitting}
            className="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-800 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Uploading...' : 'Submit Review'}
          </button>
        </div>
      </form>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="border-b pb-6 flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold">{review.customer_name}</span>
                {/* Star rating icons... */}
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
            
            {review.image_url && (
              <div className="w-24 h-24 flex-shrink-0">
                <img 
                  src={review.image_url} 
                  alt="Customer product" 
                  className="w-full h-full object-cover rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}