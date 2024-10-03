//const crypto = require('crypto');
const crypto = require('node:crypto');
//const Cryptojs = require('crypto-js');
const bcryptjs = require('bcryptjs');

const helpers = {};

helpers.genSalt = ()=>{
    const salt = crypto.randomBytes(16).toString('hex');
    return salt;
};

helpers.encrypt = (pass,salt)=>{
    const sha256Hash = crypto.createHash('sha256').update(pass+salt).digest('hex');
    return sha256Hash;
};

helpers.bcryptHash = async (pass)=>{
    const salt = await bcryptjs.genSalt(10);
    const hashed = await bcryptjs.hash(pass,salt);
    return hashed;
};



module.exports = helpers;
