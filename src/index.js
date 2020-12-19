const path = require('path')
const express = require('express')


const viewsPath = path.join(__dirname, '..', '/templates/views')

const app = express()
const port = process.env.PORT

app.use(express.static(viewsPath))


app.listen(port, () => {
    console.log(`Server is up in port ${port}.`)
})



