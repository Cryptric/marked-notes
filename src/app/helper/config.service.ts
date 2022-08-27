import { Injectable } from '@angular/core';
import { ElectronService } from '../core/services';
import { Config } from '../model/config';
import { ConfigLoader } from './config-loader';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public config: Config;

  private configLoader: ConfigLoader;

  constructor(private electronService: ElectronService) {
    this.configLoader = new ConfigLoader(electronService);
  }

  public loadConfig(): void {
    this.config = this.configLoader.loadConfig();
  }

  public saveConfig(): void {
    this.configLoader.saveConfig(this.config);
  }


}
