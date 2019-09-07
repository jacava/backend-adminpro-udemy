var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken

//ar SEED = require('../config/config').SEED; // Fijamos como constante la semilla
var mdAutentificacion = require('../middlewares/autetificaciones');

var app = express();

var Usuario = require('../models/usuario');

// Rutas

// ========================================
// Obtener todos los usuarios
// ========================================
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role') //Esto fue para no retornar el pass
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            });
});


// ========================================
// Actualizar usuarios
// ========================================
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            // Retorna una cara como contraseña, es para no retornar la verdadera
            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});


// ========================================
// Crear un nuevo usuarios
// ========================================
app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    // Leemos el parse
    var body = req.body;
    // Creamos estructura de usuario
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });

});

// ========================================
// Borrar un usuario por el id
// ========================================
app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findOneAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});

module.exports = app;