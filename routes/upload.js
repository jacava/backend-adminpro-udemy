var express = require('express');
//https://github.com/richardgirges/express-fileupload
var fileUpload = require('express-fileupload');

var fs = require('fs');
var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de colecciones
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe e seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo se aceptan estas extensiones
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extesnión no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    // ID_USU + RANDOM + EXT
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;


    // Mover el archivo del temporal a un path específico
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res)
            /*res.status(200).json({
                ok: true,
                mensaje: 'Archivo movido',
                nombreCortado: nombreCortado
            });*/
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    switch (tipo) {
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {

                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No existe el Hospital',
                        errors: { message: 'No existe el Hospital' }
                    });
                }

                var pathViejo = './uploads/hospitales/' + hospital.img;
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo, (err) => {
                        if (error) {
                            return response.status(400).json({
                                ok: false,
                                mensaje: 'No se pudo eliminar la imagen',
                                errors: error
                            });
                        }
                    });
                }
                hospital.img = nombreArchivo;
                hospital.save((err, hospitalActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalActualizado
                    });
                });
            });

            break;
        case 'medicos':
            Medico.findById(id, (err, medico) => {

                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No existe el Médico',
                        errors: { message: 'No existe el Médico' }
                    });
                }

                var pathViejo = './uploads/medicos/' + medico.img;
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo, (err) => {
                        if (error) {
                            return response.status(400).json({
                                ok: false,
                                mensaje: 'No se pudo eliminar la imagen',
                                errors: error
                            });
                        }
                    });
                }
                medico.img = nombreArchivo;
                medico.save((err, medicoActualizado) => {
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoActualizado
                    });
                });
            });

            break;
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {

                if (!usuario) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No existe el Usuario',
                        errors: { message: 'No existe el Usuario' }
                    });
                }

                var pathViejo = './uploads/usuarios/' + usuario.img;
                if (fs.existsSync(pathViejo)) {
                    fs.unlinkSync(pathViejo, (err) => {
                        if (error) {
                            return response.status(400).json({
                                ok: false,
                                mensaje: 'No se pudo eliminar la imagen',
                                errors: error
                            });
                        }
                    });
                }

                usuario.img = nombreArchivo;
                usuario.save((err, usuarioActualizado) => {
                    usuarioActualizado.password = ':)';
                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado,
                        pathViejo: pathViejo
                    });
                });
            });
            break;
    }
}


module.exports = app;