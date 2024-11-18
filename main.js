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


const audioPlay = () => {
    const div0 = document.getElementById('sound0');
    const div1 = document.getElementById('sound1');

    div0.addEventListener('click', () => {
        const se = new Audio('./sound/pi.mp3');
        se.currentTime = 0;
        se.play();
    });
    div1.addEventListener('click', () => {
        const index = Math.floor(Math.random() * 11);
        const se = new Audio(`./sound/./decide/${index}.mp3`);
        se.currentTime = 0;
        se.play();
    });
};


const displaySegmentNumber = (tenth, ones, isFinished, color) => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const tenthPattern = SEGMENT[tenth];
    const onesPattern = SEGMENT[ones];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    tenthPattern.forEach((isLighting, index) => {
        ctx.fillStyle = isLighting ? color : '#252525';
        ctx.fillRect(...COORDINATE[index]);
    });
    onesPattern.forEach((isLighting, index) => {
        ctx.fillStyle = isLighting ? color : '#252525';
        const startX = COORDINATE[index][0] + 200;
        ctx.fillRect(startX, ...COORDINATE[index].slice(1));
    });

    if (isFinished) ctx.fillRect(380, 300, 20, 20);
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


const shake = (result, remaining, sequence, eventManager) => {
    const shakeTimes = sequence.getAmount() > 1 ? Math.floor(Math.random() * 40) + 40 : 0;
    const slowDown = Math.floor(shakeTimes * (Math.floor(Math.random() * 6) + 3) / 10);
    const dividedResult = divided(result);
    let count = 0, slowPace = 2, slowDownCount = 0;

    const round = setInterval(() => {
        const random = divided(remaining[Math.floor(Math.random() * remaining.length)].number);

        if (count < slowDown || slowDownCount % slowPace === 0) {
            const div = document.getElementById('sound0');
            div.click();
            displaySegmentNumber(random.tenth, random.ones, false, '#ffffff');
            if (count >= slowDown) {
                slowPace += 2;
                slowDownCount = 0;
            };
        };

        if (count > shakeTimes) {
            clearInterval(round);
            setTimeout(() => {
                const div = document.getElementById('sound1');
                div.click();
                const hsl = `hsl(${Math.floor(Math.random() * 240) - 60}, 100%, 50%)`;
                displaySegmentNumber(dividedResult.tenth, dividedResult.ones, true, hsl);
                sequence.select(result);
                displayAlreadyPublished(result);
                eventManager.addEvent();
                const mouse = new MouseManager();
                mouse.addEvent();
            }, 1000);
        };
        if (count >= slowDown) slowDownCount++;
        count++;
    }, 100);
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
    const manager = new EventManager(sequence);
    manager.addEvent();
};

class EventManager {
    constructor(sequence) {
        this.sequence = sequence;
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleClick = this.handleClick.bind(this);
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
        window.addEventListener('click', this.handleClick);
    };

    removeEvent() {
        document.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('click', this.handleClick);
    };
};


class MouseManager {
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


window.addEventListener('DOMContentLoaded', () => {
    initialNumberDOMCreate();
    displaySegmentNumber(8, 8, true, '#ffffff');
    const numberKeep = new RestNumber();
    addEvent(numberKeep);
    audioPlay();
    new MouseManager().addEvent();
});