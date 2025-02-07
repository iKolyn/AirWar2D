import { _decorator, Animation, CCInteger, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    @property({ type: CCInteger, tooltip: "移動速度" })
    speed: number = 300;
    //注意我們使用的是Animation組件，而不是Interface。
    @property({ type: Animation, tooltip: "擊落動畫" })
    downAnim:Animation = null;

    update(deltaTime: number) {
        //控制移動
        const p = this.node.position;
        const dy = this.speed * deltaTime;
        this.node.setPosition(p.x, p.y - dy, p.z);

    }
}

