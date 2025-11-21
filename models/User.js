import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // ✅ FIXED: String not string
    name: { type: String, required: true }, // ✅ FIXED: String not string
    email: { type: String, required: true, unique: true }, // ✅ FIXED: String not string
    imageUrl: { type: String, required: true }, // ✅ FIXED: String not string
    cartItems: { type: Object, default: {} }
}, { minimize: false });

// ✅ FIXED: Use mongoose.models, not mongoose.modelNames
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;