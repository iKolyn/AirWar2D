import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartUI')
export class StartUI extends Component {
    
    //點擊UI以後會觸發的方法
    public onStartButtonClick(){
        director.loadScene("02-GameScene");//下一個場景的名字'
    }

}


