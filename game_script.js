class Card {
    constructor(name) {
        this.name = name;
    }

    createHtmlCard(patternClass){
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.name = this.name;

        const front = document.createElement("div");
        front.classList.add("front");
        front.classList.add(patternClass);

        const back = document.createElement("div");
        back.classList.add("back");
        back.classList.add(this.name);

        card.appendChild(front);
        card.appendChild(back);
        return card;
    }
}

class CardsList {
    constructor(count){
        this.allowsCards = ["cat", "rabbit", "wolf", "dog", "ladybug", "bull", "butterfly",
            "bird", "owl", "whale", "horse", "unicorn"];
        let list = [];
        for (let i = 0; i < count / 2; i++){
            list.push(new Card(this.allowsCards[i]));
        }
        this.cardsList = list.concat(list);

        let shuffle = (arr) => {
            arr.sort(() => 0.5 - Math.random());
        };

        shuffle(this.cardsList);
    }

    showCardsList(playground, patternClass){
        this.cardsList.forEach(item => {
            playground.appendChild(item.createHtmlCard(patternClass));
        });
    }
}

class Timer {
    constructor(timer) {
        this.seconds = 0;
        this.timer = timer;
        this.isStarted = false;
    }

    startTimer(){
        this.isStarted = true;
        this.intervalID = setInterval((timerObj) => {
            timerObj.seconds++;
            timerObj.timer.innerHTML = timerObj.seconds + "sec";
        }, 1000, this);
    }

    stopTimer(){
        this.isStarted = false;
        clearInterval(this.intervalID);
        return this.seconds;
    }
}

class Guess{
    constructor(level, userInfo, timerHTML){
        this.timer = new Timer(timerHTML);
        timerHTML.innerHTML = "0sec";
        this.level = level;
        this.match = 0;
        this.guessArr = [];
        this.userInfo = userInfo;
    }

    addOpenCard(card){
        if (!this.timer.isStarted){
            this.timer.startTimer();
        }
        if (!card.parentNode.classList.contains("match") && this.guessArr.indexOf(card) === -1 && this.guessArr.length < 2){
            this.guessArr.push(card);
            return true;
        } else {
            return false;
        }
    }

    matchCards(){
        if (this.guessArr[0].parentNode.dataset.name === this.guessArr[1].parentNode.dataset.name){
            this.guessArr.forEach((card) => {
                card.parentNode.classList.add("match");
            });
            this.match += 2;
            if (this.level - this.match === 2){
                let cards = document.getElementsByClassName("front");
                this.userInfo.seconds = this.timer.stopTimer();
                for (let i = 0; i < cards.length; i++){
                    if (!cards[i].parentNode.classList.contains("match")) {
                        cards[i].parentNode.classList.add("open");
                    }
                }
                this.resetGuesses();
                return true;
            }
        }
        this.resetGuesses();
        return false;
    }

    resetGuesses(){
        this.guessArr.forEach((card) => {
            card.parentNode.classList.remove("open");
        });
        this.guessArr.length = 0;
    }
}

class UserInfo {
    constructor(name, email){
        this.name = name;
        this.email = email;
        this.seconds = 0;
    }
}

class RecordTable{
    constructor(level){
        this.recordlist = JSON.parse(localStorage.getItem(level));
        this.level = level;
        if (this.recordlist == null){
            this.recordlist = new Array(10);
        }
    }

    addUser(userInfo){
        this.recordlist.push(userInfo);
        this.recordlist.sort((a, b) => {
            if (a === null){
                return 1;
            }
            if (b === null) {
                return -1;
            }
            return a.seconds - b.seconds;
        });
        this.recordlist.splice(10,1);
        localStorage.setItem(this.level, JSON.stringify(this.recordlist));
    }
}

function showCongratulate(level, userInfo) {
    document.getElementById("congratulation").classList.add("visible");
    document.getElementById("time").innerText = userInfo.seconds + " seconds";
    document.getElementById("levelCongrat").innerText = level + " cards";

    let recordTable = new RecordTable(level);
    recordTable.addUser(userInfo);

    showRecordTable(recordTable);
}

function showRecordTable(recordTable) {
    let records = document.getElementById("records");
    records.innerHTML = "";

    recordTable.recordlist.forEach((item, index) => {
        const record = document.createElement("p");
        if (item === null){
            record.innerText = (index + 1) + ". noname - sec";
        } else {
            record.innerText = (index + 1) + ". " + item.name + " " + item.seconds + " sec";
        }
        records.appendChild(record);
    })
}

function startGame(level, userInfo, patternClass) {
    const game = document.getElementById("game");
    game.innerHTML = "";

    const playground = document.createElement("section");
    playground.setAttribute("class", "playground");

    game.appendChild(playground);

    let cardsList = new CardsList(level);
    cardsList.showCardsList(playground, patternClass);

    let guess = new Guess(level, userInfo, document.getElementById("timer"));
    let delay = 1500;

    playground.addEventListener("click", (event) => {
        let clicked = event.target;

        if (clicked.nodeName === "SECTION" || clicked.parentNode.classList.contains("open")) { return; }

        if (guess.addOpenCard(event.target)) {
            clicked.parentNode.classList.add("open");

            if (guess.guessArr.length === 2){
                setTimeout((item) => {
                    if (item.matchCards()){
                        setTimeout(showCongratulate, 2000, item.level, item.userInfo);
                    }
                }, delay, guess);
            }
        }
    });
}

let selectedPattern = document.querySelector(".selected");
const patternsCards = document.querySelectorAll(".card");

patternsCards.forEach((item) => {
   item.addEventListener("click", (event) => {
       let clicked = event.target;
       clicked.classList.add("selected");
       selectedPattern.classList.remove("selected");
       selectedPattern = clicked;
   });
});

const startBtn = document.getElementById("start");

startBtn.addEventListener("click", (event) => {
    const infoForm = document.forms["info"];

    if (infoForm["name"].classList.contains("right") && infoForm["email"].classList.contains("right")) {
        let error = document.getElementById("error");
        error.classList.remove("visible");

        let userInfo = new UserInfo(infoForm["name"].value, infoForm["email"].value);

        const selectedPattern = document.querySelector(".selected");
        const patternClass = selectedPattern.id;

        const levelForm = document.forms["level"];
        let level = 0;

        for (let i = 0; i < levelForm.length; i++) {
            if (levelForm[i].checked) {
                level = levelForm[i].value;
                break;
            }
        }

        startGame(level, userInfo, patternClass);
        document.getElementById("welcome").classList.remove("visible");
    } else {
        let error = document.getElementById("error");
        error.classList.add("visible");
    }
});

const againBtn = document.getElementById("again");

againBtn.addEventListener("click", (event) => {
    document.getElementById("congratulation").classList.remove("visible");
    document.getElementById("welcome").classList.add("visible");
});

const infoForm = document.forms["info"];

infoForm["name"].addEventListener("blur", (event) => {
    let input = event.target;
    input.classList.remove("wrong");
    input.classList.remove("right");

    if (input.value == ""){
        input.classList.add("wrong");
    } else {
        input.classList.add("right");
    }
});

infoForm["email"].addEventListener("blur", (event) => {
    let input = event.target;
    input.classList.remove("wrong");
    input.classList.remove("right");

    let regexp = /^[a-z.0-9]+@[a-z0-9]+[.][a-z]{2,}$/i;
    if (regexp.test(input.value)){
        input.classList.add("right");
    } else {
        input.classList.add("wrong");
    }
});