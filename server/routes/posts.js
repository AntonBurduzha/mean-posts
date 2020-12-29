const express = require('express');
const multer = require('multer');

const Post = require('../models/post');

const router = express.Router();

const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isValid = MIME_TYPE_MAP[file.mimetype];
        let error = new Error('Invalid mime type');
        if (isValid) {
            error = null;
        }
        cb(error, 'server/images');
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLocaleLowerCase().split(' ').join('-');
        const ext = MIME_TYPE_MAP[file.mimetype];
        cb(null, `${name}-${Date.now()}.${ext}`);
    }
});

router.post('/', multer({ storage }).single('image'), async (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: url + '/images/' + req.file.filename
    });
    await post.save();
    res.status(201).json({ message: 'success', post });
});

router.put('/:id', multer({ storage }).single('image'), async (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
        const url = req.protocol + '://' + req.get('host');
        imagePath = url + '/images/' + req.file.filename;
    }
    const post = { title: req.body.title, content: req.body.content, imagePath };
    await Post.updateOne({ _id: req.params.id }, post);

    res.status(200).json({ message: 'success', post });
});

router.get('/', async(req, res, next) => {
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    const query = Post.find();
    if (pageSize && currentPage) {
        query.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }

    const posts = await query;
    const totalPosts = await Post.countDocuments();
    
    res.status(200).json({ message: 'success', posts, totalPosts });
});

router.get('/:id', async(req, res, next) => {
    const post = await Post.findById(req.params.id);
    res.status(200).json({ message: 'success', post });
});

router.delete('/:id', async(req, res, next) => {
    await Post.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'success' });
});

module.exports = router;