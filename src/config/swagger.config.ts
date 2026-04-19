import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

/**
 * Swagger/OpenAPI Configuration
 * 
 * Modüler yapı:
 * - Her modül kendi swagger dosyasında tanımlanır
 * - Route dosyaları temiz kalır
 * - Merkezi konfigürasyon
 */

const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ClubMS API Documentation',
            version: '1.0.0',
            description: `
# ClubMS Backend API

Üniversite kulüp yönetim sistemi için RESTful API.

## Özellikler
- 🔐 Firebase Authentication
- 👥 Role-Based Access Control (RBAC)
- 🏢 Kulüp Yönetimi
- 📅 Etkinlik Yönetimi
- ✅ QR & GPS Check-in
- 📊 Analytics & Reporting
- 🔔 Bildirim Sistemi

## Authentication
API'ye erişim için Firebase ID Token gereklidir.

\`\`\`
Authorization: Bearer <firebase-id-token>
\`\`\`

## Rate Limiting
- Genel: 100 request/dakika
- Auth: 10 request/dakika

## Error Responses
Tüm hatalar standart formatta döner:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Hata mesajı"
  }
}
\`\`\`
            `,
            contact: {
                name: 'ClubMS Team',
                email: 'support@clubms.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development Server'
            },
            {
                url: 'https://api.clubms.com',
                description: 'Production Server'
            }
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Kimlik doğrulama ve kullanıcı yönetimi'
            },
            {
                name: 'Users',
                description: 'Kullanıcı işlemleri'
            },
            {
                name: 'Roles',
                description: 'Global rol yönetimi'
            },
            {
                name: 'Clubs',
                description: 'Kulüp yönetimi'
            },
            {
                name: 'Memberships',
                description: 'Kulüp üyelik işlemleri'
            },
            {
                name: 'Events',
                description: 'Etkinlik yönetimi'
            },
            {
                name: 'Attendance',
                description: 'Etkinlik katılım işlemleri'
            },
            {
                name: 'Analytics',
                description: 'İstatistik ve raporlama'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Firebase ID Token'
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Yetkisiz erişim - Token geçersiz veya eksik',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    error: {
                                        type: 'object',
                                        properties: {
                                            code: { type: 'string', example: 'UNAUTHORIZED' },
                                            message: { type: 'string', example: 'Token geçersiz' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                ForbiddenError: {
                    description: 'Erişim yasak - Yeterli yetki yok',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    error: {
                                        type: 'object',
                                        properties: {
                                            code: { type: 'string', example: 'FORBIDDEN' },
                                            message: { type: 'string', example: 'Bu işlem için yetkiniz yok' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Kaynak bulunamadı',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    error: {
                                        type: 'object',
                                        properties: {
                                            code: { type: 'string', example: 'NOT_FOUND' },
                                            message: { type: 'string', example: 'Kaynak bulunamadı' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                ValidationError: {
                    description: 'Validasyon hatası',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    error: {
                                        type: 'object',
                                        properties: {
                                            code: { type: 'string', example: 'VALIDATION_ERROR' },
                                            message: { type: 'string', example: 'Geçersiz veri' },
                                            details: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        field: { type: 'string' },
                                                        message: { type: 'string' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                BearerAuth: []
            }
        ]
    },
    apis: [
        path.join(__dirname, '../../api-docs/modules/**/*.yaml'),
        path.join(__dirname, '../../api-docs/schemas/**/*.yaml')
    ]
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
