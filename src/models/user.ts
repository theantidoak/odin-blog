import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const UserSchema = new Schema({
  email: { type: String, required: true },
  hash: { type: String, required: true },
  is_admin: { type: Boolean, required: true }
});

export const User = mongoose.model("User", UserSchema);