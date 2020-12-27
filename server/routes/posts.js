const express = require('express');
const Post = require('../models/post');

const router = express.Router();

router.post('/', async (req, res, next) => {
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
    });
    await post.save();
    res.status(201).json({ message: 'success', post });
});

router.put('/:id', async (req, res, next) => {
    const post = { title: req.body.title, content: req.body.content };
    await Post.updateOne({ _id: req.params.id }, post);

    res.status(200).json({ message: 'success' });
});

router.get('/', async(req, res, next) => {
    const posts = await Post.find();
    res.status(200).json({ message: 'success', posts });
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