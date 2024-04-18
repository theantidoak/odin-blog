import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
dotenv.config();

import { Comment } from '../models/comment';
import { CustomRequest } from '../app';

interface CommentController {
  getComments?: any;
  createComment?: any;
  deleteComment?: any;
  updateComment?: any;
}

export const commentController: CommentController = {};

commentController.getComments = asyncHandler(async (req: Request, res: Response) => {  
  const comments = await Comment.find( { post: req.params.post } ).sort({ time_stamp: -1 });
  if (!comments) {
    res.status(404).json({ success: false, message: 'No comments found.' });
  } else {
    res.status(200).json({ success: true, comments });
  }
});

commentController.createComment = [
  body('post')
    .trim()
    .escape(),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required.')
    .escape(),
  body('author')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Author is required.')
    .escape(),
  asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      res.status(401).json({
        post: req.body.post,
        content: req.body.content, 
        author: req.body.author,
        errors: error.array()
      });

      return;
    }

    try {
      const comment = new Comment({
        content: req.body.content, 
        author: req.body.author,
        post: req.body.post
      });
      const result = await comment.save();

      res.status(200).json({ success: true, message: 'Comment added successfully', result });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error adding comment', err });
    }

  })
];

commentController.deleteComment = asyncHandler(async (req, res, next) => {
  try {
    const comment = await Comment.findOneAndDelete( { _id: req.params.id });
    if (!comment) {
      res.status(401).json({ success: false, message: 'Comment not found' })
    } else {
      res.status(200).json({ success: true, message: 'Comment deleted successfuly' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting comment', err });
  }
});


commentController.updateComment = [
  body('like')
    .toBoolean(),
  asyncHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
      res.status(401).json({ 
        errors: error.array(),
      });

      return;
    }

    try {
      const comment = await Comment.findOne({ _id: req.params.id });
      const newComment = comment && req.body.like === true ? { likes: comment.likes + 1 }
        : comment && req.body.like === false ? { likes: comment.likes - 1 }
        : {};
      const result = await Comment.findOneAndUpdate({ _id: req.params.id }, newComment, { new: true });

      if (!result) {
        res.status(401).json({ success: false, message: 'Comment not updated' })
      } else {
        res.status(200).json({ success: true, message: 'Comment updated successfully' });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error updating comment', err });
    }

  })
];