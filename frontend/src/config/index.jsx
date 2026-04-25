import axios from "axios"
export const BaseUrl="https://skilllink-8dfc.onrender.com/"
export const clientServer=axios.create({
    baseURL:BaseUrl,
})