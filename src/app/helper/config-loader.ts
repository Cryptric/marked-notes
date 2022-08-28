import { fstat } from "fs";
import { ElectronService } from "../core/services";
import { Config } from "../model/config";
import { EncryptedNotebook } from "../model/encrypted-notebook";
import { JSONNotebook } from "../model/json-notebook";
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
        if (config.notebooks[i].isEncryptedNotebook) {
          config.notebooks[i] = Object.assign(new EncryptedNotebook(), config.notebooks[i]);
        } else if (config.notebooks[i].isJSONNotebook) {
          config.notebooks[i] = Object.assign(new JSONNotebook(), config.notebooks[i]);
        } else {
          config.notebooks[i] = Object.assign(new Notebook(), config.notebooks[i]);
        }
      }
    } else {
      config = new Config();
      config.notebooks = [];
    }
    return config;
  }

  public saveConfig(config: Config): void {
    let json = JSON.stringify(config, (key, value) => {
      if (key === 'dir' || key === 'cryptr' || key === 'password') {
        return undefined;
      }
      return value;
    });
    this.fs.writeFileSync(ConfigLoader.CONFIG_PATH, json);

  }

}
