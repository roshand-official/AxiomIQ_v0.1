const express = require('express');
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res, next) => productController.getAll(req, res, next));
router.get('/:id', (req, res, next) => productController.getById(req, res, next));
router.post('/', authorize('ADMIN'), (req, res, next) => productController.create(req, res, next));
router.put('/:id', authorize('ADMIN'), (req, res, next) => productController.update(req, res, next));
router.post('/:id/variants', authorize('ADMIN'), (req, res, next) => productController.addVariant(req, res, next));
router.delete('/:id', authorize('ADMIN'), (req, res, next) => productController.delete(req, res, next));

module.exports = router;
