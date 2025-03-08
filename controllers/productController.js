const Product = require('../model/productModel')
const { uploadToGCS } = require('../utils/fileUploader')
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
        res.json(product)
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

const createProduct = async (req, res) => {
    console.log('Received file:', req.files ); // Log the received file
    console.log('Received body:', req.body); // Log the received body
    const { title, description, price, market } = req.body;
    try {
        console.log('Received file:', req.file); // Log the received file

        if (!req.file) {
            return res.status(400).json({ message: "ملف الصورة مطلوب" });
        }

        const productdata = {
            title,
            description,
            price,
            market,
        }

        // Log before upload attempt
        console.log('Attempting to upload file to GCS');
        const imageUrl = await uploadToGCS(req.file);
        console.log('Upload successful, URL:', imageUrl);

        productdata.image = imageUrl;

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

        createProduct,
        updateProduct,
        deleteProduct,
    }

