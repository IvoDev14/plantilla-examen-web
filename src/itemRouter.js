// Plantilla de router genérica

router.get('/', async (req, res) => {
    const itemsList = await getItems();
    const isLimitReached = itemsList.length >= 5; // Dependiendo del examen. Esto marca si se superan los elementos máximos registrados en la BD
    res.render('index', { items: itemsList, hideForm: isLimitReached }); // Le pasa los elementos y la variable de si se ha alcanzado el límite
})

router.post("/items", async (req, res) => {
    try {
        const newItem = await addItem(req.body)
        const allItems = await getItems()
        res.json({ success: true, item: newItem, total: allItems.length }) // Devuelve el objeto insertado y el contador actualizado
    } catch (error) {
        res.json({ success: false, message: error.message }) // si hay error, lo devuelve para el frontend
    }
})

router.post("/delete/:id", async (req, res) => {
    try {
        const result = await deleteItem(req.params.id)
        const allItems = await getItems()
        res.json({ success: true, total: allItems.length }) // Devuelve el contador actualizado tras borrar
    } catch (error) {
        res.json({ success: false, message: error.message }) // si hay error, lo devuelve para el frontend
    }
})