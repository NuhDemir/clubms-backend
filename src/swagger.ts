import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';

/**
 * Swagger UI Setup
 * 
 * Route dosyalarını şişirmeden modüler API documentation
 * 
 * Erişim: http://localhost:3000/api-docs
 */

export const setupSwagger = (app: Express): void => {
    // Swagger UI options
    const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
        customCss: `
            .swagger-ui .topbar { display: none }
            .swagger-ui .info { margin: 20px 0 }
            .swagger-ui .scheme-container { margin: 20px 0 }
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
            }
        }
    };

    // Swagger JSON endpoint
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    // Swagger UI
    app.use(
        '/api-docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, swaggerUiOptions)
    );

    console.log('📚 Swagger documentation available at /api-docs');
};
