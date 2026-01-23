import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Minus, Plus, Shield, Truck, RefreshCw, Star, Package, Droplets, Leaf, Check, Share2, Heart } from 'lucide-react';
import { supabase, Product, Review } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const [reviewFile, setReviewFile] = useState<File | null>(null);
  const reviewsCount = productReviews.length;
  const averageRating = reviewsCount > 0 
    ? (productReviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewsCount).toFixed(1)
    : 0;

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchProductReviews(); // Add this call
    }
  }, [id]);


  const fetchProduct = async () => {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (productError) throw productError;
      setProduct(productData);

      if (productData) {
        const { data: relatedData } = await supabase
          .from('products')
          .select('*')
          .eq('category', productData.category)
          .neq('id', id)
          .limit(4);

        setRelatedProducts(relatedData || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
    setProductReviews(data || []);
  };

  const handleAddToCart = () => {
    if (product) {
      setIsAdding(true);
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setTimeout(() => setIsAdding(false), 1000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmittingReview(true);

  let uploadedImageUrl = "";

  // Optional: Cloudinary upload logic if a file is selected
  if (reviewFile) {
    const formData = new FormData();
    formData.append('file', reviewFile);
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

  // Insert review with the product_id link
  const { error } = await supabase.from('reviews').insert([{
    customer_name: reviewForm.name,
    rating: reviewForm.rating,
    comment: reviewForm.comment,
    image_url: uploadedImageUrl || null,
    product_id: id // Links the review to this specific product
  }]);

  if (!error) {
    setReviewMessage('🎉 Review submitted! It will appear once approved.');
    setReviewForm({ name: '', rating: 5, comment: '' });
    setReviewFile(null);
    setTimeout(() => setReviewMessage(''), 5000);
  } else {
    alert("Failed to submit review.");
  }
  setIsSubmittingReview(false);
};

  const productImages = product?.image_url 
    ? [product.image_url, ...(product.additional_images || [])]
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Sorry, we couldn't find the product you're looking for.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Floating WhatsApp button for product inquiry */}
      <a
        href={`https://wa.me/923231550147?text=I'm%20interested%20in%20${encodeURIComponent(product.title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-green-500 to-green-600 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
      >
        <div className="relative">
          <span className="absolute -top-10 -left-20 bg-white text-green-700 text-sm font-semibold px-3 py-1 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
            Ask on WhatsApp
          </span>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-1.831 0-3.505-.655-4.812-1.741l-4.812 1.741 1.321-4.631c-1.102-1.904-1.74-4.076-1.74-6.399 0-6.214 5.058-11.272 11.272-11.272 3.014 0 5.847 1.174 7.977 3.304 2.13 2.131 3.304 4.964 3.304 7.977 0 6.214-5.058 11.272-11.272 11.272"/>
          </svg>
        </div>
      </a>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link to="/products" className="hover:text-blue-600 transition-colors">
            Products
          </Link>
          <span className="text-gray-400">/</span>
          <Link 
            to={`/products?category=${product.category}`} 
            className="hover:text-blue-600 transition-colors capitalize"
          >
            {product.category}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-blue-600 font-medium truncate max-w-xs">
            {product.title}
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gradient-to-br from-white to-blue-50 rounded-2xl overflow-hidden shadow-xl border border-blue-100 group">
              <img
                src={productImages[selectedImage] || product.image_url}
                alt={product.title}
                className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
              />
              {/* Quick action buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-2.5 rounded-full shadow-lg backdrop-blur-sm transition-all ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
                </button>
                <button className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-700 hover:bg-white transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              {/* Stock badge */}
              {product.stock <= 10 && product.stock > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  Only {product.stock} left!
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-blue-500 scale-105' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                {product.category}
              </span>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">
                    ({reviewsCount > 0 ? averageRating : 'No reviews'})
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.title}
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-blue-700">
                    Rs{product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    per {product.unit || 'item'}
                  </span>
                </div>
                <div className="mt-2 text-green-600 font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Competitive price • Best quality
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock === 0 ? (
                  <div className="flex items-center gap-2 text-red-600 font-semibold">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    Out of Stock
                  </div>
                ) : product.stock <= 10 ? (
                  <div className="flex items-center gap-2 text-orange-600 font-semibold">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    Only {product.stock} items left
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    In Stock ({product.stock} available)
                  </div>
                )}
              </div>

              {/* Quantity & Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="font-semibold text-gray-700">Quantity:</label>
                  <div className="flex items-center border-2 border-blue-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-blue-50 transition-colors text-blue-600"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-6 font-bold text-gray-900 text-lg min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-blue-50 transition-colors text-blue-600"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {product.stock > 0 && (
                      <>Max {product.stock} per order</>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || isAdding}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold text-lg hover:scale-[1.02]"
                  >
                    {isAdding ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-6 h-6" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  <button className="px-6 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold transition-colors">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            {/* Product Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Eco-Friendly</div>
                  <div className="text-sm text-gray-500">Biodegradable formula</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-blue-100">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Shield className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Safe & Gentle</div>
                  <div className="text-sm text-gray-500">Hypoallergenic</div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  Product Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg">
                      <Check className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {String(value)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Info */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 mb-3">
                <Truck className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-gray-900">Delivery Information</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-gray-700">Free Delivery</div>
                  <div className="text-gray-500">On orders above Rs2,000</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Same Day</div>
                  <div className="text-gray-500">Delivery in selected areas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Specific Reviews */}
        <div className="mt-16 bg-white rounded-2xl border border-blue-100 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Product Reviews</h2>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Display Reviews */}
            <div className="space-y-6">
              {productReviews.length > 0 ? (
                productReviews.map((rev) => (
                  <div key={rev.id} className="border-b border-gray-100 pb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill={i < rev.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="font-bold text-gray-900">{rev.customer_name}</span>
                    </div>
                    <p className="text-gray-600 italic">"{rev.comment}"</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No reviews for this product yet.</p>
              )}
            </div>
            
            {/* Quick Review Form */}
            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Write a Review
              </h3>
              
              {reviewMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  {reviewMessage}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={reviewForm.name}
                    onChange={e => setReviewForm({...reviewForm, name: e.target.value})}
                    placeholder="e.g. Ali Khan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setReviewForm({...reviewForm, rating: num})}
                        className="hover:scale-110 transition-transform"
                      >
                        <Star 
                          size={24} 
                          fill={num <= reviewForm.rating ? "#fbbf24" : "none"} 
                          className={num <= reviewForm.rating ? "text-yellow-400" : "text-gray-300"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Your Comments</label>
                  <textarea
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                    placeholder="What did you think of this product?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingReview ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : 'Post Review'}
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  You May Also Like
                </h2>
                <p className="text-gray-600">Similar cleaning products you might need</p>
              </div>
              <Link
                to={`/products?category=${product.category}`}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
              >
                View all
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* FAQ/Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-green-600" />
              <h4 className="font-bold text-gray-900">Quality Guaranteed</h4>
            </div>
            <p className="text-gray-600 text-sm">
              All our products are tested for quality and effectiveness. 100% satisfaction guaranteed.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6 text-blue-600" />
              <h4 className="font-bold text-gray-900">Easy Returns</h4>
            </div>
            <p className="text-gray-600 text-sm">
              7-day return policy. If you're not satisfied, we'll make it right.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-6 h-6 text-orange-600" />
              <h4 className="font-bold text-gray-900">Fast Shipping</h4>
            </div>
            <p className="text-gray-600 text-sm">
              Orders placed before 2 PM are shipped same day. Track your order in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}