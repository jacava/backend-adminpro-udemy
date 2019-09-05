// Requires: Importación de librerías
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();


// Conexión a la base de datos
// mongoose.connection.openUri('mongodb://localhost:27017/');
mongoose.connection.openUri('mongodb://192.168.1.101:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online'); // la instrucción \x1b[32m%s\x1b[0 es para darle color
});


// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});


// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online'); // la instrucción \x1b[32m%s\x1b[0 es para darle color
});