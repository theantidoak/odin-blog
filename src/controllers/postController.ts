
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
dotenv.config();

import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { CustomRequest } from '../app';

interface PostController {
  getPosts?: any;
  getPostBySlug?: any;
  createPost?: any;
  deletePost?: any;
  updatePost?: any;
}

export const postController: PostController = {};

postController.getPosts = asyncHandler(async (req: Request, res: Response) => {  
  const posts = await Post.find();
  if (!posts) {
    res.status(404).json({ success: false, message: 'No posts found.' });
  } else {
    res.status(200).json({ success: true, posts });
  }
});

postController.getPostBySlug = asyncHandler(async (req: Request, res: Response) => {  
  const post = await Post.findOne({ slug: req.params.slug });
  if (!post) {
    res.status(404).json({ success: false, message: 'No post found.' });
  } else {
    res.status(200).json({ success: true, post });
  }
});

postController.createPost = [
  body('id')
    .trim()
    .escape(),
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title is required.')
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required.')
    .escape(),
  asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const error = validationResult(req);
    const user = req.user;

    if (!error.isEmpty() || user.id === null) {
      const errors = error.array();

      if (user.id === null) {
        errors.push({
          type: 'field',
          value: req.body.title,
          msg: 'Failed to submit. You must be signed in to submit a post.',
          path: 'text',
          location: 'body'
        });
      }

      res.status(401).json({ 
        title: req.body.title, 
        content: req.body.content,
        errors: errors,
      });

      return;
    }

    try {
      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        user: user.id
      });
      const result = await post.save();

      res.status(200).json({ success: true, message: 'Post added successfully' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error adding post', err });
    }

  })
];

postController.deletePost = asyncHandler(async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete( { slug: req.params.slug });
    if (!post) {
      res.status(401).json({ success: false, message: 'Post not found' })
    } else {
      const comments = await Comment.deleteMany({ post: post.id });
      res.status(200).json({ success: true, message: 'Post deleted successfuly' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting post', err });
  }
});

postController.updatePost = [
  body('id')
    .trim()
    .escape(),
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title is required.')
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required.')
    .escape(),
  body('published')
    .toBoolean(),
  asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const error = validationResult(req);
    const user = req.user;

    if (!error.isEmpty() || user.id === null) {
      const errors = error.array();

      if (user.id === null) {
        errors.push({
          type: 'field',
          value: req.body.text,
          msg: 'Failed to submit. You must be signed in to submit a post.',
          path: 'text',
          location: 'body'
        });
      }

      res.status(401).json({ 
        title: req.body.title, 
        content: req.body.content,
        errors: errors,
      });

      return;
    }

    try {
      const newPost = {
        title: req.body.title,
        content: req.body.content,
        user: user.id,
        edit_time_stamp: Date.now(),
        is_published: req.body.published
      };
      const result = await Post.findOneAndUpdate({ slug: req.params.slug }, newPost, { new: true });

      if (!result) {
        res.status(401).json({ success: false, message: 'Post not found' })
      } else {
        res.status(200).json({ success: true, message: 'Post updated successfully' });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error updating post', err });
    }

  })
];
