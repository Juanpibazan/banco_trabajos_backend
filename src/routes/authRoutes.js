const router = require('express').Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

const {users} = require('../db/fakeDB');
const helpers = require('../utils/helpers');
const connect = require('../db/connection');

router.get('/list', (req,res)=>{
    try {
        if(users.length > 0){
            res.status(200).json({
                message: "Lista de usuarios",
                usersList: users
            })
        } else{
            res.status(200).json({
                message:'Lista de usuarios vacia, no existen ningun usuario registrado',
                usersList: users
            })
        }
    }
    catch(e){
        throw new Error('Algo salió mal :(');
    }
});

router.post('/genSalt',(req,res)=>{
    const {password} = req.body;
    const salt = helpers.genSalt();
    const hashedPassword = helpers.encrypt(password,salt);
    res.status(200).json({hashedPassword, salt});
});

/*
{
    "hashedPassword": "fe5976d847323a6839a2f384efd67283e92cdb7fe1e0860f7147e4f204e4af45",
    "salt": "4cba7a903177d7a57ffbc939abd29213"
}
    */


/**
 * @swagger
 * tags:
 *  name: Autenticación/Registro
 *  description: Autenticacion y Registro.
 */

/**
 * @swagger
 * /Autenticar_u/:
 *  post:
 *      summary: Autentica al usuario, proporcionandole un token temporal que expira a los 15 minutos.
 *      tags: [Autenticación/Registro]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          usuario:
 *                              type: string
 *                              description: Usuario
 *                              required: true
 *                          password:
 *                              type: string
 *                              description: Contraseña
 *                              required: true
 *      responses:
 *          200:
 *              description: Un mensaje confirmando "Credenciales correctas" y un token temporal.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: boolean
 *                                  description: true si la solicitud fue exitosa, sino false.
 *                              message:
 *                                  type: string
 *                                  description: Mensaje de respuesta.
 *                              token:
 *                                  type: string
 *                                  description: JSON Web Token generado a partir de una autenticación exitosa. Expira después de 15 min.
 *          400:
 *              description: Un mensaje señalando que las credenciales están vacías.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: boolean
 *                                  description: true si la solicitud fue exitosa, sino false.
 *                              message:
 *                                  type: string
 *                                  description: Mensaje de respuesta.
 *          401:
 *              description: Un mensaje señalando que el usuario es inexistente o no vigente.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: boolean
 *                                  description: true si la solicitud fue exitosa, sino false.
 *                              message:
 *                                  type: string
 *                                  description: Mensaje de respuesta.
 *          500:
 *              description: Un mensaje señalando el error que aconteció.
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Mensaje de respuesta.
 * 
 */

router.post('/', async (req,res)=>{
    try{
        const {usuario,password} = req.body;
        const pool = await connect();
        if(usuario !== '' && password !=='' ){
            //const usuarioEncontrado = users.find(u => u.usuario===usuario);
            const usuarioEncontrado = await pool.query("SELECT * FROM usuarios where usuario=?;",[usuario])
            if(usuarioEncontrado[0].length===0){
                res.status(401).json({status: false,message:'ERROR, Usuario inexistente o no vigente'});
            } else{
                const hashedPass = helpers.encrypt(password,usuarioEncontrado[0][0].salt)===usuarioEncontrado[0][0].password;
                //console.log(helpers.genSalt());
                if(!hashedPass){
                    res.status(401).json({status: false,message:'ERROR, Usuario inexistente o no vigente'});
                }
                else{
                    bcryptHashedPass = helpers.bcryptHash(usuarioEncontrado[0][0].password);
                    const token = jwt.sign({
                        usuario,
                        hashedPass: bcryptHashedPass
                    },process.env.JWT_SECRET_KEY,{expiresIn:'15m'});
                    res.status(200).json({
                        status: true,
                        message:'Credenciales correctas',
                        token
                    });
                }
            }
        } else {
            res.status(400).json({
                message: 'Usuario o contraseña vacios'
            });
        }

    } catch(e){
        res.status(500).json({
            message:`ERROR: ${e}`
        });
    }


});

module.exports = router;