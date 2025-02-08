import { _decorator, Component, Label, LabelComponent, Node } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('BombUI')
export class BombUI extends Component {
    @property({ type: LabelComponent, tooltip: "炸彈數量" })
    numberLabel: LabelComponent = null!;

    protected start(): void {
        //註冊事件
        GameManager.getInstance().node.on("onBombChange", this.onBombChange, this);
    }

    onBombChange(){
        this.numberLabel.string = "" + GameManager.getInstance().getBombNumber();
    }
    protected onDestroy(): void {
        //取消註冊事件
        //GameManager.getInstance().node.off("onBombChange", this.onBombChange, this);
    }
}


