import mongoose from 'mongoose';
import { DateTime } from 'luxon';

const Schema = mongoose.Schema;

export const PostSchema = new Schema({
  time_stamp: { type: Date, default: Date.now },
  edit_time_stamp: { type: Date, default: Date.now },
  is_published: { type: Boolean, default: false },
  slug: { type: String },
  title: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

PostSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  }
  next();
});

PostSchema.virtual("date").get(function () {
  return DateTime.fromJSDate(this.time_stamp).toLocaleString(DateTime.DATE_SHORT);
});

PostSchema.virtual("edit_date").get(function () {
  return DateTime.fromJSDate(this.edit_time_stamp).toLocaleString(DateTime.DATE_SHORT);
});


export const Post = mongoose.model("Post", PostSchema);