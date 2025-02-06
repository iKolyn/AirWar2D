import { _decorator, Canvas, Component, director, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;
import { Player } from './Player';
@ccclass('Bullet')
export class Bullet extends Component {
    @property({ type: Number, tooltip: "1代表單發，2代表雙發" })
    bulletType: number = 0;
    @property({ type: Number, tooltip: "子彈" })
    speed: number = 500;//特殊子彈600，藍色的那顆
    @property({ type: Player, tooltip: "玩家" })
    player: Player = null!;
    onLoad() {
        this.player = director.getScene().getComponentInChildren(Player);
    }

    //先將移動做出來
    update(delta: number) {
        const position = this.node.worldPosition;
        this.node.setPosition(position.x, position.y + (this.speed * delta), position.z);

        //如果子彈超出螢幕，就回收
        if (position.y > director.getScene().getComponentInChildren(Canvas).getComponent(UITransform).height) {
            this.player.unuseBullet(this.node, this.bulletType);
        }
    }
}


