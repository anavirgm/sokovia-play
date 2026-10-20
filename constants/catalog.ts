/**
 * Límites de la exploración del catálogo.
 *
 * Viven en `constants` y no en `features` para que el cliente y el servidor
 * compartan el mismo número: la acción de servidor acota la página que pide el
 * navegador y la cuadrícula necesita conocer el techo para anunciar el final.
 *
 * `BROWSE_MAX_PAGE` es un techo de producto, no de TMDB. La API permite 500
 * páginas por consulta, pero el scroll infinito no puede crecer sin freno: cada
 * página añade veinte tarjetas al DOM y el navegador acaba pagando más por
 * mantener nodos que por pintarlos. Veinte páginas —cuatrocientas películas—
 * cubren de sobra una sesión de exploración; cuando se agotan, el filtro por
 * género es la forma natural de seguir. La interfaz lo dice al llegar al final.
 */
export const BROWSE_MAX_PAGE = 20;
