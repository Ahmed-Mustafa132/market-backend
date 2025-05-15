const Product = require('../model/productModel')
const Market = require('../model/marketModel')
const { uploadProductToGCS } = require('../utils/productUploader')
const getProducts = async (req, res) => {
    const data = []
    let products
    try {
        if (req.params.state === "true") {
            products = await Product.find({ approved: true })
        } else {
            products = await Product.find({ approved: false })
        }
        for (const product of products) {
            const market = await Market.findById(product.market, "name")
            const productData = {
                ...product._doc,
                market: market.name
            }
            data.push(productData)
        }
        res.status(200).json({ message: 'Products fetched successfully', data: data })
    } catch (error) {
         
        res.status(500).json({ message: "حدث مشكلة في جلب البيانات" })
    }
}
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id, ["title", "description", "price", "image", "market", "rate"])
        const market = await Market.findById(product.market, "name")


        const data = {
            ...product._doc,
            market: market.name
        }
        res.status(200).json({ message: 'Product fetched successfully', data: data })
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}
const approvedData = async (req, res) => {
    const id = req.params.id
    try {
        const product = await Product.findByIdAndUpdate(id, { approved: true })
        res.status(200).json({ message: 'Products fetched successfully', data: product })
    } catch (error) {
        console.log({ message: error.message })
        res.status(404).json({ message: error.message })
    }
}
const getProductByMarket = async (req, res) => {
    try {
        const product = await Product.find({ market: req.user.id })

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
    console.log(req.body)
    console.log(req.file)
    try {
        const product = await Product.findById(req.params.id)
        product.approved = false
        if (req.body.title != null) {
            product.title = req.body.title
        }
        if (req.body.price != null) {
            product.price = req.body.price
        }
        if (req.body.description != null) {
            product.description = req.body.description
        }
        if (req.file) {
            // Use the same GCS uploader as in createProduct
            const imageUrl = await uploadProductToGCS(req.file);
            product.image = {
                url: imageUrl.publicUrl,
                fileName: imageUrl.fileName
            };
            console.log(imageUrl)
        }

        const updatedProduct = await product.save()
        res.json(updatedProduct)
    } catch (error) {
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
const searchProduct = async (req, res) => {
    try {
        console.log(req.params.search)
        let data = []
        let products = []
        const search = req.params.search;
        const markets = await Market.find({ name: { $regex: search, $options: 'i' } });
        const marketIds = markets.map(market => market._id);

        products = await Product.find({$or:[{ title: { $regex: search, $options: 'i' } }, { market: { $in: marketIds } }] , approved: true});
        // if (search === "undefined") {
        //     products = await Product.find({ approved: true })
        // } else {
        //     products = await Product.find({ title: { $regex: search, $options: 'i' }, approved: true });
        // }
        for (const product of products) {
            const market = await Market.findById(product.market, "name")
            const productData = {
                ...product._doc,
                market: market.name
            }
            data.push(productData)
        }
        res.status(200).json({ message: 'Products fetched successfully', data: data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const review = async (req, res) => {
    const { rating } = req.body;
    if (req.user.role !== "user") return res.status(403).json({ message: "ليس لديك صلاحية لتقييم هذا المنتج" });
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "المنتج غير موجود" });
    const alreadyReviewed = product.reviews.find(
        (rev) => rev.userId.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
        return res.status(400).json({ message: "أنت بالفعل قمت بتقييم هذا المنتج" });
    }
    try {

        product.reviews.push({
            userId: req.user.id,
            rating,
        });

        product.averageRating =
            product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

        await product.save();

        res.status(201).json({ message: "تم التقييم بنجاح" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = {
    getProducts,
    getProduct,
    getProductByMarket,
    createProduct,
    updateProduct,
    deleteProduct, searchProduct, review, approvedData
}

