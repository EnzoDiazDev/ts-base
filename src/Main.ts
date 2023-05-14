if(process.env.NODE_ENV !== 'production') require('dotenv').config();
import Logger from 'logger';

class Main {
  public static main():void {
    Logger.info('Hello world!');
  }
}

Main.main();
