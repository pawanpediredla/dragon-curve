test('API response', async () => {
    const response = await fetch('/api/endpoint');
    const data = await response.json();
    expect(data).toHaveProperty('key');
  });
  