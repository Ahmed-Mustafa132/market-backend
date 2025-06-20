const Product = require('../model/productModel')
const Market = require('../model/marketModel')
const  {uploadImage,DeleteFile} = require('../utils/fileUploader')
const getProducts = async (req, res) => {
    const data = []
    let products
    try {
        if (req.params.state === "true") {
            products = await Product.find({ approved: true })
            console.log("this is products",products)
        } else {
            products = await Product.find({ approved: false })
        }
        for (const product of products) {
            const market = await Market.findById(product.market, "name")
            const productData = {
                ...product._doc,
                market: market ? market.name : "غير محدد"
            };
            data.push(productData)
        }
        res.status(200).json({ message: 'Products fetched successfully', data: data })
    } catch (error) {
         console.log({ message: error })
        res.status(500).json({ message: "حدث مشكلة في جلب البيانات" })
    }
}
const getProduct = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id, ["title", "description", "price", "image", "market", "rate"])
        const market = await Market.findById(product.market, "name")


        const data = {
            ...product._doc,
            market: market ? market.name : "غير محدد"
        }
        res.status(200).json({ message: 'Product fetched successfully', data: data })
    } catch (error) {
        console.log({ message: error })
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
    
    if (!req.file || !title || !description || !price) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    try {
        const imageUrl = await uploadImage(req.file, "uploads/products");
        
        // const imageUrl = await uploadProductToGCS(req.file);
        const productdata = {
            title: title,
            description: description,
            price: price,
            market: req.user.id,
            image: imageUrl.publicUrl
        }
        const newProduct = new Product(productdata);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: "حدث خطأ أثناء إنشاء المنتج", error: error.message });
    }
}


const updateProduct = async (req, res) => {
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
            const imageUrl = await uploadImage(req.file, "uploads/products");
            const deleted = await DeleteFile(product.image)   
            product.image = imageUrl.publicUrl
        }
            // Use the same GCS uploader as in createProduct
                // const imageUrl = await uploadProductToGCS(req.file);

        const updatedProduct = await product.save()
        res.json({massage:"تم تحديث المنتج  بنجاح"})
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        try {
            const deleted = await DeleteFile(product.image)
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: error.message })
        }
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

