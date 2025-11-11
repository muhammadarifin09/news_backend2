// Headline news - INDONESIA (untuk section "Berita Terkini")
app.get('/api/news', async (req, res) => {
    try {
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: 'id',  // ✅ BERITA INDONESIA
                pageSize: 5,    // 5 berita utama Indonesia
                apiKey: process.env.NEWS_API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// All news - INTERNASIONAL + INDONESIA (untuk section "Semua Berita")
app.get('/api/everything', async (req, res) => {
    try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: '(indonesia OR jakarta) (technology OR business OR sports OR health)',  // ✅ KOMBINASI
                sortBy: 'publishedAt',
                pageSize: 20,
                apiKey: process.env.NEWS_API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bonus: Endpoint khusus internasional
app.get('/api/international', async (req, res) => {
    try {
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: 'us',  // ✅ BERITA INTERNASIONAL
                pageSize: 10,
                apiKey: process.env.NEWS_API_KEY
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});