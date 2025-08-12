import fs from "fs"

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
    cloud_name: 'didtiqh5a', 
    api_key:'869939152253589', 
    api_secret: 'NWzizq0DLXBC7TZv0vVzK3ig3Sg'
});
    
const uploadoncloudinary = async (localfilepath)=>{
    try{
        if(!localfilepath) return null

        const response=await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })

        // console.log("File is uploaded on cloudinary",response.url);
        
        fs.unlinkSync(localfilepath)
        return response;
    }
    catch(error){
        fs.unlinkSync(localfilepath)
        return null
    }
}

export { uploadoncloudinary }