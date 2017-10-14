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
];