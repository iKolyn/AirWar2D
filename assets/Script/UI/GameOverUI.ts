import { _decorator, Component, Label, LabelComponent, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameOverUI')
export class GameOverUI extends Component {
    
    @property({type:LabelComponent,tooltip:"最高分數標題"})
    highScoreLabel:LabelComponent = null!;
    @property({type:LabelComponent,tooltip:"分數標題"})
    currentScoreLabel:LabelComponent = null!;

    showGameOverUI(highScore:number,currentScore:number){
        this.node.active = true;

        this.highScoreLabel.string = "" + highScore;
        this.currentScoreLabel.string = "" + currentScore;
    }

}


