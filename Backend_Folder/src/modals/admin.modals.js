import moongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bycrypt from 'bcrypt';

const adminSchema = new moongoose.Schema({
    adminname: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password:{
        type: String,
        required: true,
    },
    refreshToken:{
        type: String,
        
    }
})

// write code to hash password before saving the admin