import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    @property({type:Number, tooltip: "子彈"})
    speed:number = 500;//特殊子彈600，藍色的那顆

    //先將移動做出來
    update(delta:number){
        const position = this.node.position;
        this.node.setPosition(position.x,position.y + (this.speed * delta), position.z);
    }

}


