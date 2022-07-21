import { fstat } from "fs";
import { ElectronService } from "../core/services";
import { Config } from "../model/config";
import { Notebook } from "../model/notebook";

export class ConfigLoader {

  private static CONFIG_PATH = 'marked-notes-config.json'

  private fs: any;

  constructor(private electronService: ElectronService) {
    this.fs = electronService.fs;
  }

  public loadConfig(): Config {
    let config: Config;
    if (this.fs.existsSync(ConfigLoader.CONFIG_PATH)) {
      config = Object.assign(new Config(), JSON.parse(this.fs.readFileSync(ConfigLoader.CONFIG_PATH)));
      for (let i = 0; i < config.notebooks.length; i++) {
        config.notebooks[i] = Object.assign(new Notebook(), config.notebooks[i]);
      }
      console.log(config.notebooks);
    } else {
      config = new Config();
    }
    return config;
  }

}
