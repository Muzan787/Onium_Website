import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ShoppingCart, Minus, Plus, Shield, Truck, RefreshCw, Star, Package, Droplets, Leaf, Check, Share2, CheckCircle, X, Maximize2 } from 'lucide-react';
import { supabase, Product, Review } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import SEO from '../components/SEO';

export default function ProductDetail() {
  const { slug } = useParams(); 
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  
  // Review states
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewFile, setReviewFile] = useState<File | null>(null);

  const hasDiscount = product?.discount && product?.discount > 0;
  const finalPrice = product ? (hasDiscount ? product.price * (1 - product.discount! / 100) : product.price) : 0;
  
  const reviewsCount = productReviews.length;
  const averageRating = reviewsCount > 0 
    ? (productReviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewsCount).toFixed(1)
    : 0;

  useEffect(() => {
    if (slug) fetchProduct();
  }, [slug]);

  const handleShare = async () => {
    if (!product) return;
    const shareData = { title: product.title, text: `Check out ${product.title}!`, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); toast.success('Shared!'); } catch (err) {}
    } else {
      try { await navigator.clipboard.writeText(window.location.href); toast.success('Copied to clipboard'); } catch (err) {}
    }
  };

  const fetchProduct = async () => {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (productError) throw productError;
      setProduct(productData);

      if (productData) {
        fetchProductReviews(productData.id);
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', productData.category)
          .neq('id', productData.id)
          .limit(4);
        setRelatedProducts(relatedData || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductReviews = async (productId: string) => {
    const { data } = await supabase.from('reviews').select('*').eq('product_id', productId).eq('is_approved', true).order('created_at', { ascending: false });
    setProductReviews(data || []);
  };

  const handleAddToCart = () => {
    if (product) {
      setIsAdding(true);
      for (let i = 0; i < quantity; i++) addToCart(product);
      setTimeout(() => setIsAdding(false), 1000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!product) return;
    setIsSubmittingReview(true);
    let uploadedImageUrl = "";

    if (reviewFile) {
      const formData = new FormData();
      formData.append('file', reviewFile);
      formData.append('upload_preset', 'OniumReviews'); 
      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/dztldh7o2/image/upload`, { method: 'POST', body: formData });
        const data = await response.json();
        uploadedImageUrl = data.secure_url;
      } catch (error) { console.error("Upload failed:", error); }
    }

    const { error } = await supabase.from('reviews').insert([{
      customer_name: reviewForm.name,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      image_url: uploadedImageUrl || null,
      product_id: product.id
    }]);

    if (!error) {
      setReviewMessage('🎉 Review submitted! Awaiting approval.');
      setReviewForm({ name: '', rating: 5, comment: '' });
      setReviewFile(null);
      setTimeout(() => setReviewMessage(''), 5000);
    } else {
      toast.error("Failed to submit review.");
    }
    setIsSubmittingReview(false);
  };

  const productImages = product?.image_url ? [product.image_url, ...(product.additional_images || [])] : [];

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><Package className="w-10 h-10 text-slate-400 mx-auto mb-4"/><h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2><Link to="/" className="text-primary-600 font-bold hover:underline mt-2 inline-block">Back to Home</Link></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <SEO title={product.title} description={product.description?.substring(0, 150)} image={product.image_url} url={`https://onium.store/product/${product.id}`} />
      
      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center animate-fade-in" onClick={() => setShowLightbox(false)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20"><X className="w-8 h-8" /></button>
          <div className="relative w-full h-full p-4 flex items-center justify-center">
            <img src={productImages[selectedImage] || product.image_url} alt={product.title} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

      {/* WhatsApp Floating */}
      <a href={`https://wa.me/923231550147?text=I'm%20interested%20in%20${encodeURIComponent(product.title)}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-primary-600 to-primary-500 text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all">
        {/* SVG Icon from your file... */}
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-1.831 0-3.505-.655-4.812-1.741l-4.812 1.741 1.321-4.631c-1.102-1.904-1.74-4.076-1.74-6.399 0-6.214 5.058-11.272 11.272-11.272 3.014 0 5.847 1.174 7.977 3.304 2.13 2.131 3.304 4.964 3.304 7.977 0 6.214-5.058 11.272-11.272 11.272"/></svg>
      </a>

      <div className="container mx-auto px-4 py-8">
        {/* ... Nav ... */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 font-medium">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="text-slate-300">/</span>
          <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
          <span className="text-slate-300">/</span>
          <span className="capitalize">{product.category}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 group cursor-zoom-in" onClick={() => setShowLightbox(true)}>
              {/* UPDATED: Decreased padding from p-8 to p-4 on mobile for better visibility */}
              <img 
                src={productImages[selectedImage] || product.image_url} 
                alt={product.title} 
                className="w-full h-full object-contain p-4 md:p-8 transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/20 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Maximize2 className="w-8 h-8" /></div>
              <div className="absolute top-4 right-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={handleShare} className="p-2.5 bg-white backdrop-blur-sm rounded-full shadow-lg text-slate-700 hover:bg-slate-50 transition-colors active:scale-95"><Share2 className="w-5 h-5" /></button>
              </div>
            </div>
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button key={index} onClick={() => setSelectedImage(index)} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-primary-500 scale-105' : 'border-slate-200 hover:border-primary-300'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="inline-block bg-secondary-50 text-secondary-700 px-3 py-1 rounded-full text-sm font-bold capitalize tracking-wide">{product.category}</span>
              <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent-400 fill-current" /><span className="text-sm text-slate-600 font-medium">({reviewsCount > 0 ? averageRating : 'New'})</span></div>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">{product.title}</h1>
            
            {/* Description Area (constrained by .prose) */}
            <div 
              className="text-slate-600 text-base md:text-lg leading-relaxed prose prose-slate max-w-none w-full overflow-hidden"
              dangerouslySetInnerHTML={{ __html: product.description || '' }}
            />

            <div className="bg-primary-50/50 p-6 rounded-3xl border border-primary-100">
               {/* Pricing and Cart Logic (Same as before) */}
               <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-5xl font-bold text-slate-900">Rs{finalPrice.toFixed(2)}</span>
                  {hasDiscount && <><span className="text-lg text-slate-400 line-through font-medium">Rs{product.price.toFixed(2)}</span><span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-sm font-bold">-{product.discount}%</span></>}
                </div>
                <span className="text-sm text-slate-500 font-medium block mt-1">per {product.unit || 'item'}</span>
              </div>
              <div className="hidden md:block space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-bold text-slate-700">Qty:</label>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-slate-50 text-slate-600"><Minus className="w-4 h-4" /></button>
                    <span className="px-6 font-bold text-slate-900">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-slate-50 text-slate-600"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAddToCart} disabled={product.stock === 0 || isAdding} className="flex-1 bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 transition-all font-bold text-lg shadow-lg shadow-primary-900/10">
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Droplets className="w-5 h-5 text-secondary-500" /> Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <Check className="w-4 h-4 text-primary-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 capitalize text-sm">{key.replace(/_/g, ' ')}</div>
                      <div className="text-slate-500 text-sm">{String(value)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section... */}
        <div className="mt-16 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Customer Reviews</h2>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {productReviews.length > 0 ? (
                productReviews.map((rev) => (
                  <div key={rev.id} className="border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-accent-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill={i < rev.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="font-bold text-slate-900">{rev.customer_name}</span>
                    </div>
                    <p className="text-slate-600 italic">"{rev.comment}"</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No reviews yet. Be the first!</p>
              )}
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Write a Review</h3>
              {reviewMessage && <div className="mb-4 p-3 bg-primary-100 text-primary-800 rounded-lg text-sm font-bold">{reviewMessage}</div>}
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                  <input type="text" required className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none" value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Rating</label>
                  <div className="flex gap-1">{[1, 2, 3, 4, 5].map((num) => (<button key={num} type="button" onClick={() => setReviewForm({...reviewForm, rating: num})} className="hover:scale-110 transition-transform"><Star size={24} fill={num <= reviewForm.rating ? "#fbbf24" : "none"} className={num <= reviewForm.rating ? "text-accent-400" : "text-slate-300"} /></button>))}</div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Comment</label>
                  <textarea required className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none h-24 resize-none" value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} />
                </div>
                <button type="submit" disabled={isSubmittingReview} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50">{isSubmittingReview ? 'Submitting...' : 'Post Review'}</button>
              </form>
            </div>
          </div>
        </div>
        
        {/* Mobile Sticky Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
          <div className="flex gap-4 items-center">
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50 h-12">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 hover:bg-slate-100 text-slate-600"><Minus className="w-4 h-4" /></button>
              <span className="px-3 font-bold text-slate-900 min-w-[30px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 hover:bg-slate-100 text-slate-600"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0 || isAdding} className={`flex-1 text-white h-12 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${isAdding ? 'bg-primary-500' : 'bg-primary-600'}`}>
              {isAdding ? <><CheckCircle className="w-5 h-5 animate-bounce" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}