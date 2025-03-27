const Product = require('../model/productModel')
const { uploadProductToGCS } = require('../utils/productUploader')
const getProducts = async (req, res) => {
    try {
        const products = await Product.find()
        res.status(200).json({ message: 'Products fetched successfully', data: products })
    } catch (error) {   
        res.status(500).json({ message: error.message })
    }
}
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        res.status(200).json({ message: 'Product fetched successfully', data: product })
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}
const getProductByMarket = async (req, res) => {
    try {
        const product = await Product.find({ market: req.user.id })
        console.log(product)
        res.status(200).json({ message: 'Product fetched successfully', data: product })
    } catch (error) {
        console.log({ message: error.message })
        res.status(404).json({ message: error.message })
    }
}
const createProduct = async (req, res) => {
    const { title, description, price } = req.body;
    
    try {
        if (!req.file) {
            return res.status(400).json({ message: "ملف الصورة مطلوب" });
        }
        const imageUrl = await uploadProductToGCS(req.file);
        console.log('Image URL:', imageUrl);
        const productdata = {
            title: title,
            description: description,
            price: price,
            market: req.user.id,
            image: {
                url: imageUrl.publicUrl,
                fileName: imageUrl.fileName
            },
        }
        const newProduct = new Product(productdata);
        await newProduct.save();

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('error:', error);
        res.status(400).json({ message: error.message });
    }
}


const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (req.body.title != null) {
            product.title = req.body.title
        }
        if (req.body.price != null) {
            product.price = req.body.price
        }
        if (req.body.description != null) {
            product.description = req.body.description
        }
        if (req.file != null) {
            product.image =
                req.file.path
        }
        const updatedProduct = await product.save()
        res.json(updatedProduct)
    } catch(error) {
            res.status(400).json({ message: error.message })
        }
    }
const deleteProduct = async (req, res) => {
        try {
            await Product.findByIdAndDelete(req.params.id)
            res.json({ message: 'Product deleted' })
        } catch (error) {
            res.status(500).json({ message: error.message })
        }
    }
    module.exports = {
        getProducts,
        getProduct,
        getProductByMarket,
        createProduct,
        updateProduct,
        deleteProduct,
    }

