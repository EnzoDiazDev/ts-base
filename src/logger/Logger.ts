import { AsyncLocalStorage } from 'async_hooks';

import { Logger as PinoLogger, pino, stdTimeFunctions, Bindings } from 'pino';

import { Environment } from 'src/Environment';

/** Clase singleton para el manejo de logs. */
class Logger {
  private static _instance:Logger;

  /** Variables del contexto de ejecución */
  private readonly storage = new AsyncLocalStorage<Bindings>();
  /** Instancia de `pino` logger. */
  private logger:PinoLogger;

  private constructor() {
    this.logger = pino({
      level: 'trace',
      formatters: {
        level: (label:string) => ({ level: label })
      },
      timestamp: stdTimeFunctions.isoTime,
      mixin: _mergeObject => ({ ...this.storage.getStore() }),
      base: {
        env: Environment.ENVIRONMENT,
        project: Environment.PROJECT_NAME,
        version: Environment.VERSION
      }
    });
  }

  public startContext(bindings:Bindings, cb:() => any):void {
    this.storage.run(bindings, cb);
  }

  /**
   * Método de utilidad para obtener el nombre de la función que lo invoca.
   * @param _this Objeto `this` de la función que lo invoca.
   * @returns Nombre de la función y linea que invoca a este método.
   */
  private getCaller(_this?:any) {
    const oldLimit = Error.stackTraceLimit;
    Error.stackTraceLimit = Infinity;

    const dummyObject = { stack: null };

    const v8Handler = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, callSite) {
      return callSite;
    };
    Error.captureStackTrace(dummyObject, this as any || this.getCaller);

    const v8StackTrace = dummyObject.stack;

    Error.prepareStackTrace = v8Handler;
    Error.stackTraceLimit = oldLimit;

    const caller = (v8StackTrace as any)
      .filter((e:any) => e.getTypeName() != null && e.getTypeName() !== 'Logger' && e.getTypeName() !== 'global')
      .map((e:any) => `${e.getTypeName()}.${e.getFunctionName()}: L${e.getLineNumber()}`);

    return caller[0];
  }

  public static get instance():Logger {
    if(!Logger._instance) Logger._instance = new Logger();

    return Logger._instance;
  }

  /**
   * Setea un binding en el contexto de ejecución.
   * Permite agregar información adicional a los logs.
   * @param key Nombre del binding.
   * @param value Valor del binding.
   */
  public setInContext(key:string, value:any):this {
    const store = this.storage.getStore();
    if(!store) return this;

    store[key] = value;

    return this;
  }

  /**
   * Loggea un mensaje con el nivel `trace`.
   * Se utiliza para realizar seguimiento de la ejecución del programa.
   * @param message Mensaje a loggear.
   * @param bindings Bindings opcionales.
   */
  public trace(message:string, bindings?:Bindings):void {
    this.logger.trace({ caller: this.getCaller(), ...bindings }, message);
  }

  /**
   * Loggea un mensaje con el nivel `debug`.
   * Se utiliza para loggear información de diagnóstico acerca del estado de la aplicación.
   * @param message Mensaje a loggear.
   * @param bindings Bindings opcionales.
   */
  public debug(message:string, bindings?:Bindings):void {
    this.logger.debug({ caller: this.getCaller(), ...bindings }, message);
  }

  /**
   * Loggea un mensaje con el nivel `info`.
   * Se utiliza para loggear procesos normales de la aplicación.
   * @param message Mensaje a loggear.
   * @param bindings Bindings opcionales.
   */
  public info(message:string, bindings?:Bindings):void {
    this.logger.info({ caller: this.getCaller(), ...bindings }, message);
  }

  /**
   * Loggea un mensaje con el nivel `warn`.
   * Se utiliza para loggear cualquier comportamiento potencialmente problemático, pero que podría resolverse automáticamente.
   * @param message Mensaje a loggear.
   * @param error Error a loggear.
   * @param bindings Bindings opcionales.
   */
  public warn(message:string, error?:Error, bindings?:Bindings):void {
    this.logger.warn({ caller: this.getCaller(), error, ...bindings }, message);
  }

  /**
   * Loggea un mensaje con el nivel `error`.
   * Se utiliza para loggear cualquier comportamiento inesperado que requiere intervención manual o atención humana.
   * @param message Mensaje a loggear.
   * @param error Error a loggear.
   * @param bindings Bindings opcionales.
   */
  public error(message:string, error:Error, bindings?:Bindings):void {
    this.logger.error({ caller: this.getCaller(), error, ...bindings }, message);
  }

  /**
   * Loggea un mensaje con el nivel `fatal`.
   * Se utiliza para loggear cualquier comportamiento que podría causar la pérdida de datos o la terminación de la aplicación.
   * @param message Mensaje a loggear.
   * @param error Error a loggear.
   * @param bindings Bindings opcionales.
   */
  public fatal(message:string, error:Error, bindings?:Bindings):void {
    this.logger.fatal({ caller: this.getCaller(), error, ...bindings }, message);
  }
}

export default Logger.instance;
