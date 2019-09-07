var jwt = require('jsonwebtoken'); // https://github.com/auth0/node-jsonwebtoken

var SEED = require('../config/config').SEED; // Fijamos como constante la semilla

// ========================================
// Verificar Token
// ========================================
exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
    });
}