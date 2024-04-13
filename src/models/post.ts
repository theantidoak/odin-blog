import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const PostSchema = new Schema({
  title: { type: String },
  time_stamp: { type: Date, default: Date.now },
  edit_time_stamp: { type: Date, default: Date.now },
  content: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const Post = mongoose.model("Post", PostSchema);