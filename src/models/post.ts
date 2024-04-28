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

PostSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('title')) {
    const blockedSlugs = [ 'post', 'login', 'api' ];
    const slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    const repeatSlugs = await (this.constructor as any).find({ slug: new RegExp(`^${slug}(-\\d+)?$`) });
    repeatSlugs.sort((a: { slug: string; }, b: { slug: string; }) => {
      const numA = parseInt(a.slug.replace(/^\D+/g, '')) || 0;
      const numB = parseInt(b.slug.replace(/^\D+/g, '')) || 0;
      return numA - numB;
    });

    let newSlugNumber = 0;
    if (repeatSlugs.length > 0) {
      const lastSlug = repeatSlugs[repeatSlugs.length - 1].slug;
      const match = lastSlug.match(/-(\d+)$/);
      newSlugNumber = match ? +match[1] + 1 : 1;
    }

    const newSlug = blockedSlugs.includes(slug) || repeatSlugs.length > 0 ? `${slug}-${newSlugNumber}` : slug;
    this.slug = newSlug;
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