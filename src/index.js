const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const authRoutes = require('./routes/authRoutes');
const vacantsRoutes = require('./routes/vacantsRoutes');
const swaggerOptions = require('../swaggerOptions');

const app = express();

app.use(morgan('dev'));
app.use(cors({origin:'*'}));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.set('port', process.env.PORT || 4000);
const specs = swaggerJsDoc(swaggerOptions);

app.use('/Autenticar_u', authRoutes);
app.use('/Registro_job', vacantsRoutes);
app.use('/docs',swaggerUI.serve,swaggerUI.setup(specs));

app.get('/', (req,res)=>{
    res.send('Hello World!');
});

app.listen(app.get('port'), ()=>{
    console.log('Server running on port: ', app.get('port'))
});