const SEGMENT = [
    [1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 0, 1],
    [1, 1, 1, 1, 0, 0, 1],
    [0, 1, 1, 0, 0, 1, 1],
    [1, 0, 1, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 0, 1],
];
const COORDINATE = [
    [50, 20, 100, 30],
    [150, 50, 30, 100],
    [150, 180, 30, 100],
    [50, 280, 100, 30],
    [20, 180, 30, 100],
    [20, 50, 30, 100],
    [50, 150, 100, 30]
];


const playAudio = () => {
    const sound0Div = document.getElementById('sound0');
    const sound1Div = document.getElementById('sound1');

    sound0Div.addEventListener('click', () => {
        const piSound = new Audio('./sound/pi.mp3');
        piSound.currentTime = 0;
        piSound.play();
    });
    sound1Div.addEventListener('click', () => {
        const index = Math.floor(Math.random() * 11);
        const decideSound = new Audio(`./sound/decide/${index}.mp3`);
        decideSound.play();
    });
};


const displaySegmentNumber = (tenth, ones, isFinished, color) => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const tenthPattern = SEGMENT[tenth];
    const onesPattern = SEGMENT[ones];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (isFinished) {
        ctx.fillStyle = color;
        ctx.fillRect(380, 300, 20, 20);
    } else {
        ctx.fillStyle = '#252525';
        ctx.fillRect(380, 300, 20, 20);
    };

    tenthPattern.forEach((isLighting, index) => {
        ctx.fillStyle = isLighting ? color : '#252525';
        ctx.fillRect(...COORDINATE[index]);
    });
    onesPattern.forEach((isLighting, index) => {
        ctx.fillStyle = isLighting ? color : '#252525';
        const startX = COORDINATE[index][0] + 200;
        ctx.fillRect(startX, ...COORDINATE[index].slice(1));
    });

};

const displayAlreadyPublished = (result) => {
    const unitList = document.getElementById('display-rest').children;
    const unitNumber = Math.floor((result - 1) / 15);
    const numberList = unitList[unitNumber].children;
    const number = (result - 1) % 15;
    const numberNode = numberList[number];
    numberNode.style.backgroundColor = '#00000000';
    numberNode.children[0].textContent = result;
};

const divided = (result) => {
    const tenth = Math.floor(result / 10);
    const ones = result % 10;
    return { tenth, ones };
};


const calculateShakeTimes = (sequence) => {
    return sequence.getAmount() > 1 ? Math.floor(Math.random() * 40) + 40 : 0;
};

const calculateSlowDown = (shakeTimes) => {
    return Math.floor(shakeTimes * (Math.floor(Math.random() * 6) + 3) / 10);
};

const createShakeInterval = (result, remaining, sequence, eventManager, shakeTimes, slowDown) => {
    let count = 0;
    let slowPace = 2;
    let slowDownCount = 0;

    const intervalCallback = () => {
        const random = divided(remaining[Math.floor(Math.random() * remaining.length)].number);

        if (count < slowDown || slowDownCount % slowPace === 0) {
            playSound('sound0');
            displaySegmentNumber(random.tenth, random.ones, false, '#ffffff');
            if (count >= slowDown) {
                slowPace += 2;
                slowDownCount = 0;
            };
        };

        if (count > shakeTimes) {
            clearInterval(timer);
            setTimeout(() => {
                playSound('sound1');
                displayFinalNumber(result, sequence);
                eventManager.addEvent();
                const mouse = new MouseEventManager();
                mouse.addEvent();
            }, 1000);
        };
        if (count >= slowDown) slowDownCount++;
        count++;
    };

    const timer = setInterval(intervalCallback, 100);
};

const playSound = (soundId) => {
    const div = document.getElementById(soundId);
    div.click();
};

const displayFinalNumber = (result, sequence) => {
    const hsl = `hsl(${Math.floor(Math.random() * 240) - 60}, 100%, 50%)`;
    displaySegmentNumber(divided(result).tenth, divided(result).ones, true, hsl);
    sequence.select(result);
    displayAlreadyPublished(result);
};

const shake = (result, remaining, sequence, eventManager) => {
    const shakeTimes = calculateShakeTimes(sequence);
    const slowDown = calculateSlowDown(shakeTimes);
    createShakeInterval(result, remaining, sequence, eventManager, shakeTimes, slowDown);
};


const roll = (sequence, eventManager) => {
    document.body.style.cursor = 'none';
    if (sequence.getAmount() === 0) {
        displaySegmentNumber(10, 11, true, '#ffffff');
        return;
    };
    const numbers = sequence.getSequence();
    const remaining = numbers.filter(unit => !unit.isSelected);
    const result = remaining[Math.floor(Math.random() * remaining.length)].number;
    shake(result, remaining, sequence, eventManager);
};


const addEvent = (sequence) => {
    const manager = new KeyEventManager(sequence);
    manager.addEvent();
};

class KeyEventManager {
    constructor(sequence) {
        this.sequence = sequence;
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.clickedElement = document.getElementById('main');
    };

    handleKeyDown(event) {
        if (event.key === ' ' || event.key === 'Enter') {
            roll(this.sequence, this);
            this.removeEvent();
        };
    };

    handleClick() {
        roll(this.sequence, this);
        this.removeEvent();
    };

    addEvent() {
        document.addEventListener('keydown', this.handleKeyDown);
        this.clickedElement.addEventListener('click', this.handleClick);
    };

    removeEvent() {
        document.removeEventListener('keydown', this.handleKeyDown);
        this.clickedElement.removeEventListener('click', this.handleClick);
    };
};


class MouseEventManager {
    constructor() {
        this.handleMouseMove = this.handleMouseMove.bind(this);
    };

    handleMouseMove() {
        document.body.style.cursor = 'default';
        this.removeEvent();
    };

    addEvent() {
        document.addEventListener('mousemove', this.handleMouseMove);
    };

    removeEvent() {
        document.removeEventListener('mousemove', this.handleMouseMove);
    };
};


class RestNumber {
    length = 75;

    restList = Array(this.length).fill(0).map((_, i) => ({
        number: i + 1,
        isSelected: false
    }));

    amount = this.length;

    select(number) {
        this.restList[number - 1].isSelected = true;
        this.amount--;
    };

    getSequence() {
        return this.restList;
    };

    getAmount() {
        return this.amount;
    };
};


const createElements = (parent, type, className, id, text) => {
    const element = document.createElement(type);
    element.classList.add(className);
    element.id = id;
    element.textContent = text;
    parent.appendChild(element);
    return element;
};

const initialNumberDOMCreate = () => {
    const parent = document.getElementById('display-rest');
    for (let i = 0; i < 5; i++) {
        const unit = createElements(parent, 'div', 'unit', 'unit');
        for (let j = 0; j < 15; j++) {
            const box = createElements(unit, 'div', 'a', 'a');
            createElements(box, 'h1', 'a', 'a', '　');
        };
    };
};


const switchFullScreen = (event) => {
    if (event.key === "f" || event.type === "click") {
        if (checkFullScreen()) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            };
        } else {
            if (document.body.requestFullscreen) {
                document.body.requestFullscreen();
            } else if (document.body.mozRequestFullScreen) {
                document.body.mozRequestFullScreen();
            } else if (document.body.webkitRequestFullscreen) {
                document.body.webkitRequestFullscreen();
            } else if (document.body.msRequestFullscreen) {
                document.body.msRequestFullscreen();
            };
        };
    };
};

const checkFullScreen = () => document.fullscreenElement || document.mozFullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;


window.addEventListener('DOMContentLoaded', () => {
    initialNumberDOMCreate();
    displaySegmentNumber(8, 8, true, '#ffffff');
    const numberKeep = new RestNumber();
    addEvent(numberKeep);
    playAudio();
    new MouseEventManager().addEvent();

    document.addEventListener('keydown', switchFullScreen);
    document.getElementById('fullScreen').addEventListener('click', switchFullScreen);
});