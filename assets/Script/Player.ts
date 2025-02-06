import { _decorator, Component, EventTouch, Input, input, math, Node, Vec3, } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    protected onLoad(): void {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }
    onTouchMove(event: EventTouch) {
        const p = this.node.position;
        //允許飛機一部分可以移出螢幕，但是不能完全移出螢幕
        const targetPosition = new Vec3(
            math.clamp(p.x + event.getDeltaX(),-230,230), 
            math.clamp(p.y + event.getDeltaY(),-380,380), 
            p.z);
        
        this.node.setPosition(targetPosition);

    }
}


