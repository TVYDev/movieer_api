const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

module.exports = function (app) {
    //Reference: https://swagger.io/specification/#info-object
    const swaggerOptions = {
        openapi: '3.0.0',
        definition: {
            info: {
                title: 'Movieer API',
                version: 'v1',
                description:
                    'API for cinemas, halls, movies, tickets management'
            },
            host: 'localhost:5000/api/v1'
        },
        apis: ['./controllers/*.js']
    };

    const swagerDocs = swaggerJsDoc(swaggerOptions);

    app.use('/api-docs/v1', swaggerUi.serve, swaggerUi.setup(swagerDocs));
};
