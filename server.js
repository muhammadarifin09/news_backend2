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

// Headline news - FILTER KETAT UNTUK HINDARI PROMO
app.get('/api/news', async (req, res) => {
    try {
        console.log('📰 Fetching headlines with strict filtering...');
        
        const promises = [
            // 1. Top headlines Indonesia dengan exclude promo
            axios.get('https://newsapi.org/v2/top-headlines', {
                params: {
                    country: 'id',
                    pageSize: 15,
                    apiKey: process.env.NEWS_API_KEY
                }
            }),
            // 2. Everything dengan keyword teknologi & exclude promo
            axios.get('https://newsapi.org/v2/everything', {
                params: {
                    q: 'teknologi OR tech OR gadget OR startup OR inovasi OR digital -promo -diskon -gratis -buy -get -sale',
                    language: 'id',
                    pageSize: 10,
                    sortBy: 'publishedAt',
                    apiKey: process.env.NEWS_API_KEY
                }
            }),
            // 3. Everything dengan keyword umum & exclude promo
            axios.get('https://newsapi.org/v2/everything', {
                params: {
                    q: 'Indonesia OR jakarta OR surabaya OR bandung OR pemerintah -promo -diskon -gratis -buy -get -sale',
                    language: 'id', 
                    pageSize: 10,
                    sortBy: 'publishedAt',
                    apiKey: process.env.NEWS_API_KEY
                }
            })
        ];

        const results = await Promise.allSettled(promises);
        
        let allArticles = [];
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.data.articles) {
                console.log(`✅ Source ${index + 1}: ${result.value.data.articles.length} articles`);
                allArticles = [...allArticles, ...result.value.data.articles];
            }
        });

        // FILTER KETAT: Exclude promo & pilih berita berkualitas
        const filteredArticles = allArticles
            .filter(article => {
                const title = article.title?.toLowerCase() || '';
                const source = article.source?.name?.toLowerCase() || '';
                
                // EXCLUDE keywords promo
                const excludeKeywords = [
                    'promo', 'diskon', 'gratis', 'buy', 'get', 'sale', 'katalogpromosi',
                    'alfamart', 'indomaret', 'alfagift', 'boga', 'shaburi', 'kintan',
                  'kimukatsu', 'pepper lunch', 'buffet', 'serba rp'
                ];
                
                const isPromo = excludeKeywords.some(keyword => 
                    title.includes(keyword) || source.includes(keyword)
                );
                
                // INCLUDE hanya berita berkualitas
                const hasQuality = article.title && 
                                 article.title.length > 15 &&
                                 article.source?.name &&
                                 article.urlToImage &&
                                 !title.includes(' vs ');
                
                return !isPromo && hasQuality;
            })
            .filter((article, index, self) =>  // Remove duplicates
                index === self.findIndex(a => a.title === article.title)
            )
            .slice(0, 5);

        console.log(`🎯 Final: ${filteredArticles.length} quality articles`);
        
        if (filteredArticles.length === 0) {
            // Fallback: Berita internasional teknologi (non-promo)
            console.log('🔄 Using international tech news as fallback...');
            const fallback = await axios.get('https://newsapi.org/v2/top-headlines', {
                params: {
                    category: 'technology',
                    language: 'en',
                    pageSize: 5,
                    apiKey: process.env.NEWS_API_KEY
                }
            });
            
            // Filter fallback juga
            const filteredFallback = fallback.data.articles
                ?.filter(article => {
                    const title = article.title?.toLowerCase() || '';
                    return !title.includes('sale') && !title.includes('discount') && 
                           !title.includes('promo') && !title.includes('free');
                })
                .slice(0, 5) || [];
            
            res.json({
                status: 'ok',
                totalResults: filteredFallback.length,
                articles: filteredFallback
            });
        } else {
            res.json({
                status: 'ok',
                totalResults: filteredArticles.length,
                articles: filteredArticles
            });
        }
        
    } catch (error) {
        console.error('❌ All sources failed:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch headlines',
            details: 'All news sources unavailable'
        });
    }
});

// All news - FILTER KETAT JUGA
app.get('/api/everything', async (req, res) => {
    try {
        console.log('📖 Fetching all news with strict filtering...');
        
        const promises = [
            // Berita teknologi - exclude promo
            axios.get('https://newsapi.org/v2/everything', {
                params: {
                    q: 'teknologi OR tech OR gadget OR smartphone OR startup OR digital AI -promo -diskon -gratis',
                    language: 'id',
                    pageSize: 12,
                    sortBy: 'publishedAt',
                    apiKey: process.env.NEWS_API_KEY
                }
            }),
            // Berita umum Indonesia - exclude promo
            axios.get('https://newsapi.org/v2/everything', {
                params: {
                    q: 'Indonesia OR jakarta OR surabaya OR bandung OR pemerintah OR masyarakat -promo -diskon -gratis',
                    language: 'id',
                    pageSize: 10,
                    sortBy: 'publishedAt', 
                    apiKey: process.env.NEWS_API_KEY
                }
            }),
            // Berita bisnis - exclude promo
            axios.get('https://newsapi.org/v2/everything', {
                params: {
                    q: 'bisnis OR ekonomi OR finansial OR investasi OR pasar -promo -diskon -gratis',
                    language: 'id',
                    pageSize: 8,
                    sortBy: 'publishedAt',
                    apiKey: process.env.NEWS_API_KEY
                }
            })
        ];

        const results = await Promise.allSettled(promises);
        
        let allArticles = [];
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.data.articles) {
                console.log(`✅ Source ${index + 1}: ${result.value.data.articles.length} articles`);
                allArticles = [...allArticles, ...result.value.data.articles];
            }
        });

        // Filter ketat
        const filteredArticles = allArticles
            .filter(article => {
                const title = article.title?.toLowerCase() || '';
                const source = article.source?.name?.toLowerCase() || '';
                
                const excludeKeywords = [
                    'promo', 'diskon', 'gratis', 'buy', 'get', 'sale', 'katalogpromosi',
                    'alfamart', 'indomaret', 'alfagift', 'boga', 'shaburi', 'kintan',
                    'kimukatsu', 'pepper lunch', 'buffet', 'serba rp', 'beli', 'dapat'
                ];
                
                const isPromo = excludeKeywords.some(keyword => 
                    title.includes(keyword) || source.includes(keyword)
                );
                
                return !isPromo && article.title && article.title.length > 10;
            })
            .filter((article, index, self) =>
                index === self.findIndex(a => a.title === article.title)
            )
            .slice(0, 20);  // Max 20 berita

        console.log(`🎯 Final: ${filteredArticles.length} quality articles`);
        
        res.json({
            status: 'ok',
            totalResults: filteredArticles.length,
            articles: filteredArticles
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch news',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🎯 Server running on port ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`🚫 Filter: Strict promo exclusion`);
    console.log(`🎯 Priority: Technology > General > Business (No Promo!)`);
});