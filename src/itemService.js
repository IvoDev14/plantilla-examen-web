// Plantilla de servicio genérica


// Obtener todos los elementos
async function getItems() {
    return await collection.find({}).toArray();
}

// Añadir un elemento con doble validación
async function addItem(data) {
    // Regla de negocio 1 número máximo de elementos 
    const total = await collection.countDocuments();

    if (total >= 5) {
        throw new Error("Límite máximo alcanzado");
    }

    // Regla de negocio 2, puede variar según el examen
    if (!data.name || data.name.includes(" ")) {
        throw new Error("Nombre no válido o contiene espacios");
    } // En este caso comprueba que esté el nombre y que no tenga espacios    

    // Almacenamos en mongo
    const result = await collection.insertOne(data);
    return { _id: result.insertedId, ...data }; // Devuelve el _id y toda la data (name, price...)
}

// Eliminar elemento
async function deleteItem(id) {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1; // Comprueba que realmente se haya borrado un elemento
}

