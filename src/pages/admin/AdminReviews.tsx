import { useEffect, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { supabase, type Review } from '../../lib/supabase';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    setReviews(data || []);
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    await supabase.from('reviews').update({ is_approved: !currentStatus }).eq('id', id);
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (confirm('Delete this review?')) {
      await supabase.from('reviews').delete().eq('id', id);
      fetchReviews();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Reviews</h2>
      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">No reviews yet.</div>
        ) : reviews.map(review => (
          <div key={review.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 break-words">{review.customer_name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{review.rating} Stars</p>
              </div>
              <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs ${review.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {review.is_approved ? 'Approved' : 'Pending'}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-700 break-words">{review.comment}</p>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-1">
              <button onClick={() => toggleApproval(review.id, review.is_approved)} aria-label="Toggle approval" className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                <Check size={20} />
              </button>
              <button onClick={() => deleteReview(review.id)} aria-label="Delete review" className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Rating</th>
              <th className="px-6 py-3">Comment</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reviews.map(review => (
              <tr key={review.id}>
                <td className="px-6 py-4 font-medium">{review.customer_name}</td>
                <td className="px-6 py-4">{review.rating} Stars</td>
                <td className="px-6 py-4 max-w-xs truncate">{review.comment}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${review.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {review.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => toggleApproval(review.id, review.is_approved)} className="text-blue-600 hover:text-blue-900">
                    <Check size={20} />
                  </button>
                  <button onClick={() => deleteReview(review.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}