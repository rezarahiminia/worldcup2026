const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FIFA World Cup 2026 API',
      version: '1.0.4',
      description: 'Complete REST API for FIFA World Cup 2026 - United States, Mexico & Canada',
      contact: {
        name: 'API Support',
        email: 'support@worldcup2026.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3050',
        description: 'Development server'
      },
      {
        url: 'http://worldcup26.ir:3050',
        description: 'Production server'
      },
      {
        url: 'https://worldcup26.ir',
        description: 'Production server (HTTPS)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password (min 6 characters)'
            }
          }
        },
        Group: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Group ID'
            },
            name: {
              type: 'string',
              description: 'Group name (A-L)'
            },
            winner: {
              type: 'string',
              description: 'Winner team'
            },
            runnerUp: {
              type: 'string',
              description: 'Runner-up team'
            }
          }
        },
        Team: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Team ID'
            },
            name: {
              type: 'string',
              description: 'Team name'
            },
            flag: {
              type: 'string',
              description: 'Team flag URL'
            },
            group: {
              type: 'string',
              description: 'Group reference ID'
            },
            games: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of game IDs'
            }
          }
        },
        Game: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Game ID'
            },
            typeGame: {
              type: 'string',
              description: 'Type of game (group, round16, quarter, semi, final)'
            },
            homeTeam: {
              type: 'string',
              description: 'Home team ID'
            },
            visitingTeam: {
              type: 'string',
              description: 'Visiting team ID'
            },
            homeTeamScore: {
              type: 'number',
              description: 'Home team score'
            },
            visitingTeamScore: {
              type: 'number',
              description: 'Visiting team score'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Game date and time'
            },
            local: {
              type: 'string',
              description: 'Stadium location'
            },
            finished: {
              type: 'boolean',
              description: 'Whether game is finished'
            }
          }
        },
        MatchTable: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Match table ID'
            },
            group: {
              type: 'string',
              description: 'Group name (A-L)'
            },
            teams: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  team_id: {
                    type: 'string',
                    description: 'Team ID'
                  },
                  mp: {
                    type: 'number',
                    description: 'Matches played'
                  },
                  w: {
                    type: 'number',
                    description: 'Wins'
                  },
                  d: {
                    type: 'number',
                    description: 'Draws'
                  },
                  l: {
                    type: 'number',
                    description: 'Losses'
                  },
                  gf: {
                    type: 'number',
                    description: 'Goals for'
                  },
                  ga: {
                    type: 'number',
                    description: 'Goals against'
                  },
                  gd: {
                    type: 'number',
                    description: 'Goal difference'
                  },
                  pts: {
                    type: 'number',
                    description: 'Points'
                  }
                }
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./controllers/*.js', './index.js']
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
