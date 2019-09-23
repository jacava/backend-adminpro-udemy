var express = require('express');
var app = express();

var Hospital = require('../models/hospital');

var mdAutentificacion = require('../middlewares/autetificaciones');

// ========================================
// Obtener todos los hospitales
// ========================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0; //Si no viene valor le pongo 0
    desde = Number(desde);

    Hospital.find({}, 'nombre img usuario') //Filtro los datos que quiero mostrar de la selección
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        hospitales: hospitales
                    });
                });
            });
});

// ========================================
// Actualizar hospital
// ========================================
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        //hospital.img = body.img;
        //hospital.usuario = body.usuario;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// ========================================
// Crear un nuevo hospital
// ========================================
app.post('/', mdAutentificacion.verificaToken, (req, res) => {
    // Leemos el parse
    var body = req.body;
    // Creamos estructura del hospital
    var hospital = new Hospital({
        nombre: body.nombre,
        //img: body.img,
        //usuario: body.usuario
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });

});

// ========================================
// Borrar un hospital por el id
// ========================================
app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
    var id = req.params.id;

    //Hospital.findOneAndRemove(id, (err, hospitalBorrado) => {
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con el id ' + id,
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
            id: id
        });

    });
});



module.exports = app;