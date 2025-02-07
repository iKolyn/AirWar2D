import { _decorator, CCInteger, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

//單例模式
@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager;
    public static getInstance(): GameManager {
        return this._instance ??= new GameManager();
    }
    @property({ type: CCInteger, tooltip: "炸彈數量" })
    bombNumber: number = 0;

    start() {
        GameManager._instance = this;//靜態的要透過類訪問
    }

    public AddBomb() {
        this.bombNumber += 1;
    }




}


