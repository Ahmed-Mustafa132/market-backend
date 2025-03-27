const { Router } = require('express');
const router = Router();
const upload = require('../middleware/multer');

const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByMarket,
} = require('../controllers/productController');
const { isMarket } = require('../middleware/authMiddleware');



router.get('/', getProducts);
router.get('/market/prodact',isMarket, getProductByMarket);
router.get('/:id', getProduct);
router.post('/', isMarket, upload.single('image'), createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
module.exports = router;

