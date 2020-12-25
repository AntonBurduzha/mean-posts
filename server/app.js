const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Post = require('./models/post');

const app = express();

mongoose.connect(
    process.env.MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('DB Connected!'))
    .catch(() => console.log('DB Not Connected!'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});

app.post('/api/posts', async (req, res, next) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
    });
    await post.save();
    res.status(201).json({ message: 'success', post });
});

app.get('/api/posts', async(req, res, next) => {
    const posts = await Post.find();
    res.status(200).json({ message: 'success', posts });
});

app.delete('/api/posts/:id', async(req, res, next) => {
    await Post.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'success' });
});

module.exports = app;