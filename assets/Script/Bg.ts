import { _decorator, Canvas, CCFloat, Component, director, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

//用於滾動背景的腳本
@ccclass('Bg')
export class Bg extends Component {
    
    @property({type:Node, tooltip: "背景1"})
    bgs: Node[] = [];//如果要存數組，要先給這個數組一個空值

    @property({type:CCFloat, tooltip: "背景滾動速度"})
    speed: number = 100;


    update(deltaTime: number) {
        let canvasHeight = director.getScene().getComponentInChildren(Canvas).getComponent(UITransform).height;

        for(let bg of this.bgs){
            let dy:number = bg.position.y - this.speed * deltaTime;
            if(dy < -bg.getComponent(UITransform).height){
                dy += bg.getComponent(UITransform).height + canvasHeight;
            }
            bg.setPosition(bg.position.x, dy, bg.position.z)
        }
    }
}


