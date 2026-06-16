# 📖 README: Guía Maestra para el Examen Práctico de Desarrollo Web (Con MongoDB)

Esta guía sirve como tutorial y plantilla definitiva para afrontar los exámenes prácticos de la asignatura, basándose en la estructura exacta de las convocatorias anteriores pero adaptada al uso de MongoDB como base de datos.

## 👁️🗨️ 1. VISIÓN A ALTO NIVEL DEL EXAMEN

Antes de picar código, es vital entender qué te están pidiendo. El examen busca evaluar si eres capaz de crear una aplicación web donde el cliente y el servidor se comunican de forma asíncrona sin recargar la página.

### 🔹 La Parte Común (Lo que SIEMPRE vas a tener que hacer)

Sin importar la temática del examen, siempre te pedirán construir la misma arquitectura:

* **Una única vista principal:** Una página HTML que carga una lista inicial de elementos desde la base de datos y muestra un formulario para crear más.
* **Tecnologías estrictas:** Backend con Node.js, Express y Mustache. Frontend con JavaScript vainilla y peticiones AJAX (`fetch`). Estilos con HTML/CSS puro (¡prohibido Bootstrap!).
* **Doble Validación:** Tienes que proteger tu aplicación en dos barreras:
  * **Visual (Frontend):** Mostrar mensajes en verde/rojo dinámicamente según lo que escriba el usuario usando eventos como `input`.
  * **Seguridad (Backend):** Comprobar las mismas reglas antes de insertar en MongoDB para evitar datos corruptos.
* **Flujo AJAX:** Cuando el usuario envía el formulario, interceptas el evento (`preventDefault()`), envías un JSON al servidor con `fetch` (`POST`), el servidor guarda en Mongo y devuelve un JSON. Con ese JSON, actualizas el DOM (añades un `<li>`) y lanzas un `alert()` nativo. Lo mismo para borrar (usando también `POST` hacia una ruta específica).
* **Control de Límites (Ocultar/Mostrar):** Siempre habrá un límite de negocio (ej. máximo 5 elementos). Al llegar a ese límite, el formulario debe desaparecer usando la propiedad CSS `display: none` y reaparecer con `display: block` si se borran elementos. Esto se controla al cargar la página (Mustache) y dinámicamente al crear/borrar (JavaScript).

### 🔹 La Parte Específica (Lo que PUEDE VARIAR)

Lo único que cambiará de un examen a otro son los detalles del modelo de negocio:

* **La Entidad:** Pueden pedirte Funko Pops, Citas de Peluquería, Libros, etc. Solo cambia el nombre de las variables y ficheros (debes usar inglés, ej. `product`, `appointment`).
* **Los Campos del Formulario:** En un examen pedirán Nombre y Precio, en otro Nombre, Hora y Tratamientos. Cambiarán los inputs y cómo recoges sus valores (`document.getElementById().value`).
* **La Lógica de la Regla de Negocio:**
  * **El límite:** Puede ser un máximo global (ej. "No más de 5 Funkos") o un máximo específico (ej. "No más de 5 tratamientos tipo Mechas").
  * **La restricción de texto:** Pueden pedirte validar que un campo tenga entre 20 y 200 caracteres, o comprobar que no tenga espacios usando `.includes(' ')`, o verificar formatos de hora.

## ⚠️ 2. REGLAS DE ORO DEL EXAMEN

* **No ejecutable:** Te faltarán ficheros base. NO PODRÁS EJECUTAR NI PROBAR LA APLICACIÓN. Debes programar a ciegas.
* **Sin Imports:** En los ficheros JavaScript (`Router.js` y `Service.js`) no escribas imports (Express, MongoDB, etc.), se asume que están.
* **Idioma:** Código en inglés, textos de la interfaz en castellano.
* **Alertas nativas:** Usa únicamente `alert()` para notificar éxito o error tras el AJAX.
* **Entrega:** Archivo ZIP con "7-Zip", formato `Iniciales-Examen-Mes.zip`.

## 📁 3. ESTRUCTURA DE FICHEROS A PROGRAMAR

Solo modificas 4 ficheros (divididos en 3 puntos Backend y 3 puntos Frontend):

* `src/[entidad]Service.js`: Lógica de base de datos MongoDB y doble validación.
* `src/[entidad]Router.js`: Rutas Express asíncronas (`async/await`) para renderizar vista inicial y procesar AJAX devolviendo JSON.
* `views/index.html`: Plantilla principal Mustache y CSS.
* `public/app.js`: Lógica de cliente, validación dinámica, peticiones `fetch` y modificación del DOM.

## 🛠️ 4. TUTORIAL PASO A PASO (PLANTILLA MONGODB)

Asumiremos una entidad genérica llamada `item`.

### PASO 1: Lógica de BD y Reglas (`src/itemService.js`)

Aquí se aplican las reglas estrictas del examen antes de llamar a MongoDB.

```javascript
// Obtener todos
async function getItems() {
    return await collection.find({}).toArray();
}

// Crear con doble validación
async function addItem(data) {
    // Regla de Negocio 1: Límite máximo
    const total = await collection.countDocuments();
    if (total >= 5) {
        throw new Error("Límite máximo alcanzado");
    }
    
    // Regla de Negocio 2: Restricciones específicas (ej: vacío o con espacios)
    if (!data.name || data.name.includes(' ')) {
        throw new Error("Nombre no válido o contiene espacios");
    }
    
    // Guardar en Mongo
    const result = await collection.insertOne(data);
    return { _id: result.insertedId, ...data };
}

// Borrar
async function deleteItem(id) {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
}
```

### PASO 2: Rutas Express (`src/itemRouter.js`)

Conecta el Service con el cliente. Todo es asíncrono.

```javascript
// GET Inicial: Carga la vista Mustache y decide si ocultar el form
router.get('/', async (req, res) => {
    const itemsList = await getItems();
    const isLimitReached = itemsList.length >= 5; 
    
    res.render('index', { 
        items: itemsList,
        hideForm: isLimitReached 
    }); 
});

// POST (AJAX): Crea y devuelve JSON
router.post('/items', async (req, res) => {
    try {
        const newItem = await addItem(req.body);
        const allItems = await getItems();
        res.json({ success: true, item: newItem, total: allItems.length });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// POST: Borrar un elemento (AJAX) - Adaptado con POST
router.post('/items/:id/delete', async (req, res) => {
    const isDeleted = await deleteItem(req.params.id);
    const allItems = await getItems();
    
    if (isDeleted) {
        res.json({ success: true, total: allItems.length });
    } else {
        res.json({ success: false, message: "Error deleting item" });
    }
});
```

### PASO 3: Interfaz Gráfica (`views/index.html`)

Diseño base sin Bootstrap. Uso de validación HTML (`required`) y control Mustache para ocultar (`display: none/block`).

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Examen Web</title>
    <script defer src="/app.js"></script>
</head>
<body>
    <h1>Título Principal</h1>

    <!-- Mustache decide si se muestra u oculta al cargar la página -->
    <div id="form-container" style="display: {{#hideForm}}none{{/hideForm}}{{^hideForm}}block{{/hideForm}}">
        <form id="mainForm">
            <label>Name:</label>
            <input type="text" id="itemName" name="name" required>
            
            <!-- Mensaje de validación dinámica -->
            <div id="validationMsg"></div>
            
            <button type="submit">Create</button>
        </form>
    </div>

    <h2>List of Items</h2>
    <ul id="itemsList">
        <!-- Bucle inicial usando _id de MongoDB -->
        {{#items}}
            <li id="item-{{_id}}">
                {{name}}
                <button onclick="deleteRequest('{{_id}}')">Eliminar</button>
            </li>
        {{/items}}
    </ul>
</body>
</html>
```

### PASO 4: Interactividad Frontend (`public/app.js`)

Lógica visual, llamadas asíncronas, modificación del DOM y Alertas nativas obligatorias.

```javascript
// 1. VALIDACIÓN DINÁMICA VISUAL
document.getElementById('itemName').addEventListener('input', function(event) {
    const text = event.target.value;
    const msgDiv = document.getElementById('validationMsg');
    
    // Regla dependiente del examen (ej. espacios)
    if (text.includes(' ')) { 
        msgDiv.textContent = "Error: no spaces allowed";
        msgDiv.style.color = "red";
    } else {
        msgDiv.textContent = "Valid format";
        msgDiv.style.color = "green";
    }
});

// 2. AJAX CREAR (POST)
document.getElementById('mainForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita recarga
    
    const inputName = document.getElementById('itemName');
    
    const response = await fetch('/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inputName.value })
    });
    
    const data = await response.json(); 
    
    if (data.success) {
        alert("Success!"); // Alerta obligatoria
        inputName.value = ""; // Limpiar solo si hay éxito
        
        // Actualizar DOM con _id de MongoDB
        const list = document.getElementById('itemsList');
        list.innerHTML += `
            <li id="item-${data.item._id}">
                ${data.item.name}
                <button onclick="deleteRequest('${data.item._id}')">Eliminar</button>
            </li>
        `;
        checkVisibility(data.total);
    } else {
        alert("Error: " + data.message); // Alerta error, no limpia el form
    }
});

// 3. AJAX BORRAR (POST)
async function deleteRequest(id) {
    const response = await fetch(`/items/${id}/delete`, { method: 'POST' });
    const data = await response.json();
    
    if (data.success) {
        alert("Item deleted"); 
        document.getElementById(`item-${id}`).remove(); // Borrado del DOM
        checkVisibility(data.total);
    } else {
        alert("Error deleting");
    }
}

// 4. LÓGICA DE OCULTACIÓN DINÁMICA
function checkVisibility(total) {
    const container = document.getElementById('form-container');
    if (total >= 5) {
        container.style.display = 'none'; // Supera límite
    } else {
        container.style.display = 'block'; // Debajo del límite
    }
}
```
