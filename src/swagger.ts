import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import path from 'path';

/**
 * Modern API Documentation Setup
 * 
 * Multiple documentation interfaces:
 * - /api-docs - Swagger UI (interactive)
 * - /api-docs/redoc - Redoc (clean, responsive)
 * - /api-docs.json - OpenAPI JSON spec
 */

export const setupSwagger = (app: Express): void => {
    // Swagger UI options - Enhanced
    const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
        customCss: `
            .swagger-ui .topbar { display: none }
            .swagger-ui .info { margin: 20px 0 }
            .swagger-ui .scheme-container { margin: 20px 0 }
            .swagger-ui { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif }
            .swagger-ui .opblock-tag { font-size: 18px; font-weight: 600 }
            .swagger-ui .opblock { border-radius: 8px; margin-bottom: 16px }
            .swagger-ui .opblock-summary { border-radius: 8px }
        `,
        customSiteTitle: 'ClubMS API Documentation',
        customfavIcon: '/favicon.ico',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            tryItOutEnabled: true,
            syntaxHighlight: {
                activate: true,
                theme: 'monokai'
            },
            docExpansion: 'list',
            defaultModelsExpandDepth: 3,
            defaultModelExpandDepth: 3
        }
    };

    // OpenAPI JSON endpoint
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    // Swagger UI - Interactive documentation
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, swaggerUiOptions)
    );

    // Redoc - Clean, responsive documentation
    app.get('/api-docs/redoc', (req, res) => {
        res.send(`
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ClubMS API Documentation - Redoc</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
    </style>
</head>
<body>
    <redoc spec-url="/api-docs.json"></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>
        `);
    });

    // Custom Modern Documentation Landing Page
    app.get('/api-docs/modern', (req, res) => {
        res.send(getModernDocsHTML());
    });

    console.log('📚 API Documentation available:');
    console.log('   - Swagger UI: /api-docs');
    console.log('   - Redoc: /api-docs/redoc');
    console.log('   - Modern UI: /api-docs/modern');
    console.log('   - OpenAPI JSON: /api-docs.json');
};

function getModernDocsHTML(): string {
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ClubMS API Documentation</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            color: white;
            margin-bottom: 60px;
            padding: 40px 20px;
        }

        .header h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 16px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .header p {
            font-size: 1.25rem;
            opacity: 0.95;
            font-weight: 300;
        }

        .version-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.875rem;
            margin-top: 16px;
            backdrop-filter: blur(10px);
        }

        .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            margin-bottom: 40px;
        }

        .card {
            background: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
        }

        .card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }

        .card-icon {
            font-size: 3rem;
            margin-bottom: 16px;
        }

        .card h2 {
            font-size: 1.5rem;
            color: #1a202c;
            margin-bottom: 12px;
            font-weight: 600;
        }

        .card p {
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .card-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            transition: opacity 0.3s ease;
        }

        .card-button:hover {
            opacity: 0.9;
        }

        .features {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            margin-bottom: 40px;
        }

        .features h2 {
            font-size: 2rem;
            color: #1a202c;
            margin-bottom: 32px;
            text-align: center;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 24px;
        }

        .feature-item {
            padding: 20px;
            border-left: 4px solid #667eea;
            background: #f7fafc;
            border-radius: 8px;
        }

        .feature-item h3 {
            font-size: 1.125rem;
            color: #2d3748;
            margin-bottom: 8px;
            font-weight: 600;
        }

        .feature-item p {
            color: #4a5568;
            font-size: 0.875rem;
            line-height: 1.5;
        }

        .quick-links {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }

        .quick-links h2 {
            font-size: 1.5rem;
            color: #1a202c;
            margin-bottom: 24px;
        }

        .links-list {
            list-style: none;
        }

        .links-list li {
            margin-bottom: 16px;
        }

        .links-list a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
            display: flex;
            align-items: center;
            transition: color 0.3s ease;
        }

        .links-list a:hover {
            color: #764ba2;
        }

        .links-list a::before {
            content: "→";
            margin-right: 12px;
            font-weight: bold;
        }

        .footer {
            text-align: center;
            color: white;
            padding: 40px 20px;
            opacity: 0.9;
        }

        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }

            .header p {
                font-size: 1rem;
            }

            .cards-grid {
                grid-template-columns: 1fr;
            }

            .features-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 ClubMS API</h1>
            <p>Üniversite Kulüp Yönetim Sistemi - RESTful API</p>
            <span class="version-badge">v1.0.0 • OpenAPI 3.0</span>
        </div>

        <div class="cards-grid">
            <div class="card" onclick="window.location.href='/api-docs'">
                <div class="card-icon">🚀</div>
                <h2>Swagger UI</h2>
                <p>İnteraktif API dokümantasyonu. Endpoint'leri test edin, request/response örneklerini görün.</p>
                <a href="/api-docs" class="card-button">Swagger UI'ya Git →</a>
            </div>

            <div class="card" onclick="window.location.href='/api-docs/redoc'">
                <div class="card-icon">📖</div>
                <h2>Redoc</h2>
                <p>Temiz, responsive ve modern API dokümantasyonu. Mobil uyumlu, kolay okunabilir.</p>
                <a href="/api-docs/redoc" class="card-button">Redoc'a Git →</a>
            </div>

            <div class="card" onclick="window.location.href='/api-docs.json'">
                <div class="card-icon">📄</div>
                <h2>OpenAPI JSON</h2>
                <p>OpenAPI 3.0 spesifikasyonu. Kod generation, testing ve entegrasyon için.</p>
                <a href="/api-docs.json" class="card-button">JSON'ı İndir →</a>
            </div>
        </div>

        <div class="features">
            <h2>✨ API Özellikleri</h2>
            <div class="features-grid">
                <div class="feature-item">
                    <h3>🔐 Authentication</h3>
                    <p>Firebase Authentication ile güvenli kimlik doğrulama ve JWT token yönetimi</p>
                </div>
                <div class="feature-item">
                    <h3>👥 RBAC</h3>
                    <p>Role-Based Access Control ile granüler yetki yönetimi</p>
                </div>
                <div class="feature-item">
                    <h3>🏢 Kulüp Yönetimi</h3>
                    <p>Kulüp oluşturma, üyelik yönetimi ve rol atama</p>
                </div>
                <div class="feature-item">
                    <h3>📅 Etkinlik Sistemi</h3>
                    <p>Etkinlik oluşturma, state management ve kapasite kontrolü</p>
                </div>
                <div class="feature-item">
                    <h3>✅ Check-in</h3>
                    <p>QR kod, GPS ve manuel check-in yöntemleri</p>
                </div>
                <div class="feature-item">
                    <h3>📊 Analytics</h3>
                    <p>Detaylı istatistikler ve raporlama sistemi</p>
                </div>
            </div>
        </div>

        <div class="quick-links">
            <h2>🔗 Hızlı Bağlantılar</h2>
            <ul class="links-list">
                <li><a href="/health">Health Check Endpoint</a></li>
                <li><a href="https://github.com/NuhDemir/clubms-backend" target="_blank">GitHub Repository</a></li>
                <li><a href="/api-docs/postman" target="_blank">Postman Collection</a></li>
                <li><a href="https://clubms-backend-x3pa.onrender.com" target="_blank">Production API</a></li>
            </ul>
        </div>

        <div class="footer">
            <p>Made with ❤️ by ClubMS Team</p>
            <p style="margin-top: 8px; font-size: 0.875rem;">© 2026 ClubMS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
}
