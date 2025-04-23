import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [spend, setSpend] = useState(30000);
  const [smartBidding, setSmartBidding] = useState('');
  const [performanceTarget, setPerformanceTarget] = useState('');
  const [brandCpc, setBrandCpc] = useState('');
  const [impressionShare, setImpressionShare] = useState('');
  const [matchType, setMatchType] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateWaste = () => {
    const baseWaste = spend * 0.1667;
    const smartBiddingMultiplier = smartBidding === "yes" ? 1.2 : 1.0;
    const performanceTargetMultiplier = (smartBidding === "yes" && performanceTarget === "yes") ? 1.25 : 1.0;
    const brandCpcMultiplier = brandCpc === "yes" ? 1.0 : 1.15;
    const impressionShareMultiplier = impressionShare === "yes" ? 1.25 : 1.0;

    const estimatedWaste = baseWaste * smartBiddingMultiplier * performanceTargetMultiplier * brandCpcMultiplier * impressionShareMultiplier;
    return estimatedWaste.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  useEffect(() => {
    const waste = calculateWaste();
    setResult(waste);
  }, [spend, smartBidding, performanceTarget, brandCpc, impressionShare]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // First, save to Supabase
      const { error: supabaseError } = await supabase
        .from('submissions')
        .insert([
          {
            name,
            email,
            monthly_spend: spend,
            estimated_waste: result,
            target_impression_share: smartBidding,
            incrementality_testing: brandCpc,
            broad_match: impressionShare,
            search_terms_review: matchType
          }
        ]);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // Then, trigger the Zapier webhook through our Edge Function
      const webhookResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zapier-webhook`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          monthlySpend: spend,
          estimatedWaste: result,
          answers: {
            smartBidding,
            performanceTarget,
            brandCpc,
            impressionShare,
            matchType,
          },
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error('Failed to send to Zapier webhook');
      }

      setSubmitted(true);
      setName('');
      setEmail('');
    } catch (err) {
      console.error('Submission error:', err);
      setError('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ButtonGroup = ({ label, value, onChange, options, isLastQuestion = false }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string; }[];
    isLastQuestion?: boolean;
  }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value);
              if (isLastQuestion) setShowForm(true);
            }}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
              value === option.value
                ? 'bg-[#262fb5] text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl">🧮</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Brand Savings Calculator
            </h1>
            <p className="text-sm text-gray-500">
              Discover your potential savings on branded search spend
            </p>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly branded search spend
          </label>
          <input
            type="range"
            min="1000"
            max="200000"
            step="1000"
            value={spend}
            onChange={(e) => setSpend(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2"
          />
          <p className="text-xl font-semibold text-[#262fb5]">
            ${spend.toLocaleString()} <span className="text-sm font-normal text-gray-500">/ month</span>
          </p>
        </div>

        <ButtonGroup
          label="Are you using a smart bidding strategy? (tROAS, tCPA, Max Conversions, etc)"
          value={smartBidding}
          onChange={setSmartBidding}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]}
        />

        {smartBidding === 'yes' && (
          <ButtonGroup
            label="Is your performance better than your target?"
            value={performanceTarget}
            onChange={setPerformanceTarget}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ]}
          />
        )}

        <ButtonGroup
          label="Is your brand CPC higher than or within 25% of your nonbrand CPC?"
          value={brandCpc}
          onChange={setBrandCpc}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]}
        />

        <ButtonGroup
          label="Is your search impression share above 90%?"
          value={impressionShare}
          onChange={setImpressionShare}
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]}
        />

        <ButtonGroup
          label="What match type are you predominantly using for your brand search campaign?"
          value={matchType}
          onChange={setMatchType}
          options={[
            { value: 'yes', label: 'Broad Match' },
            { value: 'no', label: 'Exact/Phrase Match' }
          ]}
          isLastQuestion={true}
        />

        {showForm && (
          <>
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💸</span>
                <div>
                  <p className="text-lg text-gray-700">
                    Get your personalized savings estimate - just fill out the form below.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t pt-8">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#262fb5] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#262fb5] focus:border-transparent"
                      required
                    />
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm py-2">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-[#262fb5] text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
                      isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#1e248f]'
                    }`}
                  >
                    {isSubmitting ? 'Sending...' : 'Get My Report'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <span className="text-3xl mb-4">✨</span>
                  <h3 className="text-xl font-semibold text-gray-900 mt-2">
                    Thank you for your submission!
                  </h3>
                  <p className="text-gray-600 mt-2">
                    We've received your information and will send your personalized savings estimate to {email} shortly.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;