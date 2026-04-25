import axios from "axios"
export const BaseUrl= process.env.NEXT_PUBLIC_API_URL
export const clientServer=axios.create({
    baseURL:BaseUrl,
})