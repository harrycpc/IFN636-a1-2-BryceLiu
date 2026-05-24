import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAllLongStayRules,
  createLongStayRule,
  updateLongStayRule,
  deleteLongStayRule,
  getWeekendSurcharge,
  updateWeekendSurcharge,
} from '../api/pricingApi';

// Admin Pricing Settings page
// Simple page: manage long-stay rules and weekend surcharge
const AdminPricingSettings = () => {
  const { user } = useAuth();
  const token = user?.token;

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // form state for add/edit
  const [form, setForm] = useState({ minDays: '', discountRate: '' });
  const [editingId, setEditingId] = useState(null);

  const [weekendRate, setWeekendRate] = useState(0);
  const [weekendLoading, setWeekendLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllLongStayRules(token);
        setRules(data);
      } catch (error) {
        alert('Failed to load long-stay rules');
      } finally {
        setLoading(false);
      }
    };

    const fetchWeekend = async () => {
      try {
        setWeekendLoading(true);
        const data = await getWeekendSurcharge(token);
        setWeekendRate(data.weekendSurchargeRate || 0);
      } catch (error) {
        alert('Failed to load weekend surcharge');
      } finally {
        setWeekendLoading(false);
      }
    };

    fetchData();
    fetchWeekend();
  }, [token]);

  const handleFormChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { minDays: Number(form.minDays), discountRate: Number(form.discountRate) };
      if (editingId) {
        const updated = await updateLongStayRule(token, editingId, payload);
        setRules((prev) => prev.map((r) => (r._id === editingId ? updated : r)));
        setEditingId(null);
      } else {
        const created = await createLongStayRule(token, payload);
        setRules((prev) => [...prev, created]);
      }
      setForm({ minDays: '', discountRate: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save rule');
    }
  };

  const handleEdit = (rule) => {
    setEditingId(rule._id);
    setForm({ minDays: rule.minDays, discountRate: rule.discountRate });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await deleteLongStayRule(token, id);
      setRules((p) => p.filter((r) => r._id !== id));
    } catch (error) {
      alert('Failed to delete rule');
    }
  };

  const handleWeekendSave = async () => {
    try {
      const payload = { weekendSurchargeRate: Number(weekendRate) };
      await updateWeekendSurcharge(token, payload);
      alert('Weekend surcharge updated');
    } catch (error) {
      alert('Failed to update weekend surcharge');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Pricing Settings</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Long-stay Discount Rules</h2>
            <form onSubmit={handleAddOrUpdate} className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <input name="minDays" value={form.minDays} onChange={handleFormChange} type="number" min="1" placeholder="Min days" className="px-3 py-2 rounded border" required />
                <input name="discountRate" value={form.discountRate} onChange={handleFormChange} type="number" min="0" max="100" placeholder="Discount %" className="px-3 py-2 rounded border" required />
              </div>
              <div className="flex gap-3">
                <button className="bg-purple-500 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => { setForm({ minDays: '', discountRate: '' }); setEditingId(null); }} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>

            {loading ? (
              <p className="text-gray-500">Loading rules...</p>
            ) : (
              <div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="p-2">Min days</th>
                      <th className="p-2">Discount %</th>
                      <th className="p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((r) => (
                      <tr key={r._id} className="border-t">
                        <td className="p-2">{r.minDays}</td>
                        <td className="p-2">{r.discountRate}%</td>
                        <td className="p-2">
                          <button onClick={() => handleEdit(r)} className="text-sm text-purple-600 mr-3">Edit</button>
                          <button onClick={() => handleDelete(r._id)} className="text-sm text-red-600">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Weekend Surcharge (Fri–Sun)</h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Surcharge %</label>
              <input type="number" min="0" max="100" value={weekendRate} onChange={(e) => setWeekendRate(e.target.value)} className="w-40 px-3 py-2 rounded border" />
            </div>
            <div>
              <button onClick={handleWeekendSave} className="bg-purple-500 text-white px-4 py-2 rounded">Save</button>
            </div>
            {weekendLoading && <p className="text-gray-500 mt-3">Loading weekend surcharge...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPricingSettings;

