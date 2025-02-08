import { _decorator, CCInteger, Component, director, Node, sys } from 'cc';
import { ScoreUI } from './UI/ScoreUI';
import { Player } from './Player';
import { GameOverUI } from './UI/GameOverUI';
const { ccclass, property } = _decorator;

//單例模式
@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager;
    public static getInstance(): GameManager {
        return this._instance ??= new GameManager();
    }

    @property
    private player: Player;
    @property({ type: Node, tooltip: "暫停按鈕" })
    private pauseButtonNode: Node = null!;
    @property({ type: Node, tooltip: "回復按鈕" })
    private resumeButtonNode: Node = null;

    @property({ type: CCInteger, tooltip: "炸彈數量" })
    private bombNumber: number = 0;
    @property({ type: CCInteger, tooltip: "分數" })
    private score: number = 0;
    @property({ type: ScoreUI, tooltip: "分數UI節點" })
    private scoreUI: ScoreUI = null!;


    @property({ type: GameOverUI, tooltip: "遊戲結束UI" })
    private gameOverUI: GameOverUI = null!;

    onLoad() {
        GameManager._instance = this;//靜態的要透過類訪問
        this.player = director.getScene().getComponentInChildren(Player);
    }

    public addBomb() {
        this.bombNumber += 1;
        this.node.emit("onBombChange");//發送事件
    }
    
    public useBomb(){
        if(this.bombNumber <= 0){
            console.error("沒有炸彈了還使用炸彈")
            return;
        }
        this.bombNumber -= 1;
        this.node.emit("onBombChange");
    }

    public getBombNumber(): number {
        return this.bombNumber
    }

    public isHaveBomb():boolean{
        return this.bombNumber > 0;
    }

    public addScore(value: number) {
        this.score += value
        this.scoreUI.updateUI(this.score)
    }

    onPauseButtonClick() {
        director.pause();
        this.player.disableControl();
        this.pauseButtonNode.active = false;
        this.resumeButtonNode.active = true;
    }

    onResumeButtonClick() {
        director.resume();
        this.player.enableControl();
        this.resumeButtonNode.active = false;
        this.pauseButtonNode.active = true;
    }

    onRestartButtonClick() {
        director.loadScene(director.getScene().name);
        this.onResumeButtonClick();
    }

    onQuitButtonClick() {

    }

    gameOver() {
        this.onPauseButtonClick();
        //獲得本地儲存的最高分
        let hScore = localStorage.getItem("highScore");
        let hScoreInt = 0;
        //如果有最高分，就轉換成整數，不然就是0
        if (hScore !== null) {
            hScoreInt = parseInt(hScore, 10);
        }
        hScoreInt = Math.max(hScoreInt, this.score);
        localStorage.setItem("highScore", "" + hScoreInt);

        this.gameOverUI.showGameOverUI(hScoreInt, this.score);
    }
}
