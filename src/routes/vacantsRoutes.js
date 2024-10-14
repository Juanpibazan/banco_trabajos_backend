const router = require('express').Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connect = require('../db/connection');


/**
 * @swagger
 * components:
 *  schemas:
 *      Vacante:
 *          type: object
 *          properties:
 *              token:
 *                  type: string
 *                  description: Token de la transacción, generado anteriormente durante el proceso de autenticación del usuario.
 *                  required: true
 *              vacante_id:
 *                  type: string
 *                  description: ID de la vacante.
 *                  required: true
 *              puesto:
 *                  type: string
 *                  description: Puesto al que se refiere la vacante.
 *              link_vacante:
 *                  type: string
 *                  description: URL de la publicación de la vacante.
 *                  required: true
 *              imagen:
 *                  type: string
 *                  description: URL de la imagen correspondiente a la publicación.
 *              empresa:
 *                  type: string
 *                  description: Empresa que publica la vacante.
 *              descripcion:
 *                  type: string
 *                  description: Descripción del puesto.
 *                  required: true
 *              ubicacion:
 *                  type: integer
 *                  description: ID de la ubicación. Referirse a tabla 'ubicaciones'.
 *                  required: true
 *              shortcode:
 *                  type: string
 *                  description: Código corto.
 *                  required: true
 *              categoria_ocupacional:
 *                  type: integer
 *                  description: ID de la categoría ocupacional. Referirse a tabla 'categorias_ocupacionales'.
 *                  required: true
 *              categoria_profesional:
 *                  type: integer
 *                  description: ID de la categoría profesional. Referirse a tabla 'categorias_profesionales'.
 *                  required: true
 *              idiomas:
 *                  type: integer
 *                  description: ID del idioma en que se basa el puesto. Referirse a la tabla 'idiomas'.
 *              formacion:
 *                  type: integer
 *                  description: ID de la formación requerida para la vacante. Referirse a la tabla 'formaciones'.
 *  securitySchemes:
 *      bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 * 
 */

/**
 * @swagger
 * tags:
 *  name: Vacantes
 *  description: Operaciones relacionadas a Vacantes.
 */

/**
 * @swagger
 * /Registro_job/:
 *  post:
 *      security:
 *          - bearerAuth: []
 *      summary: Registra una vacante en la base de datos
 *      tags: [Vacantes]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Vacante'
 *      responses:
 *          201:
 *              description: Registro realizado con éxito.
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
 *                                  description: Mensaje confirmando el registro exitoso de la vacante.
 *          400:
 *              description: Registro falló, verifica los datos enviados.
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
 *                                  description: Mensaje señalando el error.
 *          401:
 *              description: Un mensaje señalando que el token es incorrecto o no vigente.
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
 *          403:
 *              description: Algo salió mal al insertar los datos en la tabla.
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
 *                                  description: Mensaje señalando el error.
 *          500:
 *              description: Algo salió mal.
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
 *                                  description: Mensaje señalando el error.
 */

const verifyToken = (req,res,next)=>{
    const token = req.header('Authorization');
    if(!token){
        res.status(401).json({
            status: false,
            message: 'ERROR. Token incorrecto o no vigente'
        });
    }
    else{
        try {
            const decoded = jwt.verify(token.split(' ')[1],process.env.JWT_SECRET_KEY);
            console.log(decoded);
            req.user=token.usuario;
            next();
        }catch(e){
            res.status(401).json({
                status: false,
                message: 'ERROR. Token incorrecto o no vigente'
            });
        }
    }
  
};

router.post('/', verifyToken, async (req,res)=>{
    let token = req.header('Authorization');
    token = token.split(" ")[1];
    let {vacante_id,puesto,link_vacante,imagen,empresa,descripcion,ubicacion,shortcode,categoria_ocupacional,categoria_profesional,idiomas,formacion} = req.body;
    puesto = puesto ==='' ? null : puesto;
    imagen= imagen==='' ? null : imagen;
    empresa = empresa ==='' ? null : empresa;
    idiomas = idiomas === '' ? null : idiomas;
    formacion = formacion ==='' ? null : formacion;
    if(vacante_id==='' || link_vacante==='' || descripcion==='' || ubicacion==='' || shortcode==='' || categoria_ocupacional==='' || categoria_profesional===''){
        res.status(400).json({
            status: false,
            message:'ERROR. Registro no realizado, verifica los datos'
        });
    }
    try {
        const pool = await connect();
        const response = await pool.query("INSERT INTO vacantes (vacante_id,token,puesto,link_vacante,imagen,empresa,descripcion,ubicacion,shortcode,categoria_ocupacional,categoria_profesional,idiomas,formacion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);",[vacante_id,token,puesto,link_vacante,imagen,empresa,descripcion,ubicacion,shortcode,categoria_ocupacional,categoria_profesional,idiomas,formacion]);
        if(response[0].affectedRows===1){
            res.status(201).json({
                status: true,
                message: 'Registro realizado con éxito',
                //data: {token,vacante_id,puesto}
            });
        } else{
            res.status(403).json({
                status: false,
                message: 'Algo salió mal. No se realizó el registro'
            })
        }

    } catch(e){
        res.status(500).json({
            status: false,
            message: `ERROR: ${e}`
        });
    }

});

module.exports = router;