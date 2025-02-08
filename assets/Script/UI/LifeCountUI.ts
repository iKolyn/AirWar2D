import { _decorator, CCInteger, Component, LabelComponent, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LifeCountUI')
export class LifeCountUI extends Component {
    
    //單例設計模式
    static _instance: LifeCountUI = null;
    public static getInstance(){
        return this._instance ??= new LifeCountUI();
    }


    @property({type:LabelComponent, tooltip: "生命值文字"})
    lifeCountLabel: LabelComponent = null!;

    protected onLoad(): void {
        if(this.lifeCountLabel == null){
            this.lifeCountLabel = this.getComponentInChildren(LabelComponent)!;
        }
    }
    updateUI(value:number){
        this.lifeCountLabel.string = "" + value;
    }
}


