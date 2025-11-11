const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 News API Proxy on Vercel!',
        endpoints: {
            headlines: '/api/news',
            all_news: '/api/everything'
        }
    });
});

// Headline news
app.get('/api/news', async (req, res) => {
    try {
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: 'us',
                apiKey: process.env.NEWS_API_KEY || '078f337716074bb9aa1fb223b3268601'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// All news
app.get('/api/everything', async (req, res) => {
    try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: 'technology',
                apiKey: process.env.NEWS_API_KEY || '078f337716074bb9aa1fb223b3268601'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export untuk Vercel
module.exports = app;