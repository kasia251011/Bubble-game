const RED = '#ff6966';
const PURPLE = '#EA80FC';
const BLUE = '#82B1FF';
const GREEN = '#B9F6CA';
const YELLOW = 'rgb(220, 230, 81)';
const GREY = '#cfcfcf';
const LIGHT_BLUE = '#84FFFF';
const PINK = '#FF80AB';
const COLORS = [RED, PURPLE, BLUE, GREEN, YELLOW, GREY, LIGHT_BLUE, PINK];

const SHADOW_BLACK = '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)';
const SHADOW_GREEN = '0px 0px 16px 2px rgba(94,204,106,1)';
const PATH_COLOR = 'rgb(243, 213, 243)';

const PINK_BUTTON = 'rgb(243, 213, 243)';
const TRANSPARENT = 'transparent';
const NONE = 'none';

const DATA_X = 'data-x';
const DATA_Y = 'data-y';
const DATA_IS_BALL = 'data-isBall';
const DATA_VALUE = 'data-value';
const DATA_BEST_SCORE = 'bestScore';

const ZERO = 'zero';

const NEW_GAME_BUTTS = document.querySelectorAll('.button');
const BOARD = document.getElementById('board');
const POINTS = document.getElementById('points');
const GRAY_BACKGROUND = document.getElementById('gray');
const WINDOW_END_GAME = document.getElementById('restart');
const ALL_POINTS = document.getElementById('allPoints');
const BEST_SCORE = document.querySelectorAll('.bestScore');

const CELLS = [];
const NEXT_BALLS_COLOR = [PINK_BUTTON,PINK_BUTTON,PINK_BUTTON];

const EVENT = {
    CLICK: 'click',
    MOUSEDOWN: 'mousedown',
    MOUSEUP: 'mouseup',
}

let _points = 0;
let _startX;
let _startY;
let _endX;
let _endY;
let _startCell;
let _endCell;
let _addBallsInterval;
let _addNextBallsInterval;
let _times;
let _bestScore = 0;

getBestScore();
createBoard();

NEW_GAME_BUTTS.forEach(NEW_GAME_BUTT => {
    NEW_GAME_BUTT.addEventListener(EVENT.MOUSEDOWN, buttonClick);
    NEW_GAME_BUTT.addEventListener(EVENT.MOUSEUP,buttonUnclick);
    NEW_GAME_BUTT.addEventListener(EVENT.CLICK, newGame);
});

function getBestScore(){
    const storedScore = localStorage.getItem(DATA_BEST_SCORE);
    if(storedScore) _bestScore = storedScore;
    BEST_SCORE.forEach(best => {
        console.log('to');
        best.innerHTML = _bestScore;
    });

}

function createBoard(){
    //stworzenie pól
    for(let i=0; i<81; i++){
        CELLS[i] = document.createElement('div');
        CELLS[i].className='cell';
        BOARD.appendChild(CELLS[i]);
    }
    //nadanie polom wartości x i y
    for(let i=0, x=1, y=1; i<81; i++, x++){
        CELLS[i].setAttribute(DATA_X,x);
        CELLS[i].setAttribute(DATA_Y,y);
        if(x==9){
            x=0;
            y++;
        }
    }
}

function buttonClick(e){
    e.target.style.backgroundColor=PINK_BUTTON;
}

function buttonUnclick(e){
    e.target.style.backgroundColor=TRANSPARENT;
}

function getCellByParametrs(x, y){
    return document.querySelector('[data-x="'+x+'"][data-y="'+y+'"]');
}

function newGame(){
    _POINTS=0;
    POINTS.innerHTML=_POINTS;
    GRAY_BACKGROUND.style.display=NONE;
    WINDOW_END_GAME.style.display=NONE;
    start();
}

function resetBoard(){
    const balls = document.querySelectorAll('.ball');
    balls.forEach(ball => {
        ball.remove();
    })
    CELLS.forEach(cell => {
        cell.setAttribute(DATA_IS_BALL, 0);
        cell.setAttribute(DATA_VALUE, ZERO);
        cell.style.boxShadow=SHADOW_BLACK;

    });
}

function addBallsStart(){
    _times++;
    let isBall=0;
    let x, y;
    do{
        x = Math.floor(Math.random() * 9) + 1;
        y = Math.floor(Math.random() * 9) + 1;
        const cell = getCellByParametrs(x,y);
        isBall = cell.getAttribute(DATA_IS_BALL);
    }while(isBall=='1');
    let color = Math.floor(Math.random()*7);
    color = COLORS[color];
    const ball = document.createElement('div');
    ball.className='ball';
    ball.style.backgroundColor = color;
    const cell = getCellByParametrs(x,y);
    cell.setAttribute(DATA_IS_BALL,'1');
    cell.addEventListener(EVENT.CLICK, getStartParametrs);
    cell.appendChild(ball);

    if (_times === 5) {
        clearInterval(addBallsInterval);
    }
}

function setRandomNextColors(){
    let nr;
    NEXT_BALLS_COLOR.forEach((nextBall,index) => {
        nr = Math.floor(Math.random()*7);
        NEXT_BALLS_COLOR.splice(index,1,COLORS[nr]);
        document.getElementById('nextBall'+index).style.backgroundColor = COLORS[nr];
    });
}

function getStartParametrs(e){
    CELLS.forEach(cell => {
        cell.style.boxShadow = SHADOW_BLACK;
        cell.removeEventListener(EVENT.CLICK, getEndParametrs);
    });

    const ball = e.target;
    _startCell = ball.parentElement;

    if(_startCell.id!='board'){
        _startCell.style.boxShadow = SHADOW_GREEN;
        _startX = _startCell.getAttribute(DATA_X);
        _startY = _startCell.getAttribute(DATA_Y);

        CELLS.forEach(cellEnd => {
            const isBall = cellEnd.getAttribute(DATA_IS_BALL);
            if(isBall=='0') {
                cellEnd.addEventListener(EVENT.CLICK,getEndParametrs);
            }

        });
    }
    
}

function getEndParametrs(e){
    const cell = e.target;

    _endX = cell.getAttribute(DATA_X);
    _endY = cell.getAttribute(DATA_Y);
    checkPath();
}

function checkPath(){
    if(ifStartNextToEndBall()){
        moveBall();
        addPoints();
    }
    else{
        findWayFromEnd();
        if(findTheShortestWay()){
            moveBall();
            addPoints();
        }
        deleteValuesOfCells();
    }
    
}

function addPoints(){
    CELLS.forEach(cell => {
        cell.removeEventListener(EVENT.CLICK, getEndParametrs);
    });
    let points  = deleteOver5();
    if(points!=false){
        _points+=points;
        document.getElementById('points').innerHTML=_points;
    }
    else{
        
        _times = 0;
        _addNextBallsInterval = setInterval(addNextBalls, 300);
        points = deleteOver5();
        if(points!=false){
            POINTS+=points;
            document.getElementById('points').innerHTML=POINTS;
        }
        setTimeout(setRandomNextColors, 1000);
    }    
    if(countOfFullCells()>=77) gameOver();
}

function ifStartNextToEndBall(){
    const toRight = parseInt(_startX)+1;
    const toLeft = parseInt(_startX)-1;
    const toDown = parseInt(_startY)+1;
    const toUp = parseInt(_startY)-1;
    //right
    if(toRight<=9){
        if(toRight==_endX && _startY==_endY) return true;
    }
    //left
    if(toLeft>=1){
        if(toLeft==_endX && _startY==_endY) return true;
    }
    //down
    if(toDown<=9){
        if(_startX==_endX && toDown==_endY) return true;
    }
    //up
    if(toUp>=1){
        if(_startX==_endX && toUp==_endY) return true;
    }
    return false;
}

function findWayFromEnd(){
    
    let pom;
    let value = 0;
    _endCell = getCellByParametrs(_endX,_endY);
    _endCell.setAttribute(DATA_VALUE,value);
    for(;;){
        pom = false;
        for(let i=0; i<81; i++){
            const isBallStart = CELLS[i].getAttribute(DATA_IS_BALL);
            const valueStart = CELLS[i].getAttribute(DATA_VALUE);
            const x = CELLS[i].getAttribute(DATA_X);
            const y = CELLS[i].getAttribute(DATA_Y);

            if(isBallStart=='0' && valueStart==value){
                const toRight = parseInt(x)+1;
                const toLeft = parseInt(x)-1;
                const toDown = parseInt(y)+1;
                const toUp = parseInt(y)-1;
                //right
                if(toRight<=9){
                    const cellRight = getCellByParametrs(toRight,y);
                    const isBallRight = cellRight.getAttribute(DATA_IS_BALL);
                    const isValueRight = cellRight.getAttribute(DATA_VALUE);
                    if(isBallRight=='0'&& isValueRight ==ZERO)
                    {
                        cellRight.setAttribute(DATA_VALUE, value+1);
                        //cellRight.innerHTML = value+1;
                        pom=true;
                    }
                }
                //left
                if(toLeft>=1){
                    const cellLeft = getCellByParametrs(toLeft,y);
                    const isBallLeft = cellLeft.getAttribute(DATA_IS_BALL);
                    const isValueLeft = cellLeft.getAttribute(DATA_VALUE);
                    if(isBallLeft=='0'&& isValueLeft ==ZERO)
                    {
                        cellLeft.setAttribute(DATA_VALUE, value+1);
                        //cellLeft.innerHTML = value+1;
                        pom = true;
                    }
                }
                //down
                if(toDown<=9){
                    const cellDown = getCellByParametrs(x,toDown);
                    const isBallDown = cellDown.getAttribute(DATA_IS_BALL);
                    const isValueDown = cellDown.getAttribute(DATA_VALUE);
                    if(isBallDown=='0'&& isValueDown ==ZERO)
                    {
                        cellDown.setAttribute(DATA_VALUE, value+1);
                        //cellDown.innerHTML = value+1;
                        pom = true;
                    }
                }
                //up
                if(toUp>=1){
                    const cellUp = getCellByParametrs(x,toUp);
                    const isBallUp = cellUp.getAttribute(DATA_IS_BALL);
                    const isValueUp = cellUp.getAttribute(DATA_VALUE);
                    if(isBallUp=='0'&& isValueUp ==ZERO)
                    {
                        cellUp.setAttribute(DATA_VALUE, value+1);
                        //cellUp.innerHTML = value+1;
                        pom = true;
                    }
                }
            } 
        }
        value++;
        if(pom==false) break;
    }
}

function findTheShortestWay(){
    let valueStart=81;
    let value;
    let x;
    let y;
    let disable = 0;

    //znajdywanie najmniejszej liczby wokół 
    const toRight = parseInt(_startX)+1;
    const toLeft = parseInt(_startX)-1;
    const toDown = parseInt(_startY)+1;
    const toUp = parseInt(_startY)-1;
    //right
    if(toRight<=9){
        const cellRight = getCellByParametrs(toRight,_startY);
        value = cellRight.getAttribute(DATA_VALUE);
        if(value!='zero'){
            value = parseInt(value);
            if(value<valueStart){
                valueStart = value;
                x = toRight;
                y = _startY;
            }
        }
        else disable++;
    }
    else disable++;
    //left
    if(toLeft>=1){
        const cellLeft = getCellByParametrs(toLeft,_startY);
        value = cellLeft.getAttribute(DATA_VALUE);
        if(value!='zero'){
            value = parseInt(value);
            if(value<valueStart){
                valueStart = value;
                x = toLeft;
                y = _startY;
            }
        }
        else disable++;
    }
    else disable++;
    //down
    if(toDown<=9){
        const cellDown = getCellByParametrs(_startX,toDown);
        value = cellDown.getAttribute(DATA_VALUE);
        if(value!='zero'){
            value = parseInt(value);
            if(value<valueStart){
                valueStart = value;
                x =  _startX;
                y = toDown;
            }
        }
        else disable++;
    }
    else disable++;
    //up
    if(toUp>=1){
        
        const cellUp = getCellByParametrs(_startX,toUp);
        value = cellUp.getAttribute(DATA_VALUE);
        if(value!='zero'){
            value = parseInt(value);
            if(value<valueStart){
                valueStart = value;
                x =  _startX;
                y = toUp;
            }
        }
        else disable++;    
    }
    else disable++;

    if(disable==4) return false
    //rysowanie sciezki
    const cellStart = getCellByParametrs(_startX,_startY);
    const cellNext = getCellByParametrs(x,y);
    cellStart.style.backgroundColor = PATH_COLOR;
    cellNext.style.backgroundColor = PATH_COLOR;

    let valueNext=valueStart;
    let valuePom;
    let pomX;
    let pomY;

    for(i=0; i<valueStart; i++){
        const toRight = parseInt(x)+1;
        const toLeft = parseInt(x)-1;
        const toDown = parseInt(y)+1;
        const toUp = parseInt(y)-1;
        //right
        if(toRight<=9){
            const cellRight = getCellByParametrs(toRight,y);
            value = cellRight.getAttribute(DATA_VALUE);
            if(parseInt(value)+1==valueNext){
                pomX = toRight;
                pomY=y;
                valuePom=value;
            }
        }
        //left
        if(toLeft>=1){
            const cellLeft = getCellByParametrs(toLeft,y);
            value = cellLeft.getAttribute(DATA_VALUE);
            if(parseInt(value)+1==valueNext){
                pomX = toLeft;
                pomY=y;
                valuePom=value;
            }
        }
        //down
        if(toDown<=9){
            const cellDown = getCellByParametrs(x,toDown);
            value = cellDown.getAttribute(DATA_VALUE);
            if(parseInt(value)+1==valueNext){ 
                pomX = x;
                pomY=toDown;
                valuePom=value;
            }
        }
        //up
        if(toUp>=1){     
            const cellUp = getCellByParametrs(x,toUp);
            value = cellUp.getAttribute(DATA_VALUE);
            if(parseInt(value)+1==valueNext){
                pomX = x;
                pomY=toUp;
                valuePom=value;
            }
        }
        if(pomX!=undefined && pomY!=undefined){
            const cellNext = getCellByParametrs(pomX,pomY);
            cellNext.style.backgroundColor=PATH_COLOR;
            x=pomX;
            y=pomY;
            valueNext = valuePom;
        }
    }
    return valueStart;
}

function deleteValuesOfCells(){
    CELLS.forEach(cell => {
        cell.setAttribute(DATA_VALUE,ZERO);
    });
}

function moveBall(){
    setTimeout(deletePath, 600);

    function deletePath(){
        CELLS.forEach(cell => {
            const isPath = cell.style.backgroundColor;
            if(isPath==PATH_COLOR) cell.style.animationName = 'pathDisappear';
        });
    }

    CELLS.forEach(cell => {
        cell.style.boxShadow = SHADOW_BLACK;
    });

    const cellStart = getCellByParametrs(_startX, _startY);
    cellStart.removeEventListener(EVENT.CLICK, getStartParametrs);
    const ballStart = cellStart.querySelector('.ball');
    cellStart.setAttribute(DATA_IS_BALL,'0');

    const cellEnd = getCellByParametrs(_endX, _endY);
    cellEnd.setAttribute(DATA_IS_BALL,'1');
    cellEnd.appendChild(ballStart);
    cellEnd.addEventListener(EVENT.CLICK, getStartParametrs);
}

function deleteOver5(){
    let allPoints = 0;
    let points = 0;
    CELLS.forEach(cell => {
        const isBall = cell.getAttribute(DATA_IS_BALL);
        if(isBall == 1){
            const colorStart = cell.querySelector('.ball').style.backgroundColor;
            const startX = cell.getAttribute(DATA_X);
            const startY = cell.getAttribute(DATA_Y);
            points = vertical(colorStart, startX,startY);
            if(points!=false)allPoints+=points;
            points = horizontal(colorStart, startX,startY);
            if(points!=false)allPoints+=points;
            points = crossRight(colorStart, startX,startY);
            if(points!=false)allPoints+=points;
            points = crossLeft(colorStart, startX,startY);
            if(points!=false)allPoints+=points;
        }
    });
    if(allPoints>0) return allPoints;
    else return false;
}

function vertical(colorStart, startX, startY){
    let points = 0;
    startX = parseInt(startX);
    startY = parseInt(startY);
    if(startY+4<=9){
        let y = startY;
        let x = startX;
        for(y; y<=9; y++){
            const cell = getCellByParametrs(x,y);
            const isBall = cell.getAttribute(DATA_IS_BALL);
            if(isBall=='1'){
                const color = cell.querySelector('.ball').style.backgroundColor;
                if(colorStart != color) break;
                points++;
            }
            else break;
        }
        if(points>=5){
            deleteVertical(startX, startY, points);
            return points;
        }
        else return false;
    }
    else return false;
}

function deleteVertical(startX, startY, points){
    for(let i=0, x=startX, y=startY; i<points; i++, y++){
        const cell = getCellByParametrs(x,y);
        cell.setAttribute(DATA_IS_BALL,'0');
        cell.removeEventListener(EVENT.CLICK, getStartParametrs);
        const ball = cell.querySelector('.ball');
        ball.style.animationName='ballDisappear';
        setTimeout(()=> {ball.remove()},5000);
    }
}

function horizontal(colorStart, startX, startY){
    let points = 0;
    startX = parseInt(startX);
    startY = parseInt(startY);
    if(startX+4<=9){
        let y = startY;
        let x = startX;
        for(x; x<=9; x++){
            const cell = getCellByParametrs(x,y);
            const isBall = cell.getAttribute(DATA_IS_BALL);
            if(isBall=='1'){
                const color = cell.querySelector('.ball').style.backgroundColor;
                if(colorStart != color) break;
                points++;
            }
            else break;
        }
        if(points>=5){
            deleteHorizontal(startX, startY, points);
            return points;
        }
        else return false;
    }
    else return false;
}

function deleteHorizontal(startX, startY, points){
    for(let i=0, x=startX, y=startY; i<points; i++, x++){
        const cell = getCellByParametrs(x,y);
        const ball = cell.querySelector('.ball');
        cell.setAttribute(DATA_IS_BALL,'0');
        cell.removeEventListener(EVENT.CLICK, getStartParametrs);
        ball.style.animationName='ballDisappear'
        setTimeout(()=> {ball.remove()},5000);
    }
}

function crossRight(colorStart, startX, startY){
    let points = 0;
    startX = parseInt(startX);
    startY = parseInt(startY);
    if(startY+4<=9 && startX+4<=9){
        let y = startY;
        let x = startX;
        for(y,x; y<=9 && x<=9; y++, x++){
            const cell = getCellByParametrs(x,y);
            const isBall = cell.getAttribute(DATA_IS_BALL);
            if(isBall=='1'){
                const color = cell.querySelector('.ball').style.backgroundColor;
                if(colorStart != color) break;
                points++;
            }
            else break;
        }
        if(points>=5){
            deleteCrossRight(startX, startY, points);
            return points;
        }
        else return false;
    }
    else return false;
}

function deleteCrossRight(startX, startY, points){
    for(let i=0, x=startX, y=startY; i<points; i++, y++, x++){
        const cell = getCellByParametrs(x,y);
        const ball = cell.querySelector('.ball');
        cell.setAttribute(DATA_IS_BALL,'0');
        cell.removeEventListener(EVENT.CLICK, getStartParametrs);
        ball.style.animationName='ballDisappear'
        setTimeout(()=> {ball.remove()},5000);
    }
}

function crossLeft(colorStart, startX, startY){
    let points = 0;
    startX = parseInt(startX);
    startY = parseInt(startY);
    if(startY+4<=9 && startX-4>=1){
        let y = startY;
        let x = startX;
        for(y,x; y<=9 && x>=1; y++, x--){
            const cell = getCellByParametrs(x,y);
            const isBall = cell.getAttribute(DATA_IS_BALL);
            if(isBall=='1'){
                const color = cell.querySelector('.ball').style.backgroundColor;
                if(colorStart != color) break;
                points++;
            }
            else break;
        }
        if(points>=5){
            deleteCrossLeft(startX, startY, points);
            return points;
        }
        else return false;
    }
    else return false;
}

function deleteCrossLeft(startX, startY, points){
    for(let i=0, x=startX, y=startY; i<points; i++, y++, x--){
        const cell = getCellByParametrs(x,y);
        const ball = cell.querySelector('.ball');
        cell.setAttribute(DATA_IS_BALL,'0');
        cell.removeEventListener(EVENT.CLICK, getStartParametrs);
        ball.style.animationName='ballDisappear'
        setTimeout(()=> {ball.remove()},5000);
    }
}

function countOfFullCells(){
    let countOfFullCells = 0;
        
    CELLS.forEach(cell => {
        const isBall = cell.getAttribute(DATA_IS_BALL);
        if(isBall=='1')countOfFullCells++;
    });
    return countOfFullCells;
}

function gameOver(){
    GRAY_BACKGROUND.style.display='flex';
    WINDOW_END_GAME.style.display='flex';
    
    if(parseInt(_bestScore)<_points){
        localStorage.setItem(DATA_BEST_SCORE, _points.toString());
    }
    getBestScore();

    ALL_POINTS.innerHTML=_points;
}

function addNextBalls(){
    _times++;
    let x;
    let y;
    let isBall=0;
    do{
        x = Math.floor(Math.random() * 9) + 1;
        y = Math.floor(Math.random() * 9) + 1;
        const c = getCellByParametrs(x,y);
        isBall = c.getAttribute(DATA_IS_BALL);
    }while(isBall==1);

    const ball = document.createElement('div');
    ball.className='ball';
    ball.style.backgroundColor = NEXT_BALLS_COLOR[_times-1];
    const cell = getCellByParametrs(x,y)
    cell.addEventListener(EVENT.CLICK, getStartParametrs);
    cell.setAttribute(DATA_IS_BALL,'1');
    cell.appendChild(ball);
    if (_times === 3) {
        clearInterval(_addNextBallsInterval);
    }
}

function start(){
    resetBoard();
    _times = 0;
    addBallsInterval = setInterval(addBallsStart, 300);
    setRandomNextColors();
}

start();