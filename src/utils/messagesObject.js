const generateMessageObject = (text, username) => {
    return {
        text,
        createdAt : new Date().getTime(),
        username
    }
}

const generateLocationObject = (latitude, longitude, username) => {
    return {
        url : `https://google.com/maps?q=${latitude},${longitude}`,
        createdAt : new Date().getTime(),
        username
    }
}

module.exports = {
    generateMessageObject,
    generateLocationObject
}