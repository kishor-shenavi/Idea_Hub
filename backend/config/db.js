require('dotenv').config();
const mongoose=require('mongoose');

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log('mongo connected');
    } catch(err){
        console.error('Database connection  issue' ,err.message);
        process.exit(1);
    }
};

module.exports=connectDB;