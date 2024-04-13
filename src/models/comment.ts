import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const CommentSchema = new Schema({
  time_stamp: { type: Date, default: Date.now },
  edit_time_stamp: { type: Date, default: Date.now },
  content: { type: String, required: true },
  author: { type: String, required: true },
  likes: { type: Number, default: 0 }
});

export const Comment = mongoose.model("Comment", CommentSchema);