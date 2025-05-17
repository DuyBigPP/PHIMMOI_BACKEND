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
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Nhập token JWT của bạn."'
        }
      },
      schemas: {
        Favorite: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID của bản ghi yêu thích'
            },
            userId: {
              type: 'string',
              description: 'ID của người dùng'
            },
            movieId: {
              type: 'string',
              description: 'ID của phim'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian thêm vào yêu thích'
            },
            movie: {
              $ref: '#/components/schemas/Movie'
            }
          },
          required: ['id', 'userId', 'movieId', 'createdAt']
        },
        Movie: {
          type: 'object',
          required: [
            'name',
            'slug',
            'type',
            'category',
            'country',
            'actor',
            'director',
            'episodes'
          ],
          properties: {
            id: { type: 'string', description: 'ID của phim' },
            name: { type: 'string', description: 'Tên phim' },
            slug: { type: 'string', description: 'Slug của phim' },
            origin_name: { type: 'string', description: 'Tên gốc của phim' },
            content: { type: 'string', description: 'Mô tả phim' },
            type: {
              type: 'string',
              enum: ['single', 'series'],
              description: 'Loại phim (single/series)'
            },
            poster_url: { type: 'string', description: 'URL poster phim' },
            thumb_url: { type: 'string', description: 'URL thumbnail phim' },
            trailer_url: { type: 'string', description: 'URL trailer phim' },
            time: { type: 'string', description: 'Thời lượng phim (ví dụ: "114 phút")' },
            quality: { type: 'string', description: 'Chất lượng phim (HD, FullHD...)' },
            lang: { type: 'string', description: 'Ngôn ngữ phim' },
            year: { type: 'integer', description: 'Năm sản xuất' },
            actor: {
              type: 'array',
              items: { type: 'string' },
              description: 'Danh sách tên diễn viên'
            },
            director: {
              type: 'array',
              items: { type: 'string' },
              description: 'Danh sách tên đạo diễn'
            },
            category: {
              type: 'array',
              description: 'Danh sách thể loại',
              items: {
                type: 'object',
                required: ['id', 'name', 'slug'],
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  slug: { type: 'string' }
                }
              }
            },
            country: {
              type: 'array',
              description: 'Danh sách quốc gia',
              items: {
                type: 'object',
                required: ['id', 'name', 'slug'],
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  slug: { type: 'string' }
                }
              }
            },
            episodes: {
              type: 'array',
              description: 'Danh sách server và tập phim',
              items: {
                type: 'object',
                required: ['server_name', 'server_data'],
                properties: {
                  server_name: { type: 'string', description: 'Tên server (ví dụ: #Hà Nội (Vietsub))' },
                  server_data: {
                    type: 'array',
                    description: 'Danh sách tập phim',
                    items: {
                      type: 'object',
                      required: ['name', 'slug', 'link_m3u8', 'link_embed'],
                      properties: {
                        name: { type: 'string', description: 'Tên tập phim' },
                        slug: { type: 'string', description: 'Slug của tập phim' },
                        link_m3u8: { type: 'string', description: 'URL phim dạng m3u8' },
                        link_embed: { type: 'string', description: 'URL phim dạng embed' }
                      }
                    }
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian tạo'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian cập nhật'
            }
          }
        },
        CreateMovieRequest: {
          type: 'object',
          required: [
            'name',
            'slug',
            'type',
            'category',
            'country',
            'actor',
            'director',
            'episodes'
          ],
          properties: {
            name: { 
              type: 'string', 
              description: 'Tên phim',
              example: 'Buồng Giam Mặt Nạ'
            },
            slug: { 
              type: 'string', 
              description: 'Slug của phim',
              example: 'buong-giam-mat-na'
            },
            origin_name: { 
              type: 'string', 
              description: 'Tên gốc của phim',
              example: 'Masked Ward'
            },
            content: { 
              type: 'string', 
              description: 'Mô tả phim',
              example: 'Phim Buồng Giam Mặt Nạ...'
            },
            type: {
              type: 'string',
              enum: ['single', 'series'],
              description: 'Loại phim (single/series)',
              example: 'single'
            },
            poster_url: { 
              type: 'string', 
              description: 'URL poster phim',
              example: 'https://phimimg.com/...'
            },
            thumb_url: { 
              type: 'string', 
              description: 'URL thumbnail phim',
              example: 'https://phimimg.com/...'
            },
            trailer_url: { 
              type: 'string', 
              description: 'URL trailer phim',
              example: 'https://www.youtube.com/...'
            },
            time: { 
              type: 'string', 
              description: 'Thời lượng phim (ví dụ: "114 phút")',
              example: '114 phút'
            },
            quality: { 
              type: 'string', 
              description: 'Chất lượng phim (HD, FullHD...)',
              example: 'HD'
            },
            lang: { 
              type: 'string', 
              description: 'Ngôn ngữ phim',
              example: 'Vietsub + Thuyết Minh'
            },
            year: { 
              type: 'integer', 
              description: 'Năm sản xuất',
              example: 2020
            },
            actor: {
              type: 'array',
              items: { type: 'string' },
              description: 'Danh sách tên diễn viên',
              example: ['Aki Asakura', 'Kentaro Sakaguchi', 'Mei Nagano']
            },
            director: {
              type: 'array',
              items: { type: 'string' },
              description: 'Danh sách tên đạo diễn',
              example: ['Hisashi Kimura']
            },
            category: {
              type: 'array',
              description: 'Danh sách thể loại',
              items: {
                type: 'object',
                required: ['id', 'name', 'slug'],
                properties: {
                  id: { 
                    type: 'string',
                    example: 'a7b065b92ad356387ef2e075dee66529'
                  },
                  name: { 
                    type: 'string',
                    example: 'Tâm Lý'
                  },
                  slug: { 
                    type: 'string',
                    example: 'tam-ly'
                  }
                }
              }
            },
            country: {
              type: 'array',
              description: 'Danh sách quốc gia',
              items: {
                type: 'object',
                required: ['id', 'name', 'slug'],
                properties: {
                  id: { 
                    type: 'string',
                    example: 'd4097fbffa8f7149a61281437171eb83'
                  },
                  name: { 
                    type: 'string',
                    example: 'Nhật Bản'
                  },
                  slug: { 
                    type: 'string',
                    example: 'nhat-ban'
                  }
                }
              }
            },
            episodes: {
              type: 'array',
              description: 'Danh sách server và tập phim',
              items: {
                type: 'object',
                required: ['server_name', 'server_data'],
                properties: {
                  server_name: { 
                    type: 'string', 
                    description: 'Tên server (ví dụ: #Hà Nội (Vietsub))',
                    example: '#Hà Nội (Vietsub)'
                  },
                  server_data: {
                    type: 'array',
                    description: 'Danh sách tập phim',
                    items: {
                      type: 'object',
                      required: ['name', 'slug', 'link_m3u8', 'link_embed'],
                      properties: {
                        name: { 
                          type: 'string', 
                          description: 'Tên tập phim',
                          example: 'Full'
                        },
                        slug: { 
                          type: 'string', 
                          description: 'Slug của tập phim',
                          example: 'full'
                        },
                        link_m3u8: { 
                          type: 'string', 
                          description: 'URL phim dạng m3u8',
                          example: 'https://s5.phim1280.tv/...'
                        },
                        link_embed: { 
                          type: 'string', 
                          description: 'URL phim dạng embed',
                          example: 'https://player.phimapi.com/...'
                        }
                      }
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
        Category: {
          type: 'object',
          required: ['id', 'name', 'slug'],
          properties: {
            id: { 
              type: 'string',
              description: 'ID của thể loại'
            },
            name: { 
              type: 'string',
              description: 'Tên thể loại'
            },
            slug: { 
              type: 'string',
              description: 'Slug của thể loại'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian tạo'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian cập nhật'
            }
          }
        },
        Country: {
          type: 'object',
          required: ['id', 'name', 'slug'],
          properties: {
            id: { 
              type: 'string',
              description: 'ID của quốc gia'
            },
            name: { 
              type: 'string',
              description: 'Tên quốc gia'
            },
            slug: { 
              type: 'string',
              description: 'Slug của quốc gia'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian tạo'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian cập nhật'
            }
          }
        },
        Actor: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { 
              type: 'string',
              description: 'ID của diễn viên'
            },
            name: { 
              type: 'string',
              description: 'Tên diễn viên'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian tạo'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian cập nhật'
            }
          }
        },
        Director: {
          type: 'object',
          required: ['id', 'name'],
          properties: {
            id: { 
              type: 'string',
              description: 'ID của đạo diễn'
            },
            name: { 
              type: 'string',
              description: 'Tên đạo diễn'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian tạo'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian cập nhật'
            }
          }
        },
        Episode: {
          type: 'object',
          required: ['id', 'name', 'slug', 'server'],
          properties: {
            id: { 
              type: 'string',
              description: 'ID của tập phim'
            },
            name: { 
              type: 'string',
              description: 'Tên tập phim'
            },
            slug: { 
              type: 'string',
              description: 'Slug của tập phim'
            },
            server: { 
              type: 'string',
              description: 'Tên server'
            },
            links: {
              type: 'array',
              description: 'Danh sách link phim',
              items: {
                type: 'object',
                required: ['name', 'slug', 'url', 'embedUrl'],
                properties: {
                  name: { type: 'string', description: 'Tên link' },
                  slug: { type: 'string', description: 'Slug của link' },
                  url: { type: 'string', description: 'URL phim dạng m3u8' },
                  embedUrl: { type: 'string', description: 'URL phim dạng embed' }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian tạo'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Thời gian cập nhật'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/routes/admin/*.js'] // Path to the API routes
};

module.exports = swaggerJsdoc(options); 