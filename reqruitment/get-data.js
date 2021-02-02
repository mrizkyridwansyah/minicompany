async function getMultipleData (collection, option) {
    try{    
        return await collection.find(option)
    } catch(err) {
        return new Error(err.message)
    }
} 

async function getSingleData (collection, id) {
    try{    
        return await collection.findById(id)
    } catch(err) {
        return new Error(err.message)
    }
} 

module.exports = { getMultipleData, getSingleData }