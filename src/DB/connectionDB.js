import mongoose from "mongoose";

export const checkConnectionDB = async() =>{
  await mongoose.connect(process.env.DB_URL_ONLINE).then(() =>{
    console.log('Connected');
  }).catch((error) =>{
    console.log('Fail to connect');
    
  })

}

