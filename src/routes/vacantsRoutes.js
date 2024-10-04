const router = require('express').Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connect = require('../db/connection');

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
            req.user=token;
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
        res.status(403).json({
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