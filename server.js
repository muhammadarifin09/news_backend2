require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 News API Proxy is running!',
        version: '1.0',
        endpoints: {
            headlines: '/api/news',
            all_news: '/api/everything'
        }
    });
});

// Headline news - INDONESIA (untuk section "Berita Terkini")
app.get('/api/news', async (req, res) => {
    try {
        console.log('📰 Fetching Indonesian headlines...');
        
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: 'id',  // ✅ BERITA INDONESIA
                pageSize: 5,    // 5 berita utama Indonesia
                apiKey: process.env.NEWS_API_KEY
            }
        });

        console.log(`✅ Got ${response.data.articles.length} Indonesian headlines`);
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch news',
            details: error.response?.data || error.message
        });
    }
});

// All news - INTERNASIONAL + INDONESIA (untuk section "Semua Berita")
app.get('/api/everything', async (req, res) => {
    try {
        console.log('📖 Fetching mixed news...');
        
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: '(indonesia OR jakarta) (technology OR business OR sports OR health)',  // ✅ KOMBINASI
                sortBy: 'publishedAt',
                pageSize: 20,
                apiKey: process.env.NEWS_API_KEY
            }
        });

        console.log(`✅ Got ${response.data.articles.length} mixed news`);
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch news',
            details: error.response?.data || error.message
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: '✅ Backend is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.listen(PORT, () => {
    console.log(`🎯 Server running on port ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`🌍 Endpoints:`);
    console.log(`   - /api/news (Indonesian headlines)`);
    console.log(`   - /api/everything (Mixed news)`);
});