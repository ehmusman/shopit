const express = require('express')
const { Product, validation } = require('../models/productModel')
const { User } = require('../models/userModel')
const _ = require('lodash');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router()


// get all products
router.get('/countproducts', async (req, res) => {

    const products = await Product
        .find()
        .sort('_id')

    setTimeout(() => {
        return res.status(200).json({
            success: true,
            count: products.length,
        })
    }, 0);

})

// get paginated products
router.get('/products', async (req, res) => {

    let { pageNumber, pageSize } = req.query

    pageNumber = Number(Math.round(pageNumber));
    pageSize = Number(Math.round(pageSize))

    if (typeof pageNumber !== "number" || typeof pageSize !== "number") return res.status(400).send("Please Send pageNumber and pageSize in Number Format ")

    const products = await Product
        .find()
        .sort('_id')
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)

    setTimeout(() => {
        return res.status(200).json({
            success: true,
            products
        })
    }, 0);

})


// Search products by name
router.get('/products/searchbyname', async (req, res) => {
    let { name } = req.query
    console.log(name)
    const regexp = new RegExp(".*" + name + ".*", "i")

    let products = await Product
        .find({ name: regexp })
        .sort('name')

    res.status(200).send({
        success: true,
        products,
    })
})


// Search products by price
router.get('/products/searchbyprice', async (req, res) => {
    let { name, min, max } = req.query

    const regexp = new RegExp(".*" + name + ".*", "i")
    let products;
    products = await Product
        .find({ name: regexp, price: { $gte: min, $lte: max } })
        .sort('-price')

    res.status(200).send({
        success: true,
        products,
    })
})

// Search products by category
router.get('/products/searchbycategory', async (req, res) => {
    let { name, min, max, c } = req.query

    // convert the categories strings in array
    const cat = c.split(',')

    const regexp = new RegExp(".*" + name + ".*", "i")
    let products;

    // console.log(name, min, max)
    if (cat[0] !== '') {

        products = await Product
            .find({ name: regexp, price: { $gte: min, $lte: max }, category: { $in: cat } })
            .sort('-price')
    }
    if (cat[0] === '') {
        products = await Product
            .find({ name: regexp, price: { $gte: min, $lte: max } })
            .sort('-price')
    }


    res.status(200).send({
        success: true,
        products,
    })
})

// get a single product by id
router.get('/product/:id', async (req, res) => {
    const product = await Product.findById(req.params.id)

    if (!product) return res.status(400).send({
        success: false,
        message: "The Product with given id is not present...."
    })

    res.send({
        success: true,
        product
    })
})

// post a product 
//By admin
router.post('/admin/product/new', [auth, admin], async (req, res) => {
    const { error } = validation(req.body)
    if (error) return res.status(400).send(error.details[0].message)
    req.body.user = req.user._id
    let product = new Product(_.pick(req.body, [
        'name', 'price', 'description', 'rating', 'images', 'category', 'seller', 'stock', 'numOfReviews', 'reviews', 'user'
    ]))
    product = await product.save()
    res.send(product)
})

// Update a product 
// By admin
router.put('/admin/product/:id', [auth, admin], async (req, res) => {
    const { error } = validation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const product = await Product.findByIdAndUpdate(req.params.id,
        req.body, { new: true, runValidators: true, useFindAndModify: false }
    )
    if (!product) return res.status(400).send({
        success: false,
        message: "The Product with the given id is not present"
    })
    res.send(product)
})
// delete a product 
// By admin
router.delete('/admin/product/:id', [auth, admin], async (req, res) => {
    const product = await Product.findByIdAndRemove(req.params.id)
    if (!product) return res.status(400).send({
        success: false,
        message: "The Product with the given id is not present.."
    })
    res.send({
        success: true,
        message: "Product has been deleted successfully..."
    })
})

module.exports = router;