const mongoose = require("mongoose")
const passportLocalMoongose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMoongose);

module.exports = mongoose.model("User", UserSchema)