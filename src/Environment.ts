/** Custom error para cuando una variable de entorno no está definida. */
class EnvVarNotDefined extends Error {
  /** @param envVar Nombre de la variable de entorno. */
  constructor(envVar:string) {
    super(`Environment variable '${envVar}' is not defined`);
  }
}

/** Clase estática con las variables de entorno del proyecto. */
export class Environment {
  /** Entorno del proyecto. */
  public static get ENVIRONMENT():string {
    if(!process.env.ENVIRONMENT) throw new EnvVarNotDefined('ENVIRONMENT');

    return process.env.ENVIRONMENT;
  }

  /** Nombre del proyecto según el `package.json`. */
  public static get PROJECT_NAME():string {
    return process.env.npm_package_name || 'project';
  }

  /** Versión del proyecto según el `package.json`. */
  public static get VERSION():string {
    return process.env.npm_package_version || '1.0.0';
  }
}
