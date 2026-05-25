import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminShell from '../components/AdminShell';
import Icon from '../components/Icon';
import { fmt$ } from '../utils/format';
import {
  getAllLongStayRules,
  createLongStayRule,
  updateLongStayRule,
  deleteLongStayRule,
  getWeekendSurcharge,
  updateWeekendSurcharge,
} from '../api/pricingApi';

const AdminPricingSettings = () => {
  const { user } = useAuth();
  const token = user?.token;

  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({ minDays: '', discountRate: '' });
  const [editingId, setEditingId] = useState(null);
  const isEditing = Boolean(editingId);

  const [weekendRate, setWeekendRate] = useState(0);
  const [weekendDraft, setWeekendDraft] = useState(0);
  const [weekendSavedAt, setWeekendSavedAt] = useState(null);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await getAllLongStayRules(token);
        setRules(data);
      } catch (error) {
        alert('Failed to load long-stay rules');
      }
    };
    const fetchWeekend = async () => {
      try {
        const data = await getWeekendSurcharge(token);
        const rate = data.weekendSurchargeRate || 0;
        setWeekendRate(rate);
        setWeekendDraft(rate);
      } catch (error) {
        alert('Failed to load weekend surcharge');
      }
    };
    fetchRules();
    fetchWeekend();
  }, [token]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submitRule = async (e) => {
    e.preventDefault();
    const min = Number(form.minDays);
    const rate = Number(form.discountRate);
    if (!min || rate < 0 || rate > 100) return;
    try {
      const payload = { minDays: min, discountRate: rate };
      if (editingId) {
        const updated = await updateLongStayRule(token, editingId, payload);
        setRules((prev) =>
          prev.map((r) => (r._id === editingId ? updated : r))
        );
      } else {
        const created = await createLongStayRule(token, payload);
        setRules((prev) => [...prev, created]);
      }
      setForm({ minDays: '', discountRate: '' });
      setEditingId(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save rule');
    }
  };

  const startEdit = (rule) => {
    setEditingId(rule._id);
    setForm({
      minDays: String(rule.minDays),
      discountRate: String(rule.discountRate),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ minDays: '', discountRate: '' });
  };

  const deleteRule = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await deleteLongStayRule(token, id);
      setRules((prev) => prev.filter((r) => r._id !== id));
      if (editingId === id) cancelEdit();
    } catch (error) {
      alert('Failed to delete rule');
    }
  };

  const saveWeekend = async () => {
    const rate = Math.max(0, Math.min(100, Number(weekendDraft) || 0));
    try {
      await updateWeekendSurcharge(token, { weekendSurchargeRate: rate });
      setWeekendRate(rate);
      setWeekendSavedAt(Date.now());
      setTimeout(() => setWeekendSavedAt(null), 2400);
    } catch (error) {
      alert('Failed to update weekend surcharge');
    }
  };

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => a.minDays - b.minDays),
    [rules]
  );

  // Sample preview: 10-day trip @ $120/day, 4 weekend days
  const sampleDays = 10;
  const samplePerDay = 120;
  const sampleWeekendDays = 4;
  const sampleBase = sampleDays * samplePerDay;
  const applicableRule = [...sortedRules]
    .reverse()
    .find((r) => sampleDays >= r.minDays);
  const sampleDiscount = applicableRule
    ? Math.round((sampleBase * applicableRule.discountRate) / 100)
    : 0;
  const sampleSurcharge = Math.round(
    (sampleWeekendDays * samplePerDay * (Number(weekendDraft) || 0)) / 100
  );
  const sampleTotal = sampleBase - sampleDiscount + sampleSurcharge;

  return (
    <AdminShell>
      <div className="admin-head">
        <div>
          <h1 className="h-display">Pricing Settings</h1>
          <p className="sub">
            Configure long-stay discounts and the weekend surcharge applied to
            every booking.
          </p>
        </div>
      </div>

      <div className="pricing-grid">
        {/* Long-stay rules */}
        <section className="profile-card pricing-card">
          <header className="pricing-card-head">
            <div className="pricing-icon">
              <Icon name="percent" size={20} stroke={2} />
            </div>
            <div>
              <h3>Long-stay Discount Rules</h3>
              <p>
                Reward longer bookings. The rule with the largest{' '}
                <code>minDays</code> ≤ trip length is applied.
              </p>
            </div>
          </header>

          <form className="rule-form" onSubmit={submitRule} noValidate>
            <div className="field-grid">
              <div className="field-stack">
                <label>Minimum days</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  value={form.minDays}
                  onChange={(e) => set('minDays', e.target.value)}
                  placeholder="e.g. 7"
                  required
                />
              </div>
              <div className="field-stack">
                <label>Discount %</label>
                <div className="input-with-suffix">
                  <input
                    className="input"
                    type="number"
                    min="0"
                    max="100"
                    value={form.discountRate}
                    onChange={(e) => set('discountRate', e.target.value)}
                    placeholder="e.g. 10"
                    required
                  />
                  <span className="suffix">%</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                className="btn-primary-sm"
                style={{ minWidth: 120 }}
              >
                {isEditing ? 'Update Rule' : '+ Add Rule'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="btn-secondary-sm"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {sortedRules.length === 0 ? (
            <div className="rule-empty">
              <p>
                No discount rules yet. Add one above — for example, 5% off
                bookings of 3+ days.
              </p>
            </div>
          ) : (
            <table className="admin-table rule-table">
              <thead>
                <tr>
                  <th>Trip length</th>
                  <th>Discount</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedRules.map((r) => (
                  <tr
                    key={r._id}
                    className={editingId === r._id ? 'is-editing' : ''}
                  >
                    <td>
                      <b>{r.minDays}+ days</b>
                      <span className="rule-hint">
                        applied to bookings of {r.minDays} or more days
                      </span>
                    </td>
                    <td>
                      <span className="discount-chip">
                        {r.discountRate}% off
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="row-btn"
                          onClick={() => startEdit(r)}
                          aria-label="Edit rule"
                        >
                          <Icon name="pencil" size={14} stroke={2} />
                        </button>
                        <button
                          type="button"
                          className="row-btn danger"
                          onClick={() => deleteRule(r._id)}
                          aria-label="Delete rule"
                        >
                          <Icon name="trash" size={14} stroke={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Weekend surcharge */}
        <section className="profile-card pricing-card">
          <header className="pricing-card-head">
            <div className="pricing-icon">
              <Icon name="calendar-week" size={20} stroke={2} />
            </div>
            <div>
              <h3>Weekend Surcharge</h3>
              <p>Adds a per-day surcharge to Friday, Saturday and Sunday only.</p>
            </div>
          </header>

          <div className="field-stack">
            <label>Surcharge %</label>
            <div className="input-with-suffix" style={{ maxWidth: 200 }}>
              <input
                className="input"
                type="number"
                min="0"
                max="100"
                step="1"
                value={weekendDraft}
                onChange={(e) => setWeekendDraft(e.target.value)}
              />
              <span className="suffix">%</span>
            </div>
            <p className="field-hint">
              Applied to the day rate on Fri / Sat / Sun. Set to 0 to disable.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginTop: 4,
            }}
          >
            <button
              type="button"
              className="btn-primary-sm"
              style={{ minWidth: 120 }}
              onClick={saveWeekend}
            >
              Save Surcharge
            </button>
            {weekendSavedAt && (
              <span
                style={{ color: 'var(--ok)', fontSize: 14, fontWeight: 600 }}
              >
                ✓ Saved
              </span>
            )}
          </div>

          <div className="weekend-week">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
              const isWeekend = i >= 4;
              return (
                <div
                  key={i}
                  className={'wd' + (isWeekend ? ' is-weekend' : '')}
                >
                  <span className="wd-letter">{d}</span>
                  {isWeekend && (
                    <span className="wd-rate">+{weekendDraft || 0}%</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Preview */}
        <section className="profile-card pricing-preview">
          <header className="pricing-card-head">
            <div className="pricing-icon">
              <Icon name="calendar" size={20} stroke={2} />
            </div>
            <div>
              <h3>Preview · Sample booking</h3>
              <p>
                10-day rental at $120/day with 4 weekend days — using your
                current rules.
              </p>
            </div>
          </header>

          <div className="preview-grid">
            <div className="preview-row">
              <span>
                Base price · {sampleDays} days × {fmt$(samplePerDay)}
              </span>
              <b>{fmt$(sampleBase)}</b>
            </div>
            <div className="preview-row discount">
              <span>
                Long-stay discount
                {applicableRule ? (
                  <em>
                    {' '}
                    · {applicableRule.discountRate}% off (
                    {applicableRule.minDays}+ days rule)
                  </em>
                ) : (
                  <em> · no rule applies</em>
                )}
              </span>
              <b>{sampleDiscount > 0 ? '−' + fmt$(sampleDiscount) : '—'}</b>
            </div>
            <div className="preview-row surcharge">
              <span>
                Weekend surcharge · {sampleWeekendDays} days ×{' '}
                {weekendDraft || 0}%
              </span>
              <b>{sampleSurcharge > 0 ? '+' + fmt$(sampleSurcharge) : '—'}</b>
            </div>
            <div className="preview-row total">
              <span>Estimated total</span>
              <b>{fmt$(sampleTotal)}</b>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
};

export default AdminPricingSettings;
