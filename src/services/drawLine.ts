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
        return
      }

      let lastLineIndex: number = this.lines.length - 1
      this.lines[lastLineIndex].toX = x
      this.lines[lastLineIndex].toY = y
      this.lines[lastLineIndex].deltaX =
        Math.abs(x - this.lines[lastLineIndex].fromX) / 750
      this.lines[lastLineIndex].deltaY =
        Math.abs(y - this.lines[lastLineIndex].fromY) / 750

      this.setLineConst(this.lines[lastLineIndex])
      this.allDots = this.allDots.concat(this.currentDots)
      this.currentDots = []
      this.isDraw = false
    }
    if (e.buttons === 2) {
      this.deleteCurrentLineAndDots()
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
    if (this.lines.length > 1) {
      let i = this.lines.length - 1
      let lastLine = this.lines[i]
      this.currentDots = []
      this.lines.forEach((line, index) => {
        if (line.a !== lastLine.a) {
          let x = (lastLine.b - line.b) / (line.a - lastLine.a)
          let y =
            (line.a * lastLine.b - line.b * lastLine.a) / (line.a - lastLine.a)

          if (
            Math.abs(x - line.fromX) + Math.abs(x - line.toX) <=
              Math.abs(line.fromX - line.toX) &&
            Math.abs(y - line.fromY) + Math.abs(y - line.toY) <=
              Math.abs(line.fromY - line.toY) &&
            Math.abs(x - lastLine.fromX) + Math.abs(x - lastLine.toX) <=
              Math.abs(lastLine.fromX - lastLine.toX) &&
            Math.abs(y - lastLine.fromY) + Math.abs(y - lastLine.toY) <=
              Math.abs(lastLine.fromY - lastLine.toY)
          )
            this.currentDots.push({ x, y })
        }
      })
    }
  }

  deleteCurrentLineAndDots() {
    if (this.isDraw) {
      this.isDraw = false
      this.lines.pop()
      this.currentDots = []
      this.drawLinesAndDots()
    }
  }

  dropLinesAndDots() {
    let i: boolean = false
    this.lines.forEach((line, index, object) => {
      let lengthX: boolean = Math.abs(line.fromX - line.toX) > line.deltaX
      let lengthY: boolean = Math.abs(line.fromY - line.toY) > line.deltaY
      if (lengthX) {
        i = true
        if (line.fromX < line.toX) {
          line.fromX += line.deltaX
          line.toX -= line.deltaX
        } else {
          line.fromX -= line.deltaX
          line.toX += line.deltaX
        }
      }
      if (lengthY) {
        i = true
        if (line.fromY < line.toY) {
          line.fromY += line.deltaY
          line.toY -= line.deltaY
        } else {
          line.fromY -= line.deltaY
          line.toY += line.deltaY
        }
      }
      if (!i) {
        object.splice(index, 1)
        if (this.lines.length) i = true
      }

      this.allDots.forEach((dot, idx, dots) => {
        if (
          (Math.abs(dot.x - line.fromX) < 4 &&
            Math.abs(dot.y - line.fromY) < 4) ||
          (Math.abs(dot.x - line.toX) < 4 && Math.abs(dot.y - line.toY) < 4)
        )
          dots.splice(idx, 1)
      })
      this.setCurrentDots()
    })
    this.drawLinesAndDots()
    return i
  }

  collapser() {
    setTimeout(() => {
      let isLinesDroped = this.dropLinesAndDots()
      if (!isLinesDroped) {
        return
      }
      this.collapser()
    }, 5)
  }

  collapseLines() {
    this.deleteCurrentLineAndDots()
    this.collapser()
  }
}

export default DrawLine
