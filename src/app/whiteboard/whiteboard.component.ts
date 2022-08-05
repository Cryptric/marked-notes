import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { getStroke  } from 'perfect-freehand';

@Component({
  selector: 'app-whiteboard',
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.scss']
})
export class WhiteboardComponent implements OnInit {

  @ViewChild('drawArea') drawArea: ElementRef;

  @Output() close = new EventEmitter();
  @Output() sketchDone = new EventEmitter<any>();

  public points: any = [];
  public pathData: any = [];

  mouseDown: boolean = false;

  public lineOptions = {
    size: 4,
    thinning: 0.2,
    smoothing: 0.5
  }

  constructor() { }

  ngOnInit(): void {
  }

  onMouseDown($event) {
    this.points.push([ ]);
    this.pathData.push(' ');
    this.mouseDown = true;
  }

  onMouseUp(event) {
    this.mouseDown = false;
  }

  drag(event: any) {
    if (this.mouseDown) {
      var x = event.x - this.drawArea.nativeElement.offsetLeft;
      var y = event.y - this.drawArea.nativeElement.offsetTop;
      this.points[this.points.length - 1].push([x, y]);
      this.pathData[this.pathData.length - 1] = getSvgPathFromStroke(getStroke(this.points[this.points.length - 1], this.lineOptions));
    }
  }

  done() {
    let result = '<svg xmlns="http://www.w3.org/2000/svg" height="' + this.drawArea.nativeElement.offsetHeight + '" width="' + this.drawArea.nativeElement.offsetWidth + '">';
    for (let path of this.pathData) {
      result += '<path style="fill: white" d="' + path + '"/>';
    }
    result += '</svg>'
    this.sketchDone.emit(result);
  }
}
export function getSvgPathFromStroke(stroke) {
  if (!stroke.length) return ""

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length]
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
      return acc
    },
    ["M", ...stroke[0], "Q"]
  )

  d.push("Z")
  return d.join(" ")
}
