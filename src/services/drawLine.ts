import { ILine, IDot } from "models/interfaces"

class DrawLine {
  private canvas: HTMLCanvasElement
  private button: HTMLElement
  private context: CanvasRenderingContext2D
  private lines: ILine[] = []
  private allDots: IDot[] = []
  private currentDots: IDot[] = []
  private isDraw: boolean = false

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.canvas.width = this.canvas.offsetWidth
    this.canvas.height = this.canvas.offsetHeight
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D
    this.button = document.getElementById("button")!
    this.createUserEvents()
  }

  createUserEvents(): void {
    this.canvas.oncontextmenu = function (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    this.canvas.onpointerdown = this.pointerDownHandler.bind(this)
    this.canvas.onpointermove = this.pointerMoveHandler.bind(this)
    this.button.onclick = this.collapseLines.bind(this)
  }

  pointerDownHandler(e: PointerEvent) {
    let x = e.pageX - this.canvas.offsetLeft
    let y = e.pageY - this.canvas.offsetTop

    if (e.buttons === 1) {
      if (!this.isDraw) {
        this.lines.push({
          fromX: x,
          fromY: y,
          toX: x,
          toY: y,
          a: 0,
          b: 0,
          deltaX: 0,
          deltaY: 0,
        })
        this.isDraw = true
      } else {
        let lastLineIndex: number = this.lines.length - 1
        this.lines[lastLineIndex].toX = x
        this.lines[lastLineIndex].toY = y
        this.lines[lastLineIndex].deltaX =
          Math.abs(x - this.lines[lastLineIndex].fromX) / 530
        this.lines[lastLineIndex].deltaY =
          Math.abs(y - this.lines[lastLineIndex].fromY) / 530

        this.setLineConst(this.lines[lastLineIndex])
        this.allDots = this.allDots.concat(this.currentDots)
        this.currentDots = []
        this.isDraw = false
      }
    }
    if (e.buttons === 2) {
      if (this.isDraw) {
        this.lines.pop()
        this.currentDots = []
        this.drawLinesAndDots()
        this.isDraw = false
      }
    }
  }

  pointerMoveHandler(e: PointerEvent) {
    if (!this.isDraw) return
    let x = e.pageX - this.canvas.offsetLeft
    let y = e.pageY - this.canvas.offsetTop
    let lastLineIndex = this.lines.length - 1
    this.lines[lastLineIndex].toX = x
    this.lines[lastLineIndex].toY = y
    this.setLineConst(this.lines[lastLineIndex])
    this.setCurrentDots()
    this.drawLinesAndDots()
  }

  drawLinesAndDots() {
    this.context.fillStyle = "white"
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.lines.forEach((line) => {
      this.context.beginPath()
      this.context.moveTo(line.fromX, line.fromY)
      this.context.lineTo(line.toX, line.toY)
      this.context.stroke()
    })
    this.allDots.forEach((dot) => {
      this.context.fillStyle = "red"
      this.context.beginPath()
      this.context.arc(dot.x, dot.y, 4, 0, 2 * Math.PI)
      this.context.fill()
    })
    this.currentDots.forEach((dot) => {
      this.context.fillStyle = "red"
      this.context.beginPath()
      this.context.arc(dot.x, dot.y, 4, 0, 2 * Math.PI)
      this.context.fill()
    })
  }

  setLineConst(line: ILine) {
    line.a =
      line.fromX !== line.toX
        ? (line.toY - line.fromY) / (line.toX - line.fromX)
        : 0
    line.b =
      line.fromX !== line.toX
        ? (line.fromY * line.toX - line.toY * line.fromX) /
          (line.toX - line.fromX)
        : 0
  }

  setCurrentDots() {
    if (this.lines && this.lines.length > 1) {
      let i = this.lines.length - 1
      let lastLine = this.lines[i]
      this.currentDots = []
      this.lines.forEach((line, index) => {
        if (i !== index && (line.a !== lastLine.a || line.b !== lastLine.b)) {
          let x = (lastLine.b - line.b) / (line.a - lastLine.a)
          let y =
            (line.a * lastLine.b - line.b * lastLine.a) / (line.a - lastLine.a)

          if (
            this.isDotOnLine(
              x,
              line.fromX,
              line.toX,
              y,
              line.fromY,
              line.toY,
            ) &&
            this.isDotOnLine(
              x,
              lastLine.fromX,
              lastLine.toX,
              y,
              lastLine.fromY,
              lastLine.toY,
            )
          )
            this.currentDots.push({ x, y })
        }
      })
    }
  }

  isDotOnLine(
    x0: number,
    x1: number,
    x2: number,
    y0: number,
    y1: number,
    y2: number,
  ): boolean {
    if (x2 - x1 >= 0 && y2 - y1 >= 0) {
      if (x0 <= x2 && x0 >= x1 && y0 <= y2 && y0 >= y1) return true
    } else if (x2 - x1 >= 0 && y2 - y1 <= 0) {
      if (x0 <= x2 && x0 >= x1 && y0 >= y2 && y0 <= y1) return true
    } else if (x2 - x1 <= 0 && y2 - y1 >= 0) {
      if (x0 >= x2 && x0 <= x1 && y0 <= y2 && y0 >= y1) return true
    } else {
      if (x0 >= x2 && x0 <= x1 && y0 >= y2 && y0 <= y1) return true
    }
    return false
  }

  linesReduction(): number {
    let i: number = 0
    this.lines.forEach((line, index, object) => {
      let lengthX: boolean = Math.abs(line.fromX - line.toX) > line.deltaX
      let lengthY: boolean = Math.abs(line.fromY - line.toY) > line.deltaY
      if (lengthX) {
        i += 1
        if (line.fromX < line.toX) {
          line.fromX += line.deltaX
          line.toX -= line.deltaX
        } else {
          line.fromX -= line.deltaX
          line.toX += line.deltaX
        }
      } else {
        object.splice(index, 1)
        i -= 1
      }
      if (lengthY) {
        i += 1
        if (line.fromY < line.toY) {
          line.fromY += line.deltaY
          line.toY -= line.deltaY
        } else {
          line.fromY -= line.deltaY
          line.toY += line.deltaY
        }
      } else {
        object.splice(index, 1)
        i -= 1
      }
      if (lengthX && lengthY) {
        this.allDots.forEach((dot, index, object) => {
          if (
            (Math.abs(dot.x - line.fromX) < 4 &&
              Math.abs(dot.y - line.fromY) < 4) ||
            (Math.abs(dot.x - line.toX) < 4 && Math.abs(dot.y - line.toY) < 4)
          ) {
            object.splice(index, 1)
          }
        })
      }
    })
    this.drawLinesAndDots()
    return i
  }

  collapseLines() {
    setTimeout(() => {
      let i = this.linesReduction()
      if (i <= 0) return
      this.collapseLines()
    }, 4)
  }
}

export default DrawLine
