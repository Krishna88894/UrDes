const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongooseModule = require("passport-local-mongoose");
const passportLocalMongoose = passportLocalMongooseModule.default || passportLocalMongooseModule;
//username, password will automatically defined by the pasportLocalMongoose
const userSchema = new Schema ({
    email : {
        type: String,
        required: true
    },
})
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);