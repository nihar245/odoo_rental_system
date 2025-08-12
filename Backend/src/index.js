import dotenv from "dotenv";
import {app} from './app.js'
dotenv.config({ path: "./.env" });

import connectDB from "./db/db.js";
import { 
  startDirectNotificationCronJob, 
  startCleanupCronJob,
  startRentalRequestReminderCronJob,
  startLateFeeCronJob
} from "./utils/cronJobs.js";

connectDB().then(()=>{
    const port = process.env.PORT || 8000;
    app.listen(port,()=>{
        console.log(`server is running at port : ${port}`);
        
        // Start cron jobs for notifications
        startDirectNotificationCronJob();
        startCleanupCronJob();
        startRentalRequestReminderCronJob();
        startLateFeeCronJob();
    })
}).catch((err)=>{
    console.log("MONGO db connection failed",err);
})


















/* import express from "express";
const app=express();

( async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log(":Error",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is Listening on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("ERROR: ",error)
        throw err
    }
})()
*/