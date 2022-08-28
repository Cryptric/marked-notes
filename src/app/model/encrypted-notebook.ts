import { JSONDirNode } from "./json-dir-node";
import { JSONNotebook } from "./json-notebook";

import * as CryptoJS from "crypto-js";

export class EncryptedNotebook extends JSONNotebook {

  private password: string;

  public override isEncryptedNotebook: boolean = true;

  public override readNotebook(fs: any) {
    if (this.password) {
      let cipher = fs.readFileSync(this.path + "/" + this.name + ".book").toString();
      let jsonBook = CryptoJS.AES.decrypt(cipher, this.password).toString(CryptoJS.enc.Utf8);
      this.dir = Object.assign(new JSONDirNode(), JSON.parse(jsonBook));

      this.dir.notebook = this;
      this.assignNodes(this.dir, null);
    }

  }


  public save(fs: any): void {
    if (this.password) {
      let json = JSON.stringify(this.dir, (key, value) => {
        if (key === 'notebook' || key === 'parent') {
          return undefined;
        } else {
          return value;
        }
      });
      let cipher = CryptoJS.AES.encrypt(json, this.password).toString();
      fs.writeFileSync(this.path + "/" + this.name + ".book", cipher);
    }
  }

  public setPassword(password: string): void {
    this.password = password;
  }

  public isPasswordSet(): boolean {
    return this.password && this.password.length > 0;
  }


}
