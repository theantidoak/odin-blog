
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
dotenv.config();

import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { CustomRequest } from '../app';
import { User } from '../models/user';

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
    .isLength({ min: 1, max: 150 })
    .withMessage('Title must be between 1 and 150 characters.')
    .matches(/^[\p{L}\p{N} '-.,;:!?]+$/u)
    .withMessage('Name can only contain letters, numbers, spaces, hyphens, apostrophes, and common punctuation.')
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

      res.status(200).json({ success: true, message: 'Post added successfully', post: result });
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
    .isLength({ min: 1, max: 150 })
    .withMessage('Title must be between 1 and 150 characters.')
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
        id: req.body.id,
        title: req.body.title, 
        content: req.body.content,
        errors: errors,
      });

      return;
    }

    try {
      const currentPost = await Post.findOne({ _id: req.body.id });
      const newPost = req.body.title === 'publishing' || req.body.content === 'publishing' ? { is_published: !currentPost?.is_published } : {
        title: req.body.title,
        content: req.body.content,
        edit_time_stamp: Date.now(),
      };

      const result = await Post.findOneAndUpdate({ _id: req.body.id }, newPost, { new: true });

      if (!result) {
        res.status(401).json({ success: false, message: 'Post not found' })
      } else {
        res.status(200).json({ success: true, message: 'Post updated successfully', post: result });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error updating post', err });
    }

  })
];
