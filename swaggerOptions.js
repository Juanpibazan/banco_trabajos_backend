const options = {
    definition:{
        openapi: '3.0.0',
        info:{
            title: 'REST API   Banco Trabajos',
            version: '1.0.0',
            description: 'REST API que tiene el objetivo de autenticar usuario, registrar vacantes y en el futuro actualizar y eliminar vacantes igualmente.'
        },
        servers: [
            {
                url: 'http://localhost:4000'
            },
            {
                url:'http://uxminer.com:4000'
            }
        ]
    },
    apis: [
        './src/routes/*.js'
    ]
};

module.exports = options;