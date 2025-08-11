import React from 'react';
import Layout from '../../components/Layout';
import { useUser } from '../../context/UserContext';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRODUCT_LOOKUP: Record<string, { id: string; name: string; price: number; image: string }> = {
  p1: { id: 'p1', name: 'MacBook Pro 16"', price: 500, image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400' },
  p2: { id: 'p2', name: 'Canon EOS R5', price: 800, image: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400' },
  p3: { id: 'p3', name: 'Gaming Chair Pro', price: 200, image: 'https://images.pexels.com/photos/4050320/pexels-photo-4050320.jpeg?auto=compress&cs=tinysrgb&w=400' },
  p4: { id: 'p4', name: 'Mountain Bike', price: 300, image: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400' },
};

const WishlistPage: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const wishlist = user?.wishlist ?? [];

  const removeItem = (id: string) => updateUser({ wishlist: wishlist.filter(pid => pid !== id) });
  const goToProduct = (id: string) => {
    navigate(`/customer/product/${id}`);
  };

  return (
    <Layout title="Wishlist">
      <div className="space-y-4">
        {wishlist.length === 0 && (
          <div className="text-center text-gray-600 dark:text-gray-300">Your wishlist is empty.</div>
        )}
        {wishlist.map((id) => {
          const p = PRODUCT_LOOKUP[id];
          if (!p) return null;
          return (
            <div key={id} className="flex items-center gap-4 card p-4">
              <img src={p.image} alt={p.name} className="w-20 h-20 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">{p.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">₹{p.price}/day</div>
              </div>
              <button onClick={() => goToProduct(id)} className="p-2 rounded-lg bg-indigo-600 text-white" title="Book">
                <ShoppingCart size={18} />
              </button>
              <button onClick={() => removeItem(id)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200" title="Remove">
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default WishlistPage;


