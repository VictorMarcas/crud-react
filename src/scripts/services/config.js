import Axios from 'axios';

const services = Axios.create({
    baseURL: 'http://localhost:3000/',
    headers: {'Content-Type' : 'application/json; charset=UTF-8'}
})

export default services