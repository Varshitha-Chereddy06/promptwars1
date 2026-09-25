async function test() {
  const models = ['muse-spark-1.3-contributor-free', 'nemotron-3.5-lightning-free', 'nemotron-3-super-free'];
  for (const model of models) {
    console.log('Testing model:', model);
    const apiKey = process.env.NARA_API_KEY || '';
    if (!apiKey) {
      console.log('Skipping test: NARA_API_KEY not set in environment.');
      return;
    }
    try {
      const res = await fetch('https://router.bynara.id/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Output raw JSON only: {"status": "ok"}' }]
        })
      });
      const data = await res.json();
      console.log('Result for', model, ':', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Error for', model, ':', e.message);
    }
  }
}
test();
