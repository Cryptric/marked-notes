import { Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { stderr, stdout } from 'process';
import { ElectronService } from '../core/services';
import { ConfigService } from '../helper/config.service';


@Component({
  selector: 'app-tex-editor',
  templateUrl: './tex-editor.component.html',
  styleUrls: ['./tex-editor.component.scss']
})
export class TexEditorComponent implements OnInit {

  @Output() close = new EventEmitter();
  @Output() texDone = new EventEmitter<string>();

  @ViewChild('console')
  console: ElementRef;


  public imagePath: string;
  public consoleOutput: string;

  public texCode: string;

  constructor(public configService: ConfigService, private electronService: ElectronService, private zone: NgZone) {
  }

  ngOnInit(): void {
    this.texCode = this.configService.config.texTemplate;
  }

  onCompile(): void {
    this.configService.config.texTemplate = this.texCode;
    this.configService.saveConfig();
    this.console.nativeElement.innerHTML = "";
    this.imagePath = null;
    if (this.electronService.fs.existsSync('tmp')) {
      this.electronService.fs.rmSync('tmp', { recursive: true });
    }
    this.electronService.fs.mkdirSync('tmp');
    this.electronService.fs.writeFileSync('tmp/snippet.tex', this.texCode);
    this.electronService.childProcess.exec('pdflatex snippet.tex -interaction=nonstopmode', { cwd: 'tmp' }, (error, stdout, stderr) => {
      this.consoleOutput = '<p>' + stdout + '</p>\n<p style="color: red;">' + stderr + '</p>';
      if (error) {
        this.consoleOutput = this.consoleOutput + '<p style="color: red;">' + error.toString() + '</p>';
      }
      this.console.nativeElement.innerHTML = this.consoleOutput;
      if (!error) {
        this.electronService.childProcess.exec('pdf2svg\\pdf2svg.exe tmp/snippet.pdf tmp/snippet.svg', (error, stdout, stderr) => {
          if (error) {
            this.consoleOutput += '<p style="color: red;">Error while converting to svg</p>\n' + '<p style="color: red;">' + error.toString() + '</p>';;
            this.console.nativeElement.innerHTML = this.consoleOutput;
          } else {
            this.zone.run(() => {
              this.imagePath = "file:///tmp/snippet.svg" + "?" + + new Date().getTime(); // add cache breaker to image path to force disk reload
            })
          }
        })
      }
    });
  }

  public done(): void {
    if (this.imagePath) {
      let texData = this.electronService.fs.readFileSync('tmp/snippet.svg').toString();
      this.texDone.emit(texData);
    }
  }

}
