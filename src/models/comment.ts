import mongoose from 'mongoose';
import { DateTime } from 'luxon';

const Schema = mongoose.Schema;

export const CommentSchema = new Schema({
  time_stamp: { type: Date, default: Date.now },
  edit_time_stamp: { type: Date, default: Date.now },
  content: { type: String, required: true },
  author: { type: String, required: true },
  likes: { type: Number, default: 0 },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
});

CommentSchema.virtual("date").get(function () {
  return DateTime.fromJSDate(this.time_stamp).toLocaleString(DateTime.DATE_SHORT);
});

CommentSchema.virtual("edit_date").get(function () {
  return DateTime.fromJSDate(this.edit_time_stamp).toLocaleString(DateTime.DATE_SHORT);
});

export const Comment = mongoose.model("Comment", CommentSchema);