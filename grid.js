const canvas=document.getElementByClass('grid'); const ctx=canvas.getContext('2d');

function drawGame(){
    clearScreen();

}

function clearScreen(){
    ctx.fillStyle= 'black'; // make screen black
    ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight); // black color start from 0px left, right to canvas width and canvas height
}

drawGame();