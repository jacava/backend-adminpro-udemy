var express = require('express');
var app = express();

var Medico = require('../models/medico');

var mdAutentificacion = require('../middlewares/autetificaciones');

// ========================================
// Obtener todos los médicos
// ========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; //Si no viene valor le pongo 0
    desde = Number(desde);

    Medico.find({}, 'nombre img usuario hospital') //Filtro los datos que quiero mostrar de la selección
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        medicos: medicos
                    });
                });
            });
});

// ========================================
// Actualizar médico
// ========================================
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el médico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el id ' + id + ' no existe',
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        //medico.img = body.img;
        //medico.usuario = body.usuario;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el médico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// ========================================
// Crear un nuevo médico
// ========================================
app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    // Leemos el parse
    var body = req.body;
    // Creamos estructura del médico
    var medico = new Medico({
        nombre: body.nombre,
        //img: body.img,
        //usuario: body.usuario,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el médico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            //usuariotoken: req.usuario._id
        });
    });

});

// ========================================
// Borrar un médico por el id
// ========================================
app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el médico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un médico con el id ' + id,
                errors: { message: 'No existe un médico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            id: id
        });

    });
});

module.exports = app;