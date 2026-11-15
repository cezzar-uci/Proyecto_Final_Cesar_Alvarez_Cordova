'use strict';
const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/authController');
const { onlyGuest, requireAuth } = require('../middlewares/auth');
const asyncHandler = require('../middlewares/asyncHandler');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20,
  standardHeaders: 'draft-7', legacyHeaders: false,
  message: 'Demasiados intentos. Prueba nuevamente dentro de 15 minutos.'
});

const registrationRules = [
  body('name').isString().trim().isLength({ min: 2, max: 90 }).withMessage('El nombre debe tener entre 2 y 90 caracteres.'),
  body('email').isEmail().withMessage('Introduce un correo electrónico válido.').bail().isLength({ max: 180 }).withMessage('El correo es demasiado largo.'),
  body('password').isString().isLength({ min: 10, max: 72 }).withMessage('La contraseña debe tener entre 10 y 72 caracteres.'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Las contraseñas no coinciden.')
];
const loginRules = [
  body('email').isEmail().withMessage('Introduce un correo electrónico válido.'),
  body('password').isString().notEmpty().withMessage('Escribe tu contraseña.')
];

router.get('/iniciar-sesion', onlyGuest, controller.showLogin);
router.post('/iniciar-sesion', onlyGuest, authLimiter, loginRules, asyncHandler(controller.login));
router.get('/registro', onlyGuest, controller.showRegister);
router.post('/registro', onlyGuest, authLimiter, registrationRules, asyncHandler(controller.register));
router.post('/salir', requireAuth, controller.logout);
module.exports = router;
