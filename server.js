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

// Headline news - BERITA UTAMA INDONESIA
app.get('/api/news', async (req, res) => {
    try {
        console.log('📰 Fetching Indonesian headlines...');
        
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: 'id',  // ✅ BERITA INDONESIA
                pageSize: 10,   // Ambil lebih banyak untuk filter
                apiKey: process.env.NEWS_API_KEY
            }
        });

        // Filter hanya berita dengan konten
        const filteredArticles = (response.data.articles || [])
            .filter(article => article.title && article.title.length > 10)
            .slice(0, 5);  // Ambil 5 terbaik

        console.log(`✅ Got ${filteredArticles.length} Indonesian headlines`);
        
        res.json({
            status: 'ok',
            totalResults: filteredArticles.length,
            articles: filteredArticles
        });
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch news',
            details: error.response?.data || error.message
        });
    }
});

// All news - SEMUA BERITA BAHASA INDONESIA
app.get('/api/everything', async (req, res) => {
    try {
        console.log('📖 Fetching all Indonesian news...');
        
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: 'indonesia OR jakarta OR surabaya OR bandung OR medan',  // ✅ KEYWORD INDONESIA
                language: 'id',  // ✅ PASTIKAN BAHASA INDONESIA
                sortBy: 'publishedAt',
                pageSize: 20,
                apiKey: process.env.NEWS_API_KEY
            }
        });

        // Filter berita yang relevan
        const filteredArticles = (response.data.articles || [])
            .filter(article => 
                article.title && 
                article.title.length > 10 &&
                !article.title.toLowerCase().includes('vs')  // Hindari berita olahraga vs
            );

        console.log(`✅ Got ${filteredArticles.length} Indonesian news`);
        
        res.json({
            status: 'ok',
            totalResults: filteredArticles.length,
            articles: filteredArticles
        });
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch news',
            details: error.response?.data || error.message
        });
    }
});

// Alternative: Top headlines Indonesia dengan berbagai kategori
app.get('/api/indonesia-news', async (req, res) => {
    try {
        console.log('🇮🇩 Fetching comprehensive Indonesian news...');
        
        const [general, business, technology] = await Promise.all([
            // Berita umum
            axios.get('https://newsapi.org/v2/top-headlines', {
                params: {
                    country: 'id',
                    category: 'general',
                    pageSize: 8,
                    apiKey: process.env.NEWS_API_KEY
                }
            }),
            // Berita bisnis
            axios.get('https://newsapi.org/v2/top-headlines', {
                params: {
                    country: 'id',
                    category: 'business',
                    pageSize: 6,
                    apiKey: process.env.NEWS_API_KEY
                }
            }),
            // Berita teknologi
            axios.get('https://newsapi.org/v2/top-headlines', {
                params: {
                    country: 'id',
                    category: 'technology',
                    pageSize: 6,
                    apiKey: process.env.NEWS_API_KEY
                }
            })
        ]);

        // Gabungkan semua berita
        const allArticles = [
            ...(general.data.articles || []),
            ...(business.data.articles || []),
            ...(technology.data.articles || [])
        ];

        // Remove duplicates berdasarkan title
        const uniqueArticles = allArticles.filter((article, index, self) =>
            index === self.findIndex(a => a.title === article.title)
        );

        console.log(`✅ Got ${uniqueArticles.length} unique Indonesian articles`);
        
        res.json({
            status: 'ok',
            totalResults: uniqueArticles.length,
            articles: uniqueArticles.slice(0, 20)  // Max 20 artikel
        });
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch news',
            details: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🎯 Server running on port ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`🇮🇩 Endpoints (Indonesian news only):`);
    console.log(`   - /api/news (5 headline berita)`);
    console.log(`   - /api/everything (20 berita Indonesia)`);
    console.log(`   - /api/indonesia-news (Mixed categories)`);
});