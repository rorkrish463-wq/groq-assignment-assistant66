'use client';
import { useState } from 'react';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [rules, setRules] = useState('');
  const [answer, setAnswer] = useState('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setAnswer('');
    setReport(null);

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, rules })
    });

    const data = await res.json();
    setAnswer(data.answer || data.error || 'No response');
    setReport(data.report || null);
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 1100, margin: '40px auto', padding: 20 }}>
      <div style={{ background: '#fff', padding: 30, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <h1>Assignment Assistant Pro (Free)</h1>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Paste assignment question here"
          style={{ width: '100%', height: 220, padding: 12, marginBottom: 12 }}
        />

        <textarea
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder="Paste assignment instructions here"
          style={{ width: '100%', height: 180, padding: 12, marginBottom: 12 }}
        />

        <button
          onClick={generate}
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            border: 'none',
            borderRadius: 8,
            background: '#1e3a8a',
            color: '#fff'
          }}
        >
          {loading ? 'Generating...' : 'Generate Answer'}
        </button>

        {report && (
          <div style={{ marginTop: 24, display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#f9fafb' }}>
              <h3 style={{ marginTop: 0 }}>AI Detection Report</h3>
              <p><strong>Score:</strong> {report.aiDetection.score}%</p>
              <p><strong>Status:</strong> {report.aiDetection.label}</p>
              <p style={{ fontSize: 14 }}>{report.aiDetection.note}</p>
            </div>

            <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#f9fafb' }}>
              <h3 style={{ marginTop: 0 }}>Originality Report</h3>
              <p><strong>Estimated Similarity:</strong> {report.similarity.score}%</p>
              <p><strong>Estimated Originality:</strong> {report.similarity.originalityScore}%</p>
              <p style={{ fontSize: 14 }}>{report.similarity.note}</p>
            </div>
          </div>
        )}

        {answer && (
          <div style={{
            whiteSpace: 'pre-wrap',
            marginTop: 30,
            background: '#fff',
            padding: 24,
            borderRadius: 12,
            lineHeight: 1.8,
            border: '1px solid #e5e7eb'
          }}>
            {answer}
          </div>
        )}
      </div>
    </main>
  );
}
