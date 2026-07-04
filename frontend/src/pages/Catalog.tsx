import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { Search, Loader2, Star, Plus, Monitor } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  slug: string;
  price: number;
  stock: number;
  average_rating: number;
  image: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

const Catalog: React.FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cartFeedback, setCartFeedback] = useState<Record<number, string>>({});

  useEffect(() => {
    // Fetch categories
    fetch('http://localhost:8000/api/products/categories/')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = 'http://localhost:8000/api/products/';
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  }, [searchQuery, selectedCategory]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    const error = addToCart(product, 1);
    
    if (error) {
      setCartFeedback({ ...cartFeedback, [product.id]: error });
      setTimeout(() => {
        setCartFeedback((prev) => {
          const next = { ...prev };
          delete next[product.id];
          return next;
        });
      }, 3000);
    } else {
      setCartFeedback({ ...cartFeedback, [product.id]: 'Added!' });
      setTimeout(() => {
        setCartFeedback((prev) => {
          const next = { ...prev };
          delete next[product.id];
          return next;
        });
      }, 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white rounded-3xl p-8 md:p-12 mb-8 shadow-xl flex flex-col md:flex-row justify-between items-center relative overflow-hidden animate-float">
        <div className="relative z-10 max-w-3xl text-center md:text-left">
          <span className="bg-white/20 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full">SYSTEM PROCUREMENT UNIT</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-4">MED COMPUTERS &amp; TECH HUB</h1>
          <p className="mt-4 text-base md:text-lg text-slate-100 max-w-lg leading-relaxed">
            Acquire high-performance computing configurations, workstations, and custom server infrastructure.
          </p>
        </div>
        {/* Decorative Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      </div>

      {/* Grid Layout: Sidebar Filter & Products Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 bg-white border border-slate-200/80 rounded-2xl p-5">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search specifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-medium text-slate-800 text-sm placeholder:text-slate-400"
            />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-widest mb-4">Classifications</h3>
          <div className="flex flex-wrap lg:flex-col gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all-300 w-full ${
                selectedCategory === null
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all-300 w-full ${
                  selectedCategory === cat.slug
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Products section */}
        <main className="flex-1 w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="font-semibold text-sm">Compiling catalog index...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center">
              <p className="text-slate-400 font-medium text-lg">No hardware configurations match your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="mt-4 bg-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md hover:bg-primary-hover transition-all-300"
              >
                Clear Search &amp; Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-lg transition-all-300 flex flex-col group relative"
                >
                  {/* Image link */}
                  <a href={`/product/${prod.slug}`} className="block h-52 overflow-hidden bg-slate-50 relative border-b border-slate-100 flex-shrink-0">
                    {prod.image ? (
                      <img
                        src={`http://localhost:8000${prod.image}`}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Monitor className="h-12 w-12" />
                      </div>
                    )}
                    
                    {/* Stock Alert */}
                    {prod.stock === 0 ? (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">OUT OF STOCK</span>
                    ) : prod.stock <= 5 ? (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">LOW STOCK</span>
                    ) : null}
                  </a>

                  {/* Body details */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <a href={`/product/${prod.slug}`} className="font-extrabold text-slate-800 text-base leading-tight hover:text-primary transition-all-300 flex-1">
                        {prod.name}
                      </a>
                    </div>
                    
                    {/* Ratings */}
                    <div className="flex items-center gap-1 mb-3">
                      <Star className={`h-3.5 w-3.5 ${prod.average_rating > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                      <span className="text-xs font-bold text-slate-600">{prod.average_rating > 0 ? prod.average_rating.toFixed(1) : 'No reviews'}</span>
                    </div>

                    <p className="text-slate-500 text-xs line-clamp-3 mb-4 leading-relaxed">{prod.description}</p>
                    
                    {/* Price and Add button */}
                    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">PRICE</span>
                        <span className="text-lg font-black text-slate-900">GH₵ {prod.price.toLocaleString()}</span>
                      </div>
                      
                      {prod.stock > 0 ? (
                        <div className="relative">
                          <button
                            onClick={(e) => handleAddToCart(e, prod)}
                            className="bg-primary hover:bg-primary-hover text-white h-9 w-9 rounded-xl flex items-center justify-center shadow-md shadow-primary/10 hover:shadow-primary/20 hover:scale-105 transition-all-300"
                            title="Add to Cart"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                          
                          {cartFeedback[prod.id] && (
                            <span className={`absolute bottom-11 right-0 text-[10px] font-black px-2 py-1 rounded-lg shadow-md whitespace-nowrap z-10 transition-all duration-300 ${
                              cartFeedback[prod.id] === 'Added!' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                              {cartFeedback[prod.id]}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;
