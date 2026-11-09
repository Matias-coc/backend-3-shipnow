// Devuelve las rutas reales de la app Express como un Set de strings "METODO /ruta/{param}"
export const getRealRoutes = (app) => {
  const routes = new Set();

  for (const layer of app._router.stack) {
    if (layer.name !== 'router') continue;

    const mountPath = layer.regexp.source
      .replace('^', '')
      .replace('\\/?(?=\\/|$)', '')
      .replace(/\\\//g, '/');

    for (const inner of layer.handle.stack) {
      if (!inner.route) continue;
      const fullPath = mountPath + (inner.route.path === '/' ? '' : inner.route.path);
      for (const method of Object.keys(inner.route.methods)) {
        routes.add(`${method.toUpperCase()} ${fullPath.replace(/:(\w+)/g, '{$1}')}`);
      }
    }
  }

  return routes;
};
