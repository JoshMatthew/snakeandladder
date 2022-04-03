const BG_COLOR = "#111"
const gameScreen = document.getElementById("gameScreen")
let cnv, ctx;

const socket = io('http://localhost:3000')

socket.on('init', handleInit) 

let gameState = {
    didWin: false
}

function init() {
    cnv = document.getElementById('canvas')
    ctx = cnv.getContext('2d') 

    cnv.width = cnv.height = 600
    ctx.fillStyle = BG_COLOR
    ctx.fillRect(0, 0, cnv.width, cnv.height)
}

function handleInit(msg) {
    console.log(msg)
}

init()