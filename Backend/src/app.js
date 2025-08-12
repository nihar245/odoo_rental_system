import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const allowedOrigins = (process.env.CORS_ORIGIN?.split(",") || defaultOrigins);

app.use(cors({
    origin: allowedOrigins,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("Public"))
app.use(cookieParser())


//Routes import

import userrouter from './routes/user.routes.js'
import productsRouter from './routes/products.routes.js'
import wishlistRouter from './routes/wishlist.routes.js'
import notificationRouter from './routes/notification.routes.js'
import pickupRouter from './routes/pickup.routes.js'
import rentalRequestRouter from './routes/rentalRequest.routes.js'
import settingsRouter from './routes/settings.routes.js'
import reportsRouter from './routes/reports.routes.js'
import reservationRouter from './routes/reservation.routes.js'
import deliveryRouter from './routes/delivery.routes.js'
import invoiceRouter from './routes/invoice.routes.js'

//routes declaration

app.use('/api/v1/users',userrouter)
app.use('/api/v1/products', productsRouter)
app.use('/api/v1/wishlist', wishlistRouter)
app.use('/api/v1/notifications', notificationRouter)
app.use('/api/v1/pickups', pickupRouter)
app.use('/api/v1/rental-requests', rentalRequestRouter)
app.use('/api/v1/settings', settingsRouter)
app.use('/api/v1/reports', reportsRouter)
app.use('/api/v1/reservations', reservationRouter)
app.use('/api/v1/deliveries', deliveryRouter)
app.use('/api/v1/invoices', invoiceRouter)

export { app }