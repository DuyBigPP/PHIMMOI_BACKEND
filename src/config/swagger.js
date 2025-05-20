const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PHIMMOI API Documentation',
      version: '1.0.0',
      description: 'API documentation for PHIMMOI backend services',
      contact: {
        name: 'API Support',
        email: 'support@phimmoi.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Movie: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            originName: { type: 'string' },
            type: { type: 'string' },
            poster: { type: 'string' },
            backdrop: { type: 'string' },
            description: { type: 'string' },
            year: { type: 'integer' },
            duration: { type: 'integer' },
            rating: { type: 'number' },
            categories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      slug: { type: 'string' }
                    }
                  }
                }
              }
            },
            countries: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  country: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      slug: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            isAdmin: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Rating: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            score: { type: 'integer', minimum: 1, maximum: 5 },
            review: { type: 'string' },
            userId: { type: 'string' },
            movieId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        },
        RatingResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                ratings: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Rating'
                  }
                },
                averageScore: { type: 'number' },
                pagination: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    totalPages: { type: 'integer' }
                  }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID của bình luận'
            },
            content: {
              type: 'string',
              description: 'Nội dung bình luận'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian tạo bình luận'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian cập nhật bình luận'
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'ID của người dùng'
                },
                name: {
                  type: 'string',
                  description: 'Tên người dùng'
                },
                email: {
                  type: 'string',
                  description: 'Email người dùng'
                }
              }
            },
            movieId: {
              type: 'string',
              description: 'ID của phim'
            }
          },
          required: [
            'id',
            'content',
            'createdAt',
            'updatedAt',
            'user',
            'movieId'
          ]
        },
        MovieCreateInput: {
          type: 'object',
          required: ['name', 'slug', 'originName', 'content', 'type', 'status', 'posterUrl', 'thumbUrl', 'year', 'categories', 'countries'],
          properties: {
            name: { type: 'string' },
            slug: { type: 'string' },
            originName: { type: 'string' },
            content: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string' },
            posterUrl: { type: 'string' },
            thumbUrl: { type: 'string' },
            year: { type: 'integer' },
            categories: {
              type: 'array',
              items: { type: 'string', description: 'Slug của category' },
              description: 'Danh sách slug thể loại (bắt buộc)'
            },
            countries: {
              type: 'array',
              items: { type: 'string', description: 'Slug của quốc gia' },
              description: 'Danh sách slug quốc gia (bắt buộc)'
            },
            isCopyright: { type: 'boolean' },
            subDocquyen: { type: 'boolean' },
            chieurap: { type: 'boolean' },
            trailerUrl: { type: 'string' },
            time: { type: 'string' },
            episodeCurrent: { type: 'string' },
            episodeTotal: { type: 'string' },
            quality: { type: 'string' },
            lang: { type: 'string' },
            notify: { type: 'string' },
            showtimes: { type: 'string' },
            view: { type: 'integer' },
            tmdbId: { type: 'string' },
            tmdbType: { type: 'string' },
            tmdbVoteAverage: { type: 'number' },
            tmdbVoteCount: { type: 'integer' },
            imdbId: { type: 'string', nullable: true },
            duration: { type: 'integer' },
            rating: { type: 'number' },
            poster: { type: 'string' },
            backdrop: { type: 'string' },
            // ... các trường khác nếu muốn cho phép nhập khi tạo
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // Path to the API routes
};

module.exports = swaggerJsdoc(options); 