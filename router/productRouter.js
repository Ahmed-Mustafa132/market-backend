const { Router } = require('express');
const router = Router();
const upload = require('../middleware/multer');

const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByMarket, searchProduct, review
} = require('../controllers/productController');
const { isMarket, isUser } = require('../middleware/authMiddleware');



router.get('/', getProducts);
router.get('/market/prodact', isMarket, getProductByMarket);
router.get('/search/:search', searchProduct);
router.get('/:id', getProduct);
router.post('/:id/review',isUser,review)
router.post('/', isMarket, upload.single('image'), createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
module.exports = router;

