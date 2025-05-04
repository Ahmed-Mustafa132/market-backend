const { Router } = require('express');
const router = Router();
const upload = require('../middleware/multer');

const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductByMarket, searchProduct, review, approvedData
} = require('../controllers/productController');
const { isMarket, isUser } = require('../middleware/authMiddleware');



router.get('/approved/:state', getProducts);
router.patch('/approvedData/:id', approvedData);
router.get('/market/prodact', isMarket, getProductByMarket);
router.get('/search/:search', searchProduct);
router.get('/:id', getProduct);
router.post('/:id/review',isUser,review)
router.post('/', isMarket, upload.single('image'), createProduct);
router.patch('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);
module.exports = router;

