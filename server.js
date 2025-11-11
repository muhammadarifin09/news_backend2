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
            headlines: '/news',
            all_news: '/everything',
            test: '/test'
        }
    });
});

// Headline news - PAKAI PARAMETER YANG SUDAH TERBUKTI WORK
app.get('/news', async (req, res) => {
    try {
        const apiKey = process.env.NEWS_API_KEY;
        console.log('📰 Fetching headlines from NewsAPI...');
        
        // PAKAI PARAMETER YANG SAMA DENGAN TEST DI BROWSER
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: 'us',        // Sama dengan test di browser
                apiKey: apiKey        // Sama dengan test di browser
                // pageSize tidak usah dipakai dulu, biarkan default
            }
        });

        console.log('✅ NewsAPI Response:', {
            status: response.data.status,
            totalResults: response.data.totalResults,
            articlesCount: response.data.articles.length
        });
        
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch news',
            details: error.response?.data || error.message
        });
    }
});

// All news - dengan parameter yang lebih general
app.get('/everything', async (req, res) => {
    try {
        const apiKey = process.env.NEWS_API_KEY;
        console.log('📖 Fetching all news from NewsAPI...');
        
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: 'technology',      // Keyword yang general
                apiKey: apiKey
                // Biarkan parameter lain default
            }
        });

        console.log('✅ Everything Response:', {
            status: response.data.status,
            totalResults: response.data.totalResults,
            articlesCount: response.data.articles.length
        });
        
        res.json(response.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch news',
            details: error.response?.data || error.message
        });
    }
});

// Test endpoint untuk debug
app.get('/test', async (req, res) => {
    try {
        const apiKey = process.env.NEWS_API_KEY;
        
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: 'us',
                apiKey: apiKey
            }
        });
        
        res.json({
            message: '✅ Backend connected to NewsAPI successfully!',
            apiKeyStatus: '✅ Valid',
            newsAPIStatus: response.data.status,
            totalArticles: response.data.totalResults,
            articlesReturned: response.data.articles.length,
            sampleTitles: response.data.articles.slice(0, 3).map(a => a.title)
        });
        
    } catch (error) {
        res.json({
            message: '❌ Backend connection failed',
            error: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🎯 Server running on port ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
});