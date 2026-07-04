import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Star, Loader2, ShoppingCart, MessageSquare, ShieldCheck, CornerUpLeft } from 'lucide-react';

interface Review {
  id: number;
  username: string;
  first_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ProductDetailData {
  id: number;
  name: string;
  description: string;
  slug: string;
  price: number;
  stock: number;
  average_rating: number;
  images: string[];
  reviews: Review[];
  is_verified_buyer: boolean;
  has_reviewed: boolean;
}

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartError, setCartError] = useState<string | null>(null);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Review Form States
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug, token]);

  const fetchProduct = () => {
    setLoading(true);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    fetch(`http://localhost:8000/api/products/${slug}/`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load product specifications.');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleAddToCart = () => {
    if (!product) return;
    const errorMsg = addToCart(product, quantity);
    if (errorMsg) {
      setCartError(errorMsg);
      setCartSuccess(false);
      setTimeout(() => setCartError(null), 4000);
    } else {
      setCartSuccess(true);
      setCartError(null);
      setTimeout(() => setCartSuccess(false), 2000);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !product) return;
    
    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(false);

    fetch(`http://localhost:8000/api/products/${slug}/review/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify({ rating, comment }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.error || 'Failed to submit review.');
          });
        }
        return res.json();
      })
      .then(() => {
        setSubmittingReview(false);
        setReviewSuccess(true);
        setComment('');
        // Refresh product details to show the new review and update average rating
        fetchProduct();
      })
      .catch((err) => {
        setReviewError(err.message);
        setSubmittingReview(false);
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="font-semibold text-sm">Loading specifications specs...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl text-center shadow-lg">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
        <p className="text-slate-500 text-sm mb-6">{error || 'Specifications could not be loaded.'}</p>
        <Link to="/" className="bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-hover transition-all-300 flex items-center justify-center gap-2">
          <CornerUpLeft className="h-4 w-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary mb-6 transition-all-300">
        <CornerUpLeft className="h-4 w-4" />
        <span>Back to Catalog</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden h-[400px] flex items-center justify-center p-4 relative shadow-sm">
            {activeImage ? (
              <img src={`http://localhost:8000${activeImage}`} alt={product.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <Star className="h-20 w-20 text-slate-200" />
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`h-16 w-16 border rounded-xl overflow-hidden bg-white p-1 flex-shrink-0 transition-all-300 ${
                    activeImage === img ? 'border-primary shadow-sm ring-2 ring-primary/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={`http://localhost:8000${img}`} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Detail & Purchase Controller */}
        <div className="flex flex-col bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight mb-2">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            {/* Rating summary */}
            <div className="flex items-center gap-1">
              <Star className={`h-4 w-4 ${product.average_rating > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              <span className="text-sm font-bold text-slate-700">
                {product.average_rating > 0 ? product.average_rating.toFixed(1) : 'No reviews'}
              </span>
            </div>
            
            {/* Stock indicator */}
            <div>
              {product.stock === 0 ? (
                <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
              ) : product.stock <= 5 ? (
                <span className="bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">Low Stock ({product.stock} left)</span>
              ) : (
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">In Stock ({product.stock})</span>
              )}
            </div>
          </div>

          <div className="border-t border-b border-slate-100 py-4 mb-6">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest block mb-1">PROCURMENT RATE</span>
            <span className="text-3xl font-black text-slate-900">GH₵ {product.price.toLocaleString()}</span>
          </div>

          <div className="text-slate-600 text-sm leading-relaxed mb-8">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider mb-2">Technical Description</h3>
            <p className="whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Action controllers */}
          {product.stock > 0 && (
            <div className="flex flex-col gap-4 mt-auto">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-500">Quantity:</span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-bold text-slate-700 text-sm focus:outline-none focus:border-primary"
                >
                  {[...Array(Math.min(9, product.stock))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-[1.01] transition-all-300 text-base"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Configure &amp; Add to Cart</span>
                </button>
                
                {cartError && (
                  <p className="text-red-500 text-xs font-semibold text-center mt-2">{cartError}</p>
                )}
                {cartSuccess && (
                  <p className="text-emerald-500 text-xs font-semibold text-center mt-2">Successfully configured in cart!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews and verified form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start border-t border-slate-200/80 pt-10">
        {/* Left Reviews List column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Verified Customer Reviews ({product.reviews.length})</span>
          </h2>

          <div className="flex flex-col gap-4">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <strong className="text-slate-800 text-sm font-extrabold block">{rev.first_name || rev.username}</strong>
                    <span className="text-xs text-slate-400">{rev.created_at}</span>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{rev.comment}</p>
              </div>
            ))}

            {product.reviews.length === 0 && (
              <p className="text-slate-400 font-medium text-sm text-center py-10 bg-white border border-dashed border-slate-200 rounded-2xl">
                No customer ratings submitted for this hardware configuration yet.
              </p>
            )}
          </div>
        </div>

        {/* Right Write Review Form column */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Verified Feedback Desk</span>
            </h3>

            {isAuthenticated ? (
              product.is_verified_buyer ? (
                product.has_reviewed ? (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold p-4 rounded-xl leading-relaxed">
                    ✔ Thank you for your feedback! You have successfully reviewed this premium hardware configuration.
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                    {reviewError && (
                      <div className="bg-red-50 border border-red-100 text-red-500 text-xs font-semibold p-3 rounded-xl">
                        {reviewError}
                      </div>
                    )}
                    {reviewSuccess && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-500 text-xs font-semibold p-3 rounded-xl">
                        Review published successfully!
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-extrabold text-slate-500 uppercase">Rating Score</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setRating(val)}
                            className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all-300 border ${
                              rating === val
                                ? 'bg-primary border-primary text-white shadow-md shadow-primary/10'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-extrabold text-slate-500 uppercase">Commentary</label>
                      <textarea
                        rows={4}
                        placeholder="Enter technical rating details..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm focus:outline-none focus:border-primary placeholder:text-slate-400 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-primary hover:bg-primary-hover text-white font-bold py-2.5 rounded-xl text-center text-sm shadow-md transition-all-300 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      <span>Submit Review</span>
                    </button>
                  </form>
                )
              ) : (
                <div className="bg-slate-50 border border-slate-100 text-slate-500 text-xs font-medium p-4 rounded-xl leading-relaxed">
                  🔒 <strong>Verification Required:</strong> Only confirmed buyers who have purchased and paid for this hardware can submit reviews.
                </div>
              )
            ) : (
              <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-slate-500 text-xs font-semibold mb-3">Please login to write verified product reviews.</p>
                <Link to="/login" className="inline-block bg-primary text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm hover:bg-primary-hover transition-all-300">Login</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
