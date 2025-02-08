import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScoreUI')
export class ScoreUI extends Component {
    
    @property({type:Label,tooltip:"分數"})
    scoreLabel:Label = null!;

    updateUI(value:number){
        this.scoreLabel.string = "" + value;
    }
}


