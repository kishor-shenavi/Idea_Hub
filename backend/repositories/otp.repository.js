// // backend/repositories/otp.repository.js
// // NOTE: stays Mongo-backed for now — Phase 2 replaces this with Redis TTL keys, don't do both at once
// const OTP = require('../models/OTP');
// class OTPRepository {
//   async create(data) { return OTP.create(data); }
//   async findOne(query) { return OTP.findOne(query); }
//   async deleteOne(query) { return OTP.deleteOne(query); }
// }
// module.exports = new OTPRepository();