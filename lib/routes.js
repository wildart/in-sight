'use strict';

module.exports = [
    {
      method: 'GET',
      path: '/',
      handler: (request, reply) => {
        reply('Hi to all!');
      },
      config: {
        description: 'start page'
      }
    },
    {
      method: 'GET',
      path: '/js/{file*}',
      handler: {
        directory: {
          path: 'public/js',
          listing: true
        }
      }
    },
    {
      method: 'GET',
      path: '/static/{file*}',
      handler: {
        directory: {
          path: 'views/browser',
          listing: true
        }
      }
    }
];