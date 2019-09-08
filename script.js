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
let notStop = true;

class Cell {
    constructor(x, y, cell_size){
        this.i = x;
        this.j = y;
        this.x = x*cell_size;
        this.y = y*cell_size;
        this.w = cell_size;
        this.walls = [true, true, true, true];
        this.visited   = false;
        this.leader    = false;
        this.backtrack = false;
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

    removeWall(otherCell){
        if(this.i == otherCell.i && this.j == otherCell.j+1){
            // Top neighbour..
            this.walls[0] = false;
            otherCell.walls[2] = false;
        }
        if(this.i == otherCell.i-1 && this.j == otherCell.j){
            // Right neighbour..
            this.walls[1] = false;
            otherCell.walls[3] = false;
        }
        if(this.i == otherCell.i && this.j == otherCell.j-1){
            // Bottom neighbour..
            this.walls[2] = false;
            otherCell.walls[0] = false;
        }
        if(this.i == otherCell.i+1 && this.j == otherCell.j){
            // Left neighbour..
            this.walls[3] = false;
            otherCell.walls[1] = false;
        }
    }

    isVisited(){ this.visited = true; }
}

function hasNeighboursNotVisited(cell){
    // Top     0, -1
    // Right   1,  0
    // Bottom  0,  1
    // Left   -1,  0
    let x = cell.i;
    let y = cell.j;
    let neighbours = [];
    if(x >=0 && y-1 >= 0){
        neighbours.push(grid[x][y-1]); // Top
    }
    if(x+1 < grid.length-1 && y >= 0){
        neighbours.push(grid[x+1][y]); // Right
    }
    if(x >= 0 && y < grid.length-1){
        neighbours.push(grid[x][y+1]); // Bottom
    }
    if(x-1 >= 0 && y >= 0){
        neighbours.push(grid[x-1][y]); // Left
    }
    for(let i = 0; i < neighbours.length; i++){
        if(!neighbours[i].visited){
            return true
        }
    }
    return false;
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
    cols = 60;
    rows = 60;
    cellSize = 10;

    // Setup canvas
    canvas = document.getElementById('my-canvas');
    ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Set white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    grid = create2dArray(cols, rows);

    // Creating all the cells
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            grid[i][j] = new Cell(i, j, cellSize);
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
    let random = ~~(Math.random() * 4);
    let x = 0;
    let y = 0;

    switch(random){
        case 0:
            x = currentCell.i;
            y = currentCell.j-1;
            break;
        case 1:
            x = currentCell.i+1;
            y = currentCell.j;
            break;
        case 2:
            x = currentCell.i;
            y = currentCell.j+1;
            break;
        case 3:
            x = currentCell.i-1;
            y = currentCell.j;
            break;
    }

    if(currentCell.i == 0 && x == -1){
        x = 0;
    }
    if(currentCell.j == 0 && y == -1){
        y = 0;
    }
    if(currentCell.i == grid.length || x == grid.length){
        x = grid.length-1;
    }
    if(currentCell.j == grid.length || y == grid.length){
        y = grid.length-1;
    }
    return grid[x][y];
}   

function showLeaderCell(cell){
    ctx.fillStyle = "#f542ef";
    ctx.fillRect(cell.x, cell.y, cell.w, cell.w);
}

function updateCanvas(){
    currentCell.isVisited();
    // Show leader cell
    showLeaderCell(currentCell);
    // If the current cell has any neighbours which have not been visited
    if(hasNeighboursNotVisited(currentCell)){
        //   1) Choose randomly one of the unvisited neighbours
        nextCell = chooseRandomNeighbor(currentCell);
        while(nextCell.visited != false){
            nextCell = chooseRandomNeighbor(currentCell);
        }
        //   2) Push the current cell to the stack
        stack.push(currentCell);
        //   3) Remove the wall between the current cell and the chosen cell
        nextCell.removeWall(currentCell);
        //   4) Make the chosen cell the current cell and mark it as visited
        currentCell = nextCell;
        // currentCell.isVisited();
    }
    else if(stack.length != 0){
        currentCell = stack.pop();
    }
    else{
        return false;
    }
    return true;
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Displaying the board
    for(let i = 0; i < cols; i++){
        for(let j = 0; j < rows; j++){
            grid[i][j].show();
        }   
    }
}

function loop(){
    // setTimeout(function(){
    //     if(notStop){
    //         draw();
    //         notStop = updateCanvas();
    //         window.requestAnimationFrame(loop);
    //     }
    // }, 200);
    if(notStop){
        draw();
        notStop = updateCanvas();
        window.requestAnimationFrame(loop);
    }
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