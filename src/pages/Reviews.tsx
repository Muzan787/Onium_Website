import { useEffect, useState } from 'react';
import { Star, Send, User, Calendar, Upload, ThumbsUp, Image as ImageIcon } from 'lucide-react';
import { supabase, Review } from '../lib/supabase';
import SEO from '../components/SEO';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [formData, setFormData] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').eq('is_approved', true).order('created_at', { ascending: false });
    setReviews(data || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
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
        const res = await fetch(`https://api.cloudinary.com/v1_1/dztldh7o2/image/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        uploadedImageUrl = data.secure_url;
      } catch (e) { console.error(e); }
    }
    const { error } = await supabase.from('reviews').insert([{ customer_name: formData.name, rating: formData.rating, comment: formData.comment, image_url: uploadedImageUrl || null }]);
    if (!error) { setMessage('Review submitted for approval!'); setFormData({ name: '', rating: 5, comment: '' }); setSelectedFile(null); setPreviewUrl(null); setTimeout(() => fetchReviews(), 2000); }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <SEO title="Reviews" description="See what our customers are saying about Onium cleaning products." />
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Customer Stories</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">Read honest feedback from our community or share your own experience.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Send className="w-5 h-5 text-primary-500" /> Share Experience</h2>
              {message && <div className="mb-6 p-4 bg-primary-50 text-primary-700 rounded-xl text-sm font-bold flex gap-2"><ThumbsUp className="w-5 h-5" />{message}</div>}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Name</label><input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Your name" /></div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                  <div className="flex gap-2 p-4 bg-slate-50 rounded-xl justify-center">{[1,2,3,4,5].map(num => (<button key={num} type="button" onClick={() => setFormData({...formData, rating: num})} className="hover:scale-110 transition-transform"><Star size={28} fill={num <= formData.rating ? "#fbbf24" : "#e2e8f0"} className={num <= formData.rating ? "text-accent-400" : "text-slate-200"} /></button>))}</div>
                </div>
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Review</label><textarea required className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none h-32 resize-none transition-all" value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} placeholder="Tell us about it..." /></div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Photo (Optional)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-all cursor-pointer relative">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {previewUrl ? <img src={previewUrl} className="h-32 mx-auto rounded-lg object-cover" /> : <div className="space-y-2"><Upload className="w-8 h-8 text-slate-400 mx-auto" /><p className="text-xs text-slate-500">Tap to upload</p></div>}
                  </div>
                </div>
                <button disabled={isSubmitting} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">{isSubmitting ? 'Posting...' : 'Post Review'}</button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg">{review.customer_name.charAt(0)}</div>
                    <div><h4 className="font-bold text-slate-900">{review.customer_name}</h4><div className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(review.created_at).toLocaleDateString()}</div></div>
                  </div>
                  <div className="flex text-accent-400">{[...Array(5)].map((_,i) => <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} />)}</div>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4">"{review.comment}"</p>
                {review.image_url && <img src={review.image_url} alt="Review" className="w-full h-48 md:h-64 object-cover rounded-xl mt-4" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}