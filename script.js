/** @type {CanvasRenderingContext2D} */

let canvas;
let ctx;
let grid;
let cols;
let rows;
let mouseX;
let mouseY;
let cellSize;
let numTrollCells;
let markersRemaining;
let currentCell;
let nextCell;
let stack = [];

class Cell {
    constructor(x, y){
        this.i = x;
        this.j = y;
        this.x = x*50;
        this.y = y*50;
        this.w = 50;
        this.walls = [true, true, true, true];
    }

    show(){
        // Top
        if(this.walls[0]){
            line(this.x, this.y, this.x+this.w, this.y);
        }
        // Right
        if(this.walls[1]){
        line(this.x+this.w, this.y, this.x+this.w, this.y+this.w);
        }
        // Bottom
        if(this.walls[2]){
        line(this.x+this.w, this.y+this.w, this.x, this.y+this.w);
        }
        // Left
        if(this.walls[3]){
            line(this.x, this.y+this.w, this.x, this.y);
        }
    }

    isVisited(){
        // TODO: Make another color if visited
        ctx.fillStyle = "#82daff"
        ctx.fillRect(this.x+1, this.y+1, this.w-2, this.w-2);
    }

    removeWall(otherCell){
        // TODO
        // this.walls = [true, true, true, true];
    }
}

function line(x1, y1, x2, y2){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function create2dArray(cols, rows){
    // Creating a 2D array
    let arr = new Array(cols);
    for(let i = 0; i < rows; i++){
        arr[i] = new Array(rows);
    }
    return arr;
}

function markersRemainingUpdate(){
    // Updating the flag-remainding-count
    ctx.clearRect(cols*cellSize+10, 0, 50*3, 50);
    ctx.font = "30px Courier New";
    ctx.fillStyle = "black";
    ctx.fillText("\u{1f6a9}=" + markersRemaining, cols*cellSize+10, 50/1.5);
}

function SetupCanvas(){
    // Parameters
    cols = 10;
    rows = 10;
    cellSize = 50;
    numTrollCells = 12;
    markersRemaining = numTrollCells;

    // Setup canvas
    canvas = document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Set white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add instructions
    // ctx.font = "20px Courier New";
    // ctx.fillStyle = "black";
    // ctx.fillText("1) use 'SHIFT + MOUSE-CLICK' to flag a troll", 10, cols*cellSize+30);
    // ctx.fillText("2) press 'r' to restart", 10, cols*cellSize+60);
    // ctx.clearRect(10, 0, 200, 100);

    grid = create2dArray(cols, rows);

    // Creating all the cells
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            grid[i][j] = new Cell(i, j);
        }  
    }  

    // Displaying the board
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            grid[i][j].show();
        }   
    }

    currentCell = grid[0][0];
    currentCell.isVisited();
    // markersRemainingUpdate();
}

function mouseClicked(e){
    // Checking for mouse events
    mouseX = e.pageX;
    mouseY = e.pageY;
    if(e.shiftKey){
        if(markersRemaining > 0){
            markersRemaining--;
            markersRemainingUpdate();
            markCell();
        }
    }
    else{
        checkCellClicked()
    }
}

function chooseRandomNeighbor(currentCell){
    // Top      x  , y-1
    // Right    x+1, y 
    // Bottom   x  , y+1
    // Left     x-1, y
    let x = currentCell.i+1;
    let y = currentCell.j;
    return grid[x][y];
}   

function updateCanvas(){
    // Every loop check if mouse is clicked

    // If the current cell has any neighbours which have not been visited
    //   1) Choose randomly one of the unvisited neighbours
    nextCell = chooseRandomNeighbor(currentCell);
    //   2) Push the current cell to the stack
    stack.push(currentCell);
    //   3) Remove the wall between the current cell and the chosen cell

    //   4) Make the chosen cell the current cell and mark it as visited
    nextCell.isVisited();
}

function loop(){
    updateCanvas();
    window.requestAnimationFrame(loop);
}

function refreshPage(e){
    // 114 is the 'r'-key
    if(e.keyCode == 114){
        window.location.reload();
    }
}

// Setup the canvas when pages is loaded
document.addEventListener('DOMContentLoaded', SetupCanvas);
// Refesh page when hitting 'r'-key
document.addEventListener('keypress', refreshPage);
// Render loop
window.requestAnimationFrame(loop);