const appCanvas = document.getElementById("app") as HTMLCanvasElement;

if (!appCanvas) {
  throw new Error()
}

export { appCanvas };